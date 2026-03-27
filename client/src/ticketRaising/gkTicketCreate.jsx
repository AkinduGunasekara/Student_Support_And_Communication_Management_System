import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function GkTicketCreate({ closeModal, refreshTickets, user }) {
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

  // ✅ Auto-fill logged-in user details (BEST PRACTICE)
  // useEffect(() => {
  //   if (user) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       studentId: user.studentId || "",
  //       studentEmail: user.email || "",
  //     }));
  //   }
  // }, [user]);

  // ✅ Handle input + validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "studentId") {
      const typingRegex = /^IT\d{0,8}$/;
      if (!typingRegex.test(value)) return;

      const regex = /^IT\d{8}$/;
      if (!regex.test(value)) {
        error = "Invalid Student ID (Format: IT12345678)";
      }
    }

    if (name === "studentEmail") {
      const regex = /.+@.+\..+/;
      if (!regex.test(value)) {
        error = "Invalid Email (example: student@my.sliit.lk)";
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ✅ Submit
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
      return toast.error("Invalid Student ID");
    }

    if (!emailValid) {
      return toast.error("Invalid Email");
    }

    setLoading(true);

    try {
      // 🔥 GET TOKEN FROM STORAGE
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5001/api/tickets/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ IMPORTANT
          },
        }
      );

      toast.success("Ticket submitted successfully!");

      refreshTickets && refreshTickets();
      closeModal && closeModal();

      setFormData({
        studentId: user?.studentId || "",
        studentEmail: user?.email || "",
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
        <h2 className="text-2xl font-bold">🎫 Raise New Ticket</h2>
        <p className="mt-1 text-sm text-blue-200">
          Submit your issue to the support team
        </p>
      </div>

      <div className="ui-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="ui-label">Student ID*</label>
              <input
                type="text"
                name="studentId"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={handleChange}
                className="ui-input"
                readOnly={!!user} // 🔥 prevent editing if logged in
              />
              {errors.studentId && (
                <p className="text-red-600 text-sm">{errors.studentId}</p>
              )}
            </div>

            <div>
              <label className="ui-label">Student Email*</label>
              <input
                type="text"
                name="studentEmail"
                placeholder="Student Email"
                value={formData.studentEmail}
                onChange={handleChange}
                className="ui-input"
                readOnly={!!user}
              />
              {errors.studentEmail && (
                <p className="text-red-600 text-sm">{errors.studentEmail}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <input
              type="text"
              name="accadomicYear"
              placeholder="Academic Year"
              value={formData.accadomicYear}
              onChange={handleChange}
              className="ui-input"
            />

            <input
              type="text"
              name="faculty"
              placeholder="Faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="ui-input"
            />
          </div>

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

          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your issue..."
            className="ui-textarea"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GkTicketCreate;