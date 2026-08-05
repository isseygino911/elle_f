// Shared by the library list and detail views to render size_bytes as a
// human-readable string. Uses binary units (KiB steps) to match the
// MAX_FILE_SIZE_BYTES cap, which is expressed in MiB.
const UNITS = ['B', 'KB', 'MB', 'GB']

export function formatFileSize(sizeBytes) {
  if (sizeBytes === null || sizeBytes === undefined) return '—'
  if (sizeBytes === 0) return '0 B'

  let value = sizeBytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  // Whole numbers for bytes, one decimal place above that — enough
  // precision to distinguish files without adding visual noise.
  const rounded = unitIndex === 0 ? value : Math.round(value * 10) / 10
  return `${rounded} ${UNITS[unitIndex]}`
}

// Maps a content type to a coarse kind, used to pick the list icon.
export function fileKind(contentType) {
  if (!contentType) return 'file'
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  if (contentType === 'application/zip') return 'archive'
  if (contentType === 'application/pdf') return 'pdf'
  if (contentType.includes('spreadsheet') || contentType.includes('excel') || contentType === 'text/csv') {
    return 'sheet'
  }
  return 'document'
}
