import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-300 via-purple-100 to-pink-200 overflow-hidden flex flex-col justify-center items-center px-4">
      <div className="absolute top-0 left-0 w-120 h-120 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-120 h-120 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse animation-delay-2000 translate-x-1/2 translate-y-1/2" />
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-8 border border-white/30 shadow-2xl transition-all duration-300 hover:scale-105 transform">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-black">Codeforces Visualizer</h1>
          <p className="mt-4 text-black/90 font-semibold max-w-lg">
            Unlock your competitive programming potential. Sign up with your handle and analyze your Codeforces activity with stunning visualizations.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/login">
              <button className="relative overflow-hidden px-8 py-3 rounded-full text-black bg-blue-200 transition-colors duration-300 hover:bg-blue-400 font-semibold shadow-lg">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="relative overflow-hidden px-8 py-3 rounded-full text-black bg-purple-200 transition-colors duration-300 hover:bg-purple-400 font-semibold shadow-lg">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}