import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { getVideo, getVideoPlaybackUrl, listComments, createComment, deleteVideo } from '../../api/client.js'
import { formatDuration } from '../../utils/formatDuration.js'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import InsightCard from '@/components/records/InsightCard'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function VideoDetailPage() {
  const { id } = useParams()
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [status, setStatus] = useState('loading') // loading | success | error
  const [video, setVideo] = useState(null)
  const [error, setError] = useState(null)

  const [playbackUrl, setPlaybackUrl] = useState(null)
  const [playbackError, setPlaybackError] = useState(null)
  const [loadingPlayback, setLoadingPlayback] = useState(false)

  const [commentsStatus, setCommentsStatus] = useState('loading') // loading | success | error
  const [comments, setComments] = useState([])
  const [commentsError, setCommentsError] = useState(null)

  const [commentBody, setCommentBody] = useState('')
  const [commentTimestamp, setCommentTimestamp] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getVideo(accessToken, id)
      .then((body) => {
        if (!cancelled) {
          setVideo(body.video)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 404 ? 'Video not found.' : (err.body && err.body.message) || err.message)
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, id])

  useEffect(() => {
    let cancelled = false
    setCommentsStatus('loading')

    listComments(accessToken, id)
      .then((body) => {
        if (!cancelled) {
          setComments(body.comments)
          setCommentsStatus('success')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCommentsError((err.body && err.body.message) || err.message)
          setCommentsStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, id])

  async function handleLoadVideo() {
    setPlaybackError(null)
    setLoadingPlayback(true)
    try {
      const { url } = await getVideoPlaybackUrl(accessToken, id)
      setPlaybackUrl(url)
    } catch (err) {
      setPlaybackError((err.body && err.body.message) || err.message)
    } finally {
      setLoadingPlayback(false)
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault()
    if (!commentBody.trim()) return

    setSubmitError(null)
    setSubmittingComment(true)
    try {
      const { comment, video: updatedVideo } = await createComment(accessToken, id, {
        body: commentBody,
        timestamp_sec: commentTimestamp === '' ? null : Number(commentTimestamp),
      })
      setComments((prev) => [...prev, comment])
      setVideo(updatedVideo)
      setCommentBody('')
      setCommentTimestamp('')
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Feature 2: any uploader may delete their own video, but only while it has
  // zero comments (the server enforces this too — 409 if a comment was added
  // concurrently between page load and this click). A 403/409 here means the
  // video itself didn't change, so this only ever surfaces the error inline;
  // it never removes anything from local state or navigates away.
  async function handleDeleteVideo() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteVideo(accessToken, id)
      navigate('/videos')
    } catch (err) {
      setDeleteError((err.body && err.body.message) || err.message)
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const canDelete = Boolean(video && user && video.uploaded_by === user.id && commentsStatus === 'success' && comments.length === 0)

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        {status === 'loading' && <LoadingText>Loading video...</LoadingText>}
        {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
        {status === 'success' && video && (
          <section className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="m-0">{video.title}</h2>
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete video
                </Button>
              )}
            </div>
            <p className="m-0 text-sm text-muted-foreground">
              {video.type} — {video.status} — {formatDuration(video.duration_sec)} — {video.created_at}
            </p>
            {deleteError && <ErrorAlert>{deleteError}</ErrorAlert>}
            {playbackUrl ? (
              <video controls src={playbackUrl} className="max-w-full rounded-md border border-border" />
            ) : (
              <div>
                <Button onClick={handleLoadVideo} disabled={loadingPlayback}>
                  {loadingPlayback ? 'Loading video...' : 'Load video'}
                </Button>
              </div>
            )}
            {playbackError && <ErrorAlert>{playbackError}</ErrorAlert>}

            <section className="flex flex-col gap-3 border-t border-border pt-5">
              <h3>Comments</h3>
              {commentsStatus === 'loading' && <LoadingText>Loading comments...</LoadingText>}
              {commentsStatus === 'error' && <ErrorAlert>{commentsError}</ErrorAlert>}
              {commentsStatus === 'success' && (
                <ul className="flex flex-col">
                  {comments.length === 0 && <EmptyState>No comments yet.</EmptyState>}
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 last:pb-0">
                      <span className="flex flex-wrap items-baseline gap-1">
                        <strong>{comment.author_id === user.id ? 'You' : comment.author_name}</strong>
                        {comment.body}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {comment.timestamp_sec !== null && comment.timestamp_sec !== undefined && (
                          <>@ {formatDuration(comment.timestamp_sec)} · </>
                        )}
                        {comment.created_at}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmitComment} className="rounded-md border border-border bg-muted p-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="comment-body">Comment</FieldLabel>
                    <Textarea
                      id="comment-body"
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="comment-timestamp">Timestamp (sec, optional)</FieldLabel>
                    <Input
                      id="comment-timestamp"
                      type="number"
                      min="0"
                      value={commentTimestamp}
                      onChange={(event) => setCommentTimestamp(event.target.value)}
                    />
                  </Field>
                  {submitError && <ErrorAlert>{submitError}</ErrorAlert>}
                  <div>
                    <Button type="submit" disabled={submittingComment || !commentBody.trim()}>
                      {submittingComment ? 'Posting...' : 'Post comment'}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </section>
          </section>
        )}
      </div>

      {status === 'success' && video && (
        <aside className="w-full shrink-0 lg:w-72">
          <InsightCard tone="violet" title="Review status">
            <p className="m-0">
              <span className="font-semibold">{video.status === 'reviewed' ? 'Reviewed' : 'Pending review'}</span>
            </p>
            <p className="m-0 opacity-80">
              {video.type} video · {formatDuration(video.duration_sec)}
            </p>
            <p className="m-0 opacity-80">Uploaded {video.created_at}</p>
            <p className="m-0 opacity-80">
              {commentsStatus === 'success' ? `${comments.length} comment${comments.length === 1 ? '' : 's'}` : 'Comments loading…'}
            </p>
          </InsightCard>
        </aside>
      )}

      {canDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!deleting) setConfirmOpen(next)
          }}
          title="Delete this video?"
          description="This can't be undone."
          pending={deleting}
          onConfirm={handleDeleteVideo}
        />
      )}
    </div>
  )
}
