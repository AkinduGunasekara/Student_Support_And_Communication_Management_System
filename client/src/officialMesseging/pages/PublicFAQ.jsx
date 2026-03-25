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
    if (!faculty) return Object.values(COURSE_OPTIONS).flat();
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
  const facultyCount = [
    ...new Set(messages.map((msg) => msg.faculty).filter(Boolean)),
  ].length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/60 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200/60">
          <div className="px-6 py-8 md:px-8 md:py-10">
            <div className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur">
              Official Messaging
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Public FAQ Portal
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Browse officially answered public questions using search, faculty,
              and course filters in a clean modern interface.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total Public FAQs
                </p>
                <h2 className="mt-5 text-4xl font-bold text-slate-900">
                  {totalFaq}
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  All publicly available answered questions
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <div className="h-4 w-4 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Filtered Results
                </p>
                <h2 className="mt-5 text-4xl font-bold text-slate-900">
                  {totalFiltered}
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  Results matching your current filters
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <div className="h-4 w-4 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Faculties Covered
                </p>
                <h2 className="mt-5 text-4xl font-bold text-slate-900">
                  {facultyCount}
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  Faculties included in the FAQ system
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                <div className="h-4 w-4 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Search & Filter
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Narrow down FAQs by text, faculty, or course
              </p>
            </div>

            {(search || faculty || course) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFaculty("");
                  setCourse("");
                }}
                className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Search
              </label>
              <input
                type="text"
                placeholder="Search subject, question, answer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Faculty
              </label>
              <select
                value={faculty}
                onChange={(e) => {
                  setFaculty(e.target.value);
                  setCourse("");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Faculties</option>
                <option value="Computing">Computing</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

        {/* FAQ List */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-[30px] border border-blue-100 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="text-lg font-semibold text-slate-700">
                Loading public FAQ...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Please wait while we fetch official answers
              </p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                🔍
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-800">
                No public FAQ found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your search text or filter options.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400" />

                  <div className="p-6 md:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            {msg.subject || "Untitled Subject"}
                          </h2>
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Public FAQ
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Faculty: {msg.faculty || "-"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Course: {msg.course || "-"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Year: {msg.academicYear || "-"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Semester: {msg.semester || "-"}
                          </span>
                        </div>

                        <div className="mt-6 grid gap-4">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                              Student Question
                            </p>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                              {msg.question || "-"}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                              Official Answer
                            </p>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-800">
                              {msg.answer || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:max-w-sm">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                            Answer Details
                          </h3>

                          <div className="mt-4 space-y-4">
                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Answered By
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {msg.answeredBy?.name || "Lecturer"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Lecturer Email
                              </p>
                              <p className="mt-1 break-all text-sm text-slate-700">
                                {msg.answeredBy?.email || "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Answered At
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {msg.answeredAt
                                  ? new Date(msg.answeredAt).toLocaleString()
                                  : "-"}
                              </p>
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
  );
}