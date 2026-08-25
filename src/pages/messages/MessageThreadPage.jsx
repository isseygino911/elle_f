import { useEffect, useRef, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { canManageStudents } from '../../lib/roles.js'
import { useLanguage } from '@/lib/LanguageContext'
import { listMessages, sendMessage, markThreadRead } from '../../api/client.js'
import { cn } from '@/lib/utils'
import { withCount } from '@/utils/withCount'
import { initials } from '@/utils/initials'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import InsightCard from '@/components/records/InsightCard'
import { PageContainer, BackLink, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import { formatMessageTimestamp } from '@/utils/formatSlotTime'

const POLL_INTERVAL_MS = 15000

function maxId(messages) {
  return messages.reduce((max, message) => Math.max(max, message.id), 0)
}

export default function MessageThreadPage() {
  const { studentId } = useParams()
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  // Populated by MessagesLayout (elle's student-list view) so the detail
  // pane can show who this thread is with; absent for a student's own
  // single-thread view, where there's only ever one correspondent anyway.
  const outletContext = useOutletContext()
  const student = outletContext?.students?.find((candidate) => String(candidate.id) === String(studentId))
  // 'idle' when there is no list at all -- a student reaching their own thread
  // directly, where a missing `student` is the normal shape rather than a
  // lookup that failed.
  const listStatus = outletContext?.status

  const [status, setStatus] = useState('loading') // loading | success | error
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Kept in sync with `messages` so the poll interval's closure can compare
  // against the latest rendered state without re-creating the interval on
  // every message update.
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // The newest message is the one you came to read, and a thread opens with
  // the scroll region at the top by default -- so on a long history the useful
  // end is off-screen until you drag to it.
  const bottomRef = useRef(null)
  useEffect(() => {
    // 'auto' rather than 'smooth': on first load there is nothing to follow,
    // and animating a jump the user did not initiate reads as the page moving
    // on its own. Arrivals and sends below scroll smoothly, where the motion
    // is tracking a change the user can see.
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [status])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listMessages(accessToken, studentId)
      .then((responseBody) => {
        if (cancelled) return
        setMessages(responseBody.messages)
        setStatus('success')
        // Opening the thread means we've seen the other party's messages.
        // Fire-and-forget: a failure here shouldn't hide the thread we just
        // successfully loaded, and the next poll will retry anyway since
        // this endpoint is idempotent.
        markThreadRead(accessToken, studentId).catch(() => {})
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 404 ? t('messages.threadNotFound') : (err.body && err.body.message) || err.message)
          setStatus('error')
        }
      })

    const intervalId = setInterval(() => {
      listMessages(accessToken, studentId)
        .then((responseBody) => {
          if (cancelled) return
          const newMessages = responseBody.messages
          const oldMax = maxId(messagesRef.current)
          const newMax = maxId(newMessages)
          if (newMax > oldMax) {
            setMessages(newMessages)
            bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            const hasNewFromOtherParty = newMessages.some(
              (message) => message.id > oldMax && message.sender_id !== user.id
            )
            if (hasNewFromOtherParty) {
              markThreadRead(accessToken, studentId).catch(() => {})
            }
          }
        })
        .catch(() => {
          // Ignore poll errors; keep showing the last known-good thread.
        })
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
    // t is intentionally omitted: it changes identity when the language does,
    // and re-running this effect for that would refetch the thread and reset
    // the poll on a language switch. The only t() call here is the 404 copy,
    // which is written at fetch time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, studentId, user.id])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!body.trim()) return

    setSubmitError(null)
    setSubmitting(true)
    try {
      const { message } = await sendMessage(accessToken, studentId, body)
      setMessages((prev) => [...prev, message])
      setBody('')
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message || t('messages.sendError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Elle's list panel knows this student; a student's own thread has no list,
  // so it falls back to the screen's own title rather than showing nothing.
  const heading = student ? student.name : t('messages.title')

  const unreadCount = student ? outletContext?.unreadByStudent?.[student.id] || 0 : 0
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

  return (
    // Same PageContainer as the student table, so the thread lines up with the
    // page you opened it from instead of running to the window edge -- it is a
    // page in its own right now, not a detail pane inside a list layout. The
    // wider cap gives the bubbles and the insight rail room to sit side by side.
    <PageContainer className="[--content-max-width:76rem] lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {/* The table this thread opened from is a page of its own now, not a
            rail still visible beside it, so the way back has to be on the
            thread itself. Only Elle has a table to go back to. */}
        {canManageStudents(user) && <BackLink to="/messages">{t('messages.backToList')}</BackLink>}
        <div className="flex flex-col gap-1">
          <h2 className="m-0">{heading}</h2>
          {student && <p className="m-0 text-sm text-muted-foreground">{student.email}</p>}
        </div>

        {/* A thread whose student is absent from a list that HAS loaded is a
            genuine not-found; the same absence while the list is still in
            flight is not, and reporting it as one is what makes a hard refresh
            flash an error. Only Elle has a list to be absent from. */}
        {listStatus === 'success' && !student && <EmptyState>{t('messages.threadNotFound')}</EmptyState>}

        {status === 'loading' && <LoadingText>{t('messages.loadingThread')}</LoadingText>}
        {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
        {status === 'success' && (
          <>
            {/* min-h-0 so this can actually shrink inside the flex column --
                a fixed height here (it was h-[28rem]) both overflowed short
                panes and left the thread floating in tall ones. */}
            <ScrollArea className="min-h-0 flex-1 rounded-sm border border-border bg-muted">
              <ul className="flex flex-col gap-3 p-4">
                {messages.length === 0 && <EmptyState>{t('messages.noMessages')}</EmptyState>}
                {messages.map((message) => {
                  const isOwn = message.sender_id === user.id
                  return (
                    <li
                      key={message.id}
                      className={cn(
                        'flex items-end gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
                        isOwn && 'flex-row-reverse'
                      )}
                    >
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-xs">
                          {initials(isOwn ? t('messages.you') : message.sender_name, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn('flex max-w-[75%] min-w-0 flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                        {/* Reference chat panel: dark outgoing bubble, light incoming bubble.
                            rounded-sm is the 12px step -- a bubble is a small element, and
                            the app's larger radii are for cards and panels. */}
                        <div
                          className={cn(
                            'rounded-sm px-3 py-2 text-sm shadow-sm',
                            isOwn ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-card-foreground'
                          )}
                        >
                          {!isOwn && <p className="m-0 mb-0.5 text-xs font-semibold opacity-70">{message.sender_name}</p>}
                          <p className="m-0 whitespace-pre-wrap">{message.body}</p>
                        </div>
                        {/* formatMessageTimestamp, not the raw column: created_at
                            arrives as a full ISO instant, so interpolating it
                            directly printed "2026-08-11T15:31:50.000Z" under
                            every bubble. Same class of bug as the one fixed in
                            PendingVideoReviewsList. */}
                        <span className="px-1 text-xs text-muted-foreground">
                          {formatMessageTimestamp(message.created_at)}
                          {isOwn && message.read_at && ` · ${t('messages.read')}`}
                        </span>
                      </div>
                    </li>
                  )
                })}
                {/* Scroll anchor. Inside the list so it sits after the last
                    bubble rather than after the scroll region itself. */}
                <li ref={bottomRef} aria-hidden="true" className="h-0" />
              </ul>
            </ScrollArea>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="message-body">{t('messages.messageLabel')}</FieldLabel>
                  <Textarea
                    id="message-body"
                    value={body}
                    placeholder={t('messages.messagePlaceholder')}
                    onChange={(event) => setBody(event.target.value)}
                    required
                  />
                </Field>
                {submitError && <ErrorAlert>{submitError}</ErrorAlert>}
                <div>
                  <Button type="submit" disabled={submitting || !body.trim()}>
                    {submitting ? t('messages.sending') : t('messages.send')}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </>
        )}
      </div>

      {/*
        Lime, unlike the violet on an announcement's rail. The distinction is
        deliberate: an announcement is a finished act, while a conversation is
        live and is the thing this screen asks you to act on. Lime is this
        system's active register, the same use Students and Bookings make of it.

        Only rendered for Elle: a student has one correspondent and no unread
        map, so every line here would either be about themselves or blank.
      */}
      {status === 'success' && student && (
        <aside className="w-full shrink-0 lg:w-72">
          <InsightCard tone="lime" title={t('messages.insightTitle')}>
            <p className="m-0">
              <span className="font-semibold">
                {unreadCount === 0
                  ? t('messages.insightUnreadNone')
                  : unreadCount === 1
                    ? t('messages.unreadPillOne')
                    : withCount(t('messages.unreadPill'), unreadCount)}
              </span>
            </p>
            <p className="m-0 opacity-80">
              {t('messages.insightTotal')}: {messages.length}
            </p>
            <p className="m-0 opacity-80">
              {t('messages.insightLastActivity')}:{' '}
              {lastMessage ? formatMessageTimestamp(lastMessage.created_at) : t('messages.insightNoActivity')}
            </p>
          </InsightCard>
        </aside>
      )}
    </PageContainer>
  )
}
