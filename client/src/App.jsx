
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

import StudentAskQuestion from "./officialMessaging/pages/StudentAskQuestion";
import StudentMyMessages from "./officialMessaging/pages/StudentMyMessages";
import OfficialLecturerDashboard from "./officialMessaging/pages/LecturerDashboard";
import PublicFAQ from "./officialMessaging/pages/PublicFAQ";

import gkAdminViewTicket from "./ticketRaising/gkAdminViewTicket";
import gkTicketCreate from "./ticketRaising/gkTicketCreate";
import gkTicketUpdate from "./ticketRaising/gkTicketUpdate";

import EventsPage from "./event/EventsPage";
import StudentEventsPage from "./event/StudentEventsPage";
import LecturerEventsPage from "./event/LecturerEventsPage";
import AdminEventsPage from "./event/AdminEventsPage";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Root redirect to login */}

        <Route
        path="/"
        element={
          localStorage.getItem("ssc_token") ? (
            <Navigate to="/events" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
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
          path="/admin/view-tickets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <gkAdminViewTicket />
            </ProtectedRoute>
          }
        />

        {/* Ticket Routes */}
        <Route
          path="/ticket/create"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <gkTicketCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/update/:id"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <gkTicketUpdate />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
