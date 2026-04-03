import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const LoginPage = () => {
  const { login, user, loading } = useAuth();
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

      // ✅ ALWAYS go to landing page
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // ⏳ wait until auth loads
  if (loading) return null;

  // ✅ if already logged in → go to landing page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">

        {/* LEFT */}
        <section 
          className="relative px-8 py-10 text-white overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(29,78,216,0.7), rgba(37,99,235,0.7)), url("https://images.unsplash.com/photo-1752920299180-e8fd9276c202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080")',
          }}
        >
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.16em] text-blue-100">
              Academic Atelier
            </p>

            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Student Support Portal
            </h1>

            <p className="mt-4 max-w-sm text-sm text-blue-100">
              Access tickets, messaging, and academic support in one place.
            </p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="px-8 py-10">
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use your university credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            <div>
              <label className="ui-label">Email or Student ID</label>
              <input
                type="text"
                name="identifier"
                required
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="ui-input"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button className="btn-primary w-full py-3">
              Sign In
            </button>

            <p className="text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-700 font-semibold">
                Create one
              </Link>
            </p>

          </form>
        </section>
      </div>
    </div>
  );
};