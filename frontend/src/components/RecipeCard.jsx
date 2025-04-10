import React from "react";
import { Link } from "react-router-dom";
import VoteButton from "./VoteButton";

const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-102 transition-all duration-300">
      {recipe.main_photo && (
        <div className="h-48 bg-gray-700 overflow-hidden">
          <img
            src={recipe.main_photo}
            alt={recipe.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/fallback-image.jpg';
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex">
          <VoteButton recipeId={recipe.recipe_id} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
            <p className="text-gray-400 text-sm line-clamp-3">
              {recipe.steps?.replace(/<\/?[^>]+(>|$)/g, "") || "No description available"}
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