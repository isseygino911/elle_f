const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Shared by request() and uploadSurvey() (which must bypass request() to send
// multipart/form-data without a JSON Content-Type) so the non-2xx-throw
// behavior isn't duplicated.
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

// Upload or replace the organization's brand logo. Bypasses request() for the
// same reason uploadSurvey does: a multipart body must not carry a JSON
// Content-Type, and the boundary has to be set by the browser.
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

export async function listSurveys(accessToken) {
  return request('/surveys', { accessToken })
}

export async function getSurvey(accessToken, id, { studentId } = {}) {
  const params = new URLSearchParams()
  if (studentId) params.set('student_id', studentId)
  const query = params.toString() ? `?${params.toString()}` : ''
  return request(`/surveys/${encodeURIComponent(id)}${query}`, { accessToken })
}

export async function getSurveyDownloadUrl(accessToken, id) {
  return request(`/surveys/${encodeURIComponent(id)}/download-url`, { accessToken })
}

// Downloads one student's filled-in survey (their ratings drawn onto the
// scales, as a printable HTML document) and hands back a blob URL the caller
// navigates to or revokes.
//
// Raw fetch (not request()) because the response is a document, not JSON —
// request() would hand it to JSON.parse and throw. It also can't follow the
// presigned-S3 pattern the other downloads use (getLibraryDownloadUrl et al):
// there is no S3 object to sign, the server renders the document per request
// from the student's current responses. That means the bytes come back over
// an authenticated request, so they must be buffered client-side rather than
// reached by pointing the browser at a URL — window.location.href sends no
// Authorization header.
//
// A non-2xx response is still JSON (the API's standard error shape), so the
// error path mirrors parseJsonResponse and throws with the same .status/.body
// every other caller in this file already handles.
export async function downloadStudentSurvey(accessToken, surveyId, { studentId, language } = {}) {
  const params = new URLSearchParams()
  params.set('student_id', studentId)
  if (language) params.set('language', language)

  const response = await fetch(
    `${API_BASE_URL}/surveys/${encodeURIComponent(surveyId)}/export?${params.toString()}`,
    { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined },
  )

  if (!response.ok) {
    const text = await response.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`)
    error.status = response.status
    error.body = data
    throw error
  }

  // The server sets Content-Disposition with the survey title and student
  // name, but a blob URL cannot carry it — the filename has to be reapplied
  // via the <a download> attribute, so it is parsed back out here.
  const disposition = response.headers.get('Content-Disposition') || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const asciiMatch = disposition.match(/filename="([^"]+)"/i)
  const filename = utf8Match
    ? decodeURIComponent(utf8Match[1])
    : asciiMatch
      ? asciiMatch[1]
      : 'survey.html'

  return { blob: await response.blob(), filename }
}

// Submits one whole day at once. `ratings` is [{ answer_id, rating }] and
// must cover every statement in the question -- each statement is rated
// 1..N independently, so the server rejects a partial day.
export async function submitSurveyRatings(accessToken, surveyId, questionId, ratings) {
  return request(`/surveys/${encodeURIComponent(surveyId)}/questions/${encodeURIComponent(questionId)}/submit`, {
    method: 'POST',
    body: { ratings },
    accessToken,
  })
}

// Raw fetch (not request()) because the browser must set the multipart
// boundary itself — setting Content-Type manually would break it.
export async function uploadSurvey(accessToken, formData) {
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  })

  return parseJsonResponse(response)
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

export async function listNotifications(accessToken, { unreadOnly } = {}) {
  const query = unreadOnly ? '?unread=true' : ''
  return request(`/notifications${query}`, { accessToken })
}

export async function markNotificationRead(accessToken, notificationId) {
  return request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH', accessToken })
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

export async function listOpenSlots(accessToken, date) {
  return request(`/bookings/open-slots?date=${encodeURIComponent(date)}`, { accessToken })
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

export async function listAvailability(accessToken) {
  return request('/availability', { accessToken })
}

export async function listStudents(accessToken) {
  return request('/students', { accessToken })
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

export async function getStudentScores(accessToken, studentId) {
  return request(`/students/${encodeURIComponent(studentId)}/scores`, { accessToken })
}

export async function listStudentsProgress(accessToken) {
  return request('/students/progress', { accessToken })
}

export async function createAvailability(accessToken, { day_of_week, start_time, end_time } = {}) {
  return request('/availability', { method: 'POST', body: { day_of_week, start_time, end_time }, accessToken })
}

export async function deleteAvailability(accessToken, id) {
  return request(`/availability/${encodeURIComponent(id)}`, { method: 'DELETE', accessToken })
}

export async function updateAvailability(accessToken, id, { day_of_week, start_time, end_time } = {}) {
  return request(`/availability/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { day_of_week, start_time, end_time },
    accessToken,
  })
}

export async function deleteSurvey(accessToken, id) {
  return request(`/surveys/${encodeURIComponent(id)}`, { method: 'DELETE', accessToken })
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
