import React, { useState } from "react";

const CalendarView = ({ events }) => {
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

  // 🔹 Generate days
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // 🔹 Helper: get events for a day
  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const d = new Date(event.date);
      return d.getDate() === day;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* 🟦 CALENDAR */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{monthName}</h2>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentDate(new Date(year, month - 1))
              }
              className="px-3 py-1 border rounded-lg"
            >
              Prev
            </button>

            <button
              onClick={() =>
                setCurrentDate(new Date(year, month + 1))
              }
              className="px-3 py-1 border rounded-lg"
            >
              Next
            </button>
          </div>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 text-sm text-gray-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-semibold">
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
                className={`h-28 p-2 rounded-xl border cursor-pointer flex flex-col
                  ${day ? "hover:bg-blue-50" : "bg-gray-50"}
                  ${selectedDay === day ? "bg-blue-100" : ""}
                `}
              >
                <span className="text-sm font-semibold">
                  {day}
                </span>

                {/* 🔹 EVENTS INSIDE CELL */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded text-white truncate
                        ${
                          event.type === "Seminar"
                            ? "bg-blue-500"
                            : event.type === "Workshop"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }
                      `}
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

      {/* 🟨 AGENDA PANEL */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <h2 className="text-lg font-semibold mb-4">
          Daily Agenda
        </h2>

        {!selectedDay && (
          <p className="text-gray-400">
            Select a day to view events
          </p>
        )}

        {getEventsForDay(selectedDay).map((event) => (
          <div
            key={event.id}
            className="mb-4 border-l-4 pl-3 py-2"
          >
            <p className="text-xs text-gray-500">
              {event.time}
            </p>

            <h3 className="font-semibold">
              {event.title}
            </h3>

            <p className="text-sm text-gray-500">
              📍 {event.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;