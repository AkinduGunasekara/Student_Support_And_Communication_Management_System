import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
              <div className="flex items-center gap-3 md:gap-5">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm capitalize">
                  {user.role}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-2"
                  >
                    {user.name || "Profile"}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg z-50">
                      <Link
                        to="/#profile"
                        onClick={() => {
                          setShowProfileMenu(false);
                          const profileSection = document.getElementById("profile-section");
                          if (profileSection) {
                            profileSection.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-t-2xl transition"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-b-2xl transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};
