import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import {
  answerMessage,
  getLecturerMessages,
  updateVisibility,
} from "../services/messageService";

export default function LecturerDashboard() {
  const { token, user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState(null);
  const [visibilityId, setVisibilityId] = useState(null);

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

      const res = await answerMessage(
        id,
        {
          answer,
        },
        token
      );

      const updated = res.data?.message || res.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? {
                ...msg,
                ...updated,
                answer,
                status: "ANSWERED",
                answeredAt: updated?.answeredAt || new Date().toISOString(),
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

      const res = await updateVisibility(
        id,
        { isPublic: !currentValue },
        token
      );

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
          msg.course?.toLowerCase().includes(q)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-indigo-100">
            Official Messaging + FAQ Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Lecturer Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100">
            Welcome {user?.name || "Lecturer"} — review student questions,
            submit official replies, and manage FAQ publishing from one page.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Open Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{openCount}</h2>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Answered Questions</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {answeredCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Published FAQs</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {publicCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Private Items</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {privateCount}
            </h2>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search
              </label>
              <input
                type="text"
                placeholder="Search subject, student, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ANSWERED">Answered</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Faculty
              </label>
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                FAQ Filter
              </label>
              <select
                value={faqFilter}
                onChange={(e) => setFaqFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="ALL">All Items</option>
                <option value="PUBLIC">Published FAQ</option>
                <option value="PRIVATE">Private Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No messages found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1 space-y-4">
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
                            msg.isPublic
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {msg.isPublic ? "Public FAQ" : "Private"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            msg.studentNotified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {msg.studentNotified ? "Student Seen" : "Not Seen Yet"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500">
                        {msg.faculty || "-"} • {msg.course || "-"} • Year{" "}
                        {msg.academicYear || "-"} • Semester {msg.semester || "-"}
                      </p>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Student Question
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                          {msg.question}
                        </p>
                      </div>

                      {msg.answer ? (
                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-700">
                            Submitted Answer
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                            {msg.answer}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-sm font-medium text-amber-700">
                            This question is waiting for an official answer.
                          </p>
                        </div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {msg.answer ? "Update Answer" : "Write Answer"}
                        </label>

                        <textarea
                          rows={5}
                          value={answerInputs[msg._id] ?? ""}
                          onChange={(e) =>
                            handleAnswerChange(msg._id, e.target.value)
                          }
                          placeholder="Type the official reply here..."
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleAnswerSubmit(msg._id)}
                            disabled={answeringId === msg._id}
                            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                              className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                msg.isPublic
                                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {visibilityId === msg._id
                                ? "Updating..."
                                : msg.isPublic
                                ? "Remove from FAQ"
                                : "Publish to FAQ"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 xl:max-w-sm">
                      <p>
                        <span className="font-semibold">Student Name:</span>{" "}
                        {msg.studentId?.name || "-"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Registration ID:</span>{" "}
                        {msg.studentRegistrationId || "-"}
                      </p>

                      <p className="mt-2 break-all">
                        <span className="font-semibold">Student Email:</span>{" "}
                        {msg.studentEmail || "-"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Assigned Lecturer:</span>{" "}
                        {msg.lecturerId?.name || "Not assigned"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Answered By:</span>{" "}
                        {msg.answeredBy?.name || "-"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Created:</span>{" "}
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : "-"}
                      </p>

                      {msg.answeredAt && (
                        <p className="mt-2">
                          <span className="font-semibold">Answered At:</span>{" "}
                          {new Date(msg.answeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}