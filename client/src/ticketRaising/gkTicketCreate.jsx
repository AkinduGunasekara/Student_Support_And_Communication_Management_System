import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext.jsx"; // adjust path

function GkTicketCreate({ closeModal, refreshTickets }) {
  const { user } = useAuth(); // get logged-in user
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    faculty: "",
    academicYear: "",
    ticketCategory: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Prefill user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        studentId: user.studentId || "",
        studentEmail,
        faculty,
        academicYear,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "studentId" && !/^IT\d{0,8}$/.test(value)) return;
    if (name === "studentEmail" && !/^[^\s@]+@my\.sliit\.lk$/.test(value)) {
      error = "Invalid email format (student@my.sliit.lk)";
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "studentId",
      "studentEmail",
      "faculty",
      "academicYear",
      "ticketCategory",
      "description",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        return toast.error("All fields are required");
      }
    }

    // Validate Student ID & Email
    if (!/^IT\d{8}$/.test(formData.studentId))
      return toast.error("Invalid Student ID");
    if (!/^[^\s@]+@my\.sliit\.lk$/.test(formData.studentEmail))
      return toast.error("Invalid email address");

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5001/api/tickets/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      toast.success("Ticket submitted successfully!", { position: "top-center" });
      refreshTickets?.();
      closeModal?.();

      // Reset form
      setFormData((prev) => ({
        ...prev,
        ticketCategory: "",
        description: "",
      }));
      setErrors({});
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
              disabled
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
              disabled
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Faculty*</label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="Faculty"
              className="w-full bg-gray-100 border border-gray-300 p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
              disabled
            />
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
              disabled
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