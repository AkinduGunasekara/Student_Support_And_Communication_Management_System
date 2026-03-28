import React, { useState } from "react";
import Navbar from "./components/Navbar";
import EventCard from "./components/EventCard";
import CalendarView from "./components/CalendarView";
import EventModal from "./components/EventModal";
import EventDetailsModal from "./components/EventDetailsModal";

// 🔥 import your image here
import banner from "../assets/event-banner.jpg";

const EventsPage = () => {
  const [view, setView] = useState("card");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Quantum Computing: The Future of Logic",
      time: "14:00 - 16:30",
      location: "Main Auditorium",
      date: "2026-04-10",
      dateShort: "OCT 24",
      type: "Seminar",
      image:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    },
    {
      id: 2,
      title: "UX Design Sprint: 48-Hour Challenge",
      time: "09:00 - 12:00",
      location: "Innovation Lab",
      date: "2026-04-12",
      dateShort: "OCT 28",
      type: "Workshop",
      image:
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
    },
    {
      id: 3,
      title: "Inter-Collegiate Basketball Finals",
      time: "16:00",
      location: "Sports Complex",
      date: "2026-04-15",
      dateShort: "NOV 05",
      type: "Sports",
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    },
  ]);

  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">

        {/* 🔥 HERO HEADER (NEW DESIGN) */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow">

          {/* IMAGE */}
          <img
            src={banner}
            alt="events banner"
            className="w-full h-64 object-cover"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

          {/* TEXT */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
            <h1 className="text-3xl font-bold">
              Discover. Join. Connect.
            </h1>

            <p className="text-sm mt-2 text-white/80">
              Everything happening on your campus, in one place
            </p>
          </div>
        </div>

        {/* 🔳 MAIN CARD CONTAINER */}
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

            {/* Add Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
            >
              + Add Event
            </button>
          </div>

          {/* 🔹 CONTENT */}
          {view === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
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