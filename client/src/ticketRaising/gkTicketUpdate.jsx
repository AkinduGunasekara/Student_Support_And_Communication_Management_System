import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function GkTicketUpdate({ ticketId, closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accodamicYear: "",
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
      // const token = localStorage.getItem("authToken");
      // if (!token) {
      //   toast.error("Please login first.");
      //   return;
      // }

      try {
        const res = await axios.get(
          `http://localhost:5001/api/tickets/${ticketId}`,
          // { headers: { Authorization: `Bearer ${token}` } }
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

    // const token = localStorage.getItem("authToken");
    // if (!token) {
    //   toast.error("Unauthorized. Please login again.");
    //   return;
    // }

    try {
      await axios.put(
        `http://localhost:5001/api/tickets/${ticketId}`,
        formData,
        // { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="mt-0 w-full max-w-4xl mx-auto overflow-hidden font-sens-serif">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          📝 Update Ticket
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Modify and resubmit your ticket below.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold mb-2">Student ID*</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100 cursor-not-allowed"
              readOnly
            />
            {errors.studentId && (
              <p className="text-red-600 text-sm mt-1">{errors.studentId}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Student Email*</label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            />
            {errors.studentEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.studentEmail}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Academic Year*</label>
            <input
              type="text"
              name="accodamicYear"
              value={formData.accodamicYear}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Faculty*</label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Ticket Category*</label>
            <select
              name="ticketCategory"
              value={formData.ticketCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
            >
              <option value="Select category">Select category</option>
              <option value="Accademic">Accademic</option>
              <option value="Complaint">Complaint</option>
              <option value="Technical Issues">Technical Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-gray-100"
              rows={4}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white transition-all bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Ticket"}
        </button>
      </form>
    </div>
  );
}

export default GkTicketUpdate;