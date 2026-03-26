import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function GkTicketCreate({ closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accodamicYear: "",
    ticketCategory: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regex1 = /^IT\d{8}$/;
    const regex2 = /.+@.+\..+/;

    if (!regex1.test(formData.studentId)) return toast.error("Invalid Student ID");
    if (!regex2.test(formData.studentEmail)) return toast.error("Invalid Student Email");
    if (!formData.studentId || !formData.studentEmail || !formData.accodamicYear || !formData.ticketCategory || !formData.description)
      return toast.error("All fields are required");

    setLoading(true);
    try {
      await axios.post("http://localhost:5001/api/tickets/create", formData);
      toast.success("Ticket submitted successfully!", { position: "top-center" });

      // Refresh parent ticket list
      refreshTickets && refreshTickets();

      // Close the modal
      closeModal && closeModal();

      // Reset form
      setFormData({
        studentId: "",
        studentEmail: "",
        accodamicYear: "",
        ticketCategory: "",
        description: "",
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
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Academic Year*</label>
          <input
            type="text"
            name="accodamicYear"
            value={formData.accodamicYear}
            onChange={handleChange}
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
            <option value="">Select Category</option>
            <option value="Registration">Course Registration</option>
            <option value="Hostel">Hostel</option>
            <option value="Library">Library</option>
            <option value="Exam">Exam</option>
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