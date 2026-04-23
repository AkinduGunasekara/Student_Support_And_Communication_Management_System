import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

function gkAdminViewTicket() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tickets/getall");
      setTickets(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch tickets");
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Reply message is required");
      return;
    }

    setLoadingReply(true);

    try {
      const res = await axios.put(
        `http://localhost:5001/api/tickets/${selectedTicket._id}/reply`,
        { replyMessage }
      );

      if (res.status === 200) {
        toast.success("Reply sent successfully!");
        setSelectedTicket(null);
        setReplyMessage("");
        fetchTickets();
      }
    } catch (err) {
      toast.error("Failed to send reply");
    } finally {
      setLoadingReply(false);``
    }
  };

  // Stats
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === "Pending").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  // Filter tickets
  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <AppLayout>
      <div className="ui-page">
        <div className="ui-card mb-8 bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🎫 Admin Ticket Management</h1>
          <p className="text-blue-200">Manage and respond to student support tickets efficiently.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="ui-card p-6 border-l-4 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100">
            <p className="text-xs uppercase text-blue-600 font-bold">Total Tickets</p>
            <h2 className="text-4xl font-bold mt-2 text-blue-900">{total}</h2>
          </div>

          <div className="ui-card p-6 border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-xs uppercase text-yellow-600 font-bold">Pending</p>
            <h2 className="text-4xl font-bold mt-2 text-yellow-900">{pending}</h2>
          </div>

          <div className="ui-card p-6 border-l-4 border-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <p className="text-xs uppercase text-emerald-600 font-bold">Resolved</p>
            <h2 className="text-4xl font-bold mt-2 text-emerald-900">{resolved}</h2>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => setFilterStatus("Pending")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "Pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending ({pending})
          </button>
          <button
            onClick={() => setFilterStatus("Resolved")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "Resolved"
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Resolved ({resolved})
          </button>
        </div>

        {/* Table */}
        <div className="ui-table-wrap bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Ticket ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Student ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Faculty</th>
                  <th className="px-6 py-4 text-left font-semibold">Year</th>
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {ticket.ticketId}
                      </td>

                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {ticket.studentId}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {ticket.studentEmail}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-blue-700 font-semibold px-3 py-1 bg-blue-50 rounded-full text-xs">
                          {ticket.ticketCategory}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {ticket.faculty}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {ticket.accadomicYear}
                      </td>

                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate hover:text-clip">
                        {ticket.description}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {ticket.status === "Pending" ? (
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="btn-primary px-4 py-1.5 text-sm font-semibold"
                          >
                            Reply
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium text-xs">✓ Replied</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="ui-card relative w-full max-w-lg p-8 m-4 rounded-xl">
            <button
              onClick={() => {
                setSelectedTicket(null);
                setReplyMessage("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
            >
              <XCircle size={24} />
            </button>

            <h3 className="text-2xl font-bold text-blue-700 mb-6">
              Reply to Support Ticket
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">Ticket ID</p>
                <p className="text-gray-900 font-semibold">{selectedTicket.ticketId}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold">Student</p>
                <p className="text-gray-900">{selectedTicket.studentId} ({selectedTicket.studentEmail})</p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Issue Description</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTicket.description}</p>
              </div>
            </div>

            <label className="block text-xs uppercase text-gray-500 font-semibold mb-2">
              Your Reply
            </label>

            <textarea
              rows="5"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              className="ui-textarea mb-6 w-full"
            />

            <div className="flex gap-3">
              <button
                onClick={handleReply}
                disabled={loadingReply}
                className="btn-primary flex-1 py-2.5 font-semibold disabled:opacity-50"
              >
                {loadingReply ? "Sending..." : "Send Reply"}
              </button>

              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setReplyMessage("");
                }}
                className="btn-secondary flex-1 py-2.5 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default gkAdminViewTicket;
