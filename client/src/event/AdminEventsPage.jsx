import React, { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import EventCard from "./components/EventCard";

// 🔥 banner image
import banner from "../assets/event-banner.jpg";

const AdminEventsPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "AI Seminar",
      date: "2026-04-10",
      time: "10:00 - 12:00",
      location: "Hall A",
      type: "Seminar",
      status: "pending",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    },
    {
      id: 2,
      title: "UX Workshop",
      date: "2026-04-12",
      time: "09:00 - 12:00",
      location: "Innovation Lab",
      type: "Workshop",
      status: "approved",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
    },
  ]);

  const handleApprove = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "approved" } : e
      )
    );
  };

  const handleReject = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "rejected" } : e
      )
    );
  };

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
            <h1 className="text-xl font-bold">Event Management</h1>
            <p className="text-sm mt-1 text-white/80">
              Approve or reject submitted events
            </p>
          </div>
        </div>

        {/* 🔥 GRID */}
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

              {/* 🔥 ADMIN ACTIONS */}
              <div className="flex gap-2 mt-2">

                {event.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(event.id)}
                      className="flex-1 bg-red-500 text-white text-xs py-2 rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button className="flex-1 border text-xs py-2 rounded-lg hover:bg-slate-100">
                  View
                </button>

              </div>
            </div>
          ))}

        </div>
      </div>
    </AppLayout>
  );
};

export default AdminEventsPage;