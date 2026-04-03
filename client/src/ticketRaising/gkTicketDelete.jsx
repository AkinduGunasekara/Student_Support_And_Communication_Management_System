import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function GkTicketDelete({ ticketId, closeModal, refreshTickets }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch ticket details by ID
  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      const token = localStorage.getItem("ssc_token");
      if (!token) {
        toast.error("You are not logged in. Please login first.");
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/tickets/${ticketId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTicket(res.data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        toast.error("Failed to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  // Handle ticket deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    const token = localStorage.getItem("ssc_token");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/api/tickets/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ticket deleted successfully!", { position: "top-center" });

      // Refresh parent ticket list if available
      if (refreshTickets) refreshTickets();
      // Close modal
      if (closeModal) closeModal();
    } catch (err) {
      console.error("Error deleting ticket:", err);
      toast.error(err.response?.data?.message || "Failed to delete ticket");
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading ticket details...</p>;
  }

  if (!ticket) {
    return <p className="text-center mt-10 text-red-600">Ticket not found.</p>;
  }

  return (
    <div className="mt-5 w-full max-w-4xl mx-auto overflow-hidden">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🗑️ Delete Ticket
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Review the details before deleting this ticket.
        </p>
      </div>

      <div className="ui-card p-6 mt-5">
        {/* Ticket Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Student ID</label>
            <input
              type="text"
              value={ticket.studentId}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Student Email</label>
            <input
              type="text"
              value={ticket.studentEmail}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={ticket.academicYear || ticket.accadomicYear}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Faculty</label>
            <input
              type="text"
              value={ticket.faculty}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Ticket Category</label>
            <input
              type="text"
              value={ticket.ticketCategory}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={ticket.description}
            readOnly
            className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 resize-none cursor-not-allowed"
            rows="4"
          />
        </div>

        {/* Delete Confirmation */}
        <p className="text-center text-gray-700 text-lg mt-6">
          Are you sure you want to{" "}
          <span className="font-semibold text-red-600">delete</span> this ticket?
        </p>

        <div className="flex gap-5 mt-6">
          <button
            onClick={handleDelete}
            className="w-1/2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            Yes, Delete
          </button>
          <button
            onClick={closeModal}
            className="w-1/2 bg-gray-400 text-white py-3 rounded-xl font-semibold hover:bg-gray-500 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default GkTicketDelete;