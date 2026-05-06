import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (name === "studentId") {
      // const typingRegex = /^IT\d{0,8}$/;
      // if (!typingRegex.test(value)) return;

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

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

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

    if (!idValid) return toast.error("Invalid Student ID");
    if (!emailValid) return toast.error("Invalid Email");

    setLoading(true);

    try {
      const token = localStorage.getItem("ssc_token");

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/tickets/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Ticket submitted successfully!");

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
    <div className="w-full max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-md">
        <h2 className="text-xl font-bold">🎫 Raise New Ticket</h2>
        <p className="text-sm text-blue-100">
          Submit your issue to the support team
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mt-5 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Student ID*
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="IT12345678"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.studentId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.studentId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Student Email*
              </label>
              <input
                type="email"
                name="studentEmail"
                value={formData.studentEmail}
                onChange={handleChange}
                placeholder="student@my.sliit.lk"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.studentEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.studentEmail}
                </p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-4">
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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

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
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
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
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select category</option>
              <option value="Academic">Academic</option>
              <option value="Complaint">Complaint</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Description*
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your issue..."
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>

        </form>
      </div>
    </div>
  );

  if (embedded) {
    return formContent;
  }

  return <AppLayout><div className="ui-page">{formContent}</div></AppLayout>;
}

export default GkTicketCreate;
