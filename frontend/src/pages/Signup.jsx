import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import backgroundImage from "../assets/bgForRecipe.gif";

const Signup = () => {
  const { fetchUser } = useUser();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Signup successful", data);
        await fetchUser();
        navigate("/home");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative bg-black px-4">
      {/* Background container with vignette effect */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          maskImage:
            "radial-gradient(circle at center, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 30%, transparent 80%)",
        }}
      />

      {/* Semi-transparent overlay with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85))",
        }}
      />

      {/* Welcome Text */}
      <div className="relative z-10 mb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-emerald-500 animate-pulse">
          Welcome to Recipe Rater!
        </h1>
        <p className="mt-2 text-gray-300 text-lg sm:text-xl font-light">
          🍲 A Reddit-style forum for discovering & rating amazing recipes 🍲
        </p>
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg w-full max-w-md text-left"
      >
        <h2 className="text-white text-2xl mb-4 text-center">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            required
          />
        </div>
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
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Sign Up
        </button>
        <p className="mt-4 text-gray-300 text-center">
          Have an account? Sign in{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            here
          </Link>
          !
        </p>
      </form>
    </div>
  );
};

export default Signup;
