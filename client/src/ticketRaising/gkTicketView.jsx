import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import GkTicketCreate from "./gkTicketCreate.jsx";
import GkTicketUpdate from "./gkTicketUpdate.jsx";
import GkTicketDelete from "./gkTicketDelete.jsx";
import ticketsBanner from "../assets/tickets banner.jpg";

function GkTicketView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchCategory, setSearchCategory] = useState("");

  // GET USER + TOKEN
  const token = localStorage.getItem("ssc_token");
  const user = JSON.parse(localStorage.getItem("ssc_user")); // adjust if needed

  // Fetch ONLY logged-in user's tickets
  const fetchTickets = async () => {
    setLoading(true);

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5001/api/tickets/my", 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter
  const filteredTickets = tickets.filter((t) =>
    t.ticketCategory?.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  // Open update modal
  const handleEdit = (ticket) => {
    if (ticket.status === "Pending") {
      setSelectedTicket(ticket);
      setModalType("update");
    } else {
      toast.error("Cannot edit resolved ticket");
    }
  };

  // Open delete modal
  const handleDelete = (ticket) => {
    if (ticket.status === "Pending") {
      setSelectedTicket(ticket);
      setModalType("delete");
    } else {
      toast.error("Cannot delete resolved ticket");
    }
  };

  return (
    <AppLayout>
        <main className="max-w-7xl mx-auto px-6 py-10">
          <section className="relative mb-8 overflow-hidden rounded-2xl shadow">
            <img
              src={ticketsBanner}
              alt="My tickets banner"
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
              <h1 className="text-3xl font-bold">My Tickets</h1>
              <p className="mt-2 text-sm text-white/85">Manage your support requests</p>
            </div>
          </section>

          <section className="mb-8 flex justify-end sm:mb-12">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FaPlus /> New Ticket
            </button>
          </section>

          <section className="mb-8">
            <div>
              <h2 className="text-2xl font-bold">Ticket Overview</h2>
              <p className="text-gray-500">Track all your support requests by status and category</p>
            </div>
          </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-5 bg-white shadow rounded-xl">
            <p>Total</p>
            <h2 className="text-2xl font-bold">{tickets.length}</h2>
          </div>

          <div className="p-5 bg-white shadow rounded-xl">
            <p>Resolved</p>
            <h2 className="text-2xl font-bold text-green-600">{resolvedCount}</h2>
          </div>

          <div className="p-5 bg-white shadow rounded-xl">
            <p>Pending</p>
            <h2 className="text-2xl font-bold text-yellow-600">{pendingCount}</h2>
          </div>
        </section>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by category..."
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-lg">No tickets found</p>
              <p className="text-gray-400 text-sm mt-2">Create a new ticket to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Ticket ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Student ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Faculty</th>
                    <th className="px-6 py-4 text-left font-semibold">Year</th>
                    <th className="px-6 py-4 text-left font-semibold">Subject</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-xs text-gray-500">
                            {ticket.studentId}
                          </div>
                          <div className="font-medium">
                            {ticket.studentEmail}
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-700 font-medium">
                          {ticket.ticketCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {ticket.faculty}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {ticket.accadomicYear}
                      </td>
                      <td className="p-3 max-w-md whitespace-pre-line break-words">{ticket.description}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ticket)}
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

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-xl w-full max-w-3xl relative my-6 mx-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-2 right-1 z-10 hover:text-red-600 cursor-pointer"
              >
                <XCircle size={24} />
              </button>

              <GkTicketCreate
                user={user}
                closeModal={() => setShowCreateModal(false)}
                refreshTickets={fetchTickets}
              />
            </div>
          </div>
        )}

        {/* UPDATE MODAL */}
        {selectedTicket && modalType === "update" && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-xl w-full max-w-3xl relative my-6 mx-4">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                className="absolute top-2 right-1 z-10 hover:text-red-600 cursor-pointer"
              >
                <XCircle size={24} />
              </button>

              <GkTicketUpdate
                ticketId={selectedTicket._id}
                closeModal={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                refreshTickets={fetchTickets}
              />
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {selectedTicket && modalType === "delete" && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-xl w-full max-w-3xl relative my-6 mx-4">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                className="absolute top-2 right-1 z-10 hover:text-red-600 cursor-pointer"
              >
                <XCircle size={24} />
              </button>

              <GkTicketDelete
                ticketId={selectedTicket._id}
                closeModal={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                refreshTickets={fetchTickets}
              />
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

export default GkTicketView;