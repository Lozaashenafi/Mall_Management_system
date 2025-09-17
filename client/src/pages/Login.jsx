import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/"); // ✅ redirect after login
    } catch (err) {
      console.error("Login failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="p-3 mb-4 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Sign In to Mall Management
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2 rounded-md border focus:ring-purple-500 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 rounded-md border focus:ring-purple-500 dark:bg-gray-700"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
