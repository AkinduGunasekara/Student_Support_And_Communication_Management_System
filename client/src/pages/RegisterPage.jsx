import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

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

export const RegisterPage = () => {
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
    const studentId = formData.get("studentId");

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
          studentId: role === "student" ? studentId : undefined,
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
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1fr_1.2fr]">
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Academic Atelier</p>
          <h1 className="mt-8 text-4xl font-bold leading-tight">Join the Academic Network</h1>
          <p className="mt-4 max-w-sm text-sm text-blue-100">
            Create your account to manage support tickets, communicate with lecturers, and track important updates.
          </p>
        </section>

        <section className="px-8 py-10">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">Register with institutional details to get started.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="ui-label">Name</label>
            <input
              type="text"
              name="name"
              required
              pattern="[A-Za-z]+(\s[A-Za-z]+)*"
              title="Name can contain only alphabetic letters and spaces"
              className="ui-input"
            />
          </div>

          <div>
            <label className="ui-label">Email</label>
            <input
              type="email"
              name="email"
              required
              className="ui-input"
            />
          </div>

          <div>
            <label className="ui-label">Password</label>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              title="Password must be at least 6 characters"
              placeholder="At least 6 characters"
              className="ui-input"
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 6 characters required</p>
          </div>

          <div>
            <label className="ui-label">Role</label>
            <select
              name="role"
              required
              value={selectedRole}
              onChange={(event) => {
                const nextRole = event.target.value;
                setSelectedRole(nextRole);
              }}
              className="ui-select"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="ui-label">Faculty</label>
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
              className="ui-select"
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
              <label className="ui-label">Course</label>
              <select
                name="course"
                required
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                disabled={!selectedFaculty}
                className="ui-select"
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
              <label className="ui-label">Year</label>
              <select
                name="year"
                required
                defaultValue=""
                className="ui-select"
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

          {selectedRole === "student" && (
            <div>
              <label className="ui-label">Student ID</label>
              <input
                type="text"
                name="studentId"
                required
                className="ui-input"
                placeholder="e.g., STU001"
              />
            </div>
          )}

          <button type="submit" className="btn-primary w-full px-4 py-3">
            Create Account
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </form>
        </section>
      </div>
    </div>
  );
};
