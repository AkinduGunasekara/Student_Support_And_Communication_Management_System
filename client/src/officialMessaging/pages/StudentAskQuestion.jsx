import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { createMessage } from "../services/messageService";
import QuestionForm from "../components/QuestionForm";
import { AppLayout } from "../../components/AppLayout";

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
    <AppLayout>
      <div className="ui-page">
        <div className="ui-card mb-6 bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
          <p className="text-sm font-medium text-blue-200">Official Messaging</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Ask a Question</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-200">
            Send your academic or official question to the relevant lecturer or department.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Logged In As</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{user?.name || "Student"}</h2>
            <p className="mt-1 text-sm text-slate-600">{user?.email || "No email available"}</p>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Access Role</p>
            <h2 className="mt-2 text-lg font-bold capitalize text-slate-900">{user?.role || "student"}</h2>
            <p className="mt-1 text-sm text-slate-600">You can create official questions here.</p>
          </div>

          <div className="ui-card p-5">
            <p className="text-sm text-slate-600">Submission Status</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{loading ? "Submitting..." : "Ready"}</h2>
            <p className="mt-1 text-sm text-slate-600">Fill all required fields and submit.</p>
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
    </AppLayout>
  );
}

