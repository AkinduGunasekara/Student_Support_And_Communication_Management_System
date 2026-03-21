import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MessageSquare, XCircle } from "lucide-react";
import { FaClock, FaTools, FaTicketAlt } from "react-icons/fa";

function gkAdminViewTicket() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch all complaints
  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tickets/getall");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      toast.error("Failed to fetch complaints");
    }
  };

  // Send reply
  const handleReply = async () => {
    try {
      if (!replyMessage) {
        toast.error("Reply message is required");
        return;
      }

      await axios.put(
        `http://localhost:5001/api/tickets/${selectedTicket._id}/reply`,
        { replyMessage }
      );

      toast.success("Reply sent successfully!");
      navigate("/reply");
      setSelectedTicket(null);
      setReplyMessage("");
      fetchTickets();
    } catch (err) {
      console.error("Error sending reply:", err);
      toast.error("Failed to send reply");
    }
  };

  // Count tickets by status
  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const inProessingCount = tickets.filter((t) => t.status === "Processing").length;
  // const completedCount = tickets.filter((t) => t.status === "Completed").length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">

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

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 rounded-xl text-white mb-6 flex items-center gap-2">
          <MessageSquare />
          <h2 className="text-2xl font-bold">All Complaints</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {/*<th className="p-3">Ticket ID</th>*/}
                <th className="p-3">Student ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">Category</th>
                <th className="p-3 w-64">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="border-t hover:bg-indigo-50">

                    {/*<td className="p-3">{ticket.ticketId}</td>*/}
                    <td className="p-3">{ticket.studentId}</td>
                    <td className="p-3">{ticket.studentEmail}</td>
                    <td className="p-3">{ticket.ticketCategory}</td>

                    {/* Description with line breaks */}
                    <td className="p-3 max-w-md whitespace-pre-line break-words">
                      {ticket.description}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                          ticket.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : ticket.status === "Processing"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ticket.status || "Pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-center">
                      {ticket.status === "Pending" ? (
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-500 cursor-pointer"
                        >
                          Reply
                        </button>
                      ) : (
                        <span className="text-gray-500">Replied</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              <b>Complaint:</b><br />
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
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 cursor-pointer"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default gkAdminViewTicket;