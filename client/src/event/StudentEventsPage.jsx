import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Plus } from "lucide-react";
import EventModal from "./components/EventModal";
import EventCard from "./components/EventCard";
import EventDetailsModal from "./components/EventDetailsModal";

import banner from "../assets/event-banner.jpg";
import { getMyEvents } from "../services/eventService";

const StudentEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // 🔥 for modal
  const [activeTab, setActiveTab] = useState("all");

  // 🔥 FETCH MY EVENTS
  useEffect(() => {
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

    fetchMyEvents();
  }, []);

  // 🔥 FILTER LOGIC
  const filteredEvents =
    activeTab === "all"
      ? events
      : events.filter((e) => e.status === activeTab);

  // 🎨 SOFT STATUS COLORS
  const statusStyles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <AppLayout>
      <div className="p-6">

        {/* 🔥 HERO */}
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
              Create and manage your submitted events
            </p>
          </div>
        </div>

        {/* 🔥 ACTION BAR */}
        <div className="flex justify-between items-center mb-6">

          {/* FILTERS */}
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm capitalize transition
                  ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={() => {
              setSelectedEvent(null); // 🔥 reset
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEvents.map((event) => (
            <div key={event.id} className="relative">

              {/* STATUS BADGE */}
              <span
                className={`absolute top-3 left-3 z-10 text-xs px-3 py-1 rounded-full font-medium
                  ${statusStyles[event.status] || statusStyles.pending}`}
              >
                {event.status}
              </span>

              {/* CARD */}
              <EventCard
                event={event}
                onClick={() => setSelectedEvent(event)}
              />

              {/* VIEW BUTTON */}
              <button
                onClick={() => setSelectedEvent(event)}
                className="w-full mt-2 bg-emerald-500 text-white text-xs py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                View
              </button>

              {/* EDIT BUTTON */}
              {event.status !== "approved" && (
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowModal(true);
                  }}
                  className="w-full mt-2 border border-blue-500 text-blue-600 text-xs py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Edit
                </button>
              )}
            </div>
          ))}

        </div>

        {/* 🔥 EMPTY */}
        {filteredEvents.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            No {activeTab} events found
          </div>
        )}
      </div>

      {/* 🔥 CREATE / EDIT MODAL */}
      <EventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={selectedEvent} // 🔥 IMPORTANT (for edit)
        onSave={() => window.location.reload()}
      />

      {/* 🔥 VIEW MODAL */}
      <EventDetailsModal
        event={selectedEvent && !showModal ? selectedEvent : null}
        onClose={() => setSelectedEvent(null)}
      />

    </AppLayout>
  );
};

export default StudentEventsPage;