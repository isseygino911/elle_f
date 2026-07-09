// Shared by VideoListPage and VideoDetailPage to render duration_sec as mm:ss.
export function formatDuration(durationSec) {
  if (durationSec === null || durationSec === undefined) return '—'
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
