import { useEffect, useMemo, useState } from "react";
import { getPublicMessages } from "../services/messageService";
import { toast } from "sonner";

const COURSE_OPTIONS = {
  Computing: ["IT", "SE", "Cyber Security", "Data Science"],
  Engineering: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
  ],
  Business: ["Business Management", "Accounting", "Marketing"],
};

export default function PublicFAQ() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");

  const loadPublicMessages = async () => {
    try {
      setLoading(true);
      const res = await getPublicMessages();
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load public FAQ";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicMessages();
  }, []);

  const availableCourses = useMemo(() => {
    if (!faculty) {
      return Object.values(COURSE_OPTIONS).flat();
    }
    return COURSE_OPTIONS[faculty] || [];
  }, [faculty]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];

    if (search.trim()) {
      const searchValue = search.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.subject?.toLowerCase().includes(searchValue) ||
          msg.question?.toLowerCase().includes(searchValue) ||
          msg.answer?.toLowerCase().includes(searchValue)
      );
    }

    if (faculty) {
      result = result.filter((msg) => msg.faculty === faculty);
    }

    if (course) {
      result = result.filter((msg) => msg.course === course);
    }

    return result;
  }, [messages, search, faculty, course]);

  const totalFaq = messages.length;
  const totalFiltered = filteredMessages.length;
  const facultyCount = [...new Set(messages.map((msg) => msg.faculty).filter(Boolean))].length;

  const isImageFile = (fileType) => {
    return fileType?.startsWith("image/");
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "📕";
    if (fileType?.includes("word") || fileType?.includes("document")) return "📄";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="ui-card mb-6 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-200">Official Messaging System</p>
              <h1 className="text-4xl font-bold tracking-tight">Public FAQ</h1>
              <p className="mt-2 text-blue-100">Explore officially answered questions across all faculties and courses</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition hover:shadow-md hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Public FAQs</p>
                <h2 className="mt-3 text-4xl font-bold text-blue-700">{totalFaq}</h2>
                <p className="mt-2 text-xs text-blue-600">Questions available</p>
              </div>
              <div className="text-5xl">📚</div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm transition hover:shadow-md hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Filtered Results</p>
                <h2 className="mt-3 text-4xl font-bold text-emerald-700">{totalFiltered}</h2>
                <p className="mt-2 text-xs text-emerald-600">Matching your filters</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm transition hover:shadow-md hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Faculties Covered</p>
                <h2 className="mt-3 text-4xl font-bold text-purple-700">{facultyCount}</h2>
                <p className="mt-2 text-xs text-purple-600">Academic departments</p>
              </div>
              <div className="text-5xl">🏢</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="ui-card mb-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search & Filter
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search Questions</label>
              <input
                type="text"
                placeholder="Search subject, question, answer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Faculty</label>
              <select
                value={faculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  setCourse("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Faculties</option>
                <option value="Computing">Computing</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Courses</option>
                {availableCourses.map((courseOption) => (
                  <option key={courseOption} value={courseOption}>
                    {courseOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FAQ Cards */}
        <div className="ui-card rounded-2xl border border-slate-200 p-6 shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="animate-spin">
                <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Loading public FAQ...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-bold text-slate-700">No public FAQ found</p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing your search or filters to find relevant questions.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMessages.map((msg, index) => (
                <div key={msg._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                  <div className="flex flex-col gap-0 md:flex-row md:items-stretch">
                    {/* Left Content Area */}
                    <div className="flex-1 space-y-4 p-6">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center justify-center rounded-full bg-blue-100 h-8 w-8 font-bold text-blue-700 text-sm">
                          {index + 1}
                        </div>
                        <h2 className="flex-1 text-xl font-bold text-slate-900">
                          {msg.subject || "Untitled Subject"}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          FAQ
                        </span>
                      </div>

                      {/* Course Info Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          📚 {msg.faculty || "-"}
                        </span>
                        <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          🎓 {msg.course || "-"}
                        </span>
                        <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          📅 Year {msg.academicYear || "-"} • Sem {msg.semester || "-"}
                        </span>
                      </div>

                      {/* Question Box */}
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">📝 Question</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                          {msg.question}
                        </p>
                      </div>

                      {/* Attachment Display */}
                      {msg.attachment && msg.attachment.fileUrl && (
                        <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-purple-700 mb-3">📎 Attachment</p>
                          {isImageFile(msg.attachment.fileType) ? (
                            <div className="space-y-3">
                              <img
                                src={`http://localhost:5001${msg.attachment.fileUrl}`}
                                alt={msg.attachment.fileName}
                                className="max-h-64 w-full rounded-lg object-contain border border-purple-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <a
                                href={`http://localhost:5001${msg.attachment.fileUrl}`}
                                download={msg.attachment.fileName}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 hover:text-purple-900"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {msg.attachment.fileName}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-white p-3">
                              <div className="text-3xl">{getFileIcon(msg.attachment.fileType)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {msg.attachment.fileName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {msg.attachment.fileType || "Document"}
                                </p>
                              </div>
                              <a
                                href={`http://localhost:5001${msg.attachment.fileUrl}`}
                                download={msg.attachment.fileName}
                                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition flex-shrink-0"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Answer Box */}
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">✅ Official Answer</p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                          {msg.answer}
                        </p>
                      </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 md:border-l md:border-t-0 md:min-w-xs md:max-w-xs">
                      <h4 className="mb-4 text-sm font-bold text-slate-900">ℹ️ Answer Details</h4>
                      
                      <div className="space-y-4">
                        {/* Answered By */}
                        <div className="rounded-lg bg-white p-3 border border-slate-100">
                          <p className="text-xs font-semibold uppercase text-slate-500">👤 Answered By</p>
                          <p className="mt-2 font-bold text-slate-900">
                            {msg.answeredBy?.name || "Lecturer"}
                          </p>
                        </div>

                        {/* Email */}
                        <div className="rounded-lg bg-white p-3 border border-slate-100">
                          <p className="text-xs font-semibold uppercase text-slate-500">📧 Email</p>
                          <p className="mt-2 break-all text-sm text-slate-700">
                            {msg.answeredBy?.email || "-"}
                          </p>
                        </div>

                        {/* Answered Date */}
                        <div className="rounded-lg bg-white p-3 border border-slate-100">
                          <p className="text-xs font-semibold uppercase text-slate-500">📅 Answered Date</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {msg.answeredAt
                              ? new Date(msg.answeredAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "-"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {msg.answeredAt
                              ? new Date(msg.answeredAt).toLocaleTimeString()
                              : ""}
                          </p>
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
  );
}