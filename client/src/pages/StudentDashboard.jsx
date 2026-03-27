import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AppLayout } from "../components/AppLayout";
import { UserProfile } from "../components/UserProfile";
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
      <div className="ui-page">
        <div className="ui-card mb-6 bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="mt-2 text-blue-200">
            Welcome {user?.name || "Student"} — manage feedback and access
            official messaging.
          </p>
        </div>

        <div id="profile-section" className="mb-8">
          <UserProfile />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/student/ask-question"
            className="ui-card p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ask Official Question</h2>
            <p className="text-slate-600">
              Send academic or official questions to lecturers.
            </p>
          </Link>

          <Link
            to="/student/view-ticket"
            className="ui-card p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">My Tickets</h2>
            <p className="text-slate-600">
              View answers, status, and recent official communication.
            </p>
          </Link>
          
          <Link
            to="/student/my-messages"
            className="ui-card p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">My Messages</h2>
            <p className="text-slate-600">
              View answers, status, and recent official communication.
            </p>
          </Link>

          <Link
            to="/public-faq"
            className="ui-card p-6 transition hover:-translate-y-0.5"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Public FAQ</h2>
            <p className="text-slate-600">
              Browse public answered questions from lecturers and admins.
            </p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="ui-card p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Submit Feedback</h2>
            <p className="text-sm text-slate-600 mb-4">
              Submit feedback for a resolved ticket response using a 1 to 5 star
              rating.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="ui-label">Ticket ID</label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  placeholder="Example: t001"
                  required
                  className="ui-input"
                />
              </div>

              <div>
                <label className="ui-label">Star Rating</label>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  required
                  className="ui-select"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <div>
                <label className="ui-label">Comment</label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  rows={4}
                  className="ui-textarea"
                  placeholder="Write your feedback"
                />
              </div>

              <button type="submit" className="btn-primary px-5 py-3">
                Submit Feedback
              </button>
            </form>
          </section>

          <section className="ui-card p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">My Feedback</h2>

            {loadingFeedback ? (
              <p className="text-slate-600">Loading feedback...</p>
            ) : feedbackList.length === 0 ? (
              <p className="text-slate-600">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbackList.map((item) => (
                  <div
                    key={item._id}
                    className="ui-card-soft p-4"
                  >
                    <p className="font-medium text-slate-900">Ticket: {item.ticketId}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Rating: {item.rating}/5 ({renderStars(item.rating)})
                    </p>
                    <p className="mt-2 text-slate-700">{item.comment}</p>
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