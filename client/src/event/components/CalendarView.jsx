import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const CalendarView = ({ events, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const d = new Date(event.date);
      return d.getDate() === day;
    });
  };

  const typeColors = {
    Seminar: "bg-red-500",
    Workshop: "bg-orange-500",
    Sports: "bg-green-500",
    Other: "bg-slate-500",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* 🟦 CALENDAR */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {monthName}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 text-xs text-slate-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={index}
                onClick={() => day && setSelectedDay(day)}
                className={`h-28 p-2 rounded-xl border border-slate-200 cursor-pointer flex flex-col transition
                  ${day ? "hover:bg-slate-50" : "bg-slate-50"}
                  ${selectedDay === day ? "ring-2 ring-blue-500" : ""}
                `}
              >
                <span className="text-xs font-semibold text-slate-700">
                  {day}
                </span>

                {/* Events */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`text-[10px] px-2 py-1 rounded text-white truncate cursor-pointer ${
                        typeColors[event.type] || typeColors.Other
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🟨 AGENDA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">

        <h2 className="text-md font-semibold text-slate-900 mb-4">
          Daily Agenda
        </h2>

        {!selectedDay && (
          <p className="text-sm text-slate-400">
            Select a day to view events
          </p>
        )}

        {getEventsForDay(selectedDay).map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className="mb-4 border-l-4 pl-3 py-2 border-blue-500 cursor-pointer hover:bg-slate-50 rounded-lg transition"
          >
            <p className="text-xs text-slate-500">
              {event.time}
            </p>

            <h3 className="text-sm font-semibold text-slate-900">
              {event.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin size={12} />
              <span>{event.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;