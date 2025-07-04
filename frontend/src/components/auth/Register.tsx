import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("data", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <form 
        onSubmit={handleRegister} 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-6 border border-orange-100"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-800">Create Account</h2>
          <p className="text-neutral-600 mt-2">
            Join us to get started
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              className="w-full border border-orange-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="w-full border border-orange-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-orange-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-md"
        >
          Create Account
        </button>
        
        <div className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <a 
            href="/login" 
            className="font-medium text-orange-600 hover:text-orange-800 hover:underline transition-colors"
          >
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}