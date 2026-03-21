import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function gkTicketCreate() {
  const navigate = useNavigate();
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

    if (!regex1.test(formData.studentId)) {
      return toast.error("Invalide Student ID");
    }

    if (!regex2.test(formData.studentEmail)) {
      return toast.error("Invalid Student Email");
    }

    if (
      !formData.studentId ||
      !formData.studentEmail ||
      !formData.accodamicYear ||
      !formData.ticketCategory ||
      !formData.description
    ) {
      return toast.error("All fields are required");
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5001/api/tickets/create",formData
      );

      toast.success("Ticket Raise submitted successfully!", {
        position: "top-center",
      });
      navigate("/view-ticket");

      setFormData({
        studentId: "",
        studentEmail: "",
        accodamicYear: "",
        ticketCategory: "",
        description: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sens-serif min-h-screen flex justify-center items-center p-6">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold">🎫 Raise New Ticket</h2>
          <p className="text-sm text-blue-100">
            Submit your issue to the university support team
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div className="grid md:grid-cols-2 gap-5">

            {/* Student ID */}
            <div>
              <label className="font-semibold text-gray-700">
                Student ID*
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="IT12345678"
                className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold text-gray-700">
                Student Email*
              </label>
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

          {/* Academic Year */}
          <div>
            <label className="font-semibold text-gray-700">
              Academic Year*
            </label>
            <input
              type="text"
              name="accodamicYear"
              value={formData.accodamicYear}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-semibold text-gray-700">
              Ticket Category*
            </label>
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

          {/* Description */}
          <div>
            <label className="font-semibold text-gray-700">
              Description*
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
              placeholder="Describe your issue..."
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full py-3 rounded-lg text-white ${
              loading
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 text-center text-sm text-gray-500 p-3 border-t">
          Student Support System • We're here to help 🎓
        </div>
      </div>
    </div>
  );
}

export default gkTicketCreate;