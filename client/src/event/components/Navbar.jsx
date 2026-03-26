import React from "react";

const Navbar = () => {
  return (
    <div className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl font-bold text-blue-600">
        ScholarSync
      </h1>

      {/* Links */}
      <div className="flex gap-6 text-gray-600 font-medium">
        <button className="hover:text-blue-600">Events</button>
        <button className="hover:text-blue-600">Messaging</button>
        <button className="hover:text-blue-600">Tickets</button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1 border rounded-lg"
        />
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default Navbar;