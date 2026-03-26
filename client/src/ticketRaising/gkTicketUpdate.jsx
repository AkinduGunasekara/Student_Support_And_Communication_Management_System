import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AppLayout } from "../components/AppLayout";

function GkTicketUpdate({ ticketId, closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accodamicYear: "",
    ticketCategory: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch ticket data by ID
  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login first.");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5001/api/tickets/${ticketId}`,
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
      "accodamicYear",
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

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5001/api/tickets/${ticketId}`,
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
    <AppLayout>
      <div className="ui-page max-w-4xl">
        <div className="ui-card bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
          <h2 className="text-2xl font-bold">Update Ticket</h2>
          <p className="mt-1 text-sm text-blue-200">Modify and resubmit your ticket below.</p>
        </div>

        <div className="ui-card mt-4 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="ui-label">Student ID*</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="ui-input cursor-not-allowed bg-slate-100"
                  readOnly
                />
                {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
              </div>

              <div>
                <label className="ui-label">Student Email*</label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  className="ui-input"
                />
                {errors.studentEmail && <p className="mt-1 text-sm text-red-600">{errors.studentEmail}</p>}
              </div>

              <div>
                <label className="ui-label">Academic Year*</label>
                <input
                  type="text"
                  name="accodamicYear"
                  value={formData.accodamicYear}
                  onChange={handleChange}
                  className="ui-input"
                />
              </div>

              <div>
                <label className="ui-label">Ticket Category*</label>
                <select
                  name="ticketCategory"
                  value={formData.ticketCategory}
                  onChange={handleChange}
                  className="ui-select"
                >
                  <option value="Select category">Select category</option>
                  <option value="Academic">Academic</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Technical Issues">Technical Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="ui-label">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="ui-textarea"
                  rows={4}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Ticket"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default GkTicketUpdate;
