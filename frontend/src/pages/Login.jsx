import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { setAuthToken } from "../api"; // import setAuthToken
import { useAuth } from "../context/authContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await API.post("/signin", form);

      if (res.data && res.data.success) {
        console.log(res.data);

        // Save user and token in context
        login(res.data.user, res.data.token);

        // Set token globally for Axios
        setAuthToken(res.data.token);

        setMsg({ type: "success", text: "Logged in successfully!" });
        setTimeout(() => navigate("/dashboard"), 900);
      } else {
        setMsg({ type: "error", text: res.data?.message || "Login failed" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || err.message });
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-300 via-purple-100 to-pink-200 flex justify-center items-center px-4">
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse animation-delay-2000 translate-x-1/2 translate-y-1/2" />
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-8 border border-white/30 shadow-2xl w-full max-w-md transition-all duration-300 hover:scale-105 transform">
        <h2 className="text-3xl font-extrabold text-center text-black">Login</h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-400 text-black font-semibold shadow-lg hover:bg-indigo-500 transition-colors duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {msg && (
          <p
            className={`mt-4 text-center font-medium ${
              msg.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {msg.text}
          </p>
        )}

        <p className="mt-6 text-center text-black/80">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
