import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Link } from "react-router-dom";
export default function Register(){
    const [form,setForm]=useState({email:"",username:"",password:"",codeforces_id:""});
    const [loading,setLoading]=useState(false);
    const [msg,setMsg]=useState(null);
    const navigate=useNavigate();
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const onSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try{
            const res=await API.post("/signup",form);
            if(res.data && res.data.success){
                setMsg({type:"success",text:"Registered Successfully, Please Login."});
                setTimeout(()=>navigate("/login"),900)
            }
            else{
                setMsg({type:"error",text:res.data || "Registration failed"});
            }
        }catch(err){
            setMsg({ type:"error", text: err?.response?.data?.message || err.message });
        }
        setLoading(false);
    };
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-300 via-purple-100 to-pink-200 flex justify-center items-center px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl mix-blend-overlay animate-pulse animation-delay-2000 translate-x-1/2 translate-y-1/2" />

      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-white/30 shadow-2xl transition-all duration-300 hover:scale-105 transform">
        <h2 className="text-3xl font-extrabold text-center text-black">Register</h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            name="codeforces_id"
            placeholder="Codeforces Handle (e.g. tourist)"
            value={form.codeforces_id}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-400 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition duration-300"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {msg && (
          <p
            className={`mt-4 text-center font-semibold ${
              msg.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {msg.text}
          </p>
        )}

        <p className="mt-6 text-center text-black/80">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
    );
}