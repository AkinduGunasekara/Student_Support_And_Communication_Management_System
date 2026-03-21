import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaClock, FaTools, FaTicketAlt } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

function GkTicketView() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCategory, setSearchCategory] = useState("");

  // Fetch all tickets
  const fetchTickets = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not logged in. Please login first.");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5001/api/tickets/getall", {
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

  useEffect(() => { fetchTickets(); }, []);

  // Filter tickets
  const filteredTickets = tickets.filter(t =>
    t.ticketCategory?.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Count tickets by status
  const pendingCount = tickets.filter(t => t.status === "Pending").length;
  const inProgressCount = tickets.filter(t => t.status === "Processing").length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header Section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">
            Support & Assistance
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Submit new inquiries or track existing support requests regarding academics, finance, and campus IT services.
          </p>
        </div>
        <button
          onClick={() => navigate("/raise-ticket")}
          className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <FaPlus /> Raise New Ticket
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl border-l-4 border-blue-600 flex flex-col justify-between h-32">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Tickets</span>
          <span className="text-3xl font-extrabold text-on-surface">{tickets.length}</span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl border-l-4 border-green-600 flex flex-col justify-between h-32">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Resolved</span>
          <span className="text-3xl font-extrabold text-on-surface">{inProgressCount}</span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-xl border-l-4 border-yellow-400 flex flex-col justify-between h-32">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pending</span>
          <span className="text-3xl font-extrabold text-on-surface">{pendingCount}</span>
        </div>
      </section>

      {/* Filter/Search */}
      <section className="bg-surface-container-low p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Filter by ticket category..."
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full bg-white border-none rounded-lg py-2.5 pl-10 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
          />
        </div>
      </section>

      {/* Table Container */}
      <div className="font-sens-serif max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        {loading ? (
          <p className="text-center text-gray-600 py-10">Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-center text-gray-600 py-10">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
            {/* --- KEEP YOUR TABLE AS IS --- */}
            <table className="min-w-full text-sm text-left">
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
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-t hover:bg-blue-50 transition">
                    <td className="p-3">{ticket.ticketId}</td>
                    <td className="p-3">{ticket.studentId}</td>
                    <td className="p-3">{ticket.studentEmail}</td>
                    <td className="p-3">{ticket.accodamicYear}</td>
                    <td className="p-3">{ticket.ticketCategory}</td>
                    <td className="p-3 max-w-md whitespace-pre-line break-words">{ticket.description}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === "Pending"
                          ? "text-yellow-700 bg-yellow-100"
                          : ticket.status === "Processing"
                          ? "text-green-700 bg-green-100"
                          : "text-green-700 bg-green-100"
                      }`}>
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
        {/* Pagination */}
        <div className="p-4 bg-surface-container-low flex justify-between items-center">
          <span className="text-xs font-bold text-on-surface-variant">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </span>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm"> <MdChevronLeft /></span>
            </button>
            <button className="px-3 py-1 bg-white shadow-sm rounded-lg text-xs font-bold cursor-pointer">1</button>
            <button className="px-3 py-1 hover:bg-white rounded-lg text-xs font-bold cursor-pointer">2</button>
            <button className="px-3 py-1 hover:bg-white rounded-lg text-xs font-bold cursor-pointer">3</button>
            <button className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm"> <MdChevronRight /> </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default GkTicketView;