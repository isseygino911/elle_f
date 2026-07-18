import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClipboardList, FileText } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { listSurveys, deleteSurvey } from '../../api/client.js'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'
import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/Page'
import ConfirmDialog from '@/components/ConfirmDialog'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function isWithinLastWeek(isoDate) {
  const uploaded = new Date(isoDate).getTime()
  if (Number.isNaN(uploaded)) return false
  return Date.now() - uploaded <= WEEK_MS
}

// The persistent master list panel + stat-tile row for `/surveys` and
// `/surveys/:id` (MASTER.md Layout Pattern section) — same structural
// pattern as VideosLayout. Replaces the standalone SurveyListPage;
// SurveyDetailPage.jsx (unchanged data-fetching/handlers) now renders
// inside this layout's <Outlet/>, so both URLs keep resolving as before.
//
// Deviation from MASTER.md's illustrative "pending + scored count" example:
// the `/surveys` list endpoint returns only survey metadata (title, file,
// uploaded_at) — no per-survey completion state — so a pending/scored
// count isn't available from already-fetched data without a new query.
// The stat tiles below use the two counts that genuinely are available
// from the fetched list (total surveys, surveys added this week).
export default function SurveysLayout() {
  const { accessToken, user } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()
  const isElle = Boolean(user && user.role === 'elle')

  const [status, setStatus] = useState('loading') // loading | success | error
  const [surveys, setSurveys] = useState([])
  const [error, setError] = useState(null)

  // Feature 1 (elle only): select mode for bulk survey deletion. `selectedIds`
  // only ever holds ids of surveys currently in `surveys`, so leaving select
  // mode / a successful delete can always just be cleared wholesale.
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function loadSurveys(isCancelled = () => false) {
    setStatus('loading')
    return listSurveys(accessToken)
      .then((body) => {
        if (isCancelled()) return
        setSurveys(body.surveys)
        setStatus('success')
      })
      .catch((err) => {
        if (isCancelled()) return
        setError((err.body && err.body.message) || err.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    let cancelled = false
    loadSurveys(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [accessToken])

  function toggleSelectMode() {
    setSelectMode((prev) => !prev)
    setSelectedIds(new Set())
    setDeleteError(null)
  }

  function toggleSelected(id, checked) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleConfirmDelete() {
    const ids = Array.from(selectedIds)
    setDeleting(true)
    setDeleteError(null)

    const results = await Promise.allSettled(ids.map((id) => deleteSurvey(accessToken, id)))
    const failures = results
      .map((result, index) => ({ result, id: ids[index] }))
      .filter(({ result }) => result.status === 'rejected')

    await loadSurveys()

    if (failures.length > 0) {
      const messages = failures.map(({ result }) => (result.reason?.body && result.reason.body.message) || result.reason?.message)
      setDeleteError(
        `Deleted ${ids.length - failures.length} of ${ids.length} surveys. ${failures.length} failed: ${messages.join('; ')}`
      )
      // Keep the still-undeleted ones selected so the user can see and retry.
      setSelectedIds(new Set(failures.map(({ id }) => id)))
    } else {
      setSelectedIds(new Set())
      setSelectMode(false)
    }

    setDeleting(false)
    setConfirmOpen(false)
  }

  const addedThisWeekCount = useMemo(() => surveys.filter((survey) => isWithinLastWeek(survey.uploaded_at)).length, [surveys])

  const statTiles =
    status === 'success' && surveys.length > 0 ? (
      <StatTiles
        tiles={[
          { label: 'Total surveys', value: surveys.length, icon: ClipboardList },
          { label: 'Added this week', value: addedThisWeekCount, icon: FileText },
        ]}
      />
    ) : null

  const list =
    status === 'success'
      ? surveys.map((survey) => (
          <li key={survey.id}>
            <RecordCard
              to={`/surveys/${survey.id}`}
              icon={ClipboardList}
              title={survey.title}
              meta={`${survey.original_filename} · ${survey.uploaded_at}`}
              pillLabel={isWithinLastWeek(survey.uploaded_at) ? 'New' : undefined}
              pillVariant="lime"
              selected={String(activeId) === String(survey.id)}
              checkbox={
                selectMode
                  ? {
                      checked: selectedIds.has(survey.id),
                      onChange: (checked) => toggleSelected(survey.id, checked),
                    }
                  : undefined
              }
            />
          </li>
        ))
      : []

  return (
    <>
      <MasterDetailLayout
        basePath="/surveys"
        title={t('surveys.title')}
        statTiles={
          <>
            {statTiles}
            {selectMode && deleteError && <ErrorAlert>{deleteError}</ErrorAlert>}
            {selectMode && selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
                Delete {selectedIds.size} selected
              </Button>
            )}
          </>
        }
        list={list}
        listEmpty={status === 'loading' ? t('surveys.loading') : status === 'error' ? error : t('surveys.empty')}
        actions={
          isElle ? (
            <Button size="sm" variant={selectMode ? 'secondary' : 'outline'} onClick={toggleSelectMode}>
              {selectMode ? t('surveys.cancel') : t('surveys.select')}
            </Button>
          ) : null
        }
      />
      {isElle && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(next) => {
            if (!deleting) setConfirmOpen(next)
          }}
          title={`Delete ${selectedIds.size} survey${selectedIds.size === 1 ? '' : 's'}?`}
          description="This can't be undone."
          pending={deleting}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}
