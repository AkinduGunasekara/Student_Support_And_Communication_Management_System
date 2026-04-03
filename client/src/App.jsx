 
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TicketCenter } from "./pages/TicketCenter";

import StudentAskQuestion from "./officialMessaging/pages/StudentAskQuestion";
import StudentMyMessages from "./officialMessaging/pages/StudentMyMessages";
import OfficialLecturerDashboard from "./officialMessaging/pages/LecturerDashboard";
import PublicFAQ from "./officialMessaging/pages/PublicFAQ";

import GkAdminViewTicket from "./ticketRaising/gkAdminViewTicket";
import GkTicketView from "./ticketRaising/gkTicketView.jsx";
import GkTicketCreate from "./ticketRaising/gkTicketCreate";
import GkTicketUpdate from "./ticketRaising/gkTicketUpdate";
import GkTicketDelete from "./ticketRaising/gkTicketDelete.jsx";

import EventsPage from "./event/EventsPage";
import StudentEventsPage from "./event/StudentEventsPage";
import LecturerEventsPage from "./event/LecturerEventsPage";
import AdminEventsPage from "./event/AdminEventsPage";

import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Root redirect to login */}

        <Route path="/" element={<LandingPage />} />
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/public-faq" element={<PublicFAQ />} />

        {/*Events*/}
        <Route path="/events" element={<EventsPage />} />
        <Route path="/student/events" element={<StudentEventsPage />} />
        <Route path="/lecturer/events" element={<LecturerEventsPage />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />


        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/ask-question"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAskQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-messages"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentMyMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/view-ticket"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketView />
            </ProtectedRoute>
          }
        />


        <Route
          path="/student/view-ticket"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketView />
            </ProtectedRoute>
          }
        />

        {/* Lecturer Routes */}
        <Route
          path="/lecturer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
              <OfficialLecturerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TicketCenter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <GkAdminViewTicket />
            </ProtectedRoute>
          }
        />

        {/* Ticket Routes */}
        <Route
          path="/ticket/create"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/update/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketUpdate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket/delete/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketDelete />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket/delete/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GkTicketDelete />
            </ProtectedRoute>
          }
          />
      </Routes>
    </AuthProvider>
  );
}
