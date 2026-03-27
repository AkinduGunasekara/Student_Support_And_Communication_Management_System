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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="ui-card mb-6 rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-200">Official Messaging</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Public FAQ</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-200">
            Browse officially answered public questions by faculty, course, and
            keyword.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Total Public FAQs</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{totalFaq}</h2>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Filtered Results</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalFiltered}
            </h2>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Faculties Covered</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {facultyCount}
            </h2>
          </div>
        </div>

        <div className="ui-card mb-6 p-6">
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
                className="ui-input"
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
                className="ui-select"
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
                className="ui-select"
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

        <div className="ui-card p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-600">
              Loading public FAQ...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No public FAQ found
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMessages.map((msg) => (
                <div key={msg._id} className="ui-card p-5 transition hover:shadow-md">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {msg.subject || "Untitled Subject"}
                        </h2>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          FAQ
                        </span>
                      </div>

                      <p className="text-sm text-slate-600">
                        {msg.faculty || "-"} • {msg.course || "-"} • Year{" "}
                        {msg.academicYear || "-"} • Semester{" "}
                        {msg.semester || "-"}
                      </p>

                      <div className="ui-card-soft p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Question
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                          {msg.question}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-700">
                          Official Answer
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                          {msg.answer}
                        </p>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:max-w-xs">
                      <p>
                        <span className="font-semibold">Answered By:</span>{" "}
                        {msg.answeredBy?.name || "Lecturer"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Lecturer Email:</span>{" "}
                        {msg.answeredBy?.email || "-"}
                      </p>

                      <p className="mt-2">
                        <span className="font-semibold">Answered At:</span>{" "}
                        {msg.answeredAt
                          ? new Date(msg.answeredAt).toLocaleString()
                          : "-"}
                      </p>
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