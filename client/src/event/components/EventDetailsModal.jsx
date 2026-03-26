import React from "react";

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden flex">

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
            <h2 className="text-2xl font-bold mb-3">
              {event.title}
            </h2>

            <p className="text-gray-600 mb-2">
              📅 {event.date}
            </p>

            <p className="text-gray-600 mb-2">
              ⏰ {event.time}
            </p>

            <p className="text-gray-600 mb-4">
              📍 {event.location}
            </p>

            <p className="text-gray-700">
              This is a sample event description. Later you can connect real data from backend.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Add to Calendar
            </button>

            <button
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
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