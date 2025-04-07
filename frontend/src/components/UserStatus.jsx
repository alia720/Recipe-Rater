// frontend/src/components/UserStatus.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const UserStatus = () => {
  const { user, fetchUser } = useUser();

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    fetchUser();
  };

  if (user) {
    return (
      <div className="text-white">
        Welcome, <strong>{user.name}</strong>!
        <button
          onClick={handleLogout}
          className="ml-2 text-sm text-red-500"
        >
          Logout
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex gap-2">
        <Link to="/login" className="text-white hover:underline">
          Sign In
        </Link>
        <Link to="/signup" className="text-white hover:underline">
          Sign Up
        </Link>
      </div>
    );
  }
};

export default UserStatus;