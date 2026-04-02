import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const CalendarView = ({ events, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef();

  // 🔥 CLOSE DROPDOWN WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();

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
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  // 🎨 SOFT COLORS
  const typeColors = {
    academic: "bg-emerald-100 text-emerald-700",
    workshop: "bg-amber-100 text-amber-700",
    sports: "bg-blue-100 text-blue-700",
    club: "bg-purple-100 text-purple-700",
    other: "bg-slate-100 text-slate-700",
  };

  const isToday = (day) => {
    return (
      day &&
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* 🟦 CALENDAR */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">

        {/* 🔥 HEADER */}
        <div className="flex items-center justify-between mb-6">

          {/* LEFT */}
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100"
          >
            <ChevronLeft size={16} />
          </button>

          {/* CENTER (DROPDOWN) */}
          <div className="relative" ref={pickerRef}>

            <div
              onClick={() => setShowPicker((prev) => !prev)}
              className="px-4 py-2 rounded-lg border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600 cursor-pointer hover:bg-blue-100 transition"
            >
              today, {monthName}
            </div>

            {/* 🔥 ANIMATED DROPDOWN */}
            <div
              className={`absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 w-48 transform transition-all duration-200
              ${
                showPicker
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {/* MONTH */}
              <select
                value={month}
                onChange={(e) =>
                  setCurrentDate(new Date(year, Number(e.target.value)))
                }
                className="mb-2 w-full border rounded-lg px-2 py-1 text-sm"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              {/* YEAR */}
              <select
                value={year}
                onChange={(e) =>
                  setCurrentDate(new Date(Number(e.target.value), month))
                }
                className="w-full border rounded-lg px-2 py-1 text-sm"
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const y = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>

              {/* BUTTON */}
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setShowPicker(false);
                }}
                className="mt-3 w-full bg-blue-600 text-white py-1 rounded-lg text-sm hover:bg-blue-700"
              >
                Go to Today
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* DAYS */}
        <div className="grid grid-cols-7 text-xs text-slate-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={index}
                onClick={() => day && setSelectedDay(day)}
                className={`h-28 p-2 rounded-xl border cursor-pointer flex flex-col transition

                ${day ? "bg-white hover:bg-blue-50 hover:border-blue-300" : "bg-slate-50"}

                ${selectedDay === day ? "ring-2 ring-blue-500" : "border-slate-200"}

                ${isToday(day) ? "border-blue-500 bg-blue-50" : ""}
                `}
              >
                <span className="text-xs font-semibold text-slate-700">
                  {day}
                </span>

                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`text-[10px] px-2 py-1 rounded truncate cursor-pointer
                        ${typeColors[event.type?.toLowerCase()] || typeColors.other}
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

      {/* 🟨 DAILY AGENDA */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">

        <h2 className="text-md font-semibold text-slate-900 mb-4">
          Daily Agenda
        </h2>

        {!selectedDay && (
          <p className="text-sm text-slate-400">
            Select a day to view events
          </p>
        )}

        <div className="space-y-3">

          {Array.from({ length: 8 }).map((_, i) => {
            const hour = 8 + i;
            const label = `${hour}:00`;

            const event = getEventsForDay(selectedDay).find((e) =>
              e.time?.includes(`${hour}`)
            );

            return (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs text-slate-400 w-12">
                  {label}
                </span>

                <div className="flex-1">
                  {event ? (
                    <div
                      onClick={() => onSelectEvent(event)}
                      className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition"
                    >
                      <p className="text-xs text-slate-500">
                        {event.time}
                      </p>

                      <p className="text-sm font-semibold text-slate-900">
                        {event.title}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 border border-dashed border-slate-200 rounded-lg" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;