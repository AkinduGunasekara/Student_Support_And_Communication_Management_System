import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  FileQuestion,
  LayoutDashboard,
  Menu,
  MessageSquareMore,
  MessagesSquare,
  ShieldCheck,
  X,
  CalendarDays,
} from "lucide-react";

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();

  const navByRole = {
    student: [
      {
        label: "Dashboard",
        to: "/student/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Ask Question",
        to: "/student/ask-question",
        icon: FileQuestion,
      },
      {
        label: "My Messages",
        to: "/student/my-messages",
        icon: MessagesSquare,
      },
      {
        label: "My Tickets",
        to: "/student/view-ticket",
        icon: MessagesSquare,
      },
      {
        label: "Public FAQ",
        to: "/public-faq",
        icon: MessageSquareMore,
      },
      {
        label: "My Events",
        to: "/student/events",
        icon: CalendarDays,
      },
    ],
    lecturer: [
      {
        label: "Lecturer Dashboard",
        to: "/lecturer/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Public FAQ",
        to: "/public-faq",
        icon: MessageSquareMore,
      },
      {
        label: "My Events",
        to: "/lecturer/events",
        icon: CalendarDays,
      }
    ],
    admin: [
      {
        label: "Admin Dashboard",
        to: "/admin/dashboard",
        icon: ShieldCheck,
      },
      {
        label: "Official Messaging",
        to: "/lecturer/dashboard",
        icon: MessageSquareMore,
      },
      {
        label: "Ticket Center",
        to: "/admin/tickets",
        icon: FileQuestion,
      },
      {
        label: "Public FAQ",
        to: "/public-faq",
        icon: MessagesSquare,
      },
      {
        label: "Event Management",
        to: "/admin/events",
        icon: CalendarDays,
      },
    ],
  };

  const navLinks = navByRole[user?.role] || [];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-xl transition-transform lg:translate-x-0 ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Academic Atelier
            </p>
            <h1 className="mt-1 text-lg font-bold text-slate-900">Support Hub</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileSidebar(false)}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-white shadow">
          <p className="text-xs uppercase tracking-wider text-blue-200">Signed in as</p>
          <p className="mt-1 text-sm font-semibold">{user?.name || "Portal User"}</p>
          <p className="mt-1 text-xs capitalize text-blue-200">{user?.role}</p>
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setShowMobileSidebar(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => logout(true)}
          className="btn-secondary mt-8 w-full px-4 py-2.5"
        >
          Logout
        </button>
      </aside>

      <div className="lg:pl-72">
        <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileSidebar(true)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>

              <p className="text-sm font-semibold text-slate-700">University Support System</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <CircleUserRound size={17} />
                  {user?.name || "Profile"}
                  <ChevronDown
                    size={15}
                    className={`transition ${showProfileMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        const profileSection = document.getElementById("profile-section");
                        if (profileSection) {
                          profileSection.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="relative z-10 pb-8">
        {children}
      </main>
      </div>
    </div>
  );
};

