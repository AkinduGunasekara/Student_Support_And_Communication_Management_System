import React from "react";
import { Clock, MapPin } from "lucide-react";

const EventCard = ({ event, onClick }) => {
  const typeColors = {
  Seminar: "bg-red-100 text-red-600",
  Workshop: "bg-orange-100 text-orange-600",
  Sports: "bg-green-100 text-green-600",
  Other: "bg-slate-100 text-slate-600",
};

  return (
    <div
      onClick={() => onClick(event)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden border border-slate-200"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="h-44 w-full object-cover"
        />

        {/* Tag */}
        <span
          className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-medium ${
            typeColors[event.type] || typeColors.Other
          }`}
        >
          {event.type}
        </span>

        {/* Date */}
        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-lg shadow-sm text-xs font-semibold text-slate-700">
          {event.dateShort}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-900 leading-snug">
          {event.title}
        </h2>

        {/* Meta */}
        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 🔥 prevent double click trigger
            onClick(event);
          }}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full text-sm font-medium transition"
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

export default EventCard;