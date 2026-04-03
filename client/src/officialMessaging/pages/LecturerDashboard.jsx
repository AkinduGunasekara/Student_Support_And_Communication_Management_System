import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { AppLayout } from "../../components/AppLayout";
import { UserProfile } from "../../components/UserProfile";
import {
  answerMessage,
  getLecturerMessages,
  updateVisibility,
  generateCSVReport,
  generateJSONReport,
  generateHTMLReport,
  generatePDFReport,
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
  const [exportingFormat, setExportingFormat] = useState(null);

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

  const stats = {
    total: messages.length,
    open: openCount,
    answered: answeredCount,
    public: publicCount,
    private: privateCount,
  };

  const handleExportCSV = () => {
    try {
      setExportingFormat("csv");
      generateCSVReport(
        filteredMessages,
        `messages-report-${new Date().getTime()}.csv`
      );
      toast.success("CSV report downloaded successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportJSON = () => {
    try {
      setExportingFormat("json");
      generateJSONReport(
        filteredMessages,
        stats,
        `messages-report-${new Date().getTime()}.json`
      );
      toast.success("JSON report downloaded successfully");
    } catch (error) {
      toast.error("Failed to export JSON");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportHTML = () => {
    try {
      setExportingFormat("html");
      generateHTMLReport(
        filteredMessages,
        stats,
        `messages-report-${new Date().getTime()}.html`
      );
      toast.success("HTML report downloaded successfully");
    } catch (error) {
      toast.error("Failed to export HTML");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportingFormat("pdf");
      await generatePDFReport(
        filteredMessages,
        stats,
        `messages-report-${new Date().getTime()}.pdf`
      );
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setExportingFormat(null);
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
        return "bg-amber-100 text-amber-700 border border-amber-200";
    }
  };

  const isImageFile = (fileType) => {
    return fileType?.startsWith("image/");
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "📕";
    if (fileType?.includes("word") || fileType?.includes("document"))
      return "📄";
    return "📎";
  };

  const downloadFileFromBase64 = (base64Data, fileName, mimeType) => {
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${base64Data}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/60 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Banner Section */}
          <div className="relative mb-8 overflow-hidden rounded-[30px] border border-blue-100 shadow-lg shadow-blue-200/60">
            <img
              src={lecturerDashboardBanner}
              alt="Lecturer dashboard banner"
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
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

          {/* Profile Section */}
          <div id="profile-section" className="mb-6">
            <UserProfile />
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="ui-card p-5">
              <p className="text-sm text-slate-600">Open Questions</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{openCount}</h2>
            </div>

            <div className="ui-card p-5">
              <p className="text-sm text-slate-600">Answered Questions</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {answeredCount}
              </h2>
            </div>

            <div className="ui-card p-5">
              <p className="text-sm text-slate-600">Published FAQs</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {publicCount}
              </h2>
            </div>

            <div className="ui-card p-5">
              <p className="text-sm text-slate-600">Private Items</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {privateCount}
              </h2>
            </div>
          </div>

          {/* Filters Section */}
          <div className="ui-card mb-6 p-6">
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
                  className="ui-input"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Faculty
                </label>
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="ui-select"
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
                  className="ui-select"
                >
                  <option value="ALL">All Items</option>
                  <option value="PUBLIC">Published FAQ</option>
                  <option value="PRIVATE">Private Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="ui-card mb-6 p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                📥 Export Reports
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Download filtered messages in your preferred format
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCSV}
                disabled={exportingFormat !== null || filteredMessages.length === 0}
                className="btn-primary rounded-lg px-4 py-2 text-sm font-medium transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === "csv" ? (
                  <>
                    <span className="animate-spin">⟳</span> Exporting CSV...
                  </>
                ) : (
                  <>📊 Export CSV</>
                )}
              </button>

              <button
                onClick={handleExportJSON}
                disabled={exportingFormat !== null || filteredMessages.length === 0}
                className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === "json" ? (
                  <>
                    <span className="animate-spin">⟳</span> Exporting JSON...
                  </>
                ) : (
                  <>📄 Export JSON</>
                )}
              </button>

              <button
                onClick={handleExportHTML}
                disabled={exportingFormat !== null || filteredMessages.length === 0}
                className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === "html" ? (
                  <>
                    <span className="animate-spin">⟳</span> Exporting HTML...
                  </>
                ) : (
                  <>🖨️ Export HTML</>
                )}
              </button>

              <button
                onClick={handleExportPDF}
                disabled={exportingFormat !== null || filteredMessages.length === 0}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exportingFormat === "pdf" ? (
                  <>
                    <span className="animate-spin">⟳</span> Exporting PDF...
                  </>
                ) : (
                  <>📑 Export PDF</>
                )}
              </button>
            </div>
          </div>

          {/* Messages Section */}
          <div className="ui-card p-6">
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
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredMessages.map((msg) => (
                  <div key={msg._id} className="ui-card p-5 transition hover:shadow-md">
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

                        <p className="text-sm text-slate-600">
                          {msg.faculty || "-"} • {msg.course || "-"} • Year{" "}
                          {msg.academicYear || "-"} • Semester {msg.semester || "-"}
                        </p>

                        <div className="ui-card-soft p-4">
                          <p className="text-sm font-semibold text-slate-700">
                            Student Question
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                            {msg.question}
                          </p>
                        </div>

                        {msg.attachment && msg.attachment.fileData && (
                          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                            <p className="text-sm font-semibold text-purple-700 mb-3">
                              📎 Student Attachment
                            </p>
                            {isImageFile(msg.attachment.fileType) ? (
                              <div className="space-y-3">
                                <img
                                  src={`data:${msg.attachment.fileType};base64,${msg.attachment.fileData}`}
                                  alt={msg.attachment.fileName}
                                  className="max-h-96 rounded-lg object-contain border border-purple-200"
                                  onError={(e) => {
                                    console.error("Image failed to load");
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='14'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  <svg
                                    className="h-4 w-4 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-sm text-purple-700 font-medium">
                                    {msg.attachment.fileName}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-purple-200">
                                <div className="text-2xl">
                                  {getFileIcon(msg.attachment.fileType)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">
                                    {msg.attachment.fileName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {msg.attachment.fileType || "Document"}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    downloadFileFromBase64(
                                      msg.attachment.fileData,
                                      msg.attachment.fileName,
                                      msg.attachment.fileType
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.answer ? (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-700">
                              Submitted Answer
                            </p>
                            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                              {msg.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
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
                            className="ui-textarea"
                          />

                          <div className="mt-3 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleAnswerSubmit(msg._id)}
                              disabled={answeringId === msg._id}
                              className="btn-primary rounded-2xl px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70"
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

                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 xl:max-w-sm">
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
    </AppLayout>
  );
}