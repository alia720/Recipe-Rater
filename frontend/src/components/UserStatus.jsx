// frontend/src/components/UserStatus.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const UserStatus = () => {
  const { user, fetchUser } = useUser();
  const [showDropdown, setShowDropdown] = React.useState(false);

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
        Welcome,
        <button
          className="ml-2"
          id="user-button"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <strong>{user.name}</strong>
          {showDropdown ? (
            <div className="absolute bg-gray-800 rounded-md shadow-lg p-2 right-2">
              <Link to="/profile" className="block mb-2 hover:underline">
                Profile
              </Link>
              <Link
                to="/signup"
                className="block mb-2 hover:underline text-red-500"
                onClick={handleLogout}
              >
                Sign out
              </Link>
            </div>
          ) : null}
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
