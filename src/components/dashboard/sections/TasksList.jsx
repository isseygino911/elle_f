import { CheckSquare } from 'lucide-react'
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

export default function TasksList({ tasks, onMarkTaskDone }) {
  const { t } = useLanguage()

  if (tasks.count === 0) return <EmptyState>{t('dashboard.noPendingTasks')}</EmptyState>

  return (
    <ul className="flex flex-col">
      {tasks.tasks.map((task) => {
        const overdue = isOverdue(task.due_date)
        return (
          <li
            key={task.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
          >
            <span className="flex min-w-0 items-center gap-3">
              <DashboardRowIcon icon={CheckSquare} />
              <span className="flex min-w-0 flex-col gap-0.5">
                {task.title}
                {task.due_date && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {t('dashboard.due')} {formatSlotDate(task.due_date)}
                    {overdue && <Badge variant="priorityHigh">{t('dashboard.overdue')}</Badge>}
                  </span>
                )}
              </span>
            </span>
            <Button size="sm" variant="outline" onClick={() => onMarkTaskDone(task.id)}>
              {t('dashboard.markDone')}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
