const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Get current user details
 * @param {string} token - Authentication token
 * @returns {Promise} User data
 */
export const getCurrentUserDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  return response.json();
};

/**
 * Update user profile information
 * @param {object} updateData - Data to update (name, faculty, course, year, studentId)
 * @param {string} token - Authentication token
 * @returns {Promise} Updated user data
 */
export const updateUserProfile = async (updateData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update profile");
  }

  return response.json();
};

/**
 * Change user password
 * @param {object} passwordData - { currentPassword, newPassword }
 * @param {string} token - Authentication token
 * @returns {Promise} Success message
 */
export const changeUserPassword = async (passwordData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to change password");
  }

  return response.json();
};

/**
 * Request a password reset email
 * @param {string} email - Account email address
 * @returns {Promise} Reset request response
 */
export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to request password reset");
  }

  return response.json();
};

/**
 * Reset password using the emailed token
 * @param {object} resetData - { token, newPassword }
 * @returns {Promise} Success message
 */
export const resetPassword = async (resetData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resetData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to reset password");
  }

  return response.json();
};

/**
 * Delete user account permanently
 * @param {string} token - Authentication token
 * @returns {Promise} Success message
 */
export const deleteUserAccount = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete account");
  }

  return response.json();
};
