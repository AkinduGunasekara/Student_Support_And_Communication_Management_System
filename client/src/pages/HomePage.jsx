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

const HomePage = () => {
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
        console.error(err);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="w-full bg-gray-50">

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
            <img src={img} className="w-full h-full object-cover scale-105" />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            Discover. Join. Connect.
          </h1>

          <p className="mt-4 text-lg text-white/80 max-w-xl">
            Everything happening on your campus in one place.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-3 bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition"
            >
              Explore Events
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white hover:text-black transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 FEATURES */}
      <div className="px-6 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Platform Features
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">

          <div className="relative bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl shadow-lg">
                🎟️
              </div>
            </div>
            <h3 className="mt-8 font-semibold">Ticket Management</h3>
            <p className="text-sm text-gray-600 mt-2">
              Create, track, and manage support tickets easily with real-time updates.
            </p>
          </div>

          <div className="relative bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 text-white text-2xl shadow-lg">
                💬
              </div>
            </div>
            <h3 className="mt-8 font-semibold">Online Messaging</h3>
            <p className="text-sm text-gray-600 mt-2">
              Communicate instantly with admins and users through built-in messaging.
            </p>
          </div>

          <div className="relative bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-teal-500 text-white text-2xl shadow-lg">
                📊
              </div>
            </div>
            <h3 className="mt-8 font-semibold">Activity Tracking</h3>
            <p className="text-sm text-gray-600 mt-2">
              Monitor ticket progress and user activity from a central dashboard.
            </p>
          </div>

        </div>
      </div>

      {/* 🔥 UPCOMING EVENTS */}
      <div className="px-6 py-16 bg-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800">Upcoming Events</h2>
          <button onClick={() => navigate("/events")} className="text-blue-600 hover:underline">
            See More →
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto">
          {events.map((event, i) => (
            <div
              key={i}
              onClick={() => setSelectedEvent(event)}
              className="min-w-[260px] bg-white rounded-2xl shadow hover:shadow-xl transition cursor-pointer group"
            >
              <img src={event.image} className="h-40 w-full object-cover rounded-t-2xl group-hover:scale-110 transition" />
              <div className="p-4">
                <p className="text-xs text-gray-500">{event.dateShort}</p>
                <h3 className="text-sm font-semibold mt-1 group-hover:text-blue-600">
                  {event.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

     {/* 🔥 ABOUT US */}
    <div className="px-6 py-20 bg-white">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-14">
            About Us
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

            {[
            ["🎯 Our Mission", "We connect students through meaningful campus experiences, helping them discover opportunities and build lasting relationships."],
            ["🚀 What We Do", "Our platform allows you to easily create, explore, and join events happening around your campus."],
            ["🌟 Our Vision", "To create a vibrant, engaging campus where every student feels connected and involved."],
            ["💡 Why Choose Us?", "A simple, fast, and student-friendly platform designed to make campus life more exciting."]
            ].map(([title, desc], i) => (
            <div
                key={i}
                className="p-8 bg-gray-50 rounded-3xl shadow-sm hover:shadow-xl transition duration-300 hover:-translate-y-1"
            >
                <h3 className="text-lg font-semibold text-gray-800">
                {title}
                </h3>
                <p className="text-base text-gray-600 mt-3 leading-relaxed">
                {desc}
                </p>
            </div>
            ))}

        </div>
    </div>

      {/* 🔥 FAQ */}
    <div className="px-6 py-20 bg-gradient-to-b from-gray-100 to-gray-50">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-14">
            Frequently Asked Questions
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

            {[
            ["❓ How do I create an event?", "Simply log in and go to the Events page to submit your event details."],
            ["🛡️ Who approves events?", "Admin users review and approve events before they appear publicly."],
            ["✏️ Can I edit my event?", "Yes, you can update your event details before it gets approved."],
            ["💰 Is this platform free?", "Yes! It’s completely free for students and staff to use."]
            ].map(([q, a], i) => (
            <div
                key={i}
                className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition duration-300 hover:-translate-y-1"
            >
                <h3 className="text-lg font-semibold text-gray-800">
                {q}
                </h3>
                <p className="text-base text-gray-600 mt-3 leading-relaxed">
                {a}
                </p>
            </div>
            ))}

        </div>
    </div>

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <Footer />
    </div>
  );
};

export default HomePage;