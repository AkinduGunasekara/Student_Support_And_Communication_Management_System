import React, { useEffect, useState } from "react";
import Navbar from "../event/components/Navbar";
import { useNavigate } from "react-router-dom";
import { getApprovedEvents } from "../services/eventService";
import Footer from "../event/components/Footer";
import EventDetailsModal from "../event/components/EventDetailsModal";

// 🔥 IMAGES
import img1 from "../assets/LandingPage1.jpg";
import img2 from "../assets/LandingPage2.jpg";
import img3 from "../assets/LandingPage3.jpg";
import img4 from "../assets/LandingPage4.jpg";

const images = [img1, img2, img3, img4];

const LandingPage = () => {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  // 🔁 SLIDESHOW
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getApprovedEvents();

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
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Landing events error:", err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="w-full">

      {/* 🔵 NAVBAR */}
      <Navbar />

      {/* 🔥 HERO */}
      <div className="relative h-screen w-full overflow-hidden">

        {images.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Discover. Join. Connect.
          </h1>

          <p className="mt-4 text-lg text-white/80 max-w-xl">
            Everything happening on your campus, in one place
          </p>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Explore Events
            </button>

            {/* <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200"
            >
              Login
            </button> */}
          </div>
        </div>
      </div>

      {/* 🔥 UPCOMING EVENTS */}
      <div className="px-6 py-12 bg-gray-100">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Upcoming Events
          </h2>

          <button
            onClick={() => navigate("/events")}
            className="text-blue-600 font-medium hover:underline"
          >
            See More →
          </button>
        </div>

        {/* 🔥 AUTO SCROLL */}
        <div className="overflow-hidden">
          <div className="flex gap-6 animate-scroll">

            {[...events, ...events].map((event, index) => (
              <div
                key={index}
                onClick={() => setSelectedEvent(event)}
                className="min-w-[250px] bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
              >
                <img
                  src={event.image}
                  className="w-full h-40 object-cover rounded-t-2xl"
                />

                <div className="p-4">
                  <p className="text-xs text-gray-500">
                    {event.dateShort}
                  </p>

                  <h3 className="text-sm font-semibold mt-1">
                    {event.title}
                  </h3>
                </div>
              </div>
            ))}

          </div>
        </div>

        {events.length === 0 && (
          <p className="text-gray-500 mt-4">No events available</p>
        )}
      </div>

      {/* 🔥 FAQ */}
      <div className="px-6 py-12 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="p-4 border rounded-xl">
            <h3 className="font-medium">How do I create an event?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Login and go to the Events page to create your own event.
            </p>
          </div>

          <div className="p-4 border rounded-xl">
            <h3 className="font-medium">Who approves events?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Admin users review and approve events before they appear publicly.
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Footer />
    </div>
  );
};

export default LandingPage;