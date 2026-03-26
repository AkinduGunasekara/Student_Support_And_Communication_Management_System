import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AppLayout } from "../components/AppLayout";
import { UserProfile } from "../components/UserProfile";

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

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u._id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();
      setUsers(users.map((u) => (u._id === userId ? updatedUser : u)));
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get("role");
    const faculty = formData.get("faculty");

    const newUser = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
      faculty,
      course: formData.get("course") || undefined,
      year: role === "student" ? Number(formData.get("year")) : undefined,
      studentId: role === "student" ? formData.get("studentId") : undefined,
      isActive: true,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      const createdUser = await response.json();
      setUsers([createdUser, ...users]);
      setShowUserForm(false);
      if (formRef.current) {
        formRef.current.reset();
      }
      setSelectedRole("");
      setSelectedFaculty("");
      alert("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.message || "Failed to create user");
    }
  };

  const allowedCourses = selectedFaculty
    ? COURSE_BY_FACULTY[selectedFaculty] || []
    : COURSE_OPTIONS;

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

        <div id="profile-section" className="mb-8">
          <UserProfile />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button
              onClick={() => {
                setShowUserForm(!showUserForm);
                setEditingUser(null);
                setSelectedRole("");
                setSelectedFaculty("");
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2 px-4 rounded-lg transition"
            >
              {showUserForm ? "Cancel" : "+ Add User"}
            </button>
          </div>

          {showUserForm && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <form ref={formRef} onSubmit={handleAddUser} className="space-y-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setSelectedFaculty("");
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select role</option>
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
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select faculty</option>
                    {FACULTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    name="course"
                    required
                    disabled={!selectedFaculty}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                  >
                    <option value="">
                      {selectedFaculty ? "Select course" : "Select faculty first"}
                    </option>
                    {allowedCourses.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRole === "student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Year
                      </label>
                      <select
                        name="year"
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Select year</option>
                        {YEAR_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="e.g., STU001"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="md:col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded-lg transition"
                >
                  Create User
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800 bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Name</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Role</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                      <td className="px-6 py-3">{u.name}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3 capitalize">
                        <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            u.isActive
                              ? "bg-green-900/30 text-green-300"
                              : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className="text-sm px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 transition"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-sm px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 text-red-300 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
