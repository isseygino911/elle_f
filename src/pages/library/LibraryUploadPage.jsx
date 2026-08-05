import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import {
  requestLibraryUploadUrl,
  uploadFileToS3,
  confirmLibraryUpload,
  listLibraryCategories,
  createLibraryCategory,
} from '../../api/client.js'
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_CONTENT_TYPES,
  FILE_ACCEPT_ATTRIBUTE,
  UNCATEGORIZED,
} from '../../constants/library.js'
import { formatFileSize } from '../../utils/formatFileSize.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageContainer, PageHeader, BackLink, ErrorAlert } from '@/components/Page'

export default function LibraryUploadPage() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [categories, setCategories] = useState([])
  const [categoriesError, setCategoriesError] = useState(null)
  const [categoryId, setCategoryId] = useState(UNCATEGORIZED)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploaded, setUploaded] = useState(null)

  useEffect(() => {
    let cancelled = false

    listLibraryCategories(accessToken)
      .then((body) => {
        if (!cancelled) setCategories(body.categories)
      })
      .catch((err) => {
        if (!cancelled) setCategoriesError((err.body && err.body.message) || err.message)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  // Defaults the title to the filename (minus extension) so the common case
  // needs no typing, but only while the user hasn't typed their own.
  function handleFileChange(event) {
    const nextFile = event.target.files[0] || null
    setFile(nextFile)
    if (nextFile && !title.trim()) {
      setTitle(nextFile.name.replace(/\.[^.]+$/, ''))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.target
    setError(null)
    setUploaded(null)

    if (!file) {
      setError('Please choose a file to upload.')
      return
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please choose a document, image, archive, audio, or video file.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`)
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setSubmitting(true)
    try {
      // A brand-new category typed on this form is created first, so the
      // file can be filed into it in the same submit.
      let resolvedCategoryId = categoryId === UNCATEGORIZED ? null : Number(categoryId)
      if (newCategoryName.trim()) {
        const { category } = await createLibraryCategory(accessToken, newCategoryName.trim())
        resolvedCategoryId = category.id
      }

      const { upload } = await requestLibraryUploadUrl(accessToken, {
        original_filename: file.name,
        content_type: file.type,
        content_length: file.size,
      })

      await uploadFileToS3(upload.url, upload.fields, file)

      const { file: created } = await confirmLibraryUpload(accessToken, {
        category_id: resolvedCategoryId,
        title: title.trim(),
        original_filename: file.name,
        s3_key: upload.s3_key,
        description: description.trim() || null,
      })

      setUploaded(created)
      setTitle('')
      setDescription('')
      setNewCategoryName('')
      setFile(null)
      form.reset()

      // Refresh the category list so a newly created category (and its new
      // count) is selectable on the next upload without a page reload.
      listLibraryCategories(accessToken)
        .then((body) => setCategories(body.categories))
        .catch(() => {
          // Non-fatal: the upload already succeeded, and the list reloads
          // on next mount.
        })
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const categoryItems = [
    { value: UNCATEGORIZED, label: t('library.uncategorized') },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ]

  return (
    <PageContainer>
      <PageHeader title={t('library.uploadTitle')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="file">
                  File (documents, images, archives, audio, or video — max {formatFileSize(MAX_FILE_SIZE_BYTES)})
                </FieldLabel>
                <Input id="file" type="file" accept={FILE_ACCEPT_ATTRIBUTE} onChange={handleFileChange} />
                {file && (
                  <FieldDescription>
                    {file.name} — {formatFileSize(file.size)}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="title">Title (required)</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  items={categoryItems}
                  disabled={Boolean(newCategoryName.trim())}
                >
                  {/* Base UI renders the raw value unless SelectValue is
                      given this render-prop, so map ids back to names. */}
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue>
                      {(current) =>
                        categoryItems.find((item) => item.value === current)?.label || t('library.uncategorized')
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categoryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {categoriesError || 'Choose an existing category, or create a new one below.'}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="new-category">Or create a new category</FieldLabel>
                <Input
                  id="new-category"
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="e.g. Warm-up drills"
                />
                <FieldDescription>
                  Leave blank to use the category selected above.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>

              {error && <ErrorAlert>{error}</ErrorAlert>}

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Uploading…' : 'Upload'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {uploaded && (
        <section className="flex flex-col gap-3">
          <h2>Uploaded: {uploaded.title}</h2>
          <Alert variant="success" role="status">
            <AlertDescription>
              {uploaded.category_name || t('library.uncategorized')} — {formatFileSize(uploaded.size_bytes)}
            </AlertDescription>
          </Alert>
        </section>
      )}

      <BackLink to="/library">{t('library.viewAll')}</BackLink>
    </PageContainer>
  )
}
