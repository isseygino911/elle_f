import { useCallback, useEffect, useRef, useState } from 'react'

// The bare MIME type the recorded blob is finally labelled with. MediaRecorder
// reports codec-qualified types ('video/webm;codecs=vp9,opus'), but the upload
// path can only accept a bare type: the presigned POST pins the upload with
// ['eq', '$Content-Type', contentType] and the server re-checks the stored
// object's content type against an exact-match allowlist. Recording as a
// codec-qualified type and uploading as this bare one keeps both checks happy —
// the container really is WebM either way, only the label is narrowed.
const UPLOAD_MIME_TYPE = 'video/webm'

// Candidate recording types, best-quality first. MediaRecorder rejects a type
// the browser can't encode, so the first supported one wins. Codec-qualified
// entries come first because Chrome/Firefox encode better when told which codec
// to use; the bare fallback covers browsers that only accept an unqualified type.
const PREFERRED_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
]

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return null
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

// True when this browser can record at all. Checked up front so the UI can
// explain the situation instead of failing at the moment the user hits record.
export function isRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined' &&
    pickMimeType() !== null
  )
}

// Maps a getUserMedia rejection onto a message that tells the user what to
// actually do about it. The DOMException names here are the ones browsers use
// for permission/hardware failures; anything else falls through to its message.
function describeMediaError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera and microphone access was blocked. Allow access in your browser’s address bar, then try again.'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera or microphone was found. Connect a device and try again.'
    case 'NotReadableError':
      return 'Your camera or microphone is already in use by another app. Close it and try again.'
    default:
      return err?.message || 'Could not start recording.'
  }
}

/**
 * Camera recording as a state machine: idle → requesting → ready → recording →
 * stopped. The caller renders the controls and gets back a File on stop; every
 * media resource (tracks, recorder, object URL) is owned and released here.
 *
 * Permission is requested by start() — i.e. only in response to a user gesture —
 * so the browser prompt appears when the user asks to record, not on page load.
 */
export function useMediaRecorder({ maxSeconds = null } = {}) {
  const [state, setState] = useState('idle')
  const [error, setError] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [recording, setRecording] = useState(null) // { file, url, durationSec }

  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const previewUrlRef = useRef(null)
  // Held in a ref so the timer effect and stopCamera don't need it as a
  // dependency (which would re-run them on every tick).
  const secondsRef = useRef(0)

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  // Revokes the previous preview URL before a new recording replaces it, so
  // re-recording several times in one sitting can't leak blob URLs.
  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }, [])

  // Ticks the elapsed-time counter only while actually recording, and enforces
  // the cap.
  //
  // AUTO-STOP IS A UX AFFORDANCE, NOT A BOUNDARY. The server re-checks the
  // duration against the assignment's max_recording_sec and rejects an
  // over-length take with a 400 -- see submissions.route.js. What this does is
  // stop a student discovering the limit AFTER they have performed, which was
  // the whole reason the cap exists.
  //
  // The recorder is stopped through a ref rather than by naming stop() here:
  // stop is defined below this effect, and depending on it would either hit the
  // temporal dead zone or re-create the interval every time its identity
  // changed -- which would drop ticks and make the count wrong.
  useEffect(() => {
    if (state !== 'recording') return undefined

    const interval = setInterval(() => {
      secondsRef.current += 1
      setSeconds(secondsRef.current)

      if (maxSeconds && secondsRef.current >= maxSeconds) {
        recorderRef.current?.stop()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [state, maxSeconds])

  // Safety net for unmount mid-recording (navigating away with the camera on):
  // without this the camera light would stay on until the tab closed.
  useEffect(
    () => () => {
      releaseStream()
      releasePreview()
    },
    [releaseStream, releasePreview],
  )

  // Requests permission and opens the camera preview without recording yet, so
  // the user can frame themselves before committing.
  const requestCamera = useCallback(async () => {
    setError(null)
    setState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      setState('ready')
      return stream
    } catch (err) {
      releaseStream()
      setError(describeMediaError(err))
      setState('idle')
      return null
    }
  }, [releaseStream])

  const start = useCallback(async () => {
    setError(null)
    releasePreview()
    setRecording(null)

    // Reuse the already-open preview stream if the user opened the camera
    // first; otherwise this call is what triggers the permission prompt.
    const stream = streamRef.current ?? (await requestCamera())
    if (!stream) return

    const mimeType = pickMimeType()
    if (!mimeType) {
      setError('Recording is not supported in this browser. Please upload a video file instead.')
      return
    }

    let recorder
    try {
      recorder = new MediaRecorder(stream, { mimeType })
    } catch (err) {
      setError(err.message || 'Could not start recording.')
      return
    }

    chunksRef.current = []
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunksRef.current.push(event.data)
    }

    recorder.onerror = (event) => {
      setError(event.error?.message || 'Recording stopped unexpectedly.')
      releaseStream()
      setState('idle')
    }

    recorder.onstop = () => {
      // Relabelled to the bare upload type (see UPLOAD_MIME_TYPE) and wrapped
      // as a File so it can go straight into the existing upload helpers, which
      // read .name/.type/.size off a file input's File.
      const blob = new Blob(chunksRef.current, { type: UPLOAD_MIME_TYPE })
      chunksRef.current = []

      const file = new File([blob], `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`, {
        type: UPLOAD_MIME_TYPE,
      })

      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url

      // The wall-clock tick count is the duration source: a MediaRecorder WebM
      // has no duration in its header, so a <video> element reports Infinity
      // for it and the usual metadata probe can't help here.
      setRecording({ file, url, durationSec: secondsRef.current || null })
      setState('stopped')
      releaseStream()
    }

    secondsRef.current = 0
    setSeconds(0)
    // Timeslice so chunks flush periodically rather than buffering the whole
    // recording as one blob at stop time.
    recorder.start(1000)
    setState('recording')
  }, [requestCamera, releaseStream, releasePreview])

  const stop = useCallback(() => {
    // onstop does the teardown — it fires for this call and produces the file.
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  // Closes the camera without producing a recording (user changed their mind).
  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      // Drop the buffered chunks first so onstop can't publish a recording the
      // user just cancelled.
      recorder.onstop = null
      recorder.stop()
    }
    chunksRef.current = []
    recorderRef.current = null
    releaseStream()
    releasePreview()
    setRecording(null)
    setSeconds(0)
    secondsRef.current = 0
    setState('idle')
  }, [releaseStream, releasePreview])

  // Discards a finished take so the user can record another one.
  const reset = useCallback(() => {
    releasePreview()
    setRecording(null)
    setSeconds(0)
    secondsRef.current = 0
    setState('idle')
    setError(null)
  }, [releasePreview])

  return { state, error, seconds, recording, stream: streamRef, requestCamera, start, stop, cancel, reset }
}
