import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import EventCard from "./components/EventCard";
import CalendarView from "./components/CalendarView";
import EventModal from "./components/EventModal";
import EventDetailsModal from "./components/EventDetailsModal";
import { useAuth } from "../AuthContext"; // ✅ ADDED

import { getApprovedEvents } from "../services/eventService";

// 🔥 banner image
import banner from "../assets/event-banner.jpg";

const EventsPage = () => {
  const { user } = useAuth(); // ✅ ADDED

  const [view, setView] = useState("card");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);

  // 🔥 FETCH EVENTS FROM BACKEND
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getApprovedEvents();

        if (!Array.isArray(data)) {
          console.error("Events is not an array:", data);
          return;
        }

        const formatted = data.map((e) => ({
          ...e,
          id: e._id,
          image: e.image
            ? `http://localhost:5001${e.image}`
            : "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
          dateShort: new Date(e.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          time: `${e.startTime} - ${e.endTime}`,
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Fetch events error:", err);
      }
    };

    fetchEvents();
  }, []);

  // 🔹 Add event locally
  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  // 🔒 EXTRA SAFETY (prevents manual trigger)
  const handleOpenModal = () => {
    if (!user) {
      alert("Please login to create an event");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">

        {/* 🔥 HERO HEADER */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow">
          <img
            src={banner}
            alt="events banner"
            className="w-full h-64 object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
            <h1 className="text-3xl font-bold">
              Discover. Join. Connect.
            </h1>

            <p className="text-sm mt-2 text-white/80">
              Everything happening on your campus, in one place
            </p>
          </div>
        </div>

        {/* 🔳 MAIN CONTAINER */}
        <div className="bg-white rounded-2xl shadow p-6">

          {/* 🔹 TOP BAR */}
          <div className="flex justify-between items-center mb-6">

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView("card")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === "card"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600"
                }`}
              >
                All Events
              </button>

              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  view === "calendar"
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Calendar
              </button>
            </div>

            {/* 🔒 Add Button (PROTECTED) */}
          </div>

          {/* 🔹 CONTENT */}
          {view === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events?.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={setSelectedEvent}
                />
              ))}
            </div>
          ) : (
            <CalendarView
              events={events}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </div>
      </div>

      {/* 🔹 MODALS */}
      <EventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddEvent}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default EventsPage;