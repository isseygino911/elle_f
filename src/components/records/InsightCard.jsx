import { cn } from '@/lib/utils'

// The reference's contextual insight-rail card (MASTER.md Source Analysis
// #5): a solid color-blocked panel surfacing status/metadata the detail
// page already fetched — no new API calls. `tone` picks which of the two
// decorative accents represents this section's card "type", used
// consistently everywhere that section's insight card appears.
export default function InsightCard({ tone = 'violet', title, children }) {
  const isLime = tone === 'lime'

  return (
    <section
      className={cn('flex flex-col gap-3 rounded-lg p-5 shadow-sm', isLime ? 'bg-lime text-on-lime' : 'bg-violet text-on-violet')}
    >
      <h3 className="m-0 font-heading text-base font-extrabold">{title}</h3>
      <div className="flex flex-col gap-2 text-sm">{children}</div>
    </section>
  )
}
