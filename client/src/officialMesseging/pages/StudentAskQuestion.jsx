import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { deleteMessage, getMyMessages, markAsNotified } from "../services/messageService";
import { toast } from "sonner";

export default function StudentMyMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await getMyMessages(token);
      setMessages(res.data);
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
        return "bg-slate-100 text-slate-700 border border-slate-200";
      default:
        return "bg-blue-100 text-blue-700 border border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">
            Student Support & Communication System
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Messages
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            View your submitted questions, official replies, visibility status,
            and notifications.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No messages found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                You haven’t sent any questions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {msg.subject}
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

                      {msg.answer ? (
                        <div className="rounded-2xl bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-700">
                            Official Reply
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {msg.answer}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-amber-50 p-4">
                          <p className="text-sm font-medium text-amber-700">
                            Waiting for lecturer response
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="w-full rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 lg:max-w-xs">
                      <p>
                        <span className="font-semibold">Student ID:</span>{" "}
                        {msg.studentRegistrationId || "-"}
                      </p>
                      <p className="mt-2">
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

                      <div className="mt-4 flex flex-col gap-2">
                        {msg.status === "ANSWERED" && !msg.studentNotified && (
                          <button
                            onClick={() => handleMarkSeen(msg._id)}
                            disabled={markingId === msg._id}
                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
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
    </div>
  );
}