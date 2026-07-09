import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listMessages, sendMessage, markThreadRead } from '../../api/client.js'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { PageContainer, PageHeader, BackLink, LoadingText, EmptyState, ErrorAlert } from '@/components/Page'

const POLL_INTERVAL_MS = 15000

function maxId(messages) {
  return messages.reduce((max, message) => Math.max(max, message.id), 0)
}

function initials(label) {
  return (label || '?').trim().slice(0, 1).toUpperCase()
}

export default function MessageThreadPage() {
  const { studentId } = useParams()
  const { accessToken, user } = useAuth()

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
          setError(err.status === 404 ? 'Thread not found.' : (err.body && err.body.message) || err.message)
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
    } catch (err) {
      setSubmitError((err.body && err.body.message) || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Messages" />
      {status === 'loading' && <LoadingText>Loading messages...</LoadingText>}
      {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
      {status === 'success' && (
        <>
          <ScrollArea className="h-[28rem] rounded-md border border-border bg-muted/40">
            <ul className="flex flex-col gap-3 p-4">
              {messages.length === 0 && <EmptyState>No messages yet.</EmptyState>}
              {messages.map((message) => {
                const isOwn = message.sender_id === user.id
                return (
                  <li key={message.id} className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}>
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-xs">{initials(isOwn ? 'You' : message.sender_name)}</AvatarFallback>
                    </Avatar>
                    <div className={cn('flex max-w-[75%] min-w-0 flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                      {/* Reference chat panel: dark outgoing bubble, light incoming bubble. */}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm shadow-sm',
                          isOwn ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-card-foreground'
                        )}
                      >
                        {!isOwn && <p className="m-0 mb-0.5 text-xs font-semibold opacity-70">{message.sender_name}</p>}
                        <p className="m-0">{message.body}</p>
                      </div>
                      <span className="px-1 text-xs text-muted-foreground">
                        {message.created_at}
                        {isOwn && message.read_at && ' · Read'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="message-body">Message</FieldLabel>
                <Textarea
                  id="message-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  required
                />
              </Field>
              {submitError && <ErrorAlert>{submitError}</ErrorAlert>}
              <div>
                <Button type="submit" disabled={submitting || !body.trim()}>
                  {submitting ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </>
      )}
      <BackLink to="/dashboard">Back to dashboard</BackLink>
    </PageContainer>
  )
}
