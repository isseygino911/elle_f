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

export async function createInvitation(accessToken, { studentNameHint } = {}) {
  return request('/invitations', {
    method: 'POST',
    body: { student_name_hint: studentNameHint || undefined },
    accessToken,
  })
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
