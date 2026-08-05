import { useEffect, useState } from 'react'
import { Download, FileQuestion } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getLibraryPreviewUrl, getLibraryDownloadUrl } from '../../api/client.js'
import { Button } from '@/components/ui/button'
import { LoadingText, ErrorAlert } from '@/components/Page'

// Which content types the browser can render on its own. Anything outside
// this set (Office documents, ZIP) gets the fallback card instead — we
// deliberately don't route those through a third-party online viewer, which
// would mean handing student-adjacent material to an outside service.
const PREVIEWABLE = {
  image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/mp4'],
  // PDFs and plain text render in an <iframe>; the browser's built-in
  // viewer handles paging/scrolling for free.
  frame: ['application/pdf', 'text/plain', 'text/csv'],
}

export function previewKindFor(contentType) {
  if (!contentType) return null
  const entry = Object.entries(PREVIEWABLE).find(([, types]) => types.includes(contentType))
  return entry ? entry[0] : null
}

export function isPreviewable(contentType) {
  return previewKindFor(contentType) !== null
}

// Renders a library file inline. Shared by the detail page and the list's
// preview modal so the per-type rendering rules live in exactly one place.
//
// The signed URL is fetched on mount rather than passed in, because these
// URLs expire (10 min) — deriving it at render time means a long-open modal
// or a revisited detail page always gets a fresh one.
export default function FilePreview({ file, className }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  const [url, setUrl] = useState(null)
  const [status, setStatus] = useState('loading') // loading | success | error | unsupported
  const [error, setError] = useState(null)

  const kind = previewKindFor(file?.content_type)

  useEffect(() => {
    if (!file) return undefined

    if (!kind) {
      setStatus('unsupported')
      return undefined
    }

    let cancelled = false
    setStatus('loading')

    getLibraryPreviewUrl(accessToken, file.id)
      .then((body) => {
        if (cancelled) return
        setUrl(body.url)
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
  }, [accessToken, file, kind])

  async function handleDownload() {
    try {
      const body = await getLibraryDownloadUrl(accessToken, file.id)
      window.location.href = body.url
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    }
  }

  if (!file) return null

  if (status === 'unsupported') {
    return (
      <div
        className={className}
        data-testid="preview-unsupported"
      >
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
          <FileQuestion className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="m-0 text-sm text-muted-foreground">{t('library.previewUnavailable')}</p>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" aria-hidden="true" />
            {t('library.download')}
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={className}>
        <LoadingText>{t('library.previewLoading')}</LoadingText>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={className}>
        <ErrorAlert>{error}</ErrorAlert>
      </div>
    )
  }

  return (
    <div className={className}>
      {kind === 'image' && (
        <img
          src={url}
          alt={file.title}
          className="mx-auto max-h-[70vh] w-auto max-w-full rounded-md object-contain"
        />
      )}

      {kind === 'video' && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} controls className="mx-auto max-h-[70vh] w-full rounded-md bg-black">
          {t('library.previewUnavailable')}
        </video>
      )}

      {kind === 'audio' && (
        <audio src={url} controls className="w-full">
          {t('library.previewUnavailable')}
        </audio>
      )}

      {kind === 'frame' && (
        // sandbox without allow-scripts: the document renders, but any
        // script inside an uploaded HTML-ish file can't touch this origin.
        <iframe
          src={url}
          title={file.title}
          sandbox=""
          className="h-[70vh] w-full rounded-md border border-border bg-white"
        />
      )}
    </div>
  )
}
