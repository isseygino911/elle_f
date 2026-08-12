import { useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { isManager } from '../../lib/roles.js'
import { Alert, AlertDescription } from '@/components/ui/alert'
import InsightCard from '@/components/records/InsightCard'
import { LoadingText, EmptyState, ErrorAlert } from '@/components/Page'
import { withCount } from '@/utils/withCount'

// One sent announcement, read out of the list BroadcastsLayout already
// fetched -- the API has no get-one endpoint (see the layout's note).
//
// A broadcast is immutable once sent: the route exposes no PATCH or DELETE,
// so a row served from that cached array can only ever be *missing*, never
// stale-and-wrong. That is what makes reading from the list safe here.
export default function BroadcastDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { broadcasts, status, error } = useOutletContext() ?? {}

  const broadcast = broadcasts?.find((row) => String(row.id) === String(id))
  const oversightOnly = isManager(user)

  const audienceLabels = {
    students: t('broadcasts.audienceStudents'),
    teachers: t('broadcasts.audienceTeachers'),
    both: t('broadcasts.audienceBoth'),
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        {status === 'loading' && <LoadingText>{t('broadcasts.loading')}</LoadingText>}
        {status === 'error' && <ErrorAlert>{error || t('broadcasts.loadError')}</ErrorAlert>}

        {/*
          Branched on status rather than on `broadcast` alone. Testing only for
          a missing row would report "no longer in this list" during the window
          after a hard refresh where the fetch has not yet resolved -- the row
          is absent then too, but the honest answer is "loading".

          Genuinely reachable once loaded, and not only via a mistyped URL: the
          list is capped at the server's default limit of 50, so a deep link to
          an older announcement lands here legitimately.
        */}
        {status === 'success' && !broadcast && <EmptyState>{t('broadcasts.notFound')}</EmptyState>}

        {status === 'success' && broadcast && (
          <section className="flex flex-col gap-3">
            <h2 className="m-0">{broadcast.title}</h2>

            {/*
              Absent for a manager: the server omits the key entirely rather
              than blanking it, so this renders nothing at all rather than an
              empty paragraph. Optional-chained because "no body" is a
              legitimate shape here, not a missing value.

              whitespace-pre-wrap because an announcement's line breaks are
              authored -- the sender laid the message out deliberately.
            */}
            {broadcast.body && <p className="m-0 whitespace-pre-wrap">{broadcast.body}</p>}

            {/*
              Sits where the body would be, rather than above the whole screen
              as it did on the old flat page. It explains this specific blank
              space, so it belongs beside it.

              Gated on isManager, not on the absence of a body: a body can be
              absent for no other role, and deriving it from `!body` would make
              the copy appear for any future shape that happens to omit one.
            */}
            {oversightOnly && (
              <Alert>
                <AlertDescription>{t('broadcasts.oversightNote')}</AlertDescription>
              </Alert>
            )}
          </section>
        )}
      </div>

      {/*
        Violet, not lime. Lime carries one meaning throughout this app --
        selection -- and you arrive here by clicking a card that is lime-filled
        at that moment; a lime rail beside it would read as one continuous
        highlight. An announcement is a completed act with nothing pending, so
        violet's "status/metadata about this record" register is the right one,
        the same use VideoDetailPage makes of it.

        Every field below survives serializeBroadcast for EVERY role including
        the manager -- only `body` is dropped. So this rail is identical across
        roles, which is exactly right: it is the manager's entire view of an
        announcement, and it is complete.
      */}
      {status === 'success' && broadcast && (
        <aside className="w-full shrink-0 lg:w-72">
          <InsightCard tone="violet" title={t('broadcasts.insightTitle')}>
            <p className="m-0">
              <span className="font-semibold">
                {broadcast.recipient_count === 1
                  ? t('broadcasts.recipientCountOne')
                  : withCount(t('broadcasts.recipientCount'), broadcast.recipient_count)}
              </span>
            </p>
            <p className="m-0 opacity-80">
              {t('broadcasts.insightAudience')}: {audienceLabels[broadcast.audience] || broadcast.audience}
            </p>
            <p className="m-0 opacity-80">
              {t('broadcasts.insightSender')}: {broadcast.sender_name}
            </p>
            <p className="m-0 opacity-80">
              {t('broadcasts.insightSentAt')}: {new Date(broadcast.created_at).toLocaleString()}
            </p>
          </InsightCard>
        </aside>
      )}
    </div>
  )
}
