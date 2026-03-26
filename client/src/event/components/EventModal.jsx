import React, { useState } from "react";

const EventModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    type: "Seminar",
  });

  // 🔴 IMPORTANT: prevents crash
  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.date) {
      alert("Title and date required");
      return;
    }

    onSave({
      ...form,
      id: Date.now(),
    });

    // reset form (optional but good)
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      type: "Seminar",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">

        <h2 className="text-xl font-bold mb-4">Add Event</h2>

        <div className="space-y-3">

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Event Title"
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-2 rounded"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option>Seminar</option>
            <option>Workshop</option>
            <option>Sports</option>
          </select>

        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventModal;