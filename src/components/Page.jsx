import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Shared page shell used by every authenticated screen — same max width,
// spacing rhythm, and header/back-link pattern everywhere, per the product
// register's "same list/row pattern, same alert style everywhere" rule.
export function PageContainer({ children, className }) {
  return (
    <main className={cn('mx-auto flex w-full max-w-(--content-max-width) flex-col gap-6 px-5 pt-6 pb-16 [--content-max-width:64rem]', className)}>
      {children}
    </main>
  )
}

export function PageHeader({ title, meta }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4">
      <h1>{title}</h1>
      {meta && <p className="m-0 text-sm text-muted-foreground">{meta}</p>}
    </div>
  )
}

export function BackLink({ to, children }) {
  return (
    <p className="text-sm text-muted-foreground">
      <Link to={to} className="font-medium text-muted-foreground hover:text-primary">
        {children}
      </Link>
    </p>
  )
}

// One-line async state primitives shared by every list/detail page — the
// same loading/empty/error treatment everywhere per the product register.
export function LoadingText({ children }) {
  return <p className="animate-pulse text-sm text-muted-foreground">{children}</p>
}

export function EmptyState({ children }) {
  return <p className="py-4 text-sm text-muted-foreground">{children}</p>
}

export function ErrorAlert({ children }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
