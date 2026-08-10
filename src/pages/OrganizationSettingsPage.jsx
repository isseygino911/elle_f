import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useOrganization } from '@/lib/OrganizationContext'
import { isOwner } from '../lib/roles.js'
import { ORGANIZATION_THEMES, DEFAULT_ORGANIZATION_THEME } from '../lib/orgThemes.js'
import {
  updateOrganization,
  uploadOrganizationLogo,
  deleteOrganizationLogo,
} from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { PageContainer, PageHeader, LoadingText, ErrorAlert } from '@/components/Page'
import ConfirmDialog from '@/components/ConfirmDialog'

// Mirrors the server's own limits (middleware/upload.js) so the common
// mistakes -- a photo straight off a phone, a PDF renamed to .png -- are
// caught without a round-trip. The server stays the real boundary; this is
// only here to make the failure immediate and legible.
const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// Organization settings. Owner-only.
//
// Two cards: the studio's name, and its branding. Branding is a logo plus one
// decision about it -- whether the name still renders beside it, which matters
// because a logo that already contains a wordmark would otherwise show the
// studio's name twice in the sidebar.
export default function OrganizationSettingsPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { organization, status, applyOrganization } = useOrganization()

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  // Branding state is kept separate from the rename state above so the two
  // forms never disable or clear each other's feedback.
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [logoBusy, setLogoBusy] = useState(false)
  const [logoError, setLogoError] = useState(null)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  // Theme state, kept separate from the two forms above for the same reason
  // they are separate from each other: picking a color must not clear the
  // rename form's "saved" message or borrow its error slot.
  const [themeBusy, setThemeBusy] = useState(null) // the slug being saved
  const [themeError, setThemeError] = useState(null)
  const [themeSaved, setThemeSaved] = useState(false)
  // Identifies the most recently issued theme save, so a slow earlier response
  // cannot land on top of a newer choice.
  const latestThemeRequest = useRef(null)

  // Seed the field once the organization arrives. Keyed on the name itself so
  // an external change (another tab renaming it) re-syncs, while typing here
  // is left alone — the effect only reruns when the server value changes.
  useEffect(() => {
    if (organization) setName(organization.name)
  }, [organization && organization.name])

  // Object URLs are a manual resource: without this the page leaks one per
  // file the owner picks and discards.
  useEffect(() => {
    if (!previewUrl) return undefined
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  // The route guard already keeps non-owners out; this is the second line of
  // defence for a direct navigation, and the server refuses regardless.
  if (!isOwner(user)) {
    return (
      <PageContainer>
        <PageHeader title={t('organization.title')} />
        <ErrorAlert>{t('organization.ownerOnly')}</ErrorAlert>
      </PageContainer>
    )
  }

  const trimmed = name.trim()
  const isDirty = Boolean(organization) && trimmed !== organization.name
  const canSave = isDirty && trimmed.length > 0 && !saving

  const logoUrl = (organization && organization.logo_url) || null
  const hasLogo = Boolean(logoUrl)
  const showNameWithLogo = !organization || organization.show_name_with_logo !== false
  const activeTheme = (organization && organization.theme) || DEFAULT_ORGANIZATION_THEME

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSave) return

    setSaving(true)
    setSaveError(null)
    setSaved(false)

    try {
      const body = await updateOrganization(accessToken, { name: trimmed })
      // Push straight into the shared context so the sidebar renames itself
      // immediately rather than on the next full load.
      applyOrganization(body.organization)
      setSaved(true)
    } catch (err) {
      setSaveError((err.body && err.body.message) || err.message)
    } finally {
      setSaving(false)
    }
  }

  function clearSelection() {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleFileChange(event) {
    const file = event.target.files && event.target.files[0]
    setLogoError(null)

    if (!file) {
      clearSelection()
      return
    }

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError(t('organization.logoWrongType'))
      clearSelection()
      return
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoError(t('organization.logoTooLarge'))
      clearSelection()
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleLogoUpload() {
    if (!selectedFile || logoBusy) return

    setLogoBusy(true)
    setLogoError(null)

    try {
      const body = await uploadOrganizationLogo(accessToken, selectedFile)
      applyOrganization(body.organization)
      clearSelection()
    } catch (err) {
      setLogoError((err.body && err.body.message) || err.message)
    } finally {
      setLogoBusy(false)
    }
  }

  async function handleLogoRemove() {
    setLogoBusy(true)
    setLogoError(null)

    try {
      const body = await deleteOrganizationLogo(accessToken)
      applyOrganization(body.organization)
      clearSelection()
      setConfirmRemoveOpen(false)
    } catch (err) {
      setLogoError((err.body && err.body.message) || err.message)
    } finally {
      setLogoBusy(false)
    }
  }

  // Arrow-key movement inside the palette radiogroup. The ARIA pattern
  // requires it and the browser only supplies it for native radio inputs, so
  // a role="radio" group has to implement it by hand: move focus to the
  // neighbouring swatch and select it, wrapping at both ends.
  function handleThemeKeyDown(event) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
    if (!keys.includes(event.key)) return

    event.preventDefault()

    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1

    // Stepped from the focused swatch rather than from activeTheme: the two
    // agree at rest, but a second arrow press landing before the first save
    // resolves would otherwise re-step from the same stale origin and appear
    // to stick.
    const focusedSlug = event.target.closest('[data-theme-slug]')?.dataset.themeSlug
    const origin = ORGANIZATION_THEMES.findIndex(
      (theme) => theme.slug === (focusedSlug || activeTheme)
    )
    const total = ORGANIZATION_THEMES.length
    const next = ORGANIZATION_THEMES[(origin + step + total) % total]

    // Focus follows selection, as the radiogroup pattern expects. The node is
    // addressed by slug rather than held in a ref array: the grid is six
    // static items, and a query here is simpler than six refs.
    const node = event.currentTarget.querySelector(`[data-theme-slug="${next.slug}"]`)
    if (node) node.focus()

    handleThemeSelect(next.slug)
  }

  async function handleThemeSelect(slug) {
    if (slug === activeTheme) return

    setThemeBusy(slug)
    setThemeError(null)
    setThemeSaved(false)

    // Holding an arrow key fires faster than the round trip, so saves can
    // overlap. Rather than dropping the extra presses -- which would leave the
    // group on a color the user arrowed away from -- each one is sent and the
    // last to be *issued* wins. Without this, responses landing out of order
    // would let an earlier choice overwrite a later one.
    const request = Symbol(slug)
    latestThemeRequest.current = request

    try {
      const body = await updateOrganization(accessToken, { theme: slug })
      if (latestThemeRequest.current !== request) return

      // The context's effect repaints the whole app off the new slug, so the
      // sidebar gradient and every accented control change with this one call.
      applyOrganization(body.organization)
      setThemeSaved(true)
    } catch (err) {
      if (latestThemeRequest.current !== request) return
      setThemeError((err.body && err.body.message) || err.message)
    } finally {
      if (latestThemeRequest.current === request) setThemeBusy(null)
    }
  }

  async function handleToggleName(event) {
    const next = event.target.checked
    setLogoBusy(true)
    setLogoError(null)

    try {
      const body = await updateOrganization(accessToken, { show_name_with_logo: next })
      applyOrganization(body.organization)
    } catch (err) {
      setLogoError((err.body && err.body.message) || err.message)
    } finally {
      setLogoBusy(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t('organization.title')} />

      {status === 'loading' && <LoadingText>{t('organization.loading')}</LoadingText>}
      {status === 'error' && <ErrorAlert>{t('organization.loadError')}</ErrorAlert>}

      {organization && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="organization-name">{t('organization.name')}</FieldLabel>
                    <Input
                      id="organization-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value)
                        setSaved(false)
                      }}
                      disabled={saving}
                      maxLength={255}
                    />
                    <FieldDescription>{t('organization.nameHint')}</FieldDescription>
                  </Field>

                  {saveError && (
                    <Alert variant="destructive">
                      <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                  )}

                  {saved && !isDirty && (
                    <p className="m-0 text-sm font-medium text-success-text">
                      {t('organization.saved')}
                    </p>
                  )}

                  {/* Only offered when there is a change to save — a permanently
                      live button on a settled form invites pointless writes. */}
                  <div>
                    <Button type="submit" disabled={!canSave}>
                      {saving ? t('organization.saving') : t('organization.save')}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organization-logo">{t('organization.logo')}</FieldLabel>
                  <FieldDescription>{t('organization.logoHint')}</FieldDescription>

                  {/* Stacks on phones so the preview, the file button and the
                      remove button never squeeze into one cramped row. */}
                  <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Previewed on a dark tile because the sidebar it lands in
                        is dark — a logo shown on this white card would
                        misrepresent how it actually renders. */}
                    <div className="flex h-20 w-40 shrink-0 items-center justify-center rounded-md border border-dark-border bg-dark p-3">
                      {previewUrl || logoUrl ? (
                        <img
                          src={previewUrl || logoUrl}
                          alt={t('organization.logo')}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="truncate font-heading text-lg font-extrabold text-lime">
                          {organization.name}
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        id="organization-logo"
                        type="file"
                        accept={ACCEPTED_LOGO_TYPES.join(',')}
                        onChange={handleFileChange}
                        disabled={logoBusy}
                        className="sr-only"
                      />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={logoBusy}
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          {hasLogo ? t('organization.replaceLogo') : t('organization.uploadLogo')}
                        </Button>

                        {selectedFile && (
                          <Button type="button" disabled={logoBusy} onClick={handleLogoUpload}>
                            {logoBusy ? t('organization.saving') : t('organization.save')}
                          </Button>
                        )}

                        {hasLogo && !selectedFile && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={logoBusy}
                            onClick={() => setConfirmRemoveOpen(true)}
                          >
                            {t('organization.removeLogo')}
                          </Button>
                        )}
                      </div>

                      {selectedFile && (
                        <p className="m-0 truncate text-sm text-muted-foreground">
                          {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Field>

                <Field>
                  <div className="flex items-start gap-2">
                    <input
                      id="organization-show-name"
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-lime disabled:opacity-50"
                      checked={showNameWithLogo}
                      disabled={!hasLogo || logoBusy}
                      onChange={handleToggleName}
                    />
                    <div className="min-w-0">
                      <FieldLabel htmlFor="organization-show-name">
                        {t('organization.showNameWithLogo')}
                      </FieldLabel>
                      {/* Without a logo the name is the only brand mark there
                          is, so the control explains itself rather than sitting
                          there disabled and unexplained. */}
                      <FieldDescription>
                        {hasLogo
                          ? t('organization.showNameWithLogoHint')
                          : t('organization.showNameNeedsLogo')}
                      </FieldDescription>
                    </div>
                  </div>
                </Field>

                {logoError && (
                  <Alert variant="destructive">
                    <AlertDescription>{logoError}</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Accent palette. Saves on click rather than behind a Save button:
              the choice is a single value with an immediate, whole-app
              preview -- the sidebar beside this card repaints as you pick --
              so a second confirming step would only delay the feedback that
              makes the decision for you. */}
          <Card>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organization-theme">{t('organization.theme')}</FieldLabel>
                  <FieldDescription>{t('organization.themeHint')}</FieldDescription>

                  {/* A native radiogroup rather than buttons: this is a
                      single-choice control, and the role gives arrow-key
                      navigation and "3 of 6" announcements for free. The
                      visible swatch is the label, so each option carries an
                      aria-label with the palette's name. */}
                  <div
                    id="organization-theme"
                    role="radiogroup"
                    aria-label={t('organization.theme')}
                    onKeyDown={handleThemeKeyDown}
                    className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"
                  >
                    {ORGANIZATION_THEMES.map((theme) => {
                      const selected = theme.slug === activeTheme
                      const name = t(`organization.themeNames.${theme.slug}`)

                      return (
                        <button
                          key={theme.slug}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={name}
                          data-theme-slug={theme.slug}
                          // aria-disabled rather than the `disabled`
                          // attribute: a disabled element cannot hold focus,
                          // so disabling the swatch the user just arrowed onto
                          // drops focus to <body> the moment the save starts
                          // and strands a keyboard user outside the group.
                          // This keeps it focusable and lets handleThemeSelect
                          // ignore the click instead.
                          aria-disabled={Boolean(themeBusy)}
                          // Only the selected swatch stays in the tab order,
                          // so Tab moves past the group rather than through
                          // six stops; arrow keys move within it.
                          tabIndex={selected ? 0 : -1}
                          onClick={() => handleThemeSelect(theme.slug)}
                          className={cn(
                            'group relative flex flex-col gap-2 rounded-lg border p-2 text-left transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                            'aria-disabled:cursor-progress',
                            selected
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-border hover:border-primary/40'
                          )}
                        >
                          {/* The gradient as it actually renders in the rail,
                              with the accent dot and a wordmark stand-in --
                              a flat color chip would not show what the
                              sidebar is about to look like. Inline style
                              rather than the .sidebar-gradient class: that
                              one reads the live document variable, which is
                              the *current* theme, not this option's.

                              Taller and top-aligned now that the gradient
                              fills the whole rail: the palettes differ most
                              at their top stop and resolve to the same dark
                              at the bottom, so a short chip centred on the
                              midpoint would make several of them look
                              identical. This shows the ramp instead. */}
                          <span
                            className="flex h-20 flex-col justify-start gap-1.5 rounded-md p-2"
                            style={{ backgroundImage: theme.gradient }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="size-4 shrink-0 rounded-full"
                                style={{ backgroundColor: theme.accent.base }}
                                aria-hidden="true"
                              />
                              <span
                                className="truncate font-heading text-sm font-extrabold"
                                style={{ color: theme.accent.base }}
                                aria-hidden="true"
                              >
                                {organization.name}
                              </span>
                            </span>

                            {/* A stand-in for the active nav pill -- the one
                                place the accent is used as a fill behind
                                text, and the pairing the contrast floor in
                                orgThemes.js exists to protect. */}
                            <span
                              className="mt-auto w-fit rounded px-1.5 py-0.5 text-[0.625rem] font-semibold"
                              style={{ backgroundColor: theme.accent.base, color: theme.accent.on }}
                              aria-hidden="true"
                            >
                              {t('nav.dashboard')}
                            </span>
                          </span>

                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium">{name}</span>
                            {selected && (
                              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                            )}
                          </span>

                          {/* Screen readers get the selected state from
                              aria-checked; this is the sighted equivalent for
                              anyone who can't distinguish the ring. */}
                          {selected && <span className="sr-only">{t('organization.themeCurrent')}</span>}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {themeError && (
                  <Alert variant="destructive">
                    <AlertDescription>{themeError}</AlertDescription>
                  </Alert>
                )}

                {themeSaved && !themeError && (
                  <p className="m-0 text-sm font-medium text-success-text" role="status">
                    {t('organization.themeSaved')}
                  </p>
                )}
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title={t('organization.removeLogo')}
        description={t('organization.removeLogoConfirm')}
        confirmLabel={t('organization.removeLogo')}
        pendingLabel={t('organization.saving')}
        pending={logoBusy}
        onConfirm={handleLogoRemove}
      />
    </PageContainer>
  )
}
