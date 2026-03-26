import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function GkTicketCreate({ closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    academicYear: "",
    ticketCategory: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    studentId: "",
    studentEmail: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    // Student ID validation (partial typing allowed)
    if (name === "studentId") {
      const typingRegex = /^IT\d{0,8}$/;
      if (!typingRegex.test(value)) return;

      const fullRegex = /^IT\d{8}$/;
      if (!fullRegex.test(value)) {
        error = "Invalid Student ID (Format: IT12345678)";
      }
    }

    // Email validation (must end with @my.sliit.lk)
    if (name === "studentEmail") {
      const regex = /^[^\s@]+@my\.sliit\.lk$/;
      if (!regex.test(value)) {
        error = "Invalid email (format: student@my.sliit.lk)";
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idValid = /^IT\d{8}$/.test(formData.studentId);
    const emailValid = /^[^\s@]+@my\.sliit\.lk$/.test(formData.studentEmail);

    if (
      !formData.studentId ||
      !formData.studentEmail ||
      !formData.academicYear ||
      !formData.ticketCategory ||
      !formData.description
    ) {
      return toast.error("All fields are required");
    }

    if (!idValid) return toast.error("Invalid Student ID");
    if (!emailValid) return toast.error("Invalid Email Address");

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5001/api/tickets/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Ticket submitted successfully!", { position: "top-center" });

      refreshTickets?.();
      closeModal?.();

      setFormData({
        studentId: "",
        studentEmail: "",
        academicYear: "",
        ticketCategory: "",
        description: "",
      });
      setErrors({ studentId: "", studentEmail: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-0 w-full max-w-4xl mx-auto overflow-hidden font-sens-serif">
      <div className="mb-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎫 Raise New Ticket
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Submit your issue to the university support team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-semibold text-gray-700">Student ID*</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="IT12345678"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            />
            {errors.studentId && (
              <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-gray-700">Student Email*</label>
            <input
              type="text"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              placeholder="student@my.sliit.lk"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            />
            {errors.studentEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.studentEmail}</p>
            )}
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Academic Year*</label>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="Academic Year"
            className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700">Ticket Category*</label>
          <select
            name="ticketCategory"
            value={formData.ticketCategory}
            onChange={handleChange}
            className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select category</option>
            <option value="Academic">Academic</option>
            <option value="Complaint">Complaint</option>
            <option value="Technical Issues">Technical Issues</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Description*</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your issue..."
            className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

export default GkTicketCreate;