import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import loginBackground from "../assets/bgForLogin.gif";

const Login = () => {
  const { fetchUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log("Response status:", res.status, data);
      if (res.ok) {
        console.log("Login successful", data);
        await fetchUser();
        navigate("/home");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative bg-black">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${loginBackground})`,
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 30%, transparent 80%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85))",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-white text-2xl mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Login
        </button>
        <p className="mt-4 text-gray-300 text-center">
          Don't have an account? Sign up <Link to="/signup" className="text-blue-500 hover:underline">here</Link>!
        </p>
      </form>
    </div>
  );
};

export default Login;
