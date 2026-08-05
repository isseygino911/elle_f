import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { useOrganization } from '@/lib/OrganizationContext'
import { isOwner } from '../lib/roles.js'
import { updateOrganization } from '../api/client.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { PageContainer, PageHeader, LoadingText, ErrorAlert } from '@/components/Page'

// Organization settings. Owner-only.
//
// Renaming is the whole page today, which is deliberate: the organization row
// holds a name and a created_at and nothing else. Anything further (billing,
// branding, deletion) is a schema change, not a form field, so this page
// stays honest about what actually exists rather than showing disabled
// controls for features that don't.
export default function OrganizationSettingsPage() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { organization, status, applyOrganization } = useOrganization()

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  // Seed the field once the organization arrives. Keyed on the name itself so
  // an external change (another tab renaming it) re-syncs, while typing here
  // is left alone — the effect only reruns when the server value changes.
  useEffect(() => {
    if (organization) setName(organization.name)
  }, [organization && organization.name])

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

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSave) return

    setSaving(true)
    setSaveError(null)
    setSaved(false)

    try {
      const body = await updateOrganization(accessToken, trimmed)
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

  return (
    <PageContainer>
      <PageHeader title={t('organization.title')} />

      {status === 'loading' && <LoadingText>{t('organization.loading')}</LoadingText>}
      {status === 'error' && <ErrorAlert>{t('organization.loadError')}</ErrorAlert>}

      {organization && (
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
      )}
    </PageContainer>
  )
}
