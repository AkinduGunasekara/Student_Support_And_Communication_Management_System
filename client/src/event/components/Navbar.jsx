import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, CircleUserRound } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const getUser = () => JSON.parse(localStorage.getItem("ssc_user"));

  const goToDashboard = () => {
    const user = getUser();
    if (!user || !user.role) return;

    if (user.role === "student") navigate("/student/dashboard");
    else if (user.role === "lecturer") navigate("/lecturer/dashboard");
    else if (user.role === "admin") navigate("/admin/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("ssc_token");
    localStorage.removeItem("ssc_user");
    window.location.replace("/login");
  };

  const user = getUser();

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b">

      {/* Logo */}
      <h1
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/events")}
      >
        Academic Atelier
      </h1>

      {/* Center Links */}
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

      {/* RIGHT SECTION (FIXED) */}
      <div className="flex items-center gap-3">

        {/* 🔔 Notification (dashboard style) */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white cursor-pointer">
          <Bell size={18} className="text-slate-600" />
        </div>

        {/* 👤 Profile */}
        <div className="relative">
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full bg-white cursor-pointer hover:bg-slate-50 transition"
          >
            <CircleUserRound size={18} className="text-slate-600" />

            <span className="text-sm font-medium text-slate-700">
              {user?.name || "User"}
            </span>

            <ChevronDown size={16} className="text-slate-500" />
          </div>

          {/* DROPDOWN (MATCHES YOUR IMAGE) */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 py-2">

              <div
                onClick={goToDashboard}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                View Profile
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
      </div>
    </div>
  );
};

export default Navbar;