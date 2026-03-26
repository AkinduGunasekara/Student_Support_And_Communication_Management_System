import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  getCurrentUserDetails,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "../services/userService";

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

const YEAR_OPTIONS = [1, 2, 3, 4];

export const UserProfile = () => {
  const { user, token, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [token]);

  const fetchUserDetails = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getCurrentUserDetails(token);
      setUserDetails(data);
      setEditFormData({
        name: data.name,
        faculty: data.faculty || "",
        course: data.course || "",
        year: data.year || "",
        studentId: data.studentId || "",
      });
      setSelectedFaculty(data.faculty || "");
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrorMessage("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedUser = await updateUserProfile(editFormData, token);
      setUserDetails(updatedUser);
      setSuccessMessage("Profile updated successfully!");
      setShowEditModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMessage(error.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      await changeUserPassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token
      );
      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Change password error:", error);
      setErrorMessage(error.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteUserAccount(token);
      setSuccessMessage("Account deleted successfully. Redirecting to login...");
      setTimeout(() => {
        logout();
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Delete account error:", error);
      setErrorMessage(error.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <p className="text-slate-400">Unable to load profile</p>
      </div>
    );
  }

  const allowedCourses = selectedFaculty
    ? COURSE_BY_FACULTY[selectedFaculty] || []
    : [];

  // For admin users, show minimal view with only password and delete account options
  if (user?.role === "admin") {
    return (
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-emerald-900 border border-emerald-700 text-emerald-200 rounded-2xl p-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-900 border border-red-700 text-red-200 rounded-2xl p-4">
            {errorMessage}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Admin Settings</h2>
          <p className="text-slate-400 mb-6">Manage your account security below.</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Minimum 6 characters required</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 transition"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-red-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-red-400">
                Delete Account
              </h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to permanently delete your account? This
                action cannot be undone and all your data will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium py-3 transition"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-900 border border-emerald-700 text-emerald-200 rounded-2xl p-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-900 border border-red-700 text-red-200 rounded-2xl p-4">
          {errorMessage}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <p className="text-lg font-medium text-white mt-1">
              {userDetails.name}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <p className="text-lg font-medium text-white mt-1">
              {userDetails.email}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Role
            </label>
            <p className="text-lg font-medium text-white mt-1 capitalize">
              {userDetails.role}
            </p>
          </div>

          {userDetails.studentId && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Student ID
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {userDetails.studentId}
              </p>
            </div>
          )}

          {userDetails.faculty && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Faculty
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {userDetails.faculty}
              </p>
            </div>
          )}

          {userDetails.course && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Course
              </label>
              <p className="text-lg font-medium text-white mt-1">
                {userDetails.course}
              </p>
            </div>
          )}

          {userDetails.year && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Year
              </label>
              <p className="text-lg font-medium text-white mt-1">
                Year {userDetails.year}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition"
          >
            Change Password
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {user?.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          studentId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Faculty
                    </label>
                    <select
                      value={editFormData.faculty}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData,
                          faculty: e.target.value,
                          course: "",
                        });
                        setSelectedFaculty(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Faculty</option>
                      {FACULTY_OPTIONS.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {allowedCourses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Course
                      </label>
                      <select
                        value={editFormData.course}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            course: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        {allowedCourses.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Year
                    </label>
                    <select
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(user?.role === "lecturer" || user?.role === "admin") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Faculty
                    </label>
                    <select
                      value={editFormData.faculty}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData,
                          faculty: e.target.value,
                          course: "",
                        });
                        setSelectedFaculty(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Faculty</option>
                      {FACULTY_OPTIONS.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {allowedCourses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Course
                      </label>
                      <select
                        value={editFormData.course}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            course: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        {allowedCourses.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Minimum 6 characters required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 transition"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-red-400">
              Delete Account
            </h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone and all your data will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium py-3 transition"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
