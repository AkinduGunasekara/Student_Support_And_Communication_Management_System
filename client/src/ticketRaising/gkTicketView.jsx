import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { XCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import GkTicketCreate from "./gkTicketCreate.jsx";
import GkTicketUpdate from "./gkTicketUpdate.jsx";
import GkTicketDelete from "./gkTicketDelete.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function GkTicketView() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchCategory, setSearchCategory] = useState("");

  // ✅ GET USER + TOKEN
  const token = localStorage.getItem("ssc_token");
  const user = JSON.parse(localStorage.getItem("ssc_user")); // adjust if needed

  // ✅ Fetch ONLY logged-in user's tickets
  const fetchTickets = async () => {
    setLoading(true);
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
        const res = await axios.get(
        `${API_BASE_URL}/api/tickets/my`,
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
  const handleEdit = (ticket) => {
    if (ticket.status === "Pending") {
      setSelectedTicket(ticket);
      setModalType("update");
    } else {
      toast.error("Cannot edit resolved ticket");
    }
  };
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
            {/* Header */}
        <section className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Tickets</h1>
            <p className="text-gray-500">Manage your support requests</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FaPlus /> New Ticket
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
                    <th className="px-6 py-4 text-left font-semibold">Student Email</th>
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
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {ticket.studentId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {ticket.studentEmail}
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
                        {ticket.academicYear || ticket.accadomicYear}
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                        {ticket.description}
                      </td>
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
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(ticket)}
                            disabled={ticket.status !== "Pending"}
                            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm ${
                              ticket.status === "Pending"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(ticket)}
                            disabled={ticket.status !== "Pending"}
                            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm ${
                              ticket.status === "Pending"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <FaTrash className="inline mr-1" /> Delete
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
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 overflow-y-auto">
            <div className="relative my-6 mx-4 w-full max-w-3xl rounded-xl bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 z-10"
              >
                <XCircle size={24} />
              </button>
                <GkTicketCreate
                user={user} // 🔥 PASS USER
                embedded
                closeModal={() => setShowCreateModal(false)}
                refreshTickets={fetchTickets}
              />
            </div>
          </div>
        )}

        {/* UPDATE MODAL */}
        {selectedTicket && modalType === "update" && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 overflow-y-auto">
            <div className="relative my-6 mx-4 w-full max-w-3xl rounded-xl bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                className="absolute top-4 right-4 z-10"
              >
                <XCircle size={24} />
              </button>
                <GkTicketUpdate
                ticketId={selectedTicket._id}
                embedded
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
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 overflow-y-auto">
            <div className="relative my-6 mx-4 w-full max-w-3xl rounded-xl bg-white p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedTicket(null);
                }}
                className="absolute top-4 right-4 z-10"
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