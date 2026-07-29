import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { getStudentScores } from '../../api/client.js'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { LoadingText, ErrorAlert, EmptyState } from '@/components/Page'
import InsightCard from '@/components/records/InsightCard'

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
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </section>
        )}
      </div>

      {status === 'success' && student && scores.length > 0 && (
        <aside className="w-full shrink-0 lg:w-72">
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
        </aside>
      )}
    </div>
  )
}
