import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { UserCircleIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";

// Context Menu Component
const RecipeContextMenu = ({ position, recipeId, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!position) return null;
  return (
      <div
          ref={menuRef}
          className="absolute z-50 bg-gray-700 text-white rounded-md shadow-lg py-1 w-32"
          style={{ top: position.y, left: position.x }}
          onContextMenu={(e) => e.preventDefault()}
      >
        <Link
            to={`/recipe/edit/${recipeId}`}
            className="block px-4 py-2 text-sm hover:bg-blue-600 transition-colors duration-150"
            onClick={onClose}
        >
          Edit
        </Link>
        <Link
            to={`/recipe/delete/${recipeId}`}
            className="block px-4 py-2 text-sm text-red-400 hover:bg-red-600 transition-colors duration-150"
            onClick={onClose}
        >
          Delete
        </Link>
      </div>
  );
};

const Profile = () => {
  const { user } = useUser();
    const [userComments, setUserComments] = useState([]);
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [activeRecipeId, setActiveRecipeId] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchUserRecipes(user.user_id);
            fetchUserComments(user.user_id);

    }
  }, [user]);

  const fetchUserRecipes = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/user/${userId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }
      setRecipes(await res.json());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserComments = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch comments (Status: ${res.status})`
        );
      }

      const data = (await res.json()).data.filter(
        (comment) => comment.user_id === userId
      );
      setUserComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Error loading comments. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const parseSteps = (text = "") =>
      text.split("\n").map(l => l.trim()).filter(Boolean).map((line, i) => (
          <p key={i} className="text-gray-300 mb-1">{line}</p>
      ));

  const openMenu = (e, recipeId) => {
    e.stopPropagation();
    const { top, left } = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: left, y: top + 24 });
    setActiveRecipeId(recipeId);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setActiveRecipeId(null);
  };

  const getAvatar = () => {
    if (user?.avatarUrl) {
      return <img src={user.avatarUrl} alt="avatar" className="h-20 w-20 rounded-full" />;
    }
    if (user?.name) {
      const initials = user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
      return <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">{initials}</div>;
    }
    return <UserCircleIcon className="h-20 w-20 text-gray-400" />;
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      {menuVisible && activeRecipeId && (
        <RecipeContextMenu
          position={menuPosition}
          recipeId={activeRecipeId}
          onClose={closeMenu}
        />
      )}
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-gray-900 p-6 rounded-lg mb-8 max-w-4xl mx-auto flex flex-col items-center">
        {getAvatar()}
        <h2 className="text-2xl mt-4">User Information</h2>
        {user ? (
          <div className="mt-2 text-gray-300">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
          </div>
        ) : (
          <p className="italic text-gray-400">User details not available.</p>
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl mx-auto">
        <h2 className="text-2xl mb-4">My Recipes</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-blue-400"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="ml-3">Loading your recipes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900 p-4 rounded text-red-100">
            Oops! {error}
          </div>
        ) : recipes.length === 0 ? (
          <p className="italic text-gray-400 text-center py-8">
            You haven't added any recipes yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <div
                key={r.recipe_id}
                className="relative bg-gray-800 p-4 rounded-lg hover:shadow-lg"
              >
                <EllipsisVerticalIcon
                  className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer absolute top-2 right-2"
                  onClick={(e) => openMenu(e, r.recipe_id)}
                />
                <h3 className="text-lg font-bold mb-2 truncate">{r.name}</h3>
                {r.main_photo && (
                  <img
                    src={r.main_photo}
                    alt={r.name}
                    className="mb-2 w-full h-32 object-cover rounded"
                  />
                )}
                <div>
                  <pre className="whitespace-pre-wrap font-sans text-gray-300">
                    Categories:{" "}
                    {r.categories && r.categories.length > 0
                      ? r.categories.join(", ")
                      : "Not specified"}
                  </pre>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2 text-gray-300">
                  {parseSteps(r.steps)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* user comments section */}
      <div className="bg-gray-900 p-5 md:p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mt-8">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
          My Comments
        </h2>
        {loading && (
          <div className="flex items-center justify-center space-x-3 text-gray-300 py-8">
            {/* SVG Spinner */}
            <svg
              className="animate-spin h-6 w-6 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-lg">Loading your comments...</p>
          </div>
        )}
        {error && !loading && (
          <div
            className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative text-center"
            role="alert"
          >
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {!loading && !error && userComments.length === 0 && (
          <p className="text-gray-400 italic text-center py-8">
            You haven't added any comments yet.
          </p>
        )}
        {!loading && !error && userComments.length > 0 && (
          <ul className="space-y-4">
            {userComments.map((comment) => (
              <li key={comment.comment_id} className="bg-gray-700 p-3 rounded">
                {comment.title && (
                  <h4 className="font-medium text-blue-300">{comment.title}</h4>
                )}
                <p className="text-white mb-2">{comment.text}</p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>By: {comment.username || "Anonymous"}</span>
                  {comment.created_at && (
                    <span>{formatDate(comment.created_at)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
