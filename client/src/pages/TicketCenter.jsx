import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { AppLayout } from "../components/AppLayout";
import { UserProfile } from "../components/UserProfile";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const TicketCenter = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tickets/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToTicket = async (ticketId) => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replyMessage: replyText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      const updatedTicket = await response.json();
      setTickets(tickets.map((t) => (t._id === ticketId ? updatedTicket : t)));
      setReplyingTo(null);
      setReplyText("");
      alert("Reply sent successfully");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    }
  };

  const filteredTickets = filterStatus === "all" 
    ? tickets 
    : tickets.filter((t) => t.status === filterStatus);

  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <AppLayout>
      <div className="ui-page">
        <div className="border rounded-xl mb-8 bg-blue-600 p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🎫 Support Ticket Center</h1>
          <p className="text-white-200">
            Manage and respond to student support tickets
          </p>
        </div>

        <div id="profile-section" className="mb-8">
          <UserProfile />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="ui-card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold uppercase">Total Tickets</p>
            <h2 className="text-3xl font-bold text-blue-900">{tickets.length}</h2>
          </div>

          <div className="ui-card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-semibold uppercase">Pending</p>
            <h2 className="text-3xl font-bold text-yellow-900">{pendingCount}</h2>
          </div>

          <div className="ui-card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <p className="text-sm text-green-600 font-semibold uppercase">Resolved</p>
            <h2 className="text-3xl font-bold text-green-900">{resolvedCount}</h2>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilterStatus("Pending")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "Pending"
                ? "bg-yellow-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("Resolved")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "Resolved"
                ? "bg-green-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-600 py-12">
              <p className="text-lg">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="ui-card p-12 text-center">
              <p className="text-slate-600 text-lg">
                {filterStatus === "all"
                  ? "No tickets submitted yet"
                  : `No ${filterStatus.toLowerCase()} tickets`}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket._id} className="ui-card p-6 border border-slate-200 hover:shadow-lg transition">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{ticket.ticketId}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Student: <span className="font-semibold">{ticket.studentEmail}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Student ID</p>
                      <p className="text-sm font-medium text-slate-900">{ticket.studentId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Category</p>
                      <p className="text-sm font-medium text-slate-900">{ticket.ticketCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Faculty</p>
                      <p className="text-sm font-medium text-slate-900">{ticket.faculty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Year</p>
                      <p className="text-sm font-medium text-slate-900">{ticket.accadomicYear}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Subject</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.description}</p>
                  </div>

                  {/* Existing Reply */}
                  {ticket.replyMessage && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-2">✓ Admin Reply</p>
                      <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {ticket.replyMessage}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === ticket._id ? (
                    <div className="space-y-3 p-4 rounded-lg border border-slate-300">
                      <label className="text-sm font-semibold text-slate-700">Type your reply:</label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply to the student..."
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReplyToTicket(ticket._id)}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="btn-secondary text-sm px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(ticket._id)}
                      disabled={ticket.status === "Resolved" && ticket.replyMessage}
                      className={`w-full py-2 px-4 rounded-lg transition text-sm font-semibold ${
                        ticket.status === "Resolved" && ticket.replyMessage
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {ticket.replyMessage ? "Edit Reply" : "Reply to Ticket"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TicketCenter;
