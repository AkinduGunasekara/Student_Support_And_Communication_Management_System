import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AppLayout } from "../components/AppLayout";
import { getMyFeedback, submitFeedback } from "../feedback/feedbackService";

// Constants for star rating
const STAR_FILLED = "★";
const STAR_EMPTY = "☆";
const MAX_RATING = 5;

export const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [ticketId, setTicketId] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const fetchMyFeedback = async () => {
    if (!token) return;

    setLoadingFeedback(true);
    try {
      const response = await getMyFeedback(token);
      setFeedbackList(response.data);
    } catch (error) {
      console.error("Get feedback error:", error);
      alert(error?.response?.data?.message || "Something went wrong while loading feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, [token]);

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();

    try {
      await submitFeedback({ ticketId, comment, rating }, token);
      alert("Feedback submitted successfully");
      setTicketId("");
      setComment("");
      setRating(5);
      fetchMyFeedback();
    } catch (error) {
      console.error("Submit feedback error:", error);
      alert(error?.response?.data?.message || "Something went wrong while submitting feedback.");
    }
  };

  const renderStars = (value) =>
    STAR_FILLED.repeat(value) + STAR_EMPTY.repeat(MAX_RATING - value);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Student Dashboard
          </h1>
          <p className="text-white/90">
            Welcome {user?.name || "Student"} — manage feedback and access
            official messaging.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/student/ask-question"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-cyan-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Ask Official Question</h2>
            <p className="text-slate-400">
              Send academic or official questions to lecturers.
            </p>
          </Link>

          <Link
            to="/student/view-tickets"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">My Tickets</h2>
            <p className="text-slate-400">
              Track your ticket status, responses, and updates from support.
            </p>
          </Link>

          <Link
            to="/student/my-messages"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">My Messages</h2>
            <p className="text-slate-400">
              View answers, status, and recent official communication.
            </p>
          </Link>

          <Link
            to="/public-faq"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-purple-400 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Public FAQ</h2>
            <p className="text-slate-400">
              Browse public answered questions from lecturers and admins.
            </p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Submit Feedback</h2>
            <p className="text-sm text-slate-400 mb-4">
              Submit feedback for a resolved ticket response using a 1 to 5 star
              rating.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  placeholder="Example: t001"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Star Rating
                </label>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Write your feedback"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-cyan-500 text-slate-950 font-semibold py-3 px-5 hover:bg-cyan-400 transition"
              >
                Submit Feedback
              </button>
            </form>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-4">My Feedback</h2>

            {loadingFeedback ? (
              <p className="text-slate-400">Loading feedback...</p>
            ) : feedbackList.length === 0 ? (
              <p className="text-slate-400">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbackList.map((item) => (
                  <div
                    key={item._id}
                    className="border border-slate-700 rounded-2xl p-4 bg-slate-800"
                  >
                    <p className="font-medium text-white">Ticket: {item.ticketId}</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Rating: {item.rating}/5 ({renderStars(item.rating)})
                    </p>
                    <p className="mt-2 text-slate-200">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
};
