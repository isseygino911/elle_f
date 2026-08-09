import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useOrganization } from '@/lib/OrganizationContext'
import { isOwner } from '../lib/roles.js'
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
