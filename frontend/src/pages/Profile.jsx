import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { UserCircleIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, ChatBubbleBottomCenterTextIcon, BookOpenIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"; // Added icons for menu

// --- Loading Spinner Component --- (Keep as is)
const LoadingSpinner = ({ size = 'h-8 w-8' }) => (
    <svg className={`animate-spin ${size} text-blue-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Context Menu Component ---
const RecipeContextMenu = ({ position, recipeId, onClose, isVisible }) => { // Added isVisible prop
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const ellipsisIcon = document.getElementById(`ellipsis-${recipeId}`);
        if (!ellipsisIcon || !ellipsisIcon.contains(event.target)) {
          onClose();
        }
      }
    };
    if (isVisible) { // Only add listener when menu is visible
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, recipeId, isVisible]); // Depend on isVisible

  // Use isVisible to control rendering/animation classes
  const animationClasses = isVisible
      ? 'animate-scale-in' // Use the custom animation utility
      : 'opacity-0 scale-95 pointer-events-none'; // Start hidden/scaled down

  if (!position) return null; // Still need position check

  return (
      <div
          ref={menuRef}
          className={`absolute z-50 bg-gray-800 text-white rounded-lg shadow-xl py-2 w-36 border border-gray-700 transform transition-opacity transition-transform duration-150 ease-out ${animationClasses} origin-top-right`} // Added transform, origin, transition classes
          style={{ top: position.y, left: position.x }}
          onContextMenu={(e) => e.preventDefault()}
      >
        <Link
            to={`/recipe/edit/${recipeId}`}
            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue-600 rounded-t-md transition-colors duration-150 w-full text-left" // Added gap, icon
            onClick={onClose}
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit
        </Link>
        <Link
            to={`/recipe/delete/${recipeId}`}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded-b-md transition-colors duration-150 w-full text-left" // Added gap, icon
            onClick={onClose}
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </Link>
      </div>
  );
};


// --- Profile Component ---
const Profile = () => {
  // ... (state and functions remain largely the same) ...
  const { user } = useUser();
  const [userComments, setUserComments] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorRecipes, setErrorRecipes] = useState("");
  const [errorComments, setErrorComments] = useState("");
  const [menuVisibleForRecipe, setMenuVisibleForRecipe] = useState(null); // Stores ID of recipe whose menu is open
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchUserRecipes(user.user_id);
      fetchUserComments(user.user_id);
    }
  }, [user]);

  // --- Fetch functions (keep as is, or add AbortController for robustness) ---
  const fetchUserRecipes = async (userId) => {
    setLoadingRecipes(true);
    setErrorRecipes("");
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/user/${userId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `Error ${res.status}` }));
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      const recipesWithArrayCategories = data.map(r => ({
        ...r,
        categories: Array.isArray(r.categories) ? r.categories : (r.categories ? r.categories.split(',').map(c => c.trim()) : [])
      }));
      setRecipes(recipesWithArrayCategories);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setErrorRecipes(err.message);
    } finally {
      setLoadingRecipes(false);
    }
  };
  const fetchUserComments = async (userId) => {
    setLoadingComments(true);
    setErrorComments("");
    try {
      const res = await fetch(`http://localhost:5000/api/comments`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch comments (Status: ${res.status})`);
      }
      let allCommentsData = await res.json();
      const commentsArray = allCommentsData?.data ?? [];
      const filteredComments = commentsArray.filter(comment => comment.user_id === userId);
      const commentsWithTitles = await Promise.all(
          filteredComments.map(async (comment) => {
            if (comment.recipe_id) {
              try {
                const recipeRes = await fetch(`http://localhost:5000/api/recipes/${comment.recipe_id}`);
                if (recipeRes.ok) {
                  const recipeData = await recipeRes.json();
                  return { ...comment, recipeTitle: recipeData.name || 'Unknown Recipe' };
                }
              } catch (fetchErr) { console.error(`Failed to fetch title for recipe ${comment.recipe_id}`, fetchErr); }
            }
            return { ...comment, recipeTitle: comment.title || 'Recipe Title Unavailable' };
          })
      );
      setUserComments(commentsWithTitles);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setErrorComments(err.message || "Error loading comments. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  };

  const formatDate = (dateString) => {
    // ... (keep as is)
    if (!dateString) return 'Date unavailable';
    try {
      const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid date';
    }
  };
  const parseStepsPreview = (text = "") => {
    // ... (keep as is)
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.slice(0, 2).join(" ").substring(0, 100) + (lines.length > 2 || text.length > 100 ? "..." : "");
  };

  const toggleMenu = (e, recipeId) => {
    e.stopPropagation();
    if (menuVisibleForRecipe === recipeId) {
      closeMenu();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      // Adjust position slightly - may need fine-tuning
      setMenuPosition({ x: rect.left - 144 + rect.width, y: rect.bottom + 8 }); // x: menuWidth - iconWidth approx
      setMenuVisibleForRecipe(recipeId);
    }
  };
  const closeMenu = () => setMenuVisibleForRecipe(null); // Simplified close

  // --- Avatar Logic --- (Keep as is)
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

  // --- Render ---
  return (
      <div className="bg-gray-950 min-h-screen text-gray-200 p-4 md:p-8 overflow-x-hidden"> {/* Prevent horizontal scroll from animations */}

        {/* Render context menu - Use menuVisibleForRecipe to control visibility for animation */}
        <RecipeContextMenu
            position={menuPosition}
            recipeId={menuVisibleForRecipe} // Pass the ID
            onClose={closeMenu}
            isVisible={!!menuVisibleForRecipe} // Pass boolean visibility
        />

        <div className="max-w-5xl mx-auto space-y-10">

          {/* --- User Info Section --- */}
          <section aria-labelledby="user-info-heading" className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-xl shadow-lg flex flex-col items-center border border-gray-700/50 animate-fade-in"> {/* Added animation */}
            <h1 id="user-info-heading" className="sr-only">User Information</h1>
            {getAvatar()}
            {user ? (
                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
                  <p className="text-md text-blue-400">@{user.username}</p>
                </div>
            ) : (
                <p className="italic text-gray-400 mt-6">User details not available.</p>
            )}
          </section>

          {/* --- My Recipes Section --- */}
          <section aria-labelledby="recipes-heading" className="animate-fade-in" style={{ animationDelay: '150ms' }}> {/* Stagger section appearance */}
            <h2 id="recipes-heading" className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">My Recipes</h2>
            {/* Add transitions to loading/error/empty states */}
            <div className="transition-opacity duration-300 ease-in-out">
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
                    <Link to="/add-recipe" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-100"> {/* Added button animation */}
                      Add Your First Recipe
                    </Link>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add animation and delay to each card */}
                    {recipes.map((r, index) => (
                        <div
                            key={r.recipe_id}
                            className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300 ease-out flex flex-col group transform hover:-translate-y-1 animate-fade-in-up" // Enhanced hover, added animation
                            style={{ animationDelay: `${index * 100}ms` }} // Staggered delay
                        >
                          <button
                              id={`ellipsis-${r.recipe_id}`}
                              type="button"
                              aria-label={`Actions for ${r.name}`}
                              className="absolute top-3 right-3 text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
                              onClick={(e) => toggleMenu(e, r.recipe_id)}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>

                          {/* Card Content */}
                          <div className="flex-grow">
                            {r.main_photo ? (
                                <img src={r.main_photo} alt={`${r.name}`} className="mb-3 w-full h-40 object-cover rounded-md transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" /> // Subtle image zoom on hover
                            ) : (
                                <div className="mb-3 w-full h-40 bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                                  <BookOpenIcon className="h-10 w-10"/>
                                </div>
                            )}
                            <h3 className="text-lg font-semibold mb-1.5 text-white truncate pr-6 group-hover:text-blue-300 transition-colors duration-200" title={r.name}>{r.name}</h3> {/* Color change on hover */}

                            {r.categories && r.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {r.categories.slice(0, 3).map((cat, index) => (
                                      <span key={index} className="inline-block bg-gradient-to-r from-blue-900/60 to-purple-900/60 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full transition-transform hover:scale-105"> {/* Scale pill on hover */}
                                        {cat}
                                                        </span>
                                  ))}
                                  {r.categories.length > 3 && <span className="text-xs text-gray-400 self-center">+{r.categories.length - 3} more</span>}
                                </div>
                            )}
                            <p className="text-sm text-gray-400 max-h-20 overflow-hidden">
                              {parseStepsPreview(r.steps)}
                            </p>
                          </div>
                          <Link to={`/recipe/${r.recipe_id}`} className="block mt-3 text-sm text-blue-400 hover:text-blue-300 self-start transition-transform duration-200 hover:translate-x-1 active:scale-95"> {/* Link animation */}
                            View Recipe &rarr;
                          </Link>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </section>

          {/* --- My Comments Section --- */}
          <section aria-labelledby="comments-heading" className="animate-fade-in" style={{ animationDelay: '300ms' }}> {/* Stagger section appearance */}
            <h2 id="comments-heading" className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">My Comments</h2>
            <div className="transition-opacity duration-300 ease-in-out">
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
                    {/* Add animation and delay to each comment */}
                    {userComments.map((comment, index) => (
                        <li key={comment.comment_id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:border-gray-600 animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}> {/* Subtle hover, animation */}
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