import React from "react";

const EventCard = ({ event, onClick }) => {
  return (
    <div
      onClick={() => onClick(event)}
      className="bg-white rounded-2xl shadow hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="h-48 w-full object-cover"
        />

        {/* Tag */}
        <span className="absolute top-3 left-3 bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
          {event.type}
        </span>

        {/* Date badge */}
        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-lg shadow text-sm font-semibold">
          {event.dateShort}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">{event.title}</h2>

        <p className="text-sm text-gray-500 mt-2">
          ⏰ {event.time}
        </p>

        <p className="text-sm text-gray-500">
          📍 {event.location}
        </p>

        <button
        onClick={() => onClick(event)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
        Join Now
        </button>
      </div>
    </div>
  );
};

export default EventCard;