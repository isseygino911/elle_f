// Mirrors server-side limits (server/src/constants/library.js) — keep these
// two in sync manually, there is no shared package between client and server
// in this project.
export const MAX_FILE_SIZE_BYTES = 524288000 // 500 MiB

export const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/zip',
  'audio/mpeg',
  'audio/mp4',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

// The <input type="file"> accept attribute. Extensions are included
// alongside MIME types because some browsers/OS file pickers match on
// extension only — notably for Office formats and .csv.
export const FILE_ACCEPT_ATTRIBUTE = [
  ...ALLOWED_CONTENT_TYPES,
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.zip',
  '.mp3',
  '.m4a',
  '.mp4',
  '.webm',
  '.mov',
].join(',')

// The "Uncategorized" bucket isn't a real category row — it's the absence of
// one. This sentinel stands in for it in the category filter and the move
// picker, both of which need a selectable value for a null category_id.
export const UNCATEGORIZED = 'uncategorized'
