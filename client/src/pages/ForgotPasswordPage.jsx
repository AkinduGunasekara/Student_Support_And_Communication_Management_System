import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/userService";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || "Reset instructions have been sent if the account exists.");
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <section
          className="relative overflow-hidden bg-cover bg-center px-8 py-10 text-white"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15, 23, 42, 0.65), rgba(37, 99, 235, 0.7)), url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Account recovery</p>
            <h1 className="mt-8 text-4xl font-bold leading-tight">Reset access to your account</h1>
            <p className="mt-4 max-w-sm text-sm text-blue-100">
              Enter your email address and we will send a password reset link if the account exists.
            </p>
          </div>
        </section>

        <section className="px-8 py-10">
          <h2 className="text-3xl font-bold text-slate-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500">We will email a secure link to reset your password.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="ui-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ui-input"
                placeholder="name@university.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending link..." : "Send reset link"}
            </button>

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </div>
            )}

            {resetUrl && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Local dev reset link:{" "}
                <a href={resetUrl} className="break-all font-semibold underline">
                  {resetUrl}
                </a>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <p className="text-center text-sm text-slate-500">
              Remembered it?{" "}
              <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                Back to sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};