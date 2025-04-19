import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import VoteButton from "./VoteButton";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { PhotoIcon } from "@heroicons/react/24/outline"; // Added PhotoIcon for placeholder

const RecipeCard = ({ recipe }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const isOwnerOrAdmin = user && (user.role === 'admin' || user.user_id === recipe.user_id);
  const photoSrc = recipe.main_photo &&
      (recipe.main_photo.startsWith('http')
          ? recipe.main_photo
          : `http://localhost:5000/uploads/${recipe.main_photo}`);

  // Fetch categories for this recipe if they're not already included
  useEffect(() => {
    // First check if categories already exist in the recipe object
    if (recipe.categories && (Array.isArray(recipe.categories) ? recipe.categories.length > 0 : recipe.categories.trim() !== '')) {
      const processedCategories = Array.isArray(recipe.categories) 
        ? recipe.categories 
        : recipe.categories.split(',').map(c => c.trim());
      setCategories(processedCategories);
      return;
    }
    
    // If not, fetch them from the API
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${recipe.recipe_id}`);
        if (response.ok) {
          const data = await response.json();
          // Process categories from the fetched data
          const fetchedCategories = Array.isArray(data.categories) 
            ? data.categories 
            : (data.categories ? data.categories.split(',').map(c => c.trim()) : []);
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Error fetching recipe categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [recipe]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete recipe "${recipe.name}"?`)) return;
    navigate(`/recipe/delete/${recipe.recipe_id}`);
  };

  return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-102 transition-all duration-300 relative flex flex-col h-full">
        {isOwnerOrAdmin && (
            <div className="absolute top-2 right-2 z-10" ref={menuRef}>
              <EllipsisVerticalIcon
                  className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuVisible(v => !v);
                  }}
              />
              {menuVisible && (
                  <div className="absolute right-0 mt-2 bg-gray-700 text-white rounded shadow-lg py-1 w-32 z-20">
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-blue-600"
                        onClick={() => navigate(`/recipe/edit/${recipe.recipe_id}`)}
                    >
                      Edit
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-600"
                        onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
              )}
            </div>
        )}
        
        {/* Image area - show placeholder if no image */}
        <div className="h-48 bg-gray-700 overflow-hidden">
          {recipe.main_photo ? (
            <img
                src={recipe.main_photo}
                alt={recipe.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={e => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentNode.querySelector('.image-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
            />
          ) : (
            <div className="image-placeholder flex items-center justify-center h-full w-full bg-gray-700">
              <PhotoIcon className="h-16 w-16 text-gray-500" />
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          {/* Categories display */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat, index) => (
                <span key={index} className="inline-block bg-gradient-to-r from-blue-900/70 to-purple-900/70 text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  {cat}
                </span>
              ))}
            </div>
          )}
          {/* Loading indicator for categories */}
          {loadingCategories && (
            <div className="text-gray-400 text-xs mb-2">
              Loading categories...
            </div>
          )}
          <div className="flex flex-grow">
            <VoteButton recipeId={recipe.recipe_id} />
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-auto">
                {recipe.steps?.replace(/<[^>]+>/g, "") || "No description available"}
              </p>
              <Link
                  to={`/recipe/${recipe.recipe_id}`}
                  className="mt-3 inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 self-start"
              >
                View Recipe
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RecipeCard;