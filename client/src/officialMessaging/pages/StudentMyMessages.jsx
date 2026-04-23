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
import messagesBanner from "../../assets/Messages banner.jpg";

const BACKEND_URL = "http://localhost:5001";

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
  const closedCount = messages.filter((msg) => msg.status === "CLOSED").length;
  const totalMessages = messages.length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-8 overflow-hidden rounded-[30px] border border-blue-100 shadow-lg shadow-blue-200/60">
            <img
              src={messagesBanner}
              alt="My messages banner"
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
            <div className="absolute inset-0 px-6 py-8 text-white md:px-8 md:py-10">
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur">
                Student Support & Communication
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                My Messages
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                View your submitted questions, official replies, visibility status,
                and notification updates in one place.
              </p>
            </div>
          </div>

          {/* Stats Cards Section */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Total Messages Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total Messages
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-slate-900">
                    {totalMessages}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    All submitted questions
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Open Messages Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Open Messages
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-blue-600">
                    {openCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Awaiting response
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Answered Messages Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Answered Messages
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-emerald-600">
                    {answeredCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    With replies
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Closed Messages Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Closed Messages
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-slate-600">
                    {closedCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Resolved
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Unread Updates Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Unread Updates
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-amber-600">
                    {unreadCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    New notifications
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Messages List Section */}
          <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Submitted Questions
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Track status, read lecturer replies, and manage open requests.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <Link
                  to="/student/ask-question"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Ask New Question
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[30px] border border-blue-100 bg-white p-14 text-center shadow-sm">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="text-lg font-semibold text-slate-700">
                  Loading your messages...
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we fetch your submitted questions
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 p-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  📝
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-800">
                  No messages found
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  You haven&apos;t sent any questions for this filter yet.
                </p>
                <Link
                  to="/student/ask-question"
                  className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Send Your First Question
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400" />

                    <div className="p-6 md:p-7">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                              {msg.subject || "Untitled Subject"}
                            </h2>
                          </div>

                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                msg.status
                              )}`}
                            >
                              {msg.status === "OPEN" && "🔵"} {msg.status === "ANSWERED" && "✅"} {msg.status === "CLOSED" && "⏹"} {msg.status}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                msg.studentNotified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {msg.studentNotified ? "👁️ Seen" : "🔔 Unread"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                msg.isPublic
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {msg.isPublic ? "🌐 Public FAQ" : "🔒 Private"}
                            </span>
                          </div>

                          <div className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                              📚 {msg.faculty || "-"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                              📖 {msg.course || "-"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                              📅 Year {msg.academicYear || "-"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                              🗓️ Semester {msg.semester || "-"}
                            </span>
                          </div>

                          <div className="grid gap-4">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                Your Question
                              </p>
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                                {msg.question}
                              </p>

                              {/* Student Attachment Display */}
                              {msg.attachment?.fileUrl && (
                                <div className="mt-5 pt-5 border-t border-slate-200">
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
                                    📎 Your Attachment
                                  </p>
                                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                    {msg.attachment.fileType?.startsWith("image/") ? (
                                      <div className="space-y-2">
                                        <img
                                          src={`${BACKEND_URL}${msg.attachment.fileUrl}`}
                                          alt={msg.attachment.fileName}
                                          className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                                        />
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="text-sm font-semibold text-slate-700 break-all flex-1">
                                            🖼️ {msg.attachment.fileName}
                                          </p>
                                          <a
                                            href={`${BACKEND_URL}${msg.attachment.fileUrl}`}
                                            download={msg.attachment.fileName}
                                            className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                                          >
                                            Download
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200">
                                            <svg
                                              className="h-5 w-5 text-blue-700"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-700 break-all">
                                              📄 {msg.attachment.fileName}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                              {msg.attachment.fileType}
                                            </p>
                                          </div>
                                        </div>
                                        <a
                                          href={`${BACKEND_URL}${msg.attachment.fileUrl}`}
                                          download={msg.attachment.fileName}
                                          className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
                                        >
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          Download
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {msg.answer ? (
                              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                  ✓ Official Reply
                                </p>
                                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-800">
                                  {msg.answer}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                                  ⏳ Awaiting Response
                                </p>
                                <p className="mt-2 text-sm text-amber-800">
                                  Your question is pending. The lecturer will respond soon.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full lg:max-w-sm">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                              Message Details
                            </h3>

                            <div className="mt-4 space-y-3">
                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Student ID
                                </p>
                                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                  {msg.studentRegistrationId || "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Email Address
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-700">
                                  {msg.studentEmail || "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Assigned Lecturer
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {msg.lecturerId?.name || "Assigned lecturer"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Submitted Date
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleString()
                                    : "-"}
                                </p>
                              </div>

                              {msg.answeredAt && (
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                    Answered Date
                                  </p>
                                  <p className="mt-1 text-sm text-emerald-800">
                                    {new Date(msg.answeredAt).toLocaleString()}
                                  </p>
                                </div>
                              )}

                              <div className="mt-4 flex flex-col gap-2">
                                {msg.status === "ANSWERED" && !msg.studentNotified && (
                                  <button
                                    onClick={() => handleMarkSeen(msg._id)}
                                    disabled={markingId === msg._id}
                                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {markingId === msg._id
                                      ? "Updating..."
                                      : "✓ Mark as Seen"}
                                  </button>
                                )}

                                {msg.status === "OPEN" && (
                                  <button
                                    onClick={() => handleDelete(msg._id)}
                                    disabled={deletingId === msg._id}
                                    className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {deletingId === msg._id
                                      ? "Deleting..."
                                      : "🗑️ Delete Message"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}