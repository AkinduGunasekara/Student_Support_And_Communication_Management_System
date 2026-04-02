import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-black text-white mt-16">

      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">

        {/* LEFT */}
        <div>
          <h1
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-400 cursor-pointer"
          >
            Campus One
          </h1>

          <p className="text-sm text-gray-400 mt-3">
            Discover. Join. Connect. <br />
            Everything happening on your campus, in one place.
          </p>
        </div>

        {/* CENTER */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Navigation
          </h2>

          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <button onClick={() => navigate("/events")} className="hover:text-white text-left">
              Events
            </button>

            <button onClick={() => navigate("/login")} className="hover:text-white text-left">
              Login
            </button>

            <button onClick={() => navigate("/register")} className="hover:text-white text-left">
              Register
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Contact
          </h2>

          <p className="text-sm text-gray-400">
            University Support System <br />
            support@university.edu
          </p>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-800 text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} Campus One. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;