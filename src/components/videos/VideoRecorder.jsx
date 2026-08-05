import { useEffect, useRef } from 'react'
import { Video, Square, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/Page'
import { formatDuration } from '../../utils/formatDuration.js'
import { useMediaRecorder, isRecordingSupported } from '../../hooks/useMediaRecorder.js'

// Records straight from the camera and hands the finished take to the parent as
// a File, so it can travel the same presigned-S3 upload path as a chosen file.
// The parent owns the upload; this component owns the camera.
export default function VideoRecorder({ onRecorded, disabled }) {
  const { state, error, seconds, recording, stream, start, stop, cancel, reset } = useMediaRecorder()
  const previewRef = useRef(null)
  const supported = isRecordingSupported()

  // Binds the live camera stream to the <video> preview. Runs on state changes
  // rather than on mount because the stream only exists once recording starts.
  useEffect(() => {
    const video = previewRef.current
    if (!video) return
    if (state === 'recording' || state === 'ready') {
      video.srcObject = stream.current
    } else {
      video.srcObject = null
    }
  }, [state, stream])

  // Publishes the finished take upward. Separate from onstop so the parent
  // stays a pure consumer of `recording` and can't be called mid-teardown.
  useEffect(() => {
    if (state === 'stopped' && recording) {
      onRecorded(recording.file, recording.durationSec)
    }
  }, [state, recording, onRecorded])

  if (!supported) {
    return (
      <ErrorAlert>
        Recording isn’t supported in this browser. Please choose a video file instead.
      </ErrorAlert>
    )
  }

  const isLive = state === 'recording' || state === 'ready'

  return (
    <div className="flex flex-col gap-3">
      {(isLive || recording) && (
        <div className="relative overflow-hidden rounded-md border bg-black">
          <video
            ref={previewRef}
            className="aspect-video w-full"
            // Live preview must be muted, or the mic feeds back through the speakers.
            muted={isLive}
            autoPlay={isLive}
            playsInline
            controls={state === 'stopped'}
            src={state === 'stopped' && recording ? recording.url : undefined}
          />
          {state === 'recording' && (
            <div className="absolute top-2 left-2 flex items-center gap-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span role="status">Recording {formatDuration(seconds)}</span>
            </div>
          )}
        </div>
      )}

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <div className="flex flex-wrap gap-2">
        {state === 'idle' && (
          <Button type="button" variant="outline" onClick={start} disabled={disabled}>
            <Video /> Record with camera
          </Button>
        )}
        {state === 'requesting' && (
          <Button type="button" variant="outline" disabled>
            Waiting for camera permission…
          </Button>
        )}
        {state === 'recording' && (
          <>
            <Button type="button" variant="destructive" onClick={stop}>
              <Square /> Stop recording
            </Button>
            <Button type="button" variant="ghost" onClick={cancel}>
              <X /> Cancel
            </Button>
          </>
        )}
        {state === 'stopped' && (
          <Button type="button" variant="outline" onClick={reset} disabled={disabled}>
            <RotateCcw /> Record again
          </Button>
        )}
      </div>

      {state === 'stopped' && recording && (
        <p className="text-muted-foreground text-sm">
          Recorded {formatDuration(recording.durationSec)} — review it above, then upload below.
        </p>
      )}
    </div>
  )
}
