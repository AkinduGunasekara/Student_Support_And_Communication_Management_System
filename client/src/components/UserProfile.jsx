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

  useEffect(() => {
    if (!showEditModal && !showPasswordModal && !showDeleteModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowEditModal(false);
        setShowPasswordModal(false);
        setShowDeleteModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showEditModal, showPasswordModal, showDeleteModal]);

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
      <div className="ui-card p-8">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="ui-card p-8">
        <p className="text-slate-500">Unable to load profile</p>
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="ui-card p-8">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">Admin Settings</h2>
          <p className="mb-6 text-slate-500">Manage your account security below.</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="rounded-xl bg-amber-600 px-6 py-2 font-medium text-white transition hover:bg-amber-500"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-500"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div
              className="ui-card w-full max-w-md p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-password-modal-title"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 id="admin-password-modal-title" className="text-xl font-semibold text-slate-900">
                  Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close change password dialog"
                >
                  x
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="ui-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="ui-input"
                    required
                  />
                </div>

                <div>
                  <label className="ui-label">New Password</label>
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
                    className="ui-input"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Minimum 6 characters required</p>
                </div>

                <div>
                  <label className="ui-label">Confirm New Password</label>
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
                    className="ui-input"
                    required
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-amber-600 py-3 font-medium text-white transition hover:bg-amber-500"
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
                    className="btn-secondary flex-1 py-3"
                    aria-label="Cancel password update"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div
              className="ui-card w-full max-w-md border-red-200 p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-delete-modal-title"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 id="admin-delete-modal-title" className="text-xl font-semibold text-red-700">
                  Delete Account
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close delete account dialog"
                >
                  x
                </button>
              </div>
              <p className="mb-6 text-slate-600">
                Are you sure you want to permanently delete your account? This
                action cannot be undone and all your data will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-500"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1 py-3"
                  aria-label="Cancel account deletion"
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="ui-card p-8">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">My Profile</h2>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <p className="mt-1 text-lg font-medium text-slate-900">
              {userDetails.name}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <p className="mt-1 text-lg font-medium text-slate-900">
              {userDetails.email}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </label>
            <p className="mt-1 text-lg font-medium capitalize text-slate-900">
              {userDetails.role}
            </p>
          </div>

          {userDetails.studentId && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Student ID
              </label>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {userDetails.studentId}
              </p>
            </div>
          )}

          {userDetails.faculty && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Faculty
              </label>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {userDetails.faculty}
              </p>
            </div>
          )}

          {userDetails.course && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Course
              </label>
              <p className="mt-1 text-lg font-medium text-slate-900">
                {userDetails.course}
              </p>
            </div>
          )}

          {userDetails.year && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Year
              </label>
              <p className="mt-1 text-lg font-medium text-slate-900">
                Year {userDetails.year}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary px-6 py-2"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-xl bg-amber-600 px-6 py-2 font-medium text-white transition hover:bg-amber-500"
          >
            Change Password
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            className="ui-card w-full max-w-md p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-modal-title"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 id="edit-profile-modal-title" className="text-xl font-semibold text-slate-900">
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close edit profile dialog"
              >
                x
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="ui-label">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="ui-input"
                  required
                />
              </div>

              {user?.role === "student" && (
                <>
                  <div>
                    <label className="ui-label">Student ID</label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          studentId: e.target.value,
                        })
                      }
                      className="ui-input"
                    />
                  </div>

                  <div>
                    <label className="ui-label">Faculty</label>
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
                      className="ui-select"
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
                      <label className="ui-label">Course</label>
                      <select
                        value={editFormData.course}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            course: e.target.value,
                          })
                        }
                        className="ui-select"
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
                    <label className="ui-label">Year</label>
                    <select
                      value={editFormData.year}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="ui-select"
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
                    <label className="ui-label">Faculty</label>
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
                      className="ui-select"
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
                      <label className="ui-label">Course</label>
                      <select
                        value={editFormData.course}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            course: e.target.value,
                          })
                        }
                        className="ui-select"
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

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1 py-3"
                  aria-label="Cancel profile edits"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            className="ui-card w-full max-w-md p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 id="password-modal-title" className="text-xl font-semibold text-slate-900">
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close change password dialog"
              >
                x
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="ui-label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="ui-input"
                  required
                />
              </div>

              <div>
                <label className="ui-label">New Password</label>
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
                  className="ui-input"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Minimum 6 characters required</p>
              </div>

              <div>
                <label className="ui-label">Confirm New Password</label>
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
                  className="ui-input"
                  required
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 py-3 font-medium text-white transition hover:bg-amber-500"
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
                  className="btn-secondary flex-1 py-3"
                  aria-label="Cancel password update"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            className="ui-card w-full max-w-md border-red-200 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 id="delete-modal-title" className="text-xl font-semibold text-red-700">
                Delete Account
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close delete account dialog"
              >
                x
              </button>
            </div>
            <p className="mb-6 text-slate-600">
              Are you sure you want to permanently delete your account? This
              action cannot be undone and all your data will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-500"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1 py-3"
                aria-label="Cancel account deletion"
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
