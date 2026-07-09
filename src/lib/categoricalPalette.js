// Dashboard widget accent palette (tokens.css / global.css @theme block) —
// matches the RonDesignLab reference screenshot's actual widget colors
// (lighter lime, lighter purple, a coral pill) rather than an invented hue
// set. One source of truth so every SectionCard cycles the same three
// tones in the same order.
export const CATEGORICAL_PALETTE = [
  { name: 'lime-light', solidBg: 'bg-tag-lime-light' },
  { name: 'violet-light', solidBg: 'bg-tag-violet-light' },
  { name: 'coral', solidBg: 'bg-tag-coral' },
]

export function getCategoricalAccent(index) {
  return CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
}
