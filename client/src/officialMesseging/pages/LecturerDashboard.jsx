import { useEffect, useState } from "react";
import { getPublicMessages } from "../services/messageService";
import { toast } from "sonner";

export default function PublicFAQ() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("");
  const [course, setCourse] = useState("");

  const loadPublicMessages = async () => {
    try {
      setLoading(true);
      const res = await getPublicMessages();
      setMessages(res.data);
      setFilteredMessages(res.data);
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

  useEffect(() => {
    let result = [...messages];

    if (search.trim()) {
      const searchValue = search.toLowerCase();
      result = result.filter(
        (msg) =>
          msg.subject?.toLowerCase().includes(searchValue) ||
          msg.question?.toLowerCase().includes(searchValue) ||
          msg.answer?.toLowerCase().includes(searchValue) ||
          msg.studentRegistrationId?.toLowerCase().includes(searchValue) ||
          msg.studentEmail?.toLowerCase().includes(searchValue)
      );
    }

    if (faculty) {
      result = result.filter((msg) => msg.faculty === faculty);
    }

    if (course) {
      result = result.filter((msg) => msg.course === course);
    }

    setFilteredMessages(result);
  }, [search, faculty, course, messages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">Official Messaging</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Public FAQ</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Browse officially answered public questions by faculty, course, and
            keyword.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Faculty
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All Courses</option>
                <option value="IT">IT</option>
                <option value="SE">SE</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              Loading public FAQ...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No public FAQ found
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
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {msg.subject}
                        </h2>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          FAQ
                        </span>
                      </div>

                      <p className="text-sm text-slate-500">
                        {msg.faculty || "-"} • {msg.course || "-"} • Year{" "}
                        {msg.academicYear || "-"} • Semester {msg.semester || "-"}
                      </p>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Question
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {msg.question}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-700">
                          Official Answer
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {msg.answer}
                        </p>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:max-w-xs">
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