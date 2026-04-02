import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import EventCard from "./components/EventCard";

import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from "../services/eventService";

import banner from "../assets/event-banner.jpg";

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);

  // 🔥 FETCH PENDING EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getPendingEvents();

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
        console.error("Fetch pending events error:", err);
      }
    };

    fetchEvents();
  }, []);

  // 🔥 APPROVE
  const handleApprove = async (id) => {
    try {
      await approveEvent(id);

      // remove from UI instantly
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // 🔥 REJECT
  const handleReject = async (id) => {
    try {
      await rejectEvent(id);

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Reject error:", err);
    }
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
              <span className="absolute top-3 left-3 z-10 text-xs px-3 py-1 rounded-full font-medium bg-yellow-400 text-white">
                pending
              </span>

              <EventCard event={event} onClick={() => {}} />

              {/* ACTIONS */}
              <div className="flex gap-2 mt-2">

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

              </div>
            </div>
          ))}

        </div>
      </div>
    </AppLayout>
  );
};

export default AdminEventsPage;