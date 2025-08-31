import { useEffect, useState } from "react";
import API from "../api"; 
import { useAuth } from "../context/authContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

export default function Dashboard() {
  const { user } = useAuth();
  const handle = user?.codeforces_id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!handle) return;

    async function fetchData() {
      try {
        const [solved, streak, rating, analysis, difficulty, activity] =
          await Promise.all([
            API.get(`/solved/${handle}`),
            API.get(`/streak/${handle}`),
            API.get(`/rating/${handle}`),
            API.get(`/analysis/${handle}`),
            API.get(`/difficulty/${handle}`),
            API.get(`/activity/${handle}`)
          ]);

        setData({
          solved: solved.data,
          streak: streak.data,
          rating: rating.data,
          analysis: analysis.data,
          difficulty: difficulty.data,
          activity: activity.data
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [handle]);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const COLORS = ["#6366F1", "#EC4899", "#22C55E", "#FACC15", "#06B6D4", "#F97316"];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Dashboard</h1>

      <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
        <p className="text-lg">
          Welcome <span className="font-semibold">{user.email}</span>
        </p>
        <p className="text-lg">
          Codeforces Handle: <span className="font-semibold">{handle}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-indigo-500 text-white rounded-xl p-6 shadow-lg">
          <h2>Problems Solved</h2>
          <p className="text-3xl font-bold">{data.solved.solvedCount}</p>
        </div>
        <div className="bg-pink-500 text-white rounded-xl p-6 shadow-lg">
          <h2>Current Streak</h2>
          <p className="text-3xl font-bold">{data.streak.currentStreak}</p>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-6 shadow-lg">
          <h2>Longest Streak</h2>
          <p className="text-3xl font-bold">{data.streak.longestStreak}</p>
        </div>
        <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
          <h2>Active Days</h2>
          <p className="text-3xl font-bold">{data.streak.activeDaysCurrentYear}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Rating Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.rating.ratingHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contestName" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="newRating" stroke="#6366F1" />
            </LineChart>
          </ResponsiveContainer>
        </div>


        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Difficulty Breakdown</h2>
         <ResponsiveContainer width="100%" height={350}>
  <BarChart data={data.difficulty.difficulties}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="rating" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="solved" fill="#22C55E" name="Solved" />

    <Bar dataKey="attempts" fill="#3B82F6" name="Attempts" />
    <Line type="monotone" dataKey="successRate" stroke="#F59E0B" name="Success Rate" yAxisId="right" />
  </BarChart>
</ResponsiveContainer>

        </div>
      </div>
<div className="bg-white shadow-md rounded-2xl p-6 mb-6 w-full">
  <h2 className="text-xl font-bold mb-4">Daily Activity</h2>
  <div className="w-full overflow-x-auto">
    <CalendarHeatmap
      startDate={new Date(new Date().getFullYear(), 0, 1)}
      endDate={new Date()}
      values={data.activity.activity.map(a => ({
        date: a.date,
        count: a.count
      }))}
      classForValue={value => {
        if (!value) return "color-empty";
        if (value.count >= 5) return "color-scale-4";
        if (value.count >= 3) return "color-scale-3";
        if (value.count >= 2) return "color-scale-2";
        return "color-scale-1";
      }}
    />
  </div>
  <style>
    {`
      .color-empty { fill: #e5e7eb; }
      .color-scale-1 { fill: #d1fae5; }
      .color-scale-2 { fill: #6ee7b7; }
      .color-scale-3 { fill: #34d399; }
      .color-scale-4 { fill: #059669; }
      .react-calendar-heatmap { width: 100% !important; }
    `}
  </style>
</div>

      <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-20">Topic Analysis</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.analysis.topics}
                dataKey="solved"
                nameKey="topic"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {data.analysis.topics.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Tag-wise Accuracy</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Tag</th>
                <th className="p-2">Solved</th>
                <th className="p-2">Attempts</th>
                <th className="p-2">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {data.analysis.topics.map((tag, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{tag.topic}</td>
                  <td className="p-2">{tag.solved}</td>
                  <td className="p-2">{tag.attempts}</td>
                  <td className="p-2">
                    {((tag.solved / (tag.attempts || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
