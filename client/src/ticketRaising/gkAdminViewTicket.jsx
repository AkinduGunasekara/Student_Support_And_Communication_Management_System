import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { XCircle } from "lucide-react";
import { FaClock, FaCheckCircle, FaTicketAlt, FaPlus } from "react-icons/fa";

function gkAdminViewTicket() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

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
      setLoadingReply(false);
    }
  };

  // Stats
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === "Pending").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sens-serif">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="max-w-7xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-2xl flex justify-between items-start mb-10">
          <div className="">
            <h1 className="text-3xl font-extrabold text-white-900">
              Ticket Management System
            </h1>
            <p className="text-white-600 mt-2 max-w-xl">
              Manage and respond to student complaints efficiently.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
            <p className="text-xs uppercase text-gray-500 font-bold">Total Tickets</p>
            <h2 className="text-3xl font-bold mt-2">{total}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-xs uppercase text-gray-500 font-bold">Resolved</p>
            <h2 className="text-3xl font-bold mt-2">{resolved}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
            <p className="text-xs uppercase text-gray-500 font-bold">Pending</p>
            <h2 className="text-3xl font-bold mt-2">{pending}</h2>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">

              {/* Table Head */}
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Student ID</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Subject</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 text-center font-bold">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-4 text-gray-900">
                        {ticket.studentId}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {ticket.studentEmail}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-blue-700 px-3 py-1 font-semibold">
                          {ticket.ticketCategory}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-md whitespace-pre-line break-words text-gray-700">
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
                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-500 transition"
                          >
                            Reply
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium">Replied</span>
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">

            {/* Close */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <XCircle size={24} />
            </button>

            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              Reply to Complaint
            </h3>

            <p className="text-gray-600 mb-3">
              <b>Student:</b> {selectedTicket.studentId}
            </p>

            <p className="text-gray-600 mb-4">
              <b>Complaint:</b>
              <br />
              {selectedTicket.description}
            </p>

            {/* Reply Input */}
            <textarea
              rows="4"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-400"
            />

            <button
              onClick={handleReply}
              disabled={loadingReply}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
            >
              {loadingReply ? "Sending..." : "Send Reply"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default gkAdminViewTicket;