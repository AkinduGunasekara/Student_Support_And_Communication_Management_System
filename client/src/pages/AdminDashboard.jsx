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
      <div className="ui-page">
        <div className="ui-card mb-8 bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-200">
            Welcome {user?.name || "Admin"} — oversee users, feedback, and
            official communication.
          </p>
        </div>

        <div id="profile-section" className="mb-8">
          <UserProfile />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
            <button
              onClick={() => {
                setShowUserForm(!showUserForm);
                setEditingUser(null);
                setSelectedRole("");
                setSelectedFaculty("");
              }}
              className="btn-primary py-2 px-4"
            >
              {showUserForm ? "Cancel" : "+ Add User"}
            </button>
          </div>

          {showUserForm && (
            <div className="ui-card p-6 mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Add New User</h3>
              <form ref={formRef} onSubmit={handleAddUser} className="space-y-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="ui-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
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
                    className="ui-input"
                  />
                </div>

                <div>
                  <label className="ui-label">Role</label>
                  <select
                    name="role"
                    required
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setSelectedFaculty("");
                    }}
                    className="ui-select"
                  >
                    <option value="">Select role</option>
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
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="ui-select"
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
                  <label className="ui-label">Course</label>
                  <select
                    name="course"
                    required
                    disabled={!selectedFaculty}
                    className="ui-select disabled:opacity-50"
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
                      <label className="ui-label">Year</label>
                      <select
                        name="year"
                        required
                        className="ui-select"
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
                      <label className="ui-label">Student ID</label>
                      <input
                        type="text"
                        name="studentId"
                        required
                        className="ui-input"
                        placeholder="e.g., STU001"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn-primary md:col-span-2 py-2"
                >
                  Create User
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-600">Loading users...</div>
          ) : (
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
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
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3">{u.name}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3 capitalize">
                        <span className="ui-badge bg-blue-100 text-blue-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`ui-badge ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className="btn-secondary text-sm px-2 py-1"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="ui-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Feedback Overview</h2>
            <p className="text-slate-600">Monitor student feedback and ratings.</p>
          </div>

          <Link
            to="/lecturer/dashboard"
            className="ui-card p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Official Messaging</h2>
            <p className="text-slate-600">
              Review and manage official Q&A content.
            </p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};


