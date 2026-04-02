import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Plus } from "lucide-react";
import EventModal from "./components/EventModal";
import EventCard from "./components/EventCard";
import banner from "../assets/event-banner.jpg";

// 🔥 IMPORT API
import { getMyEvents } from "../services/eventService";

const LecturerEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 🔥 FETCH FUNCTION (REUSABLE)
  const fetchMyEvents = async () => {
    try {
      const data = await getMyEvents();

      const formatted = data.map((e) => ({
        ...e,
        id: e._id,
        image: e.image
          ? `http://localhost:5001${e.image}`
          : "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
        time: `${e.startTime} - ${e.endTime}`,
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Fetch my events error:", err);
    }
  };

  // 🔥 INITIAL LOAD
  useEffect(() => {
    fetchMyEvents();
  }, []);

  return (
    <AppLayout>
      <div className="p-6">

        {/* 🔥 HERO HEADER */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow">
          <img
            src={banner}
            alt="events banner"
            className="w-full h-52 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
            <h1 className="text-xl font-bold">My Events</h1>
            <p className="text-sm mt-1 text-white/80">
              Manage events created by you
            </p>
          </div>
        </div>

        {/* 🔥 ACTION BAR */}
        <div className="flex justify-between items-center mb-6">

          {/* FILTERS (UI ONLY FOR NOW) */}
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
              All
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
              Pending
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
              Approved
            </button>
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
              Rejected
            </button>
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={() => {
              setSelectedEvent(null); // 🔥 ensure create mode
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* 🔥 EVENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {events.map((event) => (
            <div key={event.id} className="relative">

              {/* STATUS BADGE */}
              <span
                className={`absolute top-3 left-3 z-10 text-xs px-3 py-1 rounded-full font-medium ${
                  event.status === "approved"
                    ? "bg-green-500 text-white"
                    : event.status === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-yellow-400 text-white"
                }`}
              >
                {event.status}
              </span>

              {/* CARD */}
              <EventCard event={event} onClick={() => {}} />

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 mt-2">

                {event.status !== "approved" && (
                  <button
                    onClick={() => {
                      setSelectedEvent(event); // 🔥 pass event to modal
                      setShowModal(true);
                    }}
                    className="flex-1 bg-red-500 text-white text-xs py-2 rounded-lg hover:bg-red-600"
                  >
                    Edit
                  </button>
                )}

                <button className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg hover:bg-green-600">
                  View
                </button>

              </div>
            </div>
          ))}

        </div>

        {/* 🔥 EMPTY STATE */}
        {events.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No events created yet
          </p>
        )}
      </div>

      {/* 🔥 MODAL */}
      <EventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSave={fetchMyEvents}   // 🔥 FIXED (no crash now)
      />

    </AppLayout>
  );
};

export default LecturerEventsPage;