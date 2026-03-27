import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  deleteMessage,
  getMyMessages,
  markAsNotified,
} from "../services/messageService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AppLayout } from "../../components/AppLayout";

export default function StudentMyMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await getMyMessages(token);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load messages";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMessages();
    }
  }, [token]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteMessage(id, token);
      toast.success("Message deleted successfully");
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete message";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkSeen = async (id) => {
    try {
      setMarkingId(id);
      await markAsNotified(id, token);
      toast.success("Notification marked as seen");
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, studentNotified: true } : msg
        )
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update notification";
      toast.error(message);
    } finally {
      setMarkingId(null);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "ANSWERED":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "CLOSED":
        return "bg-slate-200 text-slate-700 border border-slate-300";
      case "OPEN":
      default:
        return "bg-blue-100 text-blue-700 border border-blue-200";
    }
  };

  const filteredMessages = useMemo(() => {
    if (statusFilter === "ALL") return messages;
    return messages.filter((msg) => msg.status === statusFilter);
  }, [messages, statusFilter]);

  const answeredCount = messages.filter((msg) => msg.status === "ANSWERED").length;
  const openCount = messages.filter((msg) => msg.status === "OPEN").length;
  const unreadCount = messages.filter((msg) => !msg.studentNotified).length;

  return (
    <AppLayout>
      <div className="ui-page">
        <div className="ui-card mb-6 bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-200">
            Student Support & Communication System
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Messages
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-200">
            View your submitted questions, official replies, visibility status,
            and notification updates in one place.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Open Messages</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{openCount}</h2>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Answered Messages</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {answeredCount}
            </h2>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Unread Updates</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {unreadCount}
            </h2>
          </div>
        </div>

        <div className="ui-card p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Submitted Questions
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Track status, read lecturer replies, and manage open requests.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ui-select"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ANSWERED">Answered</option>
                <option value="CLOSED">Closed</option>
              </select>

              <Link
                to="/student/ask-question"
                className="btn-primary inline-flex items-center justify-center px-5 py-3"
              >
                Ask New Question
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-600">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No messages found
              </p>
              <p className="mt-2 text-sm text-slate-600">
                You haven&apos;t sent any questions for this filter yet.
              </p>
              <Link
                to="/student/ask-question"
                className="btn-primary mt-5 inline-flex px-5 py-3"
              >
                Send Your First Question
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMessages.map((msg) => (
                <div key={msg._id} className="ui-card p-5 transition hover:shadow-md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {msg.subject || "Untitled Subject"}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            msg.status
                          )}`}
                        >
                          {msg.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            msg.studentNotified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {msg.studentNotified ? "Seen" : "Unread"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            msg.isPublic
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {msg.isPublic ? "Public FAQ" : "Private"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">
                        {msg.faculty || "-"} • {msg.course || "-"} • Year{" "}
                        {msg.academicYear || "-"} • Semester {msg.semester || "-"}
                      </p>

                      <div className="ui-card-soft p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Question
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                          {msg.question}
                        </p>
                      </div>

                      {msg.answer ? (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-700">
                            Official Reply
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                            {msg.answer}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                          <p className="text-sm font-medium text-amber-700">
                            Waiting for lecturer response
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:max-w-xs">
                      <p>
                        <span className="font-semibold">Student ID:</span>{" "}
                        {msg.studentRegistrationId || "-"}
                      </p>

                      <p className="mt-2 break-all">
                        <span className="font-semibold">Email:</span>{" "}
                        {msg.studentEmail || "-"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Lecturer:</span>{" "}
                        {msg.lecturerId?.name || "Assigned lecturer"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Created:</span>{" "}
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : "-"}
                      </p>

                      {msg.answeredAt && (
                        <p className="mt-2">
                          <span className="font-semibold">Answered:</span>{" "}
                          {new Date(msg.answeredAt).toLocaleString()}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-2">
                        {msg.status === "ANSWERED" && !msg.studentNotified && (
                          <button
                            onClick={() => handleMarkSeen(msg._id)}
                            disabled={markingId === msg._id}
                            className="btn-primary rounded-2xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {markingId === msg._id
                              ? "Updating..."
                              : "Mark as Seen"}
                          </button>
                        )}

                        {msg.status === "OPEN" && (
                          <button
                            onClick={() => handleDelete(msg._id)}
                            disabled={deletingId === msg._id}
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === msg._id
                              ? "Deleting..."
                              : "Delete Message"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

