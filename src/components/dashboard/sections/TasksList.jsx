import { CheckSquare, CheckCircle2 } from 'lucide-react'
import DashboardRowIcon from '../DashboardRowIcon.jsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/Page'
import { useLanguage } from '@/lib/LanguageContext'
import { compareToEasternToday, formatSlotDate } from '@/utils/formatSlotTime'

// Unlike homework, a task's due date is NOT filtered server-side --
// serializeTask returns whatever is stored, so a task genuinely can be
// overdue and saying so is not fiction. This is the one place on the
// dashboard that earns an "Overdue" label.
//
// compareToEasternToday rather than a locally-built date string: "overdue"
// means the EASTERN calendar day has passed, which is the same day the due
// date was set in. Building "today" from the browser's clock flagged tasks as
// overdue a day early for anyone east of Eastern time, and a day late for
// anyone west -- and work due TODAY is still due, not late, which is why this
// tests < 0 rather than <= 0.
function isOverdue(dueDate) {
  if (!dueDate) return false
  return compareToEasternToday(dueDate) < 0
}

// `students` is optional and only supplied by the teacher dashboard, which
// already loads the roster for CreateTaskDialog -- so the assignee's name
// costs no extra fetch and no change to serializeTask, which returns
// assigned_to as a bare id. A student's own list passes nothing: every task
// there is theirs, and naming themselves on every row says nothing.
export default function TasksList({ tasks, onMarkTaskDone, students }) {
  const { t } = useLanguage()

  // tasks.count is the PENDING count, so it cannot stand in for emptiness any
  // more -- a list holding only completed tasks has count 0 and still has
  // something to show.
  if (tasks.tasks.length === 0) return <EmptyState>{t('dashboard.noPendingTasks')}</EmptyState>

  return (
    <ul className="flex flex-col">
      {tasks.tasks.map((task) => {
        const done = task.status === 'done'
        // Overdue is meaningless once the work is finished -- a task completed
        // after its due date is done, not late.
        const overdue = !done && isOverdue(task.due_date)
        const assignee = students?.find((student) => String(student.id) === String(task.assigned_to))
        return (
          <li
            key={task.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
          >
            <span className="flex min-w-0 items-center gap-3">
              <DashboardRowIcon icon={done ? CheckCircle2 : CheckSquare} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className={done ? 'text-muted-foreground line-through' : undefined}>{task.title}</span>
                {(assignee || task.due_date) && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {assignee && <span>{assignee.name}</span>}
                    {assignee && task.due_date && <span aria-hidden="true">·</span>}
                    {task.due_date && (
                      <span>
                        {t('dashboard.due')} {formatSlotDate(task.due_date)}
                      </span>
                    )}
                    {overdue && <Badge variant="priorityHigh">{t('dashboard.overdue')}</Badge>}
                  </span>
                )}
              </span>
            </span>
            {done ? (
              <CheckCircle2
                className="size-5 shrink-0 text-success"
                aria-label={t('dashboard.completed')}
              />
            ) : (
              <Button size="sm" variant="outline" onClick={() => onMarkTaskDone(task.id)}>
                {t('dashboard.markDone')}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
