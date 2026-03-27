import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Login failed");
        return;
      }

      const data = await response.json();
      login(data);

      if (data.user.role === "student") {
        navigate("/events");
      } else if (data.user.role === "lecturer") {
        navigate("/events");
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (user) {
    if (user.role === "student")
      return <Navigate to="/events" replace />;
    if (user.role === "lecturer")
      return <Navigate to="/events" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 text-white">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-100">Academic Atelier</p>
          <h1 className="mt-8 text-4xl font-bold leading-tight">Student Support Portal</h1>
          <p className="mt-4 max-w-sm text-sm text-blue-100">
            Access tickets, official messaging, and personalized academic support in one modern workspace.
          </p>
        </section>

        <section className="px-8 py-10">
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-slate-500">Use your university credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="ui-label">Email or Student ID</label>
              <input
                type="text"
                name="identifier"
                required
                className="ui-input"
                placeholder="name@university.edu"
              />
            </div>

            <div>
              <label className="ui-label">Password</label>
              <input type="password" name="password" required className="ui-input" />
            </div>

            <button type="submit" className="btn-primary mt-2 w-full px-4 py-3">
              Sign In
            </button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">
                Create one
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};
