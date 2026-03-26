import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight">
            Student Support Portal
          </Link>

          <div className="flex items-center gap-3 md:gap-5 flex-wrap">
            <Link
              to="/public-faq"
              className="text-slate-300 hover:text-white transition"
            >
              Public FAQ
            </Link>

            {user?.role === "student" && (
              <>
                <Link
                  to="/student/dashboard"
                  className="text-slate-300 hover:text-white transition"
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/student/ask-question"
                  className="text-slate-300 hover:text-white transition"
                >
                  Ask Question
                </Link>
                <Link
                  to="/student/my-messages"
                  className="text-slate-300 hover:text-white transition"
                >
                  My Messages
                </Link>
              </>
            )}

            {user?.role === "lecturer" && (
              <Link
                to="/lecturer/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Lecturer Dashboard
              </Link>
            )}

            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-slate-300 hover:text-white transition"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/lecturer/dashboard"
                  className="text-slate-300 hover:text-white transition"
                >
                  Official Messaging
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm capitalize">
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};
