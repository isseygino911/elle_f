// Reads a video file's duration client-side via an off-DOM <video> element.
//
// Extracted from VideoUploadPage when the homework submission form arrived:
// that form also accepts video attachments and needs the same probe, and a
// second copy would be a second chance to get the cleanup wrong.
//
// Resolves null rather than rejecting when the duration can't be determined,
// because duration_sec is optional everywhere it is sent.
//
// IT CANNOT READ A CAMERA RECORDING. A MediaRecorder WebM carries no duration
// in its header, so `video.duration` reports Infinity and this resolves null.
// That is not a bug to fix here: useMediaRecorder counts wall-clock seconds
// instead and hands its own durationSec to the caller. Probing a recorded file
// with this function will always lose that number -- keep the recorder's value
// alongside the file rather than re-deriving it.
export function readVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
    }

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null
      cleanup()
      resolve(duration)
    }
    video.onerror = () => {
      cleanup()
      resolve(null)
    }

    video.src = objectUrl
  })
}
