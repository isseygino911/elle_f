// Mirrors server-side limits (server/src) — keep these two in sync manually,
// there is no shared package between client and server in this project.
export const MAX_FILE_SIZE_BYTES = 2147483648 // 2 GiB

export const ALLOWED_CONTENT_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
