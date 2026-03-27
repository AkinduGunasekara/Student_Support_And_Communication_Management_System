import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const getUser = () => JSON.parse(localStorage.getItem("ssc_user"));

  // 🔹 Navigate based on role
 const goToDashboard = () => {
  const user = getUser();

  console.log("User:", user);

  if (!user || !user.role) return;

  if (user.role === "student") {
    navigate("/student/dashboard");
  } else if (user.role === "lecturer") {
    navigate("/lecturer/dashboard");
  } else if (user.role === "admin") {
    navigate("/admin/dashboard");
  }
};

  // 🔹 Logout (FIXED)
  const handleLogout = () => {
  localStorage.removeItem("ssc_token");
  localStorage.removeItem("ssc_user");

  window.location.replace("/login");
};

  const user = getUser();

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      
      {/* Logo */}
      <h1
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/events")}
      >
        ScholarSync
      </h1>

      {/* Links */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/events")}
          className="text-gray-700 hover:text-blue-600"
        >
          Events
        </button>

        <button className="text-gray-700 hover:text-blue-600">
          Messaging
        </button>

        <button className="text-gray-700 hover:text-blue-600">
          Tickets
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        <div className="cursor-pointer text-xl">🔔</div>

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>👤</span>
            <span className="font-medium">
              {user?.name || "User"}
            </span>
            <span>▼</span>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg border z-50">

              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={goToDashboard}
              >
                View Profile
              </div>

              <div
                className="px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;