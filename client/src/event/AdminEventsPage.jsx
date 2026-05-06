import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import EventCard from "./components/EventCard";

import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from "../services/eventService";

import banner from "../assets/event-banner.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  // 🔥 FETCH EVENTS (initial = pending only for now)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getPendingEvents();

        const formatted = data.map((e) => ({
          ...e,
          id: e._id,
          image: e.image
            ? `${API_BASE_URL}${e.image}`
            : "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
          time: `${e.startTime} - ${e.endTime}`,
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Fetch events error:", err);
      }
    };

    fetchEvents();
  }, []);

  // 🔥 APPROVE
  const handleApprove = async (id) => {
    try {
      await approveEvent(id);

      // ✅ UPDATE STATUS INSTEAD OF REMOVING
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "approved" } : e
        )
      );
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  // 🔥 REJECT
  const handleReject = async (id) => {
    try {
      await rejectEvent(id);

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: "rejected" } : e
        )
      );
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // 🔥 FILTER EVENTS BY TAB
  const filteredEvents =
    activeTab === "all"
      ? events
      : events.filter((e) => e.status === activeTab);

  // 🎨 STATUS COLORS (SOFT)
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
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Event Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
              Approve or manage submitted events
            </p>
          </div>
        </div>

        {/* 🔥 TABS */}
        <div className="flex gap-2 mb-6">
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

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="relative transition hover:scale-[1.02]"
            >

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
                onClick={() => {
                  // 👉 later connect EventDetailsModal here
                  console.log("Open modal", event);
                }}
              />

              {/* ACTIONS */}
              {event.status === "pending" && (
                <div className="flex gap-2 mt-2">

                  <button
                    onClick={() => handleApprove(event.id)}
                    className="flex-1 bg-emerald-500 text-white text-xs py-2 rounded-lg hover:bg-emerald-600 transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(event.id)}
                    className="flex-1 border border-rose-400 text-rose-500 text-xs py-2 rounded-lg hover:bg-rose-50 transition"
                  >
                    Reject
                  </button>

                </div>
              )}
            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filteredEvents.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            No {activeTab} events found
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminEventsPage;
