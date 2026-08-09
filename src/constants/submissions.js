// Mirrors the server's src/constants/submissions.js -- keep these in sync
// manually, there is no shared package between client and server in this
// project. Same arrangement as constants/video.js.
//
// Nothing here is a boundary. The server re-reads every uploaded object's real
// size and type from S3 and rejects what does not match; these values exist so
// the picker can filter and the form can fail fast with a useful message
// instead of a 400 after a long upload.

// 500 MiB, matching the library rather than video's 2 GiB -- a submission
// attachment is a score, a photo, or a short take.
export const MAX_FILE_SIZE_BYTES = 524288000

export const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'audio/mpeg',
  'audio/mp4',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

// What the recorder produces, and the only type the server accepts for a
// kind='recording' row. useMediaRecorder records codec-qualified and relabels
// the blob to exactly this before upload.
export const RECORDING_CONTENT_TYPE = 'video/webm'

// The fallback when an assignment somehow carries no cap. Assignments always
// have max_recording_sec (0032 gives the column a default), so this is a
// belt-and-braces value for rendering, not a policy.
export const MAX_RECORDING_SEC_DEFAULT = 300
