import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
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
import MessageThreadPage from './pages/messages/MessageThreadPage.jsx'
import MessagesLayout, { MessagesIndex } from './components/messages/MessagesLayout.jsx'
import BookingCalendarPage from './pages/bookings/BookingCalendarPage.jsx'
import JitsiCallPage from './pages/bookings/JitsiCallPage.jsx'
import EmptyDetailState from './components/records/EmptyDetailState.jsx'

export default function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
              <ProtectedRoute role="elle">
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
            Role gating is unchanged: neither /surveys nor /surveys/:id (nor
            /videos, /videos/:id) restricted a role before, so one
            role-less ProtectedRoute wraps the whole branch, same as before.
          */}
          <Route
            path="/surveys"
            element={
              <ProtectedRoute>
                <SurveysLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmptyDetailState>Select a survey from the list to see its details.</EmptyDetailState>} />
            <Route path=":id" element={<SurveyDetailPage />} />
          </Route>
          <Route
            path="/surveys/upload"
            element={
              <ProtectedRoute role="elle">
                <SurveyUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute role="elle">
                <StudentsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmptyDetailState>Select a student from the list to see their survey progress.</EmptyDetailState>} />
            <Route path=":id" element={<StudentDetailPage />} />
          </Route>
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideosLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmptyDetailState>Select a video from the list to see its details.</EmptyDetailState>} />
            <Route path=":id" element={<VideoDetailPage />} />
          </Route>
          <Route
            path="/videos/upload"
            element={
              <ProtectedRoute>
                <VideoUploadPage />
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
              <ProtectedRoute>
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
              <ProtectedRoute>
                <BookingCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/call"
            element={
              <ProtectedRoute>
                <JitsiCallPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  )
}
