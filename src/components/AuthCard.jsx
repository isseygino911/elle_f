// Shared centered-card shell used by every public (unauthenticated) page —
// login, register, and status. Matches the "one deliberate card use" the
// product register calls out for auth surfaces.
export default function AuthCard({ children }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-(--narrow-max-width) flex-col justify-center gap-6 px-5 py-6 [--narrow-max-width:26rem]">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-6">
        {children}
      </div>
    </main>
  )
}
