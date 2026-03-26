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
              title="Password must be at least 6 characters"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">Minimum 6 characters required</p>
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

          {selectedRole === "student" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., STU001"
              />
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
