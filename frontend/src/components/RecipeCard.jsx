import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import VoteButton from "./VoteButton";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

const RecipeCard = ({ recipe }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const isOwnerOrAdmin = user && (user.role === 'admin' || user.user_id === recipe.user_id);
  const photoSrc = recipe.main_photo &&
      (recipe.main_photo.startsWith('http')
          ? recipe.main_photo
          : `http://localhost:5000/uploads/${recipe.main_photo}`);


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
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-102 transition-all duration-300 relative">
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
      {recipe.main_photo && (
        <div className="h-48 bg-gray-700 overflow-hidden">
          <img
            src={recipe.main_photo}
            alt={recipe.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.onerror = null; e.target.src = '/fallback-image.jpg'; }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex">
          <VoteButton recipeId={recipe.recipe_id} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
            <p className="text-gray-400 text-sm line-clamp-3">
              {recipe.steps?.replace(/<[^>]+>/g, "") || "No description available"}
            </p>
            <Link
              to={`/recipe/${recipe.recipe_id}`}
              className="mt-3 inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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