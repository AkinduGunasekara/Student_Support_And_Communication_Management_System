import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaClock, FaTools, FaTicketAlt } from "react-icons/fa";

function gkTicketView() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCategory, setSearchCategory] = useState("");

  // Fetch all tickets for the logged-in user
  const fetchTickets = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not logged in. Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5001/api/tickets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to fetch tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets by category
  const filteredTickets = tickets.filter((t) =>
    t.ticketCategory?.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Count tickets by status
  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const inProessingCount = tickets.filter((t) => t.status === "Processing").length;
  // const completedCount = tickets.filter((t) => t.status === "Completed").length;

  return (
    <div className="font-sens-serif max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        
        {/* Pending Tickets */}
        <div className="flex items-center bg-white rounded-lg shadow p-4">
            <div className="bg-yellow-200 text-yellow-800 p-3 rounded-lg">
                <FaClock size={24} />
            </div>
            <div className="ml-4">
                <div className="text-sm font-medium text-yellow-800">Pending Tickets</div>
                <div className="text-2xl font-bold">{pendingCount}</div>
            </div>
        </div>

        {/* In Progress Tickets */}
        <div className="flex items-center bg-white rounded-lg shadow p-4">
            <div className="bg-blue-200 text-blue-800 p-3 rounded-lg">
            <FaTools size={24} />
            </div>
            <div className="ml-4">
            <div className="text-sm font-medium text-blue-800">In Progress</div>
            <div className="text-2xl font-bold">{inProessingCount}</div>
            </div>
        </div>

        {/* Total Tickets */}
        <div className="flex items-center bg-white rounded-lg shadow p-4">
            <div className="bg-blue-200 text-blue-800 p-3 rounded-lg">
            <FaTicketAlt size={24} />
            </div>
            <div className="ml-4">
            <div className="text-sm font-medium text-gray-800">Total Tickets</div>
            <div className="text-2xl font-bold">{tickets.length}</div>
            </div>
        </div>
        </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold tracking-wide drop-shadow-md">
          My Tickets
        </h1>
      </div>

      {/* Filter + New Ticket Button */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Filter by ticket category..."
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <button
          onClick={() => navigate("/raise-ticket")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <FaPlus size={16} /> New Ticket
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-10">Loading tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-center text-gray-600 py-10">
          No tickets found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
                
                {/* Table Head */}
                <thead className="bg-gray-100 text-gray-700">
                <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                {filteredTickets.map((ticket) => (
                    <tr
                    key={ticket._id}
                    className="border-t hover:bg-blue-50 transition"
                    >
                    <td className="p-3">{ticket.ticketId}</td>
                    <td className="p-3">{ticket.studentId}</td>
                    <td className="p-3">{ticket.studentEmail}</td>
                    <td className="p-3">{ticket.accodamicYear}</td>
                    <td className="p-3">{ticket.ticketCategory}</td>

                    {/* FIXED DESCRIPTION */}
                    <td className="p-3 max-w-md whitespace-pre-line break-words">
                        {ticket.description}
                    </td>

                    <td className="p-3">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "Pending"
                                ? "text-yellow-700 bg-yellow-100"
                                : ticket.status === "Processing"
                                ? "text-green-700 bg-green-100"
                                : "text-green-700 bg-green-100"
                            }`}
                        >
                            {ticket.status || "Pending"}
                        </span>
                    </td>

                    <td className="p-3">
                        <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => 
                                ticket.status === "Pending"
                                ? navigate(`/update-ticket/${ticket._id}`)
                                : toast.error("Can not edit")
                            }
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                        >
                            <FaEdit /> Edit
                        </button>

                        <button
                            onClick={() => 
                                ticket.status === "Pending"
                                ? navigate(`/delete-ticket/${ticket._id}`)
                                : toast.error("Can not delete")
                            }
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                        >
                            <FaTrash /> Delete
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
      )}
    </div>
  );
}

export default gkTicketView;