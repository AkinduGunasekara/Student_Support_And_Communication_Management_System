import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { AppLayout } from "../../components/AppLayout";
import { UserProfile } from "../../components/UserProfile";
import {
  answerMessage,
  getLecturerMessages,
  updateVisibility,
} from "../services/messageService";
import { Trash2, AlertCircle } from "lucide-react";
import lecturerDashboardBanner from "../../assets/lecture dashboard banner.jpg";

const BACKEND_URL = "http://localhost:5001";

export default function LecturerDashboard() {
  const { token, user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState(null);
  const [visibilityId, setVisibilityId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [faqFilter, setFaqFilter] = useState("ALL");

  const [answerInputs, setAnswerInputs] = useState({});

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await getLecturerMessages(token);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load lecturer messages";
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

  const handleAnswerChange = (id, value) => {
    setAnswerInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAnswerSubmit = async (id) => {
    const answer = answerInputs[id]?.trim();

    if (!answer) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      setAnsweringId(id);

      const res = await answerMessage(id, { answer }, token);
      const updated = res.data?.message || res.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? {
                ...msg,
                ...updated,
                answer: updated?.answer || answer,
                status: updated?.status || "ANSWERED",
                answeredAt: updated?.answeredAt || new Date().toISOString(),
                answeredBy: updated?.answeredBy || msg.answeredBy,
                lecturerId: updated?.lecturerId || msg.lecturerId,
                studentNotified: false,
              }
            : msg
        )
      );

      setAnswerInputs((prev) => ({
        ...prev,
        [id]: "",
      }));

      toast.success("Answer submitted successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to submit answer";
      toast.error(message);
    } finally {
      setAnsweringId(null);
    }
  };

  const handleVisibilityToggle = async (id, currentValue) => {
    try {
      setVisibilityId(id);

      const res = await updateVisibility(id, { isPublic: !currentValue }, token);
      const updated = res.data?.message || res.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? {
                ...msg,
                ...updated,
                isPublic:
                  typeof updated?.isPublic === "boolean"
                    ? updated.isPublic
                    : !currentValue,
              }
            : msg
        )
      );

      toast.success(
        !currentValue
          ? "Message published to public FAQ"
          : "Message removed from public FAQ"
      );
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update visibility";
      toast.error(message);
    } finally {
      setVisibilityId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      setDeletingId(id);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setDeleteConfirm(null);
      toast.success("Message deleted successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete message";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const facultyOptions = useMemo(() => {
    const unique = new Set(messages.map((msg) => msg.faculty).filter(Boolean));
    return Array.from(unique);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.subject?.toLowerCase().includes(q) ||
          msg.question?.toLowerCase().includes(q) ||
          msg.studentRegistrationId?.toLowerCase().includes(q) ||
          msg.studentEmail?.toLowerCase().includes(q) ||
          msg.course?.toLowerCase().includes(q) ||
          msg.studentId?.name?.toLowerCase().includes(q) ||
          msg.lecturerId?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((msg) => msg.status === statusFilter);
    }

    if (facultyFilter !== "ALL") {
      result = result.filter((msg) => msg.faculty === facultyFilter);
    }

    if (faqFilter === "PUBLIC") {
      result = result.filter((msg) => msg.isPublic);
    }

    if (faqFilter === "PRIVATE") {
      result = result.filter((msg) => !msg.isPublic);
    }

    return result;
  }, [messages, search, statusFilter, facultyFilter, faqFilter]);

  const openCount = messages.filter((msg) => msg.status === "OPEN").length;
  const answeredCount = messages.filter((msg) => msg.status === "ANSWERED").length;
  const publicCount = messages.filter((msg) => msg.isPublic).length;
  const privateCount = messages.filter((msg) => !msg.isPublic).length;

  const getStatusClasses = (status) => {
    switch (status) {
      case "ANSWERED":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "CLOSED":
        return "bg-slate-200 text-slate-700 border border-slate-300";
      case "OPEN":
      default:
        return "bg-amber-100 text-amber-700 border border-amber-200";
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100/60 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Banner Section */}
          <div className="relative mb-8 overflow-hidden rounded-[30px] border border-blue-100 shadow-lg shadow-blue-200/60">
            <img
              src={lecturerDashboardBanner}
              alt="Lecturer dashboard banner"
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/30" />
            <div className="absolute inset-0 px-6 py-8 text-white md:px-8 md:py-10">
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur">
                Official Messaging + FAQ Management
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Lecturer Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 md:text-base">
                Welcome <span className="font-semibold">{user?.name || "Lecturer"}</span> — Review student questions,
                submit official replies, and manage FAQ publishing from one page.
              </p>
            </div>
          </div>

          {/* User Profile Section */}
          <div id="profile-section" className="mb-8">
            <UserProfile />
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
                    {messages.length}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    All student questions
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Open Questions Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Open Questions
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-amber-600">
                    {openCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Awaiting answers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Answered Questions Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Answered Questions
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-emerald-600">
                    {answeredCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Completed answers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Published FAQs Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Published FAQs
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-blue-600">
                    {publicCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Public answers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4v4m0-11v3m0 0a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Private Items Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Private Items
                  </p>
                  <h2 className="mt-4 text-4xl font-bold text-slate-600">
                    {privateCount}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    Not published yet
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-8 rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Search & Filter
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Find messages by search text, status, faculty, or FAQ visibility
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder="Search subject, student, course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  📋 Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  📚 Faculty
                </label>
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="ALL">All Faculties</option>
                  {facultyOptions.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  🌐 FAQ Filter
                </label>
                <select
                  value={faqFilter}
                  onChange={(e) => setFaqFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="ALL">All Items</option>
                  <option value="PUBLIC">Published FAQ</option>
                  <option value="PRIVATE">Private Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages List Section */}
          <div>
            {loading ? (
              <div className="rounded-[30px] border border-blue-100 bg-white p-14 text-center shadow-sm">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                <p className="text-lg font-semibold text-slate-700">
                  Loading messages...
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we fetch all questions
                </p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-slate-300 bg-slate-50 p-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  📭
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-800">
                  No messages found
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md relative"
                  >
                    {/* Delete Confirmation Modal */}
                    {deleteConfirm === msg._id && (
                      <div className="absolute inset-0 bg-black/50 rounded-[28px] flex items-center justify-center z-50">
                        <div className="bg-white rounded-[20px] p-6 shadow-xl mx-4 max-w-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-bold text-slate-900">Delete Message?</h3>
                          </div>
                          <p className="text-slate-600 mb-6 text-sm">
                            Are you sure you want to delete this message? This action cannot be undone.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              disabled={deletingId === msg._id}
                              className="px-4 py-2.5 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm disabled:opacity-50"
                            >
                              {deletingId === msg._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="h-1.5 w-full bg-linear-to-r from-blue-700 via-blue-500 to-blue-400" />

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
                                msg.isPublic
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-50 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {msg.isPublic ? "🌐 Public FAQ" : "🔒 Private"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                msg.studentNotified
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {msg.studentNotified ? "👁️ Student Seen" : "🔔 Not Seen Yet"}
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

                          <div className="grid gap-4 mb-5">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                Student Question
                              </p>
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                                {msg.question}
                              </p>

                              {/* Student Attachment Display */}
                              {msg.attachment?.fileUrl && (
                                <div className="mt-5 pt-5 border-t border-slate-200">
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
                                    📎 Student Attachment
                                  </p>
                                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                    {msg.attachment.fileType?.startsWith("image/") ? (
                                      <div className="space-y-2">
                                        <img
                                          src={msg.attachment.fileUrl}
                                          alt={msg.attachment.fileName}
                                          className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                                          onError={(e) => {
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%' y='50%' font-size='12' fill='%23999' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                                          }}
                                        />
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="text-sm font-semibold text-slate-700 break-all flex-1">
                                            🖼️ {msg.attachment.fileName}
                                          </p>
                                          {msg.attachment.fileUrl && (
                                            <a
                                              href={msg.attachment.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                                            >
                                              View
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-200">
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
                                        {msg.attachment.fileUrl && (
                                          <a
                                            href={msg.attachment.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap"
                                          >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Open
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {msg.answer ? (
                              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                                  ✓ Your Answer
                                </p>
                                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-800">
                                  {msg.answer}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                                  ⏳ Awaiting Your Answer
                                </p>
                                <p className="mt-2 text-sm text-amber-800">
                                  This question is waiting for an official response.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <label className="mb-3 block text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                              {msg.answer ? "Update Answer" : "Write Official Answer"}
                            </label>

                            <textarea
                              rows={5}
                              value={answerInputs[msg._id] ?? ""}
                              onChange={(e) =>
                                handleAnswerChange(msg._id, e.target.value)
                              }
                              placeholder="Type the official reply here..."
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                            />

                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                onClick={() => handleAnswerSubmit(msg._id)}
                                disabled={answeringId === msg._id}
                                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {answeringId === msg._id
                                  ? "Submitting..."
                                  : msg.answer
                                  ? "Update Answer"
                                  : "Submit Answer"}
                              </button>

                              {msg.status === "ANSWERED" && (
                                <button
                                  onClick={() =>
                                    handleVisibilityToggle(msg._id, msg.isPublic)
                                  }
                                  disabled={visibilityId === msg._id}
                                  className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                    msg.isPublic
                                      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                                  }`}
                                >
                                  {visibilityId === msg._id
                                    ? "Updating..."
                                    : msg.isPublic
                                    ? "🔒 Remove from FAQ"
                                    : "🌐 Publish to FAQ"}
                                </button>
                              )}

                              <button
                                onClick={() => setDeleteConfirm(msg._id)}
                                disabled={deletingId === msg._id}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="w-full lg:max-w-sm">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                              Student Information
                            </h3>

                            <div className="mt-4 space-y-3">
                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Student Name
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {msg.studentId?.name || "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Registration ID
                                </p>
                                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                                  {msg.studentRegistrationId || "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Student Email
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
                                  {msg.lecturerId?.name || "Not assigned"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Answered By
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {msg.answeredBy?.name || "-"}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  Created Date
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