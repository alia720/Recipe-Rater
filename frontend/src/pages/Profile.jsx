import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  UserCircleIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

// --- Loading Spinner Component ---
const LoadingSpinner = ({ size = 'h-8 w-8' }) => (
    <svg className={`animate-spin ${size} text-blue-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Recipe Context Menu Component ---
// Positioned relative to its parent (the recipe card) using Tailwind classes
const RecipeContextMenu = ({ recipeId, onClose, isVisible }) => {
  const menuRef = useRef(null);

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click target exists and is outside the menu element
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Additionally, check if the click was on the specific trigger button for this menu instance.
        // This prevents closing if the user clicks the button again (toggle logic handles that)
        // or clicks another recipe's button (which should open a new menu).
        const triggerButton = document.getElementById(`ellipsis-${recipeId}`);
        if (!triggerButton || !triggerButton.contains(event.target)) {
          onClose(); // Call the close handler passed from Profile
        }
      }
    };

    // Add listener only when the menu is visible
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Remove listener immediately if menu becomes invisible
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove listener on unmount or when dependencies change
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose, recipeId]); // Dependencies for the effect

  // CSS classes for visibility and animation
  const animationClasses = isVisible
      ? 'opacity-100 scale-100' // Visible state
      : 'opacity-0 scale-95 pointer-events-none'; // Hidden state

  return (
      <div
          ref={menuRef}
          // Positioning: Absolute relative to parent card.
          // `top-8 right-3 mt-1` aims to place it below the ellipsis button (adjust as needed).
          // `z-20` ensures it's above other card content.
          className={`absolute top-8 right-3 mt-1 z-20 bg-gray-800 text-white rounded-lg shadow-xl py-2 w-36 border border-gray-700 transform transition-all duration-150 ease-out ${animationClasses} origin-top-right`}
          // Prevent browser context menu on right-click
          onContextMenu={(e) => e.preventDefault()}
      >
        {/* Edit Link */}
        <Link
            to={`/recipe/edit/${recipeId}`}
            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue-600 rounded-t-md transition-colors duration-150 w-full text-left"
            onClick={onClose} // Close menu when link is clicked
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit
        </Link>
        {/* Delete Link */}
        <Link
            to={`/recipe/delete/${recipeId}`} // Consider using a modal confirmation instead of direct link for delete
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded-b-md transition-colors duration-150 w-full text-left"
            onClick={onClose} // Close menu when link is clicked
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </Link>
      </div>
  );
};


// --- Profile Component ---
const Profile = () => {
  const { user } = useUser(); // Get user data from context
  const [userComments, setUserComments] = useState([]); // State for user's comments
  const [recipes, setRecipes] = useState([]); // State for user's recipes
  const [loadingRecipes, setLoadingRecipes] = useState(false); // Loading state for recipes
  const [loadingComments, setLoadingComments] = useState(false); // Loading state for comments
  const [errorRecipes, setErrorRecipes] = useState(""); // Error state for recipes
  const [errorComments, setErrorComments] = useState(""); // Error state for comments
  // State to track which recipe's menu is currently visible (using recipe_id)
  const [menuVisibleForRecipe, setMenuVisibleForRecipe] = useState(null);

  // Effect to fetch data when the user ID becomes available or changes
  useEffect(() => {
    if (user?.user_id) {
      // Use AbortController for fetch cleanup on component unmount or user change
      const controller = new AbortController();
      const signal = controller.signal;

      fetchUserRecipes(user.user_id, signal);
      fetchUserComments(user.user_id, signal);

      // Cleanup function: Abort pending fetches
      return () => {
        controller.abort();
      };
    } else {
      // Clear data if user logs out or context is not yet loaded
      setRecipes([]);
      setUserComments([]);
      setErrorRecipes("");
      setErrorComments("");
    }
  }, [user]); // Dependency array: Re-run effect if `user` object changes

  // --- Data Fetching Functions ---

  // Fetch recipes created by the user
  const fetchUserRecipes = async (userId, signal) => {
    setLoadingRecipes(true);
    setErrorRecipes("");
    setRecipes([]); // Clear existing recipes before fetching
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/user/${userId}`, { signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP Error ${res.status}` }));
        throw new Error(err.message || `HTTP Error ${res.status}`);
      }
      const data = await res.json();
      // Process categories to ensure they are arrays
      const recipesWithArrayCategories = data.map(r => ({
        ...r,
        categories: Array.isArray(r.categories)
            ? r.categories
            : (r.categories ? r.categories.split(',').map(c => c.trim()) : [])
      }));
      // Check if the fetch was aborted before setting state
      if (!signal.aborted) {
        setRecipes(recipesWithArrayCategories);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Recipe fetch aborted.');
      } else {
        console.error("Error fetching recipes:", err);
        setErrorRecipes(err.message || "Could not load recipes.");
      }
    } finally {
      // Check if aborted before setting loading state (optional, depends on desired UI behavior)
      if (!signal?.aborted) {
        setLoadingRecipes(false);
      }
    }
  };

  // Fetch comments made by the user (requires fetching all and filtering, then getting titles)
  const fetchUserComments = async (userId, signal) => {
    setLoadingComments(true);
    setErrorComments("");
    setUserComments([]); // Clear existing comments
    try {
      // Adjust API endpoint if filtering server-side is possible
      const res = await fetch(`http://localhost:5000/api/comments`, { signal });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch comments (Status: ${res.status})`);
      }
      let allCommentsData = await res.json();
      const commentsArray = allCommentsData?.data ?? []; // Ensure data is an array
      const filteredComments = commentsArray.filter(comment => comment.user_id === userId);

      // Fetch recipe titles for each comment
      const commentsWithTitles = await Promise.all(
          filteredComments.map(async (comment) => {
            if (signal.aborted) throw new Error('AbortError'); // Check for abort within map
            if (comment.recipe_id) {
              try {
                const recipeRes = await fetch(`http://localhost:5000/api/recipes/${comment.recipe_id}`, { signal });
                if (recipeRes.ok) {
                  const recipeData = await recipeRes.json();
                  return { ...comment, recipeTitle: recipeData.name || 'Unknown Recipe' };
                }
                return { ...comment, recipeTitle: 'Recipe Title Unavailable' }; // Handle recipe fetch failure
              } catch (fetchErr) {
                if (fetchErr.name === 'AbortError') throw fetchErr;
                console.error(`Failed to fetch title for recipe ${comment.recipe_id}`, fetchErr);
                return { ...comment, recipeTitle: 'Recipe Title Unavailable' };
              }
            }
            return { ...comment, recipeTitle: comment.title || 'Recipe Title Unavailable' }; // Fallback
          })
      );
      // Check if aborted before setting state
      if (!signal.aborted) {
        setUserComments(commentsWithTitles);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Comment fetch aborted.');
      } else {
        console.error("Error fetching comments:", err);
        setErrorComments(err.message || "Error loading comments.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoadingComments(false);
      }
    }
  };

  // --- Utility Functions ---

  // Format date string for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid date';
    }
  };

  // Create a short preview from recipe steps
  const parseStepsPreview = (text = "") => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const preview = lines.slice(0, 2).join(" ");
    if (preview.length > 100 || lines.length > 2) {
      return preview.substring(0, 100) + "...";
    }
    return preview || "No steps preview available.";
  };

  // Determine user avatar (URL, initials, or fallback icon)
  const getAvatar = () => {
    const commonClasses = "h-24 w-24 rounded-full ring-4 ring-offset-4 ring-offset-gray-900";
    if (user?.avatarUrl) {
      return <img src={user.avatarUrl} alt={`${user.name || 'User'}'s avatar`} className={`${commonClasses} object-cover`} />;
    }
    if (user?.name) {
      const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const hashCode = (str) => str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600', 'bg-yellow-600', 'bg-indigo-600'];
      const colorClass = colors[Math.abs(hashCode(initials)) % colors.length];
      return <div className={`${commonClasses} ${colorClass} flex items-center justify-center text-white text-3xl font-semibold`}>{initials}</div>;
    }
    return <UserCircleIcon className={`${commonClasses} text-gray-500`} />;
  };

  // --- Event Handlers ---

  // Toggle context menu visibility for a specific recipe ID
  const toggleMenu = (e, recipeId) => {
    e.stopPropagation(); // Stop click from bubbling up
    // If the clicked menu is already open, set to null (close). Otherwise, set to the clicked recipeId (open).
    setMenuVisibleForRecipe(currentId => (currentId === recipeId ? null : recipeId));
  };

  // Close any currently open context menu
  const closeMenu = () => {
    setMenuVisibleForRecipe(null);
  };

  // --- Render Component JSX ---
  return (
      <div className="bg-gray-950 min-h-screen text-gray-200 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* User Information Section */}
          <section aria-labelledby="user-info-heading" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-xl shadow-lg flex flex-col items-center border border-gray-700/50 animate-fade-in">
            <h1 id="user-info-heading" className="sr-only">User Information</h1>
            {getAvatar()}
            {user ? (
                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-semibold text-white">{user.name || 'User Name'}</h2>
                  <p className="text-md text-blue-400">@{user.username || 'username'}</p>
                </div>
            ) : (
                <p className="italic text-gray-400 mt-6">Loading user details...</p>
            )}
          </section>

          {/* User Recipes Section */}
          <section aria-labelledby="recipes-heading" className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <h2 id="recipes-heading" className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">My Recipes</h2>
            <div className="transition-opacity duration-300 ease-in-out min-h-[200px]"> {/* Added min-height */}
              {loadingRecipes ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-fade-in">
                    <LoadingSpinner />
                    <p className="mt-3">Loading your recipes...</p>
                  </div>
              ) : errorRecipes ? (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-5 py-4 rounded-lg text-center flex items-center justify-center gap-3 animate-fade-in">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <span>Oops! Could not load recipes: {errorRecipes}</span>
                  </div>
              ) : recipes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 flex flex-col items-center animate-fade-in">
                    <BookOpenIcon className="h-12 w-12 mb-3"/>
                    <p className="text-lg">You haven't added any recipes yet.</p>
                    <Link to="/add-recipe" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-100">
                      Add Your First Recipe
                    </Link>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((r, index) => (
                        // Recipe Card Container - Make it relative for context menu positioning
                        <div
                            key={r.recipe_id}
                            className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300 ease-out flex flex-col group transform hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Ellipsis Button - Triggers the menu */}
                          <button
                              id={`ellipsis-${r.recipe_id}`} // ID used by menu's click-outside logic
                              type="button"
                              aria-label={`Actions for ${r.name}`}
                              className="absolute top-3 right-3 text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
                              onClick={(e) => toggleMenu(e, r.recipe_id)}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>

                          {/* Context Menu - Rendered inside the card */}
                          <RecipeContextMenu
                              recipeId={r.recipe_id}
                              onClose={closeMenu}
                              isVisible={menuVisibleForRecipe === r.recipe_id} // Show only if ID matches state
                          />

                          {/* Card Content */}
                          <div className="flex-grow">
                            {r.main_photo ? (
                                <img src={r.main_photo} alt={r.name || 'Recipe image'} className="mb-3 w-full h-40 object-cover rounded-md transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                            ) : (
                                <div className="mb-3 w-full h-40 bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                                  <BookOpenIcon className="h-10 w-10"/>
                                </div>
                            )}
                            <h3 className="text-lg font-semibold mb-1.5 text-white truncate pr-6 group-hover:text-blue-300 transition-colors duration-200" title={r.name}>{r.name}</h3>
                            {r.categories && r.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {r.categories.slice(0, 3).map((cat, idx) => (
                                      <span key={idx} className="inline-block bg-gradient-to-r from-blue-900/60 to-purple-900/60 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full transition-transform hover:scale-105">{cat}</span>
                                  ))}
                                  {r.categories.length > 3 && <span className="text-xs text-gray-400 self-center">+{r.categories.length - 3} more</span>}
                                </div>
                            )}
                            <p className="text-sm text-gray-400 max-h-20 overflow-hidden">
                              {parseStepsPreview(r.steps)}
                            </p>
                          </div>
                          <Link to={`/recipe/${r.recipe_id}`} className="block mt-3 text-sm text-blue-400 hover:text-blue-300 self-start transition-transform duration-200 hover:translate-x-1 active:scale-95">
                            View Recipe &rarr;
                          </Link>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </section>

          {/* User Comments Section */}
          <section aria-labelledby="comments-heading" className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 id="comments-heading" className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">My Comments</h2>
            <div className="transition-opacity duration-300 ease-in-out min-h-[150px]"> {/* Added min-height */}
              {loadingComments ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-fade-in">
                    <LoadingSpinner />
                    <p className="mt-3">Loading your comments...</p>
                  </div>
              ) : errorComments ? (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-5 py-4 rounded-lg text-center flex items-center justify-center gap-3 animate-fade-in">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <span>Oops! Could not load comments: {errorComments}</span>
                  </div>
              ) : userComments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 flex flex-col items-center animate-fade-in">
                    <ChatBubbleBottomCenterTextIcon className="h-12 w-12 mb-3"/>
                    <p className="text-lg">You haven't added any comments yet.</p>
                    <p className="text-sm mt-1">Join the conversation on recipe pages!</p>
                  </div>
              ) : (
                  <ul className="space-y-5">
                    {userComments.map((comment, index) => (
                        <li key={comment.comment_id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:border-gray-600 animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
                          {comment.recipe_id && (
                              <Link to={`/recipe/${comment.recipe_id}`} className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline mb-1 block truncate transition-colors duration-150" title={`Comment on: ${comment.recipeTitle}`}>
                                On: {comment.recipeTitle || 'Recipe...'}
                              </Link>
                          )}
                          <p className="text-gray-200 mb-2">{comment.text}</p>
                          <div className="flex justify-end items-center text-xs text-gray-400 border-t border-gray-700 pt-2 mt-2">
                            {comment.created_at && (
                                <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                            )}
                          </div>
                        </li>
                    ))}
                  </ul>
              )}
            </div>
          </section>

        </div> {/* End max-w container */}
      </div> // End main background div
  );
};

export default Profile;