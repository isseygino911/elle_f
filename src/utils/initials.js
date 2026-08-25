// Initials for an avatar fallback. The app has no profile photos at all --
// AvatarImage is never used anywhere -- so this is what every Avatar renders,
// which is why it is worth having exactly one of.
//
// `max` is the number of WORDS taken, not characters: the sidebar shows two
// initials for a full name, the message bubbles show one. Taking words rather
// than a raw slice is what makes "Mei Chen" read as "MC" instead of "Me".
//
// Returns '?' rather than an empty string for unnamed input, so a caller can
// drop it straight into a fallback without its own `|| '?'`.
export function initials(label, max = 2) {
  const result = (label || '')
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  return result || '?'
}
