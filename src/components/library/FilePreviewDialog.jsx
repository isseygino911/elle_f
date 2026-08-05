import { Download, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getLibraryDownloadUrl } from '../../api/client.js'
import { formatFileSize } from '../../utils/formatFileSize.js'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import FilePreview from './FilePreview'

// Quick-look overlay opened from a library list row, so browsing a folder
// of resources doesn't cost a navigation per file.
//
// Built on AlertDialog because it's the only modal primitive in this project
// (there's no plain Dialog) and it already provides the focus trap, overlay,
// and escape handling. Its default max-w-sm is overridden here — that width
// suits a confirmation prompt, not a document or video.
export default function FilePreviewDialog({ file, open, onOpenChange }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()

  async function handleDownload() {
    if (!file) return
    const body = await getLibraryDownloadUrl(accessToken, file.id)
    window.location.href = body.url
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[min(56rem,92vw)] sm:max-w-[min(56rem,92vw)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <AlertDialogTitle className="truncate">{file?.title}</AlertDialogTitle>
            <AlertDialogDescription className="truncate">
              {file ? `${file.original_filename} · ${formatFileSize(file.size_bytes)}` : ''}
            </AlertDialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={t('library.closePreview')}
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Remounted per file (keyed) so switching rows refetches the signed
            URL instead of showing the previous file's content. */}
        {open && file && <FilePreview key={file.id} file={file} className="min-h-0 overflow-auto" />}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" aria-hidden="true" />
            {t('library.download')}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
