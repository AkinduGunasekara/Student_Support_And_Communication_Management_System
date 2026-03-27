import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function GkTicketCreate({ closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accodamicYear: "",
    faculty: "",
    ticketCategory: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    studentId: "",
    studentEmail: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Updated handleChange with validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    let error = "";

    // ✅ Restrict invalid typing for Student ID (allow partial typing)
    if (name === "studentId") {
      const typingRegex = /^IT\d{0,8}$/;
      if (!typingRegex.test(value)) return;

      const regex = /^IT\d{8}$/;
      if (!regex.test(value)) {
        error = "Invalide Student ID(Format: IT12345678)";
      }
    }

    // ✅ Email validation
    if (name === "studentEmail") {
      const regex = /.+@.+\..+/;
      if (!regex.test(value)) {
        error = "Invalid Student Email(format: student@my.sliit.lk)";
      }
    }

    // Set form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Set errors
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ✅ Submit handler with final validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const idValid = /^IT\d{8}$/.test(formData.studentId);
    const emailValid = /.+@.+\..+/.test(formData.studentEmail);

    if (
      !formData.studentId ||
      !formData.studentEmail ||
      !formData.accodamicYear ||
      !formData.faculty ||
      !formData.ticketCategory ||
      !formData.description
    ) {
      return toast.error("All fields are required");
    }

    if (!idValid) {
      return toast.error("Invalid Student ID (Format: IT12345678)");
    }

    if (!emailValid) {
      return toast.error("Invalid Email Address");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5001/api/tickets/create", formData);

      toast.success("Ticket submitted successfully!", {
        position: "top-center",
      });

      refreshTickets && refreshTickets();
      closeModal && closeModal();

      setFormData({
        studentId: "",
        studentEmail: "",
        accodamicYear: "",
        faculty: "",
        ticketCategory: "",
        description: "",
      });

      setErrors({
        studentId: "",
        studentEmail: "",
      });
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
              <p className="text-red-500 text-sm mt-1">
                {errors.studentId}
              </p>
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
              <p className="text-red-500 text-sm mt-1">
                {errors.studentEmail}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-semibold text-gray-700">Academic Year*</label>
            <input
              type="text"
              name="accodamicYear"
              value={formData.accodamicYear}
              onChange={handleChange}
              placeholder="Accodamic Year"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Faculty*</label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="faculty"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>
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
            <option value="Accademic">Accademic</option>
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