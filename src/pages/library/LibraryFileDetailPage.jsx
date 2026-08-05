import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getLibraryFile, getLibraryDownloadUrl } from '../../api/client.js'
import { formatFileSize } from '../../utils/formatFileSize.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainer, PageHeader, BackLink, LoadingText, ErrorAlert } from '@/components/Page'
import FilePreview from '@/components/library/FilePreview'

export default function LibraryFileDetailPage() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState(null)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getLibraryFile(accessToken, id)
      .then((body) => {
        if (cancelled) return
        setFile(body.file)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, id])

  async function handleDownload() {
    setDownloadError(null)
    try {
      const { url } = await getLibraryDownloadUrl(accessToken, file.id)
      window.location.href = url
    } catch (err) {
      setDownloadError((err.body && err.body.message) || err.message)
    }
  }

  return (
    <PageContainer>
      {status === 'loading' && <LoadingText>{t('library.loading')}</LoadingText>}
      {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}

      {status === 'success' && file && (
        <>
          <PageHeader title={file.title} meta={`${file.original_filename} · ${formatFileSize(file.size_bytes)}`} />

          {/* The file itself comes first — the point of opening a record is
              to see its contents, not its metadata. */}
          <Card>
            <CardContent>
              <FilePreview file={file} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={file.category_id ? 'outline' : 'secondary'}>
                  {file.category_name || t('library.uncategorized')}
                </Badge>
                <span className="text-sm text-muted-foreground">{file.content_type}</span>
              </div>

              {file.description && <p className="m-0 text-sm text-foreground">{file.description}</p>}

              {downloadError && <ErrorAlert>{downloadError}</ErrorAlert>}

              <div>
                <Button type="button" onClick={handleDownload}>
                  <Download className="size-4" aria-hidden="true" />
                  {t('library.download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <BackLink to="/library">{t('library.viewAll')}</BackLink>
    </PageContainer>
  )
}
