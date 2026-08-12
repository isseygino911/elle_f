import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GraduationCap, Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useLanguage } from '@/lib/LanguageContext'
import { listStudents } from '../../api/client.js'
import MasterDetailLayout from '@/components/records/MasterDetailLayout'
import RecordCard from '@/components/records/RecordCard'
import StatTiles from '@/components/records/StatTiles'

// The persistent master list panel for `/students` and `/students/:id` —
// same structural pattern as VideosLayout.
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

    listStudents(accessToken)
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

  const statTiles =
    status === 'success' && students.length > 0 ? (
      <StatTiles tiles={[{ label: 'Total students', value: students.length, icon: Users }]} />
    ) : null

  const list =
    status === 'success'
      ? students.map((student) => (
          <li key={student.id}>
            <RecordCard
              to={`/students/${student.id}`}
              icon={GraduationCap}
              title={student.name}
              meta={student.email}
              selected={String(activeId) === String(student.id)}
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
