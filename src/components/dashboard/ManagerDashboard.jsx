// The manager's entire view of the application: per-teacher aggregates.
//
// A manager oversees performance without seeing who the students are. The
// server enforces that — /dashboard returns only counts grouped by teacher for
// this role, and every per-student endpoint returns 403 — so this component
// renders what arrives and never asks for student detail.
//
// If you extend this, do not add a link into a student's records. There isn't
// one to follow: the API would refuse it.
export default function ManagerDashboard({ dashboard }) {
  const admins = dashboard.admins || []
  const totals = dashboard.totals || {}
  const tasks = totals.tasks || {}

  return (
    <div className="manager-dashboard">
      <section className="dashboard-section">
        <h2>Organization overview</h2>
        <ul className="stat-row">
          <li>
            <span className="stat-value">{totals.admin_count ?? 0}</span>
            <span className="stat-label">Teachers</span>
          </li>
          <li>
            <span className="stat-value">{totals.student_count ?? 0}</span>
            <span className="stat-label">Students</span>
          </li>
          <li>
            <span className="stat-value">{totals.upcoming_bookings ?? 0}</span>
            <span className="stat-label">Upcoming sessions</span>
          </li>
          <li>
            <span className="stat-value">{totals.pending_video_reviews ?? 0}</span>
            <span className="stat-label">Videos awaiting review</span>
          </li>
          <li>
            <span className="stat-value">{tasks.pending ?? 0}</span>
            <span className="stat-label">Open tasks</span>
          </li>
          <li>
            <span className="stat-value">{tasks.done ?? 0}</span>
            <span className="stat-label">Completed tasks</span>
          </li>
        </ul>
      </section>

      <section className="dashboard-section">
        <h2>By teacher</h2>

        {admins.length === 0 ? (
          <p>No teachers in this organization yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="manager-table">
              <thead>
                <tr>
                  <th scope="col">Teacher</th>
                  <th scope="col">Students</th>
                  <th scope="col">Upcoming</th>
                  <th scope="col">Completed</th>
                  <th scope="col">Videos to review</th>
                  <th scope="col">Unread messages</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.admin_id}>
                    <th scope="row">{admin.admin_name}</th>
                    <td>{admin.student_count}</td>
                    <td>{admin.upcoming_bookings}</td>
                    <td>{admin.completed_sessions}</td>
                    <td>{admin.pending_video_reviews}</td>
                    <td>{admin.unread_messages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
