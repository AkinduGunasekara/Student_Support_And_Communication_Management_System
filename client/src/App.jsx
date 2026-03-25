import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "./AuthContext.jsx";

import StudentAskQuestion from "./officialMesseging/pages/StudentAskQuestion";
import StudentMyMessages from "./officialMesseging/pages/StudentMyMessages";
import OfficialLecturerDashboard from "./officialMesseging/pages/LecturerDashboard";
import PublicFAQ from "./officialMesseging/pages/PublicFAQ";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const FACULTY_OPTIONS = ["Computing", "Engineering", "Business"];

const COURSE_BY_FACULTY = {
  Computing: [
    "Information Technology",
    "Software Engineering",
    "Cyber Security",
  ],
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

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
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
    if (user.role === "student")
      return <Navigate to="/student/dashboard" replace />;
    if (user.role === "lecturer")
      return <Navigate to="/lecturer/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-slate-400 text-center mb-6">
          Login to access the Student Support Portal
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3 hover:bg-cyan-400 transition"
          >
            Login
          </button>

          <p className="text-sm text-slate-400 text-center">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:underline font-medium"
            >
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
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (user) {
    if (user.role === "student")
      return <Navigate to="/student/dashboard" replace />;
    if (user.role === "lecturer")
      return <Navigate to="/lecturer/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Create Account
        </h1>
        <p className="text-slate-400 text-center mb-6">
          Register to access the portal
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              pattern="[A-Za-z]+(\s[A-Za-z]+)*"
              title="Name can contain only alphabetic letters and spaces"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
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
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
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
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Course
              </label>
              <select
                name="course"
                required
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                disabled={!selectedFaculty}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
          )}

          {selectedRole === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Year
              </label>
              <select
                name="year"
                required
                defaultValue=""
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3 hover:bg-cyan-400 transition"
          >
            Register
          </button>

          <p className="text-sm text-slate-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [ticketId, setTicketId] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const fetchMyFeedback = async () => {
    if (!token) return;

    setLoadingFeedback(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to load feedback");
        return;
      }

      const data = await response.json();
      setFeedbackList(data);
    } catch (error) {
      console.error("Get feedback error:", error);
      alert("Something went wrong while loading feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, [token]);

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId,
          comment,
          rating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit feedback");
        return;
      }

      alert("Feedback submitted successfully");
      setTicketId("");
      setComment("");
      setRating(5);
      fetchMyFeedback();
    } catch (error) {
      console.error("Submit feedback error:", error);
      alert("Something went wrong while submitting feedback.");
    }
  };

  const renderStars = (value) => "★".repeat(value) + "☆".repeat(5 - value);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Student Dashboard
          </h1>
          <p className="text-white/90">
            Welcome {user?.name || "Student"} — manage feedback and access
            official messaging.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/student/ask-question"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-cyan-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Ask Official Question</h2>
            <p className="text-slate-400">
              Send academic or official questions to lecturers.
            </p>
          </Link>

          <Link
            to="/student/my-messages"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">My Messages</h2>
            <p className="text-slate-400">
              View answers, status, and recent official communication.
            </p>
          </Link>

          <Link
            to="/public-faq"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-purple-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Public FAQ</h2>
            <p className="text-slate-400">
              Browse public answered questions from lecturers and admins.
            </p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Submit Feedback</h2>
            <p className="text-sm text-slate-400 mb-4">
              Submit feedback for a resolved ticket response using a 1 to 5 star
              rating.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  placeholder="Example: t001"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Star Rating
                </label>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Write your feedback"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3 px-5 hover:bg-cyan-400 transition"
              >
                Submit Feedback
              </button>
            </form>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">My Feedback</h2>

            {loadingFeedback ? (
              <p className="text-slate-400">Loading feedback...</p>
            ) : feedbackList.length === 0 ? (
              <p className="text-slate-400">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbackList.map((item) => (
                  <div
                    key={item._id}
                    className="border border-slate-700 rounded-2xl p-4 bg-slate-800"
                  >
                    <p className="font-medium text-white">Ticket: {item.ticketId}</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Rating: {item.rating}/5 ({renderStars(item.rating)})
                    </p>
                    <p className="mt-2 text-slate-200">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/90">
            Welcome {user?.name || "Admin"} — oversee users, feedback, and
            official communication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-slate-400">Manage users and access control.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold mb-2">Feedback Overview</h2>
            <p className="text-slate-400">Monitor student feedback and ratings.</p>
          </div>

          <Link
            to="/lecturer/dashboard"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Official Messaging</h2>
            <p className="text-slate-400">
              Review and manage official Q&A content.
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
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
          path="/student/ask-question"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AppLayout>
                <StudentAskQuestion />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/my-messages"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AppLayout>
                <StudentMyMessages />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lecturer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
              <AppLayout>
                <OfficialLecturerDashboard />
              </AppLayout>
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
          path="/public-faq"
          element={
            <AppLayout>
              <PublicFAQ />
            </AppLayout>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;