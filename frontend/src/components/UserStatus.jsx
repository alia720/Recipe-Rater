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
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <strong>{user.name}</strong>
        </button>
        {showDropdown ? (
          <div className="absolute bg-gray-800 rounded p-4">
            <Link to="/profile" className="block mb-2 hover:underline">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>

      // <div className="text-white">
      //   Welcome,
      //   <Link to="/profile" className="ml-2 text-white hover:underline">
      //     <strong>{user.name}</strong>!
      //   </Link>
      //   <button
      //     onClick={handleLogout}
      //     className="ml-2 text-sm text-red-500"
      //   >
      //     Logout
      //   </button>
      // </div>
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
