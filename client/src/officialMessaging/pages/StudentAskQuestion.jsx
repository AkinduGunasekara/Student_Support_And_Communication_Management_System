import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { createMessage } from "../services/messageService";
import QuestionForm from "../components/QuestionForm";
import { AppLayout } from "../../components/AppLayout";
import { CheckCircle, Mail, Shield } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/60 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="mb-8 overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200/60">
            <div className="px-6 py-8 md:px-8 md:py-10">
              <div className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur">
                Official Messaging System
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Ask a Question
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                Submit your academic or official question to the relevant lecturer or department. Your question will be reviewed and answered promptly.
              </p>
            </div>
          </div>

          {/* Student Info Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {/* Logged In As Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Logged In As
                  </p>
                  <h2 className="mt-4 text-lg font-bold text-slate-900">
                    {user?.name || "Student"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600 break-all">
                    {user?.email || "No email available"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Access Role Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Access Role
                  </p>
                  <h2 className="mt-4 text-lg font-bold capitalize text-slate-900">
                    {user?.role || "student"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600">
                    You can create official questions here
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submission Status Card */}
            <div className="rounded-[26px] border border-blue-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Submission Status
                  </p>
                  <h2 className={`mt-4 text-lg font-bold ${
                    loading ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {loading ? "Submitting..." : "Ready"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600">
                    Fill all required fields and submit
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  loading ? "bg-amber-100 animate-pulse" : "bg-emerald-100"
                }`}>
                  {loading ? (
                    <svg className="h-6 w-6 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mb-8 rounded-[28px] border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex flex-1 gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-200">
                  <svg className="h-6 w-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">How It Works</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Submit your question with complete details including faculty, course, and academic year. Your lecturer will review and provide an official answer that may be shared with other students.
                  </p>
                </div>
              </div>

              <div className="flex flex-1 gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-200">
                  <svg className="h-6 w-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Quality Assurance</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    All answers are reviewed and verified by official lecturers. Your question and answer will be properly documented for future reference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Form Section */}
          <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <QuestionForm
              onSubmit={handleCreateMessage}
              loading={loading}
              submitLabel="Send Question"
              initialValues={{
                studentEmail: user?.email || "",
              }}
            />
          </div>

          {/* Important Notes Section */}
          <div className="mt-8 rounded-[28px] border border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-amber-900">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important Information
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-amber-800">
              <li className="flex gap-3">
                <span className="flex-shrink-0 font-semibold">•</span>
                <span>Provide clear and detailed information about your question</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 font-semibold">•</span>
                <span>Select the correct faculty and course for faster responses</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 font-semibold">•</span>
                <span>Specify the academic year and semester this question relates to</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 font-semibold">•</span>
                <span>Your answer may be published as FAQ for other students to view</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}