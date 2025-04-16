import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { Link, useNavigate } from "react-router-dom"; // Added Link and useNavigate
import { useUser } from "../context/UserContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";

// --- Context Menu Component ---
// (Can be defined outside or inside Profile component)
const RecipeContextMenu = ({ position, recipeId, onClose }) => {
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    // Add listener on mount
    document.addEventListener("mousedown", handleClickOutside);
    // Remove listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-gray-700 text-white rounded-md shadow-lg py-1 w-32"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      // Prevent context menu on the menu itself
      onContextMenu={(e) => e.preventDefault()}
    >
      <Link
        to={`/recipe/edit/${recipeId}`}
        className="block px-4 py-2 text-sm hover:bg-blue-600 hover:text-white transition-colors duration-150"
        onClick={onClose} // Close menu on link click
      >
        Edit
      </Link>
      <Link
        to={`/recipe/delete/${recipeId}`}
        className="block px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-150"
        onClick={onClose} // Close menu on link click
      >
        Delete
      </Link>
    </div>
  );
};

const Profile = () => {
  const { user } = useUser();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Context Menu State ---
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  // --- End Context Menu State ---

  const navigate = useNavigate(); // Added for potential future use

  useEffect(() => {
    if (user && user.user_id) {
      fetchUserRecipes(user.user_id);
    } else if (!user) {
      console.log("Waiting for user data...");
    }
  }, [user]);

  // Close context menu if user changes or component unmounts
  useEffect(() => {
    return () => {
      setContextMenuVisible(false);
    };
  }, [user]);

  const fetchUserRecipes = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/recipes/user/${userId}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch recipes (Status: ${res.status})`
        );
      }
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError(err.message || "Error loading recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseSteps = (stepsText = "") => {
    return stepsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line, idx) => (
        <p key={idx} className="text-gray-300 mb-1">
          {line}
        </p>
      ));
  };

  // --- Context Menu Handler ---
  const handleContextMenu = (event, recipeId) => {
    event.preventDefault(); // Prevent native context menu
    setContextMenuVisible(true);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setSelectedRecipeId(recipeId);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setContextMenuPosition(null);
    setSelectedRecipeId(null);
  };
  // --- End Context Menu Handler ---
  // Helper to get initials or use avatar
  const getAvatarContent = () => {
    // Check if user object has an avatar URL (adjust property name if needed)
    if (user?.avatarUrl) {
      return (
        <div className="absolute -top-20 left-0 right-0 flex items-center justify-center">
          <img
            src={user.avatarUrl}
            alt={user.name || "User Avatar"}
            className="h-20 w-20 rounded-full object-cover"
          />
        </div>
      );
    }
    // Generate initials from name
    if (user?.name) {
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      return (
        <div className="absolute -top-20 left-0 right-0 flex items-center justify-center">
          <span className="flex items-center justify-center h-40 w-40 rounded-full bg-blue-600 text-8xl font-semibold text-white">
            {initials}
          </span>
        </div>
      );
    }
    // Fallback icon if no name or avatar
    return (
      <div className="absolute -top-20 left-0 right-0 flex items-center justify-center">
        <UserCircleIcon className="h-40 w-40 text-gray-400" />
      </div>
    )
  };

  return (
    <div
      className="p-4 md:p-6 bg-black min-h-screen text-white relative top-20" /* Added relative for absolute positioning context */
    >
      {/* Conditionally render the context menu */}
      {contextMenuVisible && selectedRecipeId && (
        <RecipeContextMenu
          position={contextMenuPosition}
          recipeId={selectedRecipeId}
          onClose={closeContextMenu}
        />
      )}

      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">
        Profile
      </h1> 

      {/* User Info Section */}
      <div className="bg-gray-900 p-5 md:p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto mb-8 relative">
        {getAvatarContent()}
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 pt-20">
          User Information
        </h2>
        {user ? (
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-medium text-gray-100">Name:</span>{" "}
              {user.name}
            </p>
            <p>
              <span className="font-medium text-gray-100">Username:</span>{" "}
              {user.username}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 italic">User details not available.</p>
        )}
      </div>

      {/* My Recipes Section */}
      <div className="bg-gray-900 p-5 md:p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
          My Recipes
        </h2>

        {/* Loading Indicator */}
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
            <p className="text-lg">Loading your recipes...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div
            className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative text-center"
            role="alert"
          >
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* No Recipes Found */}
        {!loading && !error && recipes.length === 0 && (
          <p className="text-gray-400 italic text-center py-8">
            You haven't added any recipes yet.
          </p>
        )}

        {/* Recipe Grid */}
        {!loading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.recipe_id}
                className="bg-gray-800 p-4 rounded-lg border border-transparent transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-900/30 hover:border-blue-500 cursor-default" // Added cursor-default
                // --- Add context menu trigger ---
                onContextMenu={(e) => handleContextMenu(e, recipe.recipe_id)}
              >
                <h3
                  className="text-white text-lg font-bold mb-3 truncate pointer-events-none"
                  title={recipe.name} /* Added pointer-events-none */
                >
                  {recipe.name}
                </h3>

                {recipe.main_photo && (
                  <div
                    className="mb-3 aspect-video overflow-hidden rounded pointer-events-none" /* Added pointer-events-none */
                  >
                    <img
                      src={recipe.main_photo}
                      alt={`${recipe.name}`}
                      className="w-full h-full object-cover transition-transform duration-300" // Removed group-hover effect as it might interfere
                      loading="lazy"
                    />
                  </div>
                )}

                <div
                  className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 pointer-events-none" /* Added pointer-events-none */
                >
                  {parseSteps(recipe.steps)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
