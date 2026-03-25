import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const FACULTY_OPTIONS = ["Computing", "Engineering", "Business"];

const COURSE_BY_FACULTY = {
  Computing: ["Information Technology", "Software Engineering", "Cyber Security"],
  Engineering: [
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],
  Business: ["Business Management", "Accounting", "Marketing"],
};

const COURSE_OPTIONS = Object.values(COURSE_BY_FACULTY).flat();

const YEAR_OPTIONS = [1, 2, 3, 4];
const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

const STUDENT_SIDEBAR_ITEMS = [
  { label: "Dashboard" },
  { label: "Raise Ticket" },
  { label: "My Tickets" },
  { label: "Events" },
  { label: "Messages" },
  { label: "Feedback" },
];

const LECTURER_SIDEBAR_ITEMS = [
  { label: "Dashboard" },
  { label: "View Tickets" },
  { label: "Messages" },
  { label: "Announcements" },
  { label: "Events" },
  { label: "Feedback" },
];

const ADMIN_SIDEBAR_ITEMS = [
  { label: "Dashboard" },
  { label: "Manage Users" },
  { label: "Manage Tickets" },
  { label: "Reply to Tickets" },
  { label: "Manage Events" },
  { label: "View Feedback" },
  { label: "Reports" },
];

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();
      login(data);

      if (data.user.role === "student") {
        navigate("/student/dashboard");
      } else if (data.user.role === "lecturer") {
        navigate("/lecturer/dashboard");
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "lecturer") return <Navigate to="/lecturer/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Student Support Portal Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
          <p className="text-sm text-slate-600 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const allowedCourseOptions = selectedFaculty
    ? COURSE_BY_FACULTY[selectedFaculty] || []
    : COURSE_OPTIONS;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const role = formData.get("role");
    const faculty = formData.get("faculty");
    const course = formData.get("course");
    const year = formData.get("year");

    if (!NAME_REGEX.test(String(name).trim())) {
      alert("Name can contain only alphabetic letters and spaces");
      return;
    }

    if (["student", "lecturer"].includes(role)) {
      const validCourses = COURSE_BY_FACULTY[faculty] || [];
      if (!validCourses.includes(course)) {
        alert("Invalid course for selected faculty");
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          faculty,
          course: ["student", "lecturer"].includes(role) ? course : undefined,
          year: role === "student" ? Number(year) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Registration failed");
        return;
      }

      const data = await response.json();
      login(data);

      if (data.user.role === "student") {
        navigate("/student/dashboard");
      } else if (data.user.role === "lecturer") {
        navigate("/lecturer/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "lecturer") return <Navigate to="/lecturer/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Create Your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              pattern="[A-Za-z]+(\s[A-Za-z]+)*"
              title="Name can contain only alphabetic letters and spaces"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              name="role"
              required
              value={selectedRole}
              onChange={(event) => {
                const nextRole = event.target.value;
                setSelectedRole(nextRole);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Faculty
            </label>
            <select
              name="faculty"
              required
              value={selectedFaculty}
              onChange={(event) => {
                const nextFaculty = event.target.value;
                setSelectedFaculty(nextFaculty);
                const nextAllowedCourses = COURSE_BY_FACULTY[nextFaculty] || [];
                if (selectedCourse && !nextAllowedCourses.includes(selectedCourse)) {
                  setSelectedCourse("");
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select faculty
              </option>
              {FACULTY_OPTIONS.map((facultyOption) => (
                <option key={facultyOption} value={facultyOption}>
                  {facultyOption}
                </option>
              ))}
            </select>
          </div>
          {["student", "lecturer"].includes(selectedRole) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course
                </label>
                <select
                  name="course"
                  required
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  disabled={!selectedFaculty}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    {selectedFaculty ? "Select course" : "Select faculty first"}
                  </option>
                  {allowedCourseOptions.map((courseOption) => (
                    <option key={courseOption} value={courseOption}>
                      {courseOption}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {selectedRole === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year
                </label>
                <select
                  name="year"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Select year
                  </option>
                  {YEAR_OPTIONS.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
          <p className="text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const PortalLayout = ({
  portalName,
  portalSubtitle,
  sidebarItems,
  activeItem,
  headerTitle,
  headerSubtitle,
  userName,
  userMeta,
  children,
  showSearch = false,
  primaryAction,
  profilePath,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="w-full bg-slate-950 text-slate-100 md:sticky md:top-0 md:h-screen md:w-64 md:flex md:flex-col">
        <div className="border-b border-slate-800 px-5 py-5">
          <p className="text-xl font-bold leading-none">{portalName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
            {portalSubtitle}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = item.label === activeItem;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={() => profilePath && navigate(profilePath)}
            className={`mb-2 w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              activeItem === "Profile"
                ? "bg-blue-700 text-white"
                : "text-slate-200 hover:bg-slate-900"
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-4">
          {showSearch && (
            <input
              type="text"
              readOnly
              value="Search for students, tickets or events..."
              className="min-w-[260px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
            />
          )}
          <div className="ml-auto flex items-center gap-3 text-right">
            <div>
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-slate-500">{userMeta}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <section className="p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
              {headerSubtitle ? <p className="mt-1 text-slate-600">{headerSubtitle}</p> : null}
            </div>
            {primaryAction ? (
              <button
                type="button"
                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:bg-blue-800"
              >
                {primaryAction}
              </button>
            ) : null}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
};

const MetricCard = ({ label, value, accent }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-bold leading-none text-slate-900">{value}</p>
    {accent ? <p className="mt-2 text-xs font-semibold text-emerald-600">{accent}</p> : null}
  </article>
);

const SectionCard = ({ title, action, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {action ? <button className="text-sm font-semibold text-blue-700">{action}</button> : null}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [myFeedback, setMyFeedback] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);
  const [isTicketLoading, setIsTicketLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    ticketId: "",
    rating: "5",
    comment: "",
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) {
        setIsFeedbackLoading(false);
        setIsTicketLoading(false);
        return;
      }

      try {
        const [feedbackResponse, ticketResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/feedback/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/tickets`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!feedbackResponse.ok) {
          if (feedbackResponse.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }

          const errorData = await feedbackResponse.json();
          throw new Error(errorData.message || "Failed to load feedback");
        }

        const feedbackData = await feedbackResponse.json();
        setMyFeedback(Array.isArray(feedbackData) ? feedbackData : []);

        if (ticketResponse.ok) {
          const ticketData = await ticketResponse.json();
          const ownTickets = Array.isArray(ticketData)
            ? ticketData.filter(
                (ticket) =>
                  String(ticket.studentId || "") === String(user?.id || "") ||
                  String(ticket.studentEmail || "").toLowerCase() ===
                    String(user?.email || "").toLowerCase()
              )
            : [];
          setMyTickets(ownTickets);
        }
      } catch (error) {
        console.error("Load student dashboard data error:", error);
        alert(error.message || "Unable to load dashboard data");
      } finally {
        setIsFeedbackLoading(false);
        setIsTicketLoading(false);
      }
    };

    loadDashboardData();
  }, [token, logout, navigate, user?.email, user?.id]);

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const ticketId = feedbackForm.ticketId.trim();
    const comment = feedbackForm.comment.trim();

    if (!ticketId || !comment) {
      alert("Ticket ID and comment are required");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
          headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        body: JSON.stringify({
          ticketId,
          rating: Number(feedbackForm.rating),
          comment,
        }),
        });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        throw new Error(data.message || "Failed to submit feedback");
      }

      setFeedbackForm({ ticketId: "", rating: "5", comment: "" });
      setMyFeedback((prev) => [data, ...prev]);
      alert("Feedback submitted successfully");
    } catch (error) {
      console.error("Create feedback error:", error);
      alert(error.message || "Unable to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const averageRating =
    myFeedback.length > 0
      ? (
          myFeedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
          myFeedback.length
        ).toFixed(1)
      : "0.0";

  return (
    <PortalLayout
      portalName="EduPortal"
      portalSubtitle="Student Dashboard"
      sidebarItems={STUDENT_SIDEBAR_ITEMS}
      activeItem="Dashboard"
      headerTitle="Dashboard Overview"
      headerSubtitle="Track your support requests and university events"
      userName={user?.name || "Student User"}
      userMeta={user?.course || "Student"}
      primaryAction="+  Raise New Ticket"
      profilePath="/student/profile"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Tickets" value="12" />
        <MetricCard label="Open Tickets" value="4" />
        <MetricCard
          label="My Feedback"
          value={String(myFeedback.length)}
          accent={`${averageRating}/5 avg rating`}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[2fr,1fr]">
        <SectionCard title="Recent Ticket Status" action="View All">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="py-2">Ticket ID</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-8821</td>
                  <td className="py-3">Course Registration Issue</td>
                  <td className="py-3"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span></td>
                  <td className="py-3">2 hours ago</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-8790</td>
                  <td className="py-3">Hostel WiFi Connectivity</td>
                  <td className="py-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Resolved</span></td>
                  <td className="py-3">Yesterday</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-8755</td>
                  <td className="py-3">Library Card Replacement</td>
                  <td className="py-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Resolved</span></td>
                  <td className="py-3">3 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Upcoming Events">
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="font-semibold">Annual Tech Fest</p>
              <p className="text-slate-600">Oct 24 | Main Auditorium</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="font-semibold">Career Placement Day</p>
              <p className="text-slate-600">Oct 28 | Hall B-12</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="font-semibold">Inter-College Sports Meet</p>
              <p className="text-slate-600">Nov 02 | University Stadium</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr,1fr]">
        <SectionCard title="Submit Feedback">
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ticket ID</label>
              <input
                type="text"
                list="my-ticket-options"
                required
                value={feedbackForm.ticketId}
                onChange={(event) =>
                  setFeedbackForm((prev) => ({ ...prev, ticketId: event.target.value }))
                }
                placeholder="e.g. t001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="my-ticket-options">
                {myTickets.map((ticket) => (
                  <option key={ticket._id} value={ticket.ticketId} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-slate-500">
                {isTicketLoading
                  ? "Loading your tickets..."
                  : myTickets.length > 0
                    ? `Choose a valid ticket ID from your tickets (e.g. ${myTickets[0].ticketId}).`
                    : "No tickets found for your account yet. Raise a ticket first, then submit feedback."}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Rating</label>
              <select
                value={feedbackForm.rating}
                onChange={(event) =>
                  setFeedbackForm((prev) => ({ ...prev, rating: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Comment</label>
              <textarea
                required
                rows={4}
                value={feedbackForm.comment}
                onChange={(event) =>
                  setFeedbackForm((prev) => ({ ...prev, comment: event.target.value }))
                }
                placeholder="Share your feedback about support received"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingFeedback}
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="My Recent Feedback">
          {isFeedbackLoading ? (
            <p className="text-sm text-slate-600">Loading feedback...</p>
          ) : myFeedback.length === 0 ? (
            <p className="text-sm text-slate-600">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {myFeedback.slice(0, 5).map((item) => (
                <article key={item._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">Ticket: {item.ticketId}</p>
                    <p className="text-xs font-semibold text-amber-600">{"★".repeat(Number(item.rating || 0))}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.comment}</p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PortalLayout>
  );
};

const LecturerDashboard = () => {
  const { user } = useAuth();

  return (
    <PortalLayout
      portalName="UniPortal"
      portalSubtitle="Lecturer Dashboard"
      sidebarItems={LECTURER_SIDEBAR_ITEMS}
      activeItem="Dashboard"
      headerTitle="Dashboard Overview"
      userName={user?.name || "Lecturer User"}
      userMeta="Senior Lecturer"
      profilePath="/lecturer/profile"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Student Messages" value="128" />
        <MetricCard label="Active Conversations" value="12" />
        <MetricCard label="Upcoming Events" value="4" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr,2fr]">
        <SectionCard title="Recent Chats" action="View All">
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">Maria Garcia</p>
              <p className="text-slate-600">Could you clarify the final project...</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">Alex Johnson</p>
              <p className="text-slate-600">I've uploaded the missing assignment...</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold">Sam Lee</p>
              <p className="text-slate-600">Thanks for the feedback on Lab 2.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Announcements" action="+  Post New">
          <div className="space-y-4">
            <article className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Exam Update</p>
              <h3 className="mt-2 text-lg font-semibold">Revised Midterm Exam Schedule</h3>
              <p className="mt-1 text-sm text-slate-600">
                The midterm for CS302 has been moved to Friday afternoon in Hall B.
              </p>
            </article>
            <article className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">General</p>
              <h3 className="mt-2 text-lg font-semibold">Lab Material Uploaded</h3>
              <p className="mt-1 text-sm text-slate-600">
                All supporting documents for this week&apos;s networking lab are available now.
              </p>
            </article>
          </div>
        </SectionCard>
      </div>
    </PortalLayout>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <PortalLayout
      portalName="UniAdmin"
      portalSubtitle="Management Portal"
      sidebarItems={ADMIN_SIDEBAR_ITEMS}
      activeItem="Dashboard"
      headerTitle="Admin Overview"
      headerSubtitle="Welcome back. Here is what is happening today."
      userName={user?.name || "Admin User"}
      userMeta="Super Admin"
      showSearch
      profilePath="/admin/profile"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Users" value="12,450" accent="+12.5%" />
        <MetricCard label="Total Tickets" value="1,280" accent="+5.2%" />
        <MetricCard label="Pending Tickets" value="42" />
        <MetricCard label="Avg Feedback Rating" value="4.8/5" accent="+0.2%" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[2fr,1fr]">
        <SectionCard title="Recent Tickets" action="View All">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="py-2">Ticket ID</th>
                  <th className="py-2">Student</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-1024</td>
                  <td className="py-3">Alice Johnson</td>
                  <td className="py-3">Login Issue - LMS Portal</td>
                  <td className="py-3"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span></td>
                  <td className="py-3"><button className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white">Reply</button></td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-1025</td>
                  <td className="py-3">Bob Smith</td>
                  <td className="py-3">Event Registration Error</td>
                  <td className="py-3"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">In Progress</span></td>
                  <td className="py-3"><button className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white">Reply</button></td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-blue-800">#TK-1026</td>
                  <td className="py-3">Charlie Brown</td>
                  <td className="py-3">Transcript Request</td>
                  <td className="py-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Closed</span></td>
                  <td className="py-3"><button className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Event Overview">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold">Career Fair 2024</p>
                <p className="text-slate-600">Oct 12 | 840 Students Registered</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold">Open House Webinar</p>
                <p className="text-slate-600">Oct 15 | 320 Students Registered</p>
              </div>
              <button className="w-full rounded-xl border border-blue-200 bg-blue-50 py-2 text-sm font-semibold text-blue-700">
                Manage All Events
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Recent Feedback">
            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold">LMS Portal</p>
                <p className="text-amber-500">★★★★★</p>
                <p className="mt-1 text-slate-600">The new interface is much faster and easier to navigate.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-semibold">Student Support</p>
                <p className="text-amber-500">★★★★☆</p>
                <p className="mt-1 text-slate-600">Response times improved, but technical tickets can still be faster.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PortalLayout>
  );
};

const ProfilePage = ({ role }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }

          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to load profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Get profile error:", error);
        alert(error.message || "Unable to load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, logout, navigate]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your account from the database. This action cannot be undone. Continue?"
    );

    if (!confirmed || !token) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      logout();
      alert("Your account has been permanently deleted.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Delete account error:", error);
      alert(error.message || "Unable to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const profileConfigByRole = {
    student: {
      portalName: "EduPortal",
      portalSubtitle: "Student Dashboard",
      userMetaFallback: "Student",
      sidebarItems: STUDENT_SIDEBAR_ITEMS,
      profilePath: "/student/profile",
    },
    lecturer: {
      portalName: "UniPortal",
      portalSubtitle: "Lecturer Dashboard",
      userMetaFallback: "Lecturer",
      sidebarItems: LECTURER_SIDEBAR_ITEMS,
      profilePath: "/lecturer/profile",
    },
    admin: {
      portalName: "UniAdmin",
      portalSubtitle: "Management Portal",
      userMetaFallback: "Admin",
      sidebarItems: ADMIN_SIDEBAR_ITEMS,
      profilePath: "/admin/profile",
    },
  };

  const config = profileConfigByRole[role] || profileConfigByRole.student;

  return (
    <PortalLayout
      portalName={config.portalName}
      portalSubtitle={config.portalSubtitle}
      sidebarItems={config.sidebarItems}
      activeItem="Profile"
      headerTitle="My Profile"
      headerSubtitle="View your account details and manage your account"
      userName={user?.name || "Portal User"}
      userMeta={user?.role || config.userMetaFallback}
      profilePath={config.profilePath}
    >
      <SectionCard title="Account Details">
        {loading ? (
          <p className="text-slate-600">Loading profile details...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Name</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{profile?.name || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Email</p>
              <p className="mt-1 break-all text-base font-semibold text-slate-900">{profile?.email || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Role</p>
              <p className="mt-1 text-base font-semibold capitalize text-slate-900">{profile?.role || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Faculty</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{profile?.faculty || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Course</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{profile?.course || "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Year</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{profile?.year || "-"}</p>
            </div>
          </div>
        )}
      </SectionCard>

      <div className="mt-5">
        <SectionCard title="Danger Zone">
          <p className="mb-4 text-sm text-slate-600">
            Deleting your account is permanent and removes your user record from the database.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-xl border border-red-400/50 bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {deleting ? "Deleting account..." : "Delete Account Permanently"}
          </button>
        </SectionCard>
      </div>
    </PortalLayout>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <ProfilePage role="student" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["lecturer"]}>
            <LecturerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer/profile"
        element={
          <ProtectedRoute allowedRoles={["lecturer"]}>
            <ProfilePage role="lecturer" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfilePage role="admin" />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;