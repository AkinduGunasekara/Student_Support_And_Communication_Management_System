import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/userService";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("This reset link is missing a token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword({ token, newPassword });
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 1400);
    } catch (requestError) {
      setError(requestError.message || "Unable to reset password");
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
              'linear-gradient(rgba(15, 23, 42, 0.65), rgba(29, 78, 216, 0.72)), url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Secure reset</p>
            <h1 className="mt-8 text-4xl font-bold leading-tight">Create a new password</h1>
            <p className="mt-4 max-w-sm text-sm text-blue-100">
              Choose a new password for your account after verifying the reset link from your email.
            </p>
          </div>
        </section>

        <section className="px-8 py-10">
          <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500">Enter a new password to finish recovering your account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="ui-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                minLength={6}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="ui-input"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="ui-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="ui-input"
                placeholder="Repeat the new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating password..." : "Reset password"}
            </button>

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <p className="text-center text-sm text-slate-500">
              Need a new link?{" "}
              <Link to="/forgot-password" className="font-semibold text-blue-700 hover:text-blue-800">
                Request another reset email
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};