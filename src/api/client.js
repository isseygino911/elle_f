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

export async function submitSurveyAnswer(accessToken, surveyId, questionId, answerId) {
  return request(`/surveys/${encodeURIComponent(surveyId)}/questions/${encodeURIComponent(questionId)}/submit`, {
    method: 'POST',
    body: { answer_id: answerId },
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
