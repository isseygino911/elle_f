import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

/*
  A password field with a reveal toggle.

  Why a toggle rather than a "confirm password" second field: both exist to
  catch the same mistake — a typo in text you cannot read. The toggle catches
  it by letting you read what you typed, which removes a field instead of
  adding one, and it is what NIST SP 800-63B recommends over confirmation.

  The button is deliberately NOT tabbable. Someone filling this form in with
  the keyboard is going password → submit; putting a decorative toggle in that
  path costs every keyboard user a keystroke to save the rare one who wants to
  peek. It stays reachable by pointer, and screen-reader users get the state
  from aria-pressed if they navigate to it directly.

  Resets to hidden on every mount, so a revealed password never survives a
  navigation.
*/
export default function PasswordInput({ className, ...props }) {
  const [revealed, setRevealed] = useState(false)
  const Icon = revealed ? EyeOff : Eye

  return (
    <div className="relative">
      <Input
        {...props}
        type={revealed ? 'text' : 'password'}
        // Room for the toggle, so a long password never runs underneath it.
        className={`pr-10 ${className || ''}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setRevealed((current) => !current)}
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
