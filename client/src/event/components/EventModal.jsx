import React, { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { createEvent, updateEvent } from "../../services/eventService";

const EventModal = ({ isOpen, onClose, onSave, event }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "academic",
    image: null,
  });

  const [error, setError] = useState("");

  // 🔥 PREFILL FORM WHEN EDITING
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.split("T")[0] : "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        type: event.type || "academic",
        image: null,
      });
    } else {
      // 🔥 RESET WHEN CREATING NEW
      setForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "academic",
        image: null,
      });
    }
  }, [event]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.date || !form.startTime || !form.endTime) {
        setError("Please fill all required fields");
        return;
      }

      let result;

      if (event) {
        // 🔥 UPDATE EVENT
        result = await updateEvent(event.id, form);
      } else {
        // 🔥 CREATE EVENT
        result = await createEvent(form);
      }

      if (onSave) onSave(result);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 p-6 flex gap-6">
        
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
        >
          <X size={18} />
        </button>

        {/* LEFT - IMAGE */}
        <div className="w-1/2 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-6 text-center">
          <UploadCloud size={40} className="text-blue-500 mb-3" />

          <p className="text-sm text-slate-600 mb-2">
            Upload Event Image
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />

          {form.image && (
            <p className="text-xs text-green-600 mt-2">
              {form.image.name}
            </p>
          )}
        </div>

        {/* RIGHT */}
        <div className="w-1/2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {event ? "Edit Event" : "Create Event"}
          </h2>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <input
            name="title"
            value={form.title}
            placeholder="Event Title"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="description"
            value={form.description}
            placeholder="Description"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />

          {/* DATE + TIME */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border border-slate-200 p-2 rounded-lg text-sm"
            />

            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="border border-slate-200 p-2 rounded-lg text-sm"
            />

            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="border p-2 rounded-lg text-sm"
            />
          </div>

          <input
            name="location"
            value={form.location}
            placeholder="Location"
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-sm"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-slate-200 p-2 rounded-lg text-sm"
          >
            <option value="academic">Academic</option>
            <option value="club">Club</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>

          <p className="text-xs text-slate-500">
            Admin will review your event. Once approved, it will be visible for everyone.
          </p>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {event ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;