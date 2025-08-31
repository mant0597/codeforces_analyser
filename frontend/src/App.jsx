import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { AuthProvider } from "./context/authContext";
import Register from "./pages/Register"
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
       <Route path="/register" element={<Register/>} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
