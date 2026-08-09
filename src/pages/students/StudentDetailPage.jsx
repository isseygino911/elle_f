import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getStudentScores, downloadStudentSurvey } from '../../api/client.js'
import { saveBlob } from '../../utils/saveBlob.js'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { LoadingText, ErrorAlert, EmptyState } from '@/components/Page'
import InsightCard from '@/components/records/InsightCard'
import AssignTeacherCard from '@/components/students/AssignTeacherCard'

function percent(earned, total) {
  if (!total) return 0
  return Math.round((earned / total) * 100)
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { language } = useLanguage()

  const [status, setStatus] = useState('loading') // loading | success | error
  const [student, setStudent] = useState(null)
  const [scores, setScores] = useState([])
  const [error, setError] = useState(null)
  // Which survey's download is in flight, so only that row's button shows a
  // pending state rather than every row at once.
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getStudentScores(accessToken, id)
      .then((body) => {
        if (cancelled) return
        setStudent(body.student)
        setScores(body.scores)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.status === 404 ? 'Student not found.' : (err.body && err.body.message) || err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, id])

  // Downloads this student's answers for one survey as a printable document.
  // This whole route is already gated to owner/admin (App.jsx's
  // canReadStudentDetail), so no further role check is needed here.
  async function handleDownload(survey) {
    setDownloadError(null)
    setDownloadingId(survey.survey_id)
    try {
      const { blob, filename } = await downloadStudentSurvey(accessToken, survey.survey_id, {
        studentId: id,
        language,
      })
      saveBlob(blob, filename)
    } catch (err) {
      setDownloadError((err.body && err.body.message) || err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  const totalQuestions = scores.reduce((sum, survey) => sum + survey.total_questions, 0)
  const completedQuestions = scores.reduce((sum, survey) => sum + survey.completed_questions, 0)
  const totalPoints = scores.reduce((sum, survey) => sum + survey.total_points, 0)
  const earnedPoints = scores.reduce((sum, survey) => sum + survey.earned_points, 0)

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        {status === 'loading' && <LoadingText>Loading student...</LoadingText>}
        {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
        {status === 'success' && student && (
          <section className="flex flex-col gap-3">
            <h2>{student.name}</h2>
            <p className="m-0 text-sm text-muted-foreground">{student.email}</p>

            {downloadError && <ErrorAlert>{downloadError}</ErrorAlert>}

            {scores.length === 0 ? (
              <EmptyState>No surveys have been uploaded yet.</EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey</TableHead>
                    <TableHead>Days completed</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last submitted</TableHead>
                    <TableHead className="w-px whitespace-nowrap">
                      <span className="sr-only">Download</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((survey) => {
                    const isComplete = survey.completed_questions === survey.total_questions
                    return (
                      <TableRow key={survey.survey_id}>
                        <TableCell>
                          <Link
                            to={`/surveys/${survey.survey_id}?student_id=${encodeURIComponent(id)}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {language === 'zh' && survey.title_zh ? survey.title_zh : survey.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            {survey.completed_questions}/{survey.total_questions}
                            {isComplete && <Badge variant="success">Complete</Badge>}
                          </span>
                        </TableCell>
                        <TableCell>
                          {survey.earned_points}/{survey.total_points} pts ({percent(survey.earned_points, survey.total_points)}%)
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {survey.last_submitted_at ? survey.last_submitted_at : '—'}
                        </TableCell>
                        <TableCell>
                          {/* Offered even for a survey with no submissions yet:
                              the document still prints every question with its
                              scale blank, which is a useful record of what the
                              student has not done. */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Download ${survey.title} for ${student.name}`}
                            disabled={downloadingId === survey.survey_id}
                            onClick={() => handleDownload(survey)}
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </section>
        )}
      </div>

      {/*
        The rail renders whenever a student has loaded, not only when they have
        scores. A student with no surveys yet is precisely the one most likely
        to need assigning to a teacher, so gating the whole rail on
        scores.length would hide that control exactly when it is needed. The
        progress card keeps its own scores.length check.
      */}
      {status === 'success' && student && (
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
          {scores.length > 0 && (
            <InsightCard tone="lime" title="Overall progress">
              <p className="m-0">
                <span className="font-semibold">
                  {completedQuestions} of {totalQuestions} days completed
                </span>
              </p>
              <p className="m-0 opacity-80">
                {earnedPoints} of {totalPoints} points ({percent(earnedPoints, totalPoints)}%)
              </p>
            </InsightCard>
          )}
          <AssignTeacherCard student={student} onAssigned={setStudent} />
        </aside>
      )}
    </div>
  )
}
