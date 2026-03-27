import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import { AppLayout } from "../components/AppLayout";

function GkTicketCreate({ closeModal, refreshTickets }) {
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    accadomicYear: "",
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
      !formData.accadomicYear ||
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
        accadomicYear: "",
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
        <div className="ui-card mb-4 bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
          <h2 className="text-2xl font-bold"> 🎫 Raise New Ticket</h2>
          <p className="mt-1 text-sm text-blue-200">Submit your issue to the university support team.</p>
        </div>

        <div className="ui-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="ui-label">Student ID*</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="IT12345678"
                  className="ui-input"
                />
                {errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}
              </div>

              <div>
                <label className="ui-label">Student Email*</label>
                <input
                  type="text"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  placeholder="student@my.sliit.lk"
                  className="ui-input"
                />
                {errors.studentEmail && <p className="mt-1 text-sm text-red-600">{errors.studentEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="ui-label">Academic Year*</label>
                <input
                  type="text"
                  name="accadomicYear"
                  value={formData.accadomicYear}
                  onChange={handleChange}
                  placeholder="Academic Year"
                  className="ui-input"
                />
              </div>

              <div>
                <label className="ui-label">Faculty*</label>
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  className="ui-input"
                />
              </div>
            </div>

            <div>
              <label className="ui-label">Ticket Category*</label>
              <select
                name="ticketCategory"
                value={formData.ticketCategory}
                onChange={handleChange}
                className="ui-select"
              >
                <option value="">Select category</option>
                <option value="Academic">Academic</option>
                <option value="Complaint">Complaint</option>
                <option value="Technical Issues">Technical Issues</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="ui-label">Description*</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your issue..."
                className="ui-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>
  );
}

export default GkTicketCreate;