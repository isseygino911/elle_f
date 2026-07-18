import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GraduationCap, Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { listStudentsProgress } from '../../api/client.js'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

function completionPercent(student) {
  if (!student.total_questions) return 0
  return Math.round((student.completed_questions / student.total_questions) * 100)
}

// The persistent master list panel for `/students` and `/students/:id` —
// same structural pattern as SurveysLayout/VideosLayout. Each row's meta
// line shows overall completion so elle can scan for who's behind without
// opening every student individually.
export default function StudentsLayout() {
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const { id: activeId } = useParams()

  const [status, setStatus] = useState('loading') // loading | success | error
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listStudentsProgress(accessToken)
      .then((body) => {
        if (cancelled) return
        setStudents(body.students)
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
  }, [accessToken])

  const averageCompletion =
    students.length > 0
      ? Math.round(students.reduce((sum, student) => sum + completionPercent(student), 0) / students.length)
      : 0

  const statTiles =
    status === 'success' && students.length > 0 ? (
      <StatTiles
        tiles={[
          { label: 'Total students', value: students.length, icon: Users },
          { label: 'Avg. completion', value: `${averageCompletion}%`, icon: GraduationCap },
        ]}
      />
    ) : null

  const list =
    status === 'success'
      ? students.map((student) => (
          <li key={student.student_id}>
            <RecordCard
              to={`/students/${student.student_id}`}
              icon={GraduationCap}
              title={student.student_name}
              meta={`${student.completed_questions}/${student.total_questions} days · ${completionPercent(student)}% complete`}
              pillLabel={`${completionPercent(student)}%`}
              pillVariant={completionPercent(student) >= 50 ? 'lime' : 'outlineDark'}
              selected={String(activeId) === String(student.student_id)}
            />
          </li>
        ))
      : []

  return (
    <MasterDetailLayout
      basePath="/students"
      title={t('students.title')}
      statTiles={statTiles}
      list={list}
      listEmpty={status === 'loading' ? t('students.loading') : status === 'error' ? error : t('students.empty')}
    />
  )
}
