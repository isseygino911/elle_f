import { useState } from 'react'
import { Download, Paperclip, Video as VideoIcon } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getSubmissionFileUrl } from '../../api/client.js'
import { formatDuration } from '../../utils/formatDuration.js'
import { formatSlotDate } from '../../utils/formatSlotTime.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorAlert } from '@/components/Page'

// One attached file. A recording gets a player, an attachment gets a download
// link -- they are stored the same way and are not the same thing, which is
// exactly what `kind` records.
//
// Both URLs are minted on demand rather than up front: they are short-lived
// presigned URLs, and signing every file on page load would mean most of them
// expiring unused.
function SubmissionFile({ submissionId, file }) {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [playbackUrl, setPlaybackUrl] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isRecording = file.kind === 'recording'

  async function handleOpen() {
    setError(null)
    setBusy(true)
    try {
      const { url } = await getSubmissionFileUrl(
        accessToken,
        submissionId,
        file.id,
        isRecording ? 'preview' : 'download',
      )

      if (isRecording) {
        setPlaybackUrl(url)
      } else {
        // The URL is signed with Content-Disposition: attachment, so this
        // downloads rather than navigating away from the page.
        window.location.assign(url)
      }
    } catch (err) {
      setError((err.body && err.body.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm">
        {isRecording ? (
          <VideoIcon className="size-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Paperclip className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 truncate">{file.original_filename}</span>
        {isRecording && file.duration_sec !== null && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatDuration(file.duration_sec)}
          </span>
        )}
        {!playbackUrl && (
          <Button type="button" size="sm" variant="outline" onClick={handleOpen} disabled={busy}>
            {isRecording ? t('submissions.play') : <Download />}
          </Button>
        )}
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      {playbackUrl && (
        <video src={playbackUrl} controls playsInline className="w-full rounded-md border" />
      )}
    </li>
  )
}

// One attempt. Used for the student's own view of what they handed in and for
// each row of the teacher's review roster, because they show the same thing --
// only the surrounding actions differ.
export default function SubmissionCard({ submission, showStudent = false, actions }) {
  const { t } = useLanguage()
  const reviewed = submission.status === 'reviewed'

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            {showStudent && `${submission.student_name} · `}
            {t('submissions.attempt')} {submission.attempt}
          </span>
          {/* Status as a pill AND a colour, so the review queue reads at a
              glance rather than by reading each label. */}
          <Badge variant={reviewed ? 'priorityLow' : 'priorityHigh'}>
            {reviewed ? t('submissions.reviewed') : t('submissions.submitted')}
          </Badge>
          {/* created_at arrives as a full ISO instant. Rendering it raw put
              "2026-08-09T07:30:42.000Z" in the corner of every card; the rest
              of the app reads dates through this helper, which also handles
              the bare YYYY-MM-DD form and falls back to the input unchanged
              rather than showing "Invalid Date". */}
          <span className="text-muted-foreground ml-auto text-xs">
            {formatSlotDate(submission.created_at)}
          </span>
        </div>

        {submission.body && (
          <p className="text-sm whitespace-pre-wrap">{submission.body}</p>
        )}

        {submission.files.length > 0 && (
          <ul className="flex flex-col gap-3">
            {submission.files.map((file) => (
              <SubmissionFile key={file.id} submissionId={submission.id} file={file} />
            ))}
          </ul>
        )}

        {/* Feedback sits ABOVE the student's own work on their page (the parent
            orders it), but within a card it belongs after what it responds to. */}
        {submission.feedback && (
          <div className="border-primary bg-muted/50 rounded-md border-l-2 p-3">
            <p className="text-xs font-medium">{t('submissions.feedback')}</p>
            <p className="text-sm whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        )}

        {actions}
      </CardContent>
    </Card>
  )
}
