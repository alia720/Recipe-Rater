import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Profile = () => {
  const { user } = useUser();

  return (
    <div className="p-4 bg-black min-h-screen">
      <h1 className="text-2xl text-white mb-4">Profile</h1>
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
        <h2 className="text-xl text-white mb-4">User Information</h2>
        <p className="text-gray-300">Name: {user.name}</p>
        <p className="text-gray-300">Username: {user.username}</p>
      </div>
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-2xl mt-6">
        <h2 className="text-xl text-white mb-4">My Recipes</h2>
        {/* get user's recipes here (???)*/}
      </div>
    </div>
  )
}

export default Profile;