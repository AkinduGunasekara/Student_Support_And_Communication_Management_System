import React, { useState } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import CalendarView from "../components/CalendarView";
import EventModal from "../components/EventModal";
import EventDetailsModal from "../components/EventDetailsModal";

const EventsPage = () => {
  const [view, setView] = useState("card");
const [selectedEvent, setSelectedEvent] = useState(null);
const [showModal, setShowModal] = useState(false);

const handleAddEvent = (newEvent) => {
  setEvents((prev) => [...prev, newEvent]);
};
  // 🔹 TEMP DATA (later from backend)
  const events = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔹 Navbar */}
      <Navbar />

      <div className="p-6">
        {/* 🔹 Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            University Events
          </h1>
          <p className="text-gray-500">
            Discover and connect with your campus community
          </p>
        </div>

        {/* 🔹 Toggle Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setView("card")}
              className={`px-4 py-2 rounded-lg ${
                view === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              All Events
            </button>

            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-lg ${
                view === "calendar"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              Calendar
            </button>
          </div>

          {/* 🔹 Add Event Button (future use) */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Add Event
          </button>
        </div>

        {/* 🔹 Content */}
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
          <CalendarView events={events} />
        )}
      </div>

      {/* 🔹 Modal */}
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