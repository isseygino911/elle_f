// Shared validation constants for the public auth pages.
//
// EMAIL_PATTERN existed as three identical copies (register, register-org,
// forgot-password). A regex that decides whether a signup is accepted is
// exactly the kind of constant that drifts once it is retyped per page — one
// copy gets a tweak, the others silently disagree, and the same address is
// valid on one form and rejected on another.
//
// Deliberately permissive: it rejects obvious typos (no @, no dot, spaces)
// and nothing more. The address is verified for real by the server, which
// sends mail to it; a stricter client regex would only reject valid
// addresses that the RFC allows.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Re-exported from PasswordFields rather than redeclared, so there is one
// number in the codebase and it is the one already documented as mirroring
// the server's auth.schema.js.
export { MIN_PASSWORD_LENGTH } from '@/components/auth/PasswordFields'
