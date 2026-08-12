import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { listStudents } from '../../api/client.js'
import { LoadingText, ErrorAlert } from '@/components/Page'
import AssignTeacherCard from '@/components/students/AssignTeacherCard'

export default function StudentDetailPage() {
  const { id } = useParams()
  const { accessToken } = useAuth()

  const [status, setStatus] = useState('loading') // loading | success | error
  const [student, setStudent] = useState(null)
  const [error, setError] = useState(null)

  // There is no GET /students/:id -- the roster endpoint is the only read of a
  // student record, so the one being viewed is picked out of it here. The list
  // is already scoped server-side to what this caller may see, so a student
  // outside that scope is simply absent and reads as "not found", which is the
  // same answer a dedicated endpoint would have given.
  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    listStudents(accessToken)
      .then((body) => {
        if (cancelled) return
        const match = body.students.find((row) => String(row.id) === String(id))
        if (!match) {
          setError('Student not found.')
          setStatus('error')
          return
        }
        setStudent(match)
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

  return (
    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        {status === 'loading' && <LoadingText>Loading student...</LoadingText>}
        {status === 'error' && <ErrorAlert>{error}</ErrorAlert>}
        {status === 'success' && student && (
          <section className="flex flex-col gap-3">
            <h2>{student.name}</h2>
            <p className="m-0 text-sm text-muted-foreground">{student.email}</p>
          </section>
        )}
      </div>

      {status === 'success' && student && (
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
          <AssignTeacherCard student={student} onAssigned={setStudent} />
        </aside>
      )}
    </div>
  )
}
