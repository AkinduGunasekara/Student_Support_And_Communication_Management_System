import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { createMessage } from "../services/messageService";
import QuestionForm from "../components/QuestionForm";

export default function StudentAskQuestion() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateMessage = async (payload) => {
    try {
      setLoading(true);

      await createMessage(payload, token);

      toast.success("Your question has been submitted successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to submit question";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">
            Official Messaging
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Ask a Question
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Send your academic or official question to the relevant lecturer or
            department. Make sure your details are correct before submitting.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Logged In As</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {user?.name || "Student"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {user?.email || "No email available"}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Access Role</p>
            <h2 className="mt-2 text-lg font-bold capitalize text-slate-900">
              {user?.role || "student"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You can create official questions here.
            </p>
          </div>

          <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Submission Status</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {loading ? "Submitting..." : "Ready"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill all required fields and submit.
            </p>
          </div>
        </div>

        <QuestionForm
          onSubmit={handleCreateMessage}
          loading={loading}
          submitLabel="Send Question"
          initialValues={{
            studentEmail: user?.email || "",
          }}
        />
      </div>
    </div>
  );
}