import React from "react";
import { Clock, MapPin } from "lucide-react";

const EventCard = ({ event, onClick }) => {
  const typeColors = {
    Seminar: "bg-red-500/90 text-white",
    Workshop: "bg-orange-500/90 text-white",
    Sports: "bg-green-500/90 text-white",
    Other: "bg-slate-500/90 text-white",
  };

  return (
    <div
      onClick={() => onClick(event)}
      className="group cursor-pointer"
    >
      {/* IMAGE CARD */}
      <div className="relative rounded-2xl overflow-hidden">

        <img
          src={event.image}
          alt={event.title}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

        {/* TYPE TAG */}
        <span
          className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-medium ${typeColors[event.type]}`}
        >
          {event.type}
        </span>

        {/* DATE BADGE */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
          {event.dateShort}
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="mt-3 px-1">

        <h2 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {event.title}
        </h2>

        {/* META */}
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={13} />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={13} />
            <span>{event.location}</span>
          </div>
        </div>

        {/* ACTION */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(event);
          }}
          className="mt-3 text-blue-600 text-xs font-medium hover:underline"
        >
          View Details →
        </button>

      </div>
    </div>
  );
};

export default EventCard;