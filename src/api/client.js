const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Shared by request() and the multipart uploaders (which must bypass request()
// to send multipart/form-data without a JSON Content-Type) so the
// non-2xx-throw behavior isn't duplicated.
async function parseJsonResponse(response) {
  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`)
    error.status = response.status
    error.body = data
    throw error
  }

  return data
}

async function request(path, { method = 'GET', body, credentials, accessToken } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials,
  })

  return parseJsonResponse(response)
}

export async function getHealth() {
  return request('/api/health')
}

export async function checkInvitation(token) {
  return request(`/invitations/${encodeURIComponent(token)}`)
}

export async function register({ token, name, email, password }) {
  return request('/auth/register', { method: 'POST', body: { token, name, email, password } })
}

// Organization signup: creates the organization and its owner account in one
// request. The server does both in a single transaction, so an organization
// can never exist without an owner. Returns { organization, user } but no
// tokens — the client then logs in normally, matching how register() behaves.
export async function registerOrganization({ organization_name, name, email, password }) {
  return request('/auth/register-organization', {
    method: 'POST',
    body: { organization_name, name, email, password }
  })
}

export async function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password }, credentials: 'include' })
}

export async function refresh() {
  return request('/auth/refresh', { method: 'POST', credentials: 'include' })
}

export async function logout() {
  return request('/auth/logout', { method: 'POST', credentials: 'include' })
}

// Request a reset link. Always resolves 200 with the same message whether or
// not the address is registered — the server refuses to confirm account
// existence, so the UI must not imply it did.
export async function forgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } })
}

// Check a reset link and find out whose it is.
//
// Returns { valid, name, role } — role comes from the token's user row, which
// is how the reset page knows what kind of account it is restoring without
// asking. No access token: the reset token IS the credential here.
export async function checkResetToken(token) {
  return request(`/auth/reset-password/${encodeURIComponent(token)}`)
}

// Complete the reset. Returns { role }. Issues no session — the user logs in
// with the new password afterwards, same as after registration.
export async function resetPassword({ token, password }) {
  return request('/auth/reset-password', { method: 'POST', body: { token, password } })
}

// `role` is omitted rather than sent as 'student' when unset, so this keeps
// matching the server's default and an admin's request stays byte-identical
// to what it was before role selection existed. Who may invite which role is
// enforced server-side (invitations.route.js INVITABLE_ROLES).
export async function createInvitation(accessToken, { studentNameHint, role } = {}) {
  return request('/invitations', {
    method: 'POST',
    body: {
      student_name_hint: studentNameHint || undefined,
      role: role && role !== 'student' ? role : undefined,
    },
    accessToken,
  })
}

// The caller's own organization. Available to every role — it is the name on
// the building, and the server derives which one from the token, so there is
// no id to pass and no way to ask about another tenant.
export async function getOrganization(accessToken) {
  return request('/organization', { accessToken })
}

// Update organization settings. Owner-only; the server returns 403 for anyone
// else. Takes a partial object -- { name } to rename, { show_name_with_logo }
// to change whether the name renders beside the brand logo, { theme } to pick
// the accent palette, or any combination. The server writes only the keys it
// receives, so saving one setting never overwrites another with a stale value.
//
// `theme` must be one of the slugs in lib/orgThemes.js; the server validates
// against its own copy of that list and 400s on anything else.
export async function updateOrganization(accessToken, fields) {
  return request('/organization', { method: 'PATCH', body: fields, accessToken })
}

// Upload or replace the organization's brand logo. Bypasses request() because
// a multipart body must not carry a JSON Content-Type, and the boundary has to
// be set by the browser.
export async function uploadOrganizationLogo(accessToken, file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/organization/logo`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  return parseJsonResponse(response)
}

// Remove the logo. The sidebar falls back to the text wordmark.
export async function deleteOrganizationLogo(accessToken) {
  return request('/organization/logo', { method: 'DELETE', accessToken })
}

// Outstanding and past invitations for the caller's organization. An owner
// gets all of them; an admin gets only the ones they issued. Tokens are never
// returned, so this can show that an invite is pending but not re-surface the
// link — a lost one is reissued.
export async function listInvitations(accessToken) {
  return request('/invitations', { accessToken })
}

export async function requestVideoUploadUrl(accessToken, meta) {
  return request('/videos/upload-url', { method: 'POST', body: meta, accessToken })
}

export async function confirmVideoUpload(accessToken, data) {
  return request('/videos', { method: 'POST', body: data, accessToken })
}

export async function listVideos(accessToken, { studentId, type, status } = {}) {
  const params = new URLSearchParams()
  if (studentId) params.set('student_id', studentId)
  if (type) params.set('type', type)
  if (status) params.set('status', status)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/videos${query}`, { accessToken })
}

export async function getVideo(accessToken, id) {
  return request(`/videos/${encodeURIComponent(id)}`, { accessToken })
}

export async function getVideoPlaybackUrl(accessToken, id) {
  return request(`/videos/${encodeURIComponent(id)}/playback-url`, { accessToken })
}

export async function listComments(accessToken, videoId) {
  return request(`/videos/${encodeURIComponent(videoId)}/comments`, { accessToken })
}

export async function createComment(accessToken, videoId, { body, timestamp_sec } = {}) {
  return request(`/videos/${encodeURIComponent(videoId)}/comments`, {
    method: 'POST',
    body: { body, timestamp_sec },
    accessToken,
  })
}

export async function listMessages(accessToken, studentId) {
  return request(`/messages/${encodeURIComponent(studentId)}`, { accessToken })
}

export async function sendMessage(accessToken, studentId, body) {
  return request(`/messages/${encodeURIComponent(studentId)}`, {
    method: 'POST',
    body: { body },
    accessToken,
  })
}

export async function markThreadRead(accessToken, studentId) {
  return request(`/messages/${encodeURIComponent(studentId)}/read`, { method: 'PATCH', accessToken })
}

export async function getDashboard(accessToken) {
  return request('/dashboard', { accessToken })
}

// `limit`/`offset` are the server's own paging params (limit is capped at 100
// server-side). The drawer asks for a page; the badge only needs the
// unread_count that every response carries regardless of these.
export async function listNotifications(accessToken, { unreadOnly, limit, offset } = {}) {
  const params = new URLSearchParams()
  if (unreadOnly) params.set('unread', 'true')
  if (limit != null) params.set('limit', String(limit))
  if (offset != null) params.set('offset', String(offset))
  const query = params.toString()
  return request(`/notifications${query ? `?${query}` : ''}`, { accessToken })
}

export async function markNotificationRead(accessToken, notificationId) {
  return request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH', accessToken })
}

// PATCH /notifications/read-all has existed server-side since the notification
// work landed but had no caller until the drawer needed it.
export async function markAllNotificationsRead(accessToken) {
  return request('/notifications/read-all', { method: 'PATCH', accessToken })
}

// Unread mail totals without the thread bodies -- what the shell's nav badge
// polls. Returns { total_count, by_student }; MessagesLayout uses the
// breakdown, the badge uses the total.
export async function getUnreadMessageCount(accessToken) {
  return request('/messages/unread-count', { accessToken })
}

export async function createBroadcast(accessToken, { audience, title, body } = {}) {
  return request('/broadcasts', { method: 'POST', body: { audience, title, body }, accessToken })
}

// The SENDER's outbox, and the owner/manager oversight feed. A student's copy
// of a broadcast arrives as a notification instead, so nothing calls this for
// them -- the server answers 403.
//
// A manager's rows carry no `body` key at all (the server drops it, not the
// UI), so anything rendering these must treat body as optional rather than
// assuming a string.
export async function listBroadcasts(accessToken, { limit, offset } = {}) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/broadcasts${query}`, { accessToken })
}

export async function createTask(accessToken, { title, assigned_to, due_date } = {}) {
  return request('/tasks', { method: 'POST', body: { title, assigned_to, due_date }, accessToken })
}

export async function updateTaskStatus(accessToken, taskId, status) {
  return request(`/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: { status }, accessToken })
}

// `adminId` names WHOSE calendar to read. A teacher and a student both resolve
// it server-side from their own identity and must omit it; an owner has no
// calendar of their own, so the server rejects the request without it. Every
// scheduling call below carries the same optional parameter for that reason —
// see the server's utils/calendarAdmin.js.
export async function listOpenSlots(accessToken, date, adminId) {
  const params = new URLSearchParams({ date })
  if (adminId) params.set('admin_id', String(adminId))
  return request(`/bookings/open-slots?${params.toString()}`, { accessToken })
}

// Open slots for a whole date range in ONE request. The month view needs ~30
// days; calling listOpenSlots per day would be ~30 round trips.
//
// Returns { from, to, slots_by_date } where slots_by_date has an entry for
// EVERY date in the range, empty array included — so a grid never has to
// distinguish "no availability" from "day missing from the response".
//
// The backend caps the span at 31 days and 400s past it. Note that the
// single-day listOpenSlots above will NOT complain if you pass extra params:
// zod strips unknown query keys, so `?date=…&to=…` returns 200 for one day
// with `to` silently discarded. A wrong-endpoint mistake looks like it worked.
export async function listOpenSlotsRange(accessToken, from, to, adminId) {
  const params = new URLSearchParams({ from, to })
  if (adminId) params.set('admin_id', String(adminId))
  return request(`/bookings/open-slots-range?${params.toString()}`, { accessToken })
}

export async function listBookings(accessToken, { status, upcoming } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (upcoming) params.set('upcoming', 'true')
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/bookings${query}`, { accessToken })
}

export async function createBooking(accessToken, { scheduled_at, student_id } = {}) {
  return request('/bookings', { method: 'POST', body: { scheduled_at, student_id }, accessToken })
}

export async function cancelBooking(accessToken, bookingId) {
  return request(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: 'PATCH',
    body: { status: 'cancelled' },
    accessToken,
  })
}

export async function listAvailability(accessToken, adminId) {
  const query = adminId ? `?admin_id=${encodeURIComponent(adminId)}` : ''
  return request(`/availability${query}`, { accessToken })
}

export async function listStudents(accessToken) {
  return request('/students', { accessToken })
}

// Everything the student detail page shows, in one request:
// { student, bookings: {count, bookings}, courses: {count, courses},
//   homework: {count, assignments}, videos: {count, videos} }.
//
// Owner or teacher only, and a student outside the caller's scope is a 404 --
// the same answer as one that does not exist, so ids cannot be probed.
// Homework carries the student's latest attempt as `submission`, or null when
// they have not handed anything in.
export async function getStudentDetail(accessToken, id) {
  return request(`/students/${encodeURIComponent(id)}/detail`, { accessToken })
}

// Owner-only: the organization's teachers, for the "assign to teacher" picker.
export async function listAdmins(accessToken) {
  return request('/students/admins', { accessToken })
}

// Owner-only: reassign a student to a teacher. `adminId` of null unassigns
// them, which is a real state the schema allows (a student invited by an owner
// starts unassigned, and deleting a teacher unassigns theirs).
export async function reassignStudent(accessToken, studentId, adminId) {
  return request(`/students/${encodeURIComponent(studentId)}/admin`, {
    method: 'PATCH',
    body: { admin_id: adminId === null || adminId === '' ? null : Number(adminId) },
    accessToken,
  })
}

export async function createAvailability(
  accessToken,
  { day_of_week, start_time, end_time, admin_id } = {}
) {
  return request('/availability', {
    method: 'POST',
    body: { day_of_week, start_time, end_time, admin_id },
    accessToken,
  })
}

// DELETE carries no body, so an owner's admin_id has to ride in the query
// string — the resolver reads either.
export async function deleteAvailability(accessToken, id, adminId) {
  const query = adminId ? `?admin_id=${encodeURIComponent(adminId)}` : ''
  return request(`/availability/${encodeURIComponent(id)}${query}`, { method: 'DELETE', accessToken })
}

export async function updateAvailability(
  accessToken,
  id,
  { day_of_week, start_time, end_time, admin_id } = {}
) {
  return request(`/availability/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { day_of_week, start_time, end_time, admin_id },
    accessToken,
  })
}

// --- dated exceptions to the recurring availability template ---------------
// `availability` above is a weekly rule with no dates, repeating forever.
// These amend it for ONE date: a 'block' removes offered time, an 'add' offers
// time the weekly rule doesn't. Omitting both times on a 'block' means the
// whole day (the holiday case); an 'add' must always name both.
//
// Blocking a date never cancels a booking already made on it — it only stops
// new bookings being offered. Cancelling stays an explicit, separate action.

export async function listAvailabilityExceptions(accessToken, { from, to, admin_id } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (admin_id) params.set('admin_id', String(admin_id))
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/availability-exceptions${query}`, { accessToken })
}

export async function createAvailabilityException(
  accessToken,
  { date, type, start_time, end_time, admin_id } = {}
) {
  return request('/availability-exceptions', {
    method: 'POST',
    body: { date, type, start_time, end_time, admin_id },
    accessToken,
  })
}

export async function updateAvailabilityException(
  accessToken,
  id,
  { date, type, start_time, end_time, admin_id } = {}
) {
  return request(`/availability-exceptions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { date, type, start_time, end_time, admin_id },
    accessToken,
  })
}

export async function deleteAvailabilityException(accessToken, id, adminId) {
  const query = adminId ? `?admin_id=${encodeURIComponent(adminId)}` : ''
  return request(`/availability-exceptions/${encodeURIComponent(id)}${query}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function deleteVideo(accessToken, id) {
  return request(`/videos/${encodeURIComponent(id)}`, { method: 'DELETE', accessToken })
}

// Send a reviewed video back to the review queue.
//
// One direction only. A video becomes 'reviewed' automatically when a teacher
// comments on it (comments.route.js), and the server rejects an explicit
// status:'reviewed' here with a 400 — so this is strictly the undo, never a
// way to mark work reviewed without leaving feedback.
export async function reopenVideoReview(accessToken, id) {
  return request(`/videos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status: 'pending_review' },
    accessToken,
  })
}

export async function listLibraryCategories(accessToken) {
  return request('/library/categories', { accessToken })
}

export async function createLibraryCategory(accessToken, name) {
  return request('/library/categories', { method: 'POST', body: { name }, accessToken })
}

export async function renameLibraryCategory(accessToken, id, name) {
  return request(`/library/categories/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { name },
    accessToken,
  })
}

export async function deleteLibraryCategory(accessToken, id) {
  return request(`/library/categories/${encodeURIComponent(id)}`, { method: 'DELETE', accessToken })
}

export async function requestLibraryUploadUrl(accessToken, meta) {
  return request('/library/upload-url', { method: 'POST', body: meta, accessToken })
}

export async function confirmLibraryUpload(accessToken, data) {
  return request('/library/files', { method: 'POST', body: data, accessToken })
}

// `categoryId` accepts a numeric id or the 'uncategorized' sentinel; passing
// nothing lists every file regardless of category.
export async function listLibraryFiles(accessToken, { categoryId, q } = {}) {
  const params = new URLSearchParams()
  if (categoryId) params.set('category_id', categoryId)
  if (q) params.set('q', q)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/library/files${query}`, { accessToken })
}

export async function getLibraryFile(accessToken, id) {
  return request(`/library/files/${encodeURIComponent(id)}`, { accessToken })
}

export async function getLibraryDownloadUrl(accessToken, id) {
  return request(`/library/files/${encodeURIComponent(id)}/download-url`, { accessToken })
}

// Same object as the download URL but signed for inline display, so the
// in-app viewer can render it in an <img>/<video>/<audio>/<iframe> instead
// of triggering a save dialog.
export async function getLibraryPreviewUrl(accessToken, id) {
  return request(`/library/files/${encodeURIComponent(id)}/preview-url`, { accessToken })
}

// Serves both the move-between-categories action and title/description
// edits. Pass `category_id: null` to move a file back to Uncategorized —
// the server distinguishes an explicit null from an omitted key.
export async function updateLibraryFile(accessToken, id, updates) {
  return request(`/library/files/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: updates,
    accessToken,
  })
}

export async function deleteLibraryFile(accessToken, id) {
  return request(`/library/files/${encodeURIComponent(id)}`, { method: 'DELETE', accessToken })
}

// --- Courses ---------------------------------------------------------------

// Unfiltered lists active courses only; pass status: 'archived' to reach the
// finished ones. Mirrors the server's default.
export async function listCourses(accessToken, { status } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/courses${query}`, { accessToken })
}

// Returns { course, students }. `students` is empty for a student caller --
// the server withholds the roster rather than the course.
export async function getCourse(accessToken, id) {
  return request(`/courses/${encodeURIComponent(id)}`, { accessToken })
}

export async function createCourse(accessToken, data) {
  return request('/courses', { method: 'POST', body: data, accessToken })
}

export async function updateCourse(accessToken, id, updates) {
  return request(`/courses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: updates,
    accessToken,
  })
}

// Upload or replace a course's cover image. Bypasses request() for the same
// reason uploadOrganizationLogo does: a multipart body must not carry a JSON
// Content-Type, and the boundary has to be set by the browser.
export async function uploadCourseThumbnail(accessToken, courseId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/thumbnail`,
    {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: formData,
    }
  )

  return parseJsonResponse(response)
}

// Remove the cover image. The list row falls back to the status icon.
export async function deleteCourseThumbnail(accessToken, courseId) {
  return request(`/courses/${encodeURIComponent(courseId)}/thumbnail`, {
    method: 'DELETE',
    accessToken,
  })
}

// Hard delete, and the server gates it: without confirm it answers 409 with
// confirmation_required and the counts to put in the prompt. Call it once
// without confirm, show the user what will be destroyed, then call again with
// confirm: true. Only the teacher who created the course may do this.
export async function deleteCourse(accessToken, id, { confirm = false } = {}) {
  const query = confirm ? '?confirm=true' : ''
  return request(`/courses/${encodeURIComponent(id)}${query}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function enrollStudent(accessToken, courseId, studentId) {
  return request(`/courses/${encodeURIComponent(courseId)}/enrollments`, {
    method: 'POST',
    body: { student_id: studentId },
    accessToken,
  })
}

export async function unenrollStudent(accessToken, courseId, studentId) {
  return request(
    `/courses/${encodeURIComponent(courseId)}/enrollments/${encodeURIComponent(studentId)}`,
    { method: 'DELETE', accessToken },
  )
}

// --- Assignments -----------------------------------------------------------

// A student always gets published assignments only, whatever `status` says --
// the server ignores the filter for them rather than erroring.
export async function listAssignments(accessToken, courseId, { status } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/courses/${encodeURIComponent(courseId)}/assignments${query}`, { accessToken })
}

export async function getAssignment(accessToken, courseId, id) {
  return request(
    `/courses/${encodeURIComponent(courseId)}/assignments/${encodeURIComponent(id)}`,
    { accessToken },
  )
}

// Always creates a draft. There is no create-and-publish in one call:
// publishing notifies every enrolled student, so it is its own deliberate act
// via updateAssignment({ status: 'published' }).
export async function createAssignment(accessToken, courseId, data) {
  return request(`/courses/${encodeURIComponent(courseId)}/assignments`, {
    method: 'POST',
    body: data,
    accessToken,
  })
}

// Serves editing, publishing and retracting. status: 'published' fans out the
// notifications; status: 'draft' retracts and deletes them, unless students
// have already submitted (409).
export async function updateAssignment(accessToken, courseId, id, updates) {
  return request(
    `/courses/${encodeURIComponent(courseId)}/assignments/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: updates, accessToken },
  )
}

// --- Submissions -----------------------------------------------------------

// A teacher sees every enrolled student's attempts; a student sees only their
// own, regardless of the filters passed here.
export async function listSubmissions(accessToken, assignmentId, { status, studentId } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (studentId) params.set('student_id', studentId)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/assignments/${encodeURIComponent(assignmentId)}/submissions${query}`, {
    accessToken,
  })
}

export async function getSubmission(accessToken, id) {
  return request(`/submissions/${encodeURIComponent(id)}`, { accessToken })
}

export async function requestSubmissionUploadUrl(accessToken, assignmentId, meta) {
  return request(`/assignments/${encodeURIComponent(assignmentId)}/submissions/upload-url`, {
    method: 'POST',
    body: meta,
    accessToken,
  })
}

// Creates one attempt carrying body AND files AND a recording together -- the
// shape the whole feature exists for. `files` entries are
// { kind, original_filename, s3_key, duration_sec }, each naming an object
// already uploaded via requestSubmissionUploadUrl + uploadFileToS3.
export async function createSubmission(accessToken, assignmentId, data) {
  return request(`/assignments/${encodeURIComponent(assignmentId)}/submissions`, {
    method: 'POST',
    body: data,
    accessToken,
  })
}

// Edits the written answer only. Files are fixed once submitted -- a student
// who wants different files submits another attempt. Answers 409 once the
// teacher has reviewed it.
export async function updateSubmission(accessToken, id, body) {
  return request(`/submissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { body },
    accessToken,
  })
}

export async function reviewSubmission(accessToken, id, feedback) {
  return request(`/submissions/${encodeURIComponent(id)}/review`, {
    method: 'PATCH',
    body: { feedback },
    accessToken,
  })
}

// 'preview' signs for inline display so a recording plays in a <video>;
// 'download' forces a save dialog for an attachment. The two need separate
// URLs because Content-Disposition is baked into the signature.
export async function getSubmissionFileUrl(accessToken, submissionId, fileId, mode = 'download') {
  const path = mode === 'preview' ? 'preview-url' : 'download-url'
  return request(
    `/submissions/${encodeURIComponent(submissionId)}/files/${encodeURIComponent(fileId)}/${path}`,
    { accessToken },
  )
}

// Direct-to-S3 upload using a presigned POST (fields + url from
// requestVideoUploadUrl). This bypasses request()/Express entirely: it goes
// to the S3 endpoint, not our API, so no Authorization header and no JSON
// body. S3 presigned POST requires the 'file' field to be appended last.
export async function uploadFileToS3(uploadUrl, fields, file) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value)
  })
  formData.append('file', file)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = new Error(`S3 upload failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return response
}
