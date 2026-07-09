// The reference's 2x2 stat-tile row (MASTER.md Source Analysis #2 / v3.1
// addition): small, dense dark tiles sitting above the list panel — a
// restrained adaptation, not a hero-metric tile. Renders only real counts
// already computed by the calling page; the caller decides whether ≥2
// meaningful counts exist (skip the tile row entirely otherwise, per
// MASTER.md's Layout Pattern section).
export default function StatTiles({ tiles }) {
  if (!tiles || tiles.length < 2) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-md border border-dark-border bg-dark-card p-3 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs font-medium text-dark-muted">
            {tile.icon && <tile.icon className="size-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{tile.label}</span>
          </span>
          <span className="font-heading text-xl font-extrabold text-white">{tile.value}</span>
        </div>
      ))}
    </div>
  )
}
