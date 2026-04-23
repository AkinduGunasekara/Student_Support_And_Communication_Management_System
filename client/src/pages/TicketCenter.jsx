import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { AppLayout } from "../components/AppLayout";
import { UserProfile } from "../components/UserProfile";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import ticketsBanner from "../assets/tickets banner.jpg";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const TicketCenter = () => {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tickets/getall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(data || []);
    } catch (err) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Reply message is required");
      return;
    }

    setLoadingReply(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tickets/${selectedTicket._id}/reply`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ replyMessage }),
        }
      );

      if (res.ok) {
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
  const pending = tickets.filter((t) => t.status === "Pending").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <AppLayout>
      <div className="ui-page">
        <div className="relative mb-8 overflow-hidden rounded-2xl shadow">
          <img
            src={ticketsBanner}
            alt="Ticket center banner"
            className="h-52 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Support Ticket Center</h1>
            <p className="text-sm text-white/85 max-w-2xl">
              Manage and respond to student support tickets
            </p>
          </div>
        </div>

          {/* HEADER
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-2xl mb-10">
            <h1 className="text-3xl font-extrabold">
              🎫 Ticket Management System
            </h1>
            <p className="mt-2">
              Manage and respond to student support requests efficiently.
            </p>
          </div> */}

          {/* PROFILE
          <div className="mb-8">
            <UserProfile />
          </div> */}

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
              <p className="text-xs uppercase text-gray-500 font-bold">
                Total Tickets
              </p>
              <h2 className="text-3xl font-bold mt-2">{total}</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-600">
              <p className="text-xs uppercase text-gray-500 font-bold">
                Resolved
              </p>
              <h2 className="text-3xl font-bold mt-2">{resolved}</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
              <p className="text-xs uppercase text-gray-500 font-bold">
                Pending
              </p>
              <h2 className="text-3xl font-bold mt-2">{pending}</h2>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                {/* HEAD */}
                <thead className="bg-gradient-to-r from-blue-600 to-blue-600 text-white text-xl">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Ticket ID</th>
                    <th className="px-6 py-4 text-left font-bold">Student</th>
                    <th className="px-6 py-4 text-left font-bold">Category</th>
                    <th className="px-6 py-4 text-left font-bold">Faculty</th>
                    <th className="px-6 py-4 text-left font-bold">Year</th>
                    <th className="px-6 py-4 text-left font-bold">Subject</th>
                    <th className="px-6 py-4 text-left font-bold">Status</th>
                    <th className="px-6 py-4 text-center font-bold">Action</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-500">
                        No tickets found
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">

                        <td className="px-6 py-4 font-semibold">
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              ticket.ticketCategory === "Academic"
                                ? "bg-blue-100 text-blue-700"
                                : ticket.ticketCategory === "Complaint"
                                ? "bg-red-100 text-red-700"
                                : ticket.ticketCategory === "Technical"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-yellow-100 text-yellow-700" // default / Other
                            }`}
                          >
                            {ticket.ticketCategory}
                          </span>
                        </td>

                        <td className="px-6 py-4">{ticket.faculty}</td>

                        <td className="px-6 py-4">{ticket.accadomicYear}</td>

                        {/* ✅ SUBJECT FIX */}
                        <td className="p-3 max-w-md whitespace-pre-line break-words">
                          
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
                              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-500"
                            >
                              Reply
                            </button>
                          ) : (
                            <span className="text-gray-400">Replied</span>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      

        {/* MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">

              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
              >
                <XCircle size={24} />
              </button>

              <h3 className="text-xl font-bold text-indigo-700 mb-4">
                Reply to Ticket
              </h3>

              <p className="mb-2">
                <b>Student:</b> {selectedTicket.studentId}
              </p>

              <p className="mb-4">
                <b>Subject:</b> {selectedTicket.description}
              </p>

              <textarea
                rows="4"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full border rounded-lg p-2 mb-4"
                placeholder="Type your reply..."
              />

              <button
                onClick={handleReply}
                disabled={loadingReply}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg"
              >
                {loadingReply ? "Sending..." : "Send Reply"}
              </button>

            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default TicketCenter;