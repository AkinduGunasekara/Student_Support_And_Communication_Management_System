import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, CircleUserRound } from "lucide-react";
import { useAuth } from "../../AuthContext";
import logo from "../../assets/Logo.png"; // ✅ added

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔥 Navigate to correct dashboard
  const goToDashboard = () => {
    if (!user || !user.role) return;

    if (user.role === "student") navigate("/student/dashboard");
    else if (user.role === "lecturer") navigate("/lecturer/dashboard");
    else if (user.role === "admin") navigate("/admin/dashboard");
  };

  const handleLogout = () => {
    logout(true); // uses your AuthContext logout
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b">

      {/* 🔵 LOGO → LANDING */}
      <img
        src={logo}
        alt="Campus One"
        className="h-14 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* 🔵 CENTER LINKS */}
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

        {/* 🔥 Tickets → scroll later */}
        <button className="text-gray-700 hover:text-blue-600">
          Tickets
        </button>
      </div>

      {/* 🔵 RIGHT SECTION */}
      <div className="flex items-center gap-3">

        {/* 🔔 Notification (only when logged in) */}
        {user && (
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white cursor-pointer">
            <Bell size={18} className="text-slate-600" />
          </div>
        )}

        {/* 🔐 NOT LOGGED IN */}
        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Login / Sign Up
          </button>
        )}

        {/* 🔐 LOGGED IN */}
        {user && (
          <div className="relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full bg-white cursor-pointer hover:bg-slate-50 transition"
            >
              <CircleUserRound size={18} className="text-slate-600" />

              <span className="text-sm font-medium text-slate-700">
                {user.name || "User"}
              </span>

              <ChevronDown size={16} className="text-slate-500" />
            </div>

            {/* 🔽 DROPDOWN */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 py-2">

                <div
                  onClick={goToDashboard}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Dashboard
                </div>

                <div
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-500 hover:bg-slate-100 cursor-pointer"
                >
                  Logout
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;