import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function GkTicketUpdate({ ticketId, closeModal, refreshTickets, embedded = false }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accadomicYear: "",
    faculty: "",
    ticketCategory: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch ticket data by ID
  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      const token = localStorage.getItem("ssc_token");
      if (!token) {
        toast.error("Please login first.");
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/tickets/${ticketId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        toast.error("Failed to load ticket data");
      }
    };

    fetchTicket();
  }, [ticketId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation
    if (name === "studentId") {
      const regex = /^IT\d{8}$/;
      setErrors((prev) => ({
        ...prev,
        studentId: regex.test(value) ? "" : "Invalide Student ID(Format: IT12345678)",
      }));
    }
    if (name === "studentEmail") {
      const regex = /.+@.+\..+/;
      setErrors((prev) => ({
        ...prev,
        studentEmail: regex.test(value) ? "" : "Invalid Student Email(format: student@my.sliit.lk)",
      }));
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields
    const requiredFields = [
      "studentId",
      "studentEmail",
      "accadomicYear",
      "faculty",
      "ticketCategory",
      "description",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return toast.error("All fields are required!");
      }
    }

    // Check validation errors
    if (errors.studentId || errors.studentEmail) {
      return toast.error("Please fix validation errors before submitting!");
    }

    setLoading(true);

    const token = localStorage.getItem("ssc_token");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/tickets/${ticketId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Ticket updated successfully!", { position: "top-center" });
      refreshTickets(); // Auto-refresh the ticket list
      closeModal(); // Close modal
    } catch (err) {
      console.error("Error updating ticket:", err);
      toast.error(err.response?.data?.message || "Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full max-w-3xl mx-auto">

    {/* Header */}
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md">
      <h2 className="text-xl font-bold">
        📝 Update Ticket
      </h2>
      <p className="text-sm text-blue-100">
        Modify and resubmit your ticket below.
      </p>
    </div>

    {/* Form Card */}
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-5">
      <form onSubmit={handleSubmit} className="space-y-5">

        <div className="grid md:grid-cols-2 gap-4">

          {/* Student ID */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Student ID*
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-sm cursor-not-allowed"
            />
          </div>

          {/* Student Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Student Email*
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              readOnly
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 text-sm cursor-not-allowed"
            />
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Academic Year*
            </label>
            <input
              type="text"
              name="accadomicYear"
              value={formData.accadomicYear}
              onChange={handleChange}
              placeholder="e.g. Year 3 Semester 1"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Faculty */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Faculty*
            </label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g. Computing"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Ticket Category*
            </label>
            <select
              name="ticketCategory"
              value={formData.ticketCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select category</option>
              <option value="Academic">Academic</option>
              <option value="Complaint">Complaint</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your issue..."
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-md disabled:opacity-70"
        >
          {loading ? "Updating..." : "Update Ticket"}
        </button>

      </form>
    </div>
  </div>
);
}

export default GkTicketUpdate;