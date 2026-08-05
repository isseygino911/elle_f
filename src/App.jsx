import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { canReadStudentDetail, canOpenStudentContent } from './lib/roles.js'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider } from './lib/LanguageContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import RegisterOrganizationPage from './pages/RegisterOrganizationPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import InvitationsPage from './pages/InvitationsPage.jsx'
import SurveyUploadPage from './pages/surveys/SurveyUploadPage.jsx'
import SurveysLayout from './components/surveys/SurveysLayout.jsx'
import SurveyDetailPage from './pages/surveys/SurveyDetailPage.jsx'
import StudentsLayout from './components/students/StudentsLayout.jsx'
import StudentDetailPage from './pages/students/StudentDetailPage.jsx'
import VideoUploadPage from './pages/videos/VideoUploadPage.jsx'
import VideosLayout from './components/videos/VideosLayout.jsx'
import VideoDetailPage from './pages/videos/VideoDetailPage.jsx'
import LibraryPage from './pages/library/LibraryPage.jsx'
import LibraryUploadPage from './pages/library/LibraryUploadPage.jsx'
import LibraryFileDetailPage from './pages/library/LibraryFileDetailPage.jsx'
import MessageThreadPage from './pages/messages/MessageThreadPage.jsx'
import MessagesLayout, { MessagesIndex } from './components/messages/MessagesLayout.jsx'
import BookingCalendarPage from './pages/bookings/BookingCalendarPage.jsx'
import JitsiCallPage from './pages/bookings/JitsiCallPage.jsx'
import EmptyDetailState from './components/records/EmptyDetailState.jsx'
import { useLanguage } from './lib/LanguageContext.jsx'

// Thin wrappers so the index-route empty states can call useLanguage() —
// these render as descendants of <LanguageProvider> below, unlike App's own
// render body which constructs that provider and can't consume its context.
function SurveysEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('surveys.emptyDetail')}</EmptyDetailState>
}

function StudentsEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('students.emptyDetail')}</EmptyDetailState>
}

function VideosEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('videos.emptyDetail')}</EmptyDetailState>
}

export default function App() {
  return (
    <LanguageProvider>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-organization" element={<RegisterOrganizationPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invitations"
            element={
              <ProtectedRoute roles={canReadStudentDetail}>
                <InvitationsPage />
              </ProtectedRoute>
            }
          />
          {/*
            Master-detail-insight composition (MASTER.md Layout Pattern):
            SurveysLayout/VideosLayout are the persistent dark list panel +
            stat tiles, rendered once for the whole /surveys and /videos
            branches. The `index` and `:id` children render into that
            layout's <Outlet/> — every existing URL below resolves exactly
            as it did before this pass; only the composition changed.
            These branches are gated with canOpenStudentContent -- everyone
            except a manager. A student needs them (their own surveys and
            videos), so canReadStudentDetail would be too narrow; a manager is
            aggregates-only and the API returns 403/404 for every one of these
            paths, so rendering them only produced a page of failed requests.
            The nav already assumes this (a manager is shown one link); this
            makes typing the URL agree with the nav.
          */}
          <Route
            path="/surveys"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <SurveysLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SurveysEmptyDetail />} />
            <Route path=":id" element={<SurveyDetailPage />} />
          </Route>
          <Route
            path="/surveys/upload"
            element={
              <ProtectedRoute roles={canReadStudentDetail}>
                <SurveyUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute roles={canReadStudentDetail}>
                <StudentsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentsEmptyDetail />} />
            <Route path=":id" element={<StudentDetailPage />} />
          </Route>
          <Route
            path="/videos"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <VideosLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VideosEmptyDetail />} />
            <Route path=":id" element={<VideoDetailPage />} />
          </Route>
          <Route
            path="/videos/upload"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <VideoUploadPage />
              </ProtectedRoute>
            }
          />
          {/*
            Library: browsing (list + file detail) is open to any signed-in
            user, so those two routes carry a role-less ProtectedRoute. Only
            uploading is Elle-only — category creation and moving files
            between categories happen inline on /library and are gated in the
            UI by role, with the server enforcing the same rule.
            /library/upload is declared before /library/:id so the literal
            path wins over the dynamic segment.
          */}
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library/upload"
            element={
              <ProtectedRoute roles={canReadStudentDetail}>
                <LibraryUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library/:id"
            element={
              <ProtectedRoute>
                <LibraryFileDetailPage />
              </ProtectedRoute>
            }
          />
          {/*
            Email-style master-detail: every student on the left (elle only
            — a student has just one correspondent, so MessagesLayout skips
            the list panel and renders the thread directly for them), the
            selected thread on the right. Same nested-routing composition as
            /students, /videos, /surveys — /messages/:studentId keeps
            working exactly as it did as a standalone route.
          */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <MessagesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MessagesIndex />} />
            <Route path=":studentId" element={<MessageThreadPage />} />
          </Route>
          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <BookingCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/call"
            element={
              <ProtectedRoute roles={canOpenStudentContent}>
                <JitsiCallPage />
              </ProtectedRoute>
            }
          />
          {/* Catch-all: an unknown path previously rendered a blank page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
    </LanguageProvider>
  )
}
