import React from "react";
import { X, Calendar, Clock, MapPin } from "lucide-react";

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  // 🔥 GOOGLE CALENDAR FUNCTION
  const handleAddToCalendar = () => {
    try {
      const start = new Date(event.date);

      const [startHour, startMin] = event.startTime.split(":");
      const [endHour, endMin] = event.endTime.split(":");

      const startDate = new Date(start);
      startDate.setHours(startHour, startMin);

      const endDate = new Date(start);
      endDate.setHours(endHour, endMin);

      const formatDate = (date) =>
        date.toISOString().replace(/-|:|\.\d+/g, "");

      const url = `https://www.google.com/calendar/render?action=TEMPLATE
&text=${encodeURIComponent(event.title)}
&details=${encodeURIComponent(event.description || "")}
&location=${encodeURIComponent(event.location || "")}
&dates=${formatDate(startDate)}/${formatDate(endDate)}`;

      window.open(url, "_blank");
    } catch (err) {
      console.error("Calendar error:", err);
      alert("Failed to add to calendar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden flex shadow-lg border border-slate-200 relative">

        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
        >
          <X size={20} />
        </button>

        {/* LEFT IMAGE */}
        <div className="w-1/2">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-1/2 p-6 flex flex-col justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {event.title}
            </h2>

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-slate-600">

              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{event.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            </div>

            {/* 🔥 REAL DESCRIPTION */}
            <p className="text-sm text-slate-600 mt-4">
              {event.description || "No description available."}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">

            {/* 🔥 GOOGLE CALENDAR BUTTON */}
            <button
              onClick={handleAddToCalendar}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Add to Calendar
            </button>

            <button
              onClick={onClose}
              className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;