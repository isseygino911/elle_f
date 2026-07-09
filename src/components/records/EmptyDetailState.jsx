// Rendered at the `index` child route of a MasterDetailLayout (e.g. `/videos`
// with no `:id`) — the list panel is visible but nothing is selected yet.
export default function EmptyDetailState({ children }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="m-0 text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
