import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  canReadStudentDetail,
  canOpenStudentContent,
  canReadBroadcasts,
  canManageCourses,
  canOpenCourses,
  isOwner,
} from './lib/roles.js'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LanguageProvider } from './lib/LanguageContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { OrganizationProvider } from './lib/OrganizationContext.jsx'
import { NotificationProvider } from './lib/NotificationContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import RegisterOrganizationPage from './pages/RegisterOrganizationPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import StatusPage from './pages/StatusPage.jsx'
import InvitationsLayout from './components/invitations/InvitationsLayout.jsx'
import InvitationCreatePage from './pages/invitations/InvitationCreatePage.jsx'
import InvitationDetailPage from './pages/invitations/InvitationDetailPage.jsx'
import OrganizationSettingsPage from './pages/OrganizationSettingsPage.jsx'
import BroadcastsLayout from './components/broadcasts/BroadcastsLayout.jsx'
import BroadcastDetailPage from './pages/broadcasts/BroadcastDetailPage.jsx'
import BroadcastComposePage from './pages/broadcasts/BroadcastComposePage.jsx'
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
import CoursesLayout from './components/courses/CoursesLayout.jsx'
import CourseFormPage from './pages/courses/CourseFormPage.jsx'
import CourseDetailPage from './pages/courses/CourseDetailPage.jsx'
import AssignmentFormPage from './pages/courses/AssignmentFormPage.jsx'
import AssignmentDetailPage from './pages/courses/AssignmentDetailPage.jsx'
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

function CoursesEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('courses.emptyDetail')}</EmptyDetailState>
}

function InvitationsEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('invitations.emptyDetail')}</EmptyDetailState>
}

function BroadcastsEmptyDetail() {
  const { t } = useLanguage()
  return <EmptyDetailState>{t('broadcasts.emptyDetail')}</EmptyDetailState>
}

export default function App() {
  return (
    <LanguageProvider>
    <TooltipProvider>
      <AuthProvider>
        {/* Inside AuthProvider because it reads the access token; outside
            BrowserRouter so the organization is fetched once for the session
            rather than per navigation. */}
        <OrganizationProvider>
        {/* Same placement, same reasoning: the notification/unread poll reads
            the access token and must survive navigation. Mounted here rather
            than inside AppShell so a single 15s interval serves the whole
            session -- inside the router it would remount and restart its clock
            on route changes. It no-ops without a token, so the public routes
            below cost nothing. */}
        <NotificationProvider>
        <BrowserRouter>
          <Routes>
          {/* Login is the entry page: the public landing site is gone, so an
              unauthenticated visitor at the root gets the form directly.
              /login stays declared because ProtectedRoute redirects there and
              existing links point at it. */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-organization" element={<RegisterOrganizationPage />} />
          {/* Public by necessity: someone who cannot log in has to reach
              these without a session. */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/*
            Same master-detail composition as /students, /surveys and /videos:
            the dark list panel is the route element for the parent path and
            the children render into its <Outlet/>. Replaces the single stacked
            InvitationsPage — /invitations still resolves, now to the list with
            an empty detail pane rather than a form above a list.
            '/new' is declared before ':id' so the literal path wins over the
            dynamic segment.
          */}
          <Route
            path="/invitations"
            element={
              <ProtectedRoute roles={canReadStudentDetail}>
                <InvitationsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InvitationsEmptyDetail />} />
            <Route path="new" element={<InvitationCreatePage />} />
            <Route path=":id" element={<InvitationDetailPage />} />
          </Route>
          {/* isOwner, not canReadStudentDetail: renaming the studio is an
              organization-level act, and admins are teachers. The server
              enforces the same boundary (403 for anyone but the owner). */}
          <Route
            path="/organization"
            element={
              <ProtectedRoute roles={isOwner}>
                <OrganizationSettingsPage />
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
            Courses: the same master-detail composition as /videos and
            /surveys. Gated with canOpenCourses -- everyone except a manager. A
            student needs this branch (their own courses and homework), so
            canManageCourses would be too narrow; a manager is aggregates-only
            and every one of these paths returns 403/404 for them, so rendering
            it only produced a page of failed requests.

            '/new' is declared before ':id' so the literal path wins over the
            dynamic segment, matching the /invitations and /library precedent.

            The assignment routes sit OUTSIDE the CoursesLayout branch rather
            than nested under ':id'. An assignment detail page is a full-width
            reading-and-answering surface -- the instruction on top, the
            submission form inline below -- and squeezing it into the detail
            pane beside the course list would leave the recorder and the file
            picker fighting for a 22rem-narrower column.
          */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute roles={canOpenCourses}>
                <CoursesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CoursesEmptyDetail />} />
            <Route path=":id" element={<CourseDetailPage />} />
          </Route>
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute roles={canManageCourses}>
                <CourseFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assignments/new"
            element={
              <ProtectedRoute roles={canManageCourses}>
                <AssignmentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assignments/:id"
            element={
              <ProtectedRoute roles={canOpenCourses}>
                <AssignmentDetailPage />
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
          {/*
            Senders (owner, teacher) and the oversight roles (owner, manager)
            share one page; a student never reaches it, since their copy of an
            announcement arrives as a notification. canReadBroadcasts is the
            union the server's GET /broadcasts gate applies.

            Same master-detail composition as /invitations, which had the
            identical problem: the compose form sat permanently above the list,
            pushing the sent history — the thing you come back for — below a
            form you use once. '/new' is declared before ':id' so the literal
            path wins over the dynamic segment.

            The compose route carries no ProtectedRoute of its own. It cannot:
            ProtectedRoute renders <AppShell>, so nesting one inside a layout
            route that is already protected would draw the shell twice. A
            manager reaching /broadcasts/new is redirected by the page itself.
          */}
          <Route
            path="/broadcasts"
            element={
              <ProtectedRoute roles={canReadBroadcasts}>
                <BroadcastsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BroadcastsEmptyDetail />} />
            <Route path="new" element={<BroadcastComposePage />} />
            <Route path=":id" element={<BroadcastDetailPage />} />
          </Route>
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
        </NotificationProvider>
        </OrganizationProvider>
      </AuthProvider>
    </TooltipProvider>
    </LanguageProvider>
  )
}
