import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import PasswordInput from './PasswordInput.jsx'

// Reusable "choose a new password" pair: the password itself plus its
// confirmation, with the matching/length rules that go with them.
//
// Extracted as a component because password entry now appears in more than
// one place (reset today, change-password and signup are the obvious next
// callers) and the rule that matters — the minimum length must match what the
// server enforces — is exactly the kind of constant that drifts when it is
// retyped per page.
//
// Validation lives in `validateNewPassword` below rather than inside the
// component so a submitting page can check before it calls the API, without
// having to lift state out of here.

// Mirrors the server (auth.schema.js: password min 8 on both registration and
// reset). Exported so callers validate against the same number rather than
// their own copy of it.
export const MIN_PASSWORD_LENGTH = 8

// Returns an error string, or null when the pair is acceptable.
export function validateNewPassword(password, confirmation) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (password !== confirmation) {
    return 'The two passwords do not match.'
  }
  return null
}

export default function PasswordFields({
  password,
  confirmation,
  onPasswordChange,
  onConfirmationChange,
  disabled = false,
  idPrefix = 'password',
}) {
  // Shown only once the user has typed something into the confirmation box —
  // flagging a mismatch against an empty field would mark the form invalid
  // before they have had a chance to fill it in.
  const mismatch = confirmation.length > 0 && password !== confirmation

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-new`}>New password</FieldLabel>
        <PasswordInput
          id={`${idPrefix}-new`}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          // Tells a password manager to offer a generated password and to
          // save the result, rather than autofilling the old one.
          autoComplete="new-password"
          disabled={disabled}
        />
        <FieldDescription>At least {MIN_PASSWORD_LENGTH} characters.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-confirm`}>Confirm new password</FieldLabel>
        <PasswordInput
          id={`${idPrefix}-confirm`}
          value={confirmation}
          onChange={(event) => onConfirmationChange(event.target.value)}
          autoComplete="new-password"
          disabled={disabled}
          aria-invalid={mismatch || undefined}
        />
        {mismatch && (
          <FieldDescription className="text-destructive">
            The two passwords do not match.
          </FieldDescription>
        )}
      </Field>
    </>
  )
}
