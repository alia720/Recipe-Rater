import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const RecipeCard = ({ recipe }) => {
  // Local state for rating; backend data may not include a rating, so default to 0.
  const [rating, setRating] = useState(recipe.rating || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleRatingClick = () => {
    if (!hasVoted) {
      setRating(rating + 1);
      setHasVoted(true);
    }
  };

  // Truncate the steps field to serve as description (we'll adjust the length later if need be)
  const description =
    recipe.steps && recipe.steps.length > 100
      ? recipe.steps.substring(0, 100) + "..."
      : recipe.steps;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
        <p className="text-gray-400">{description}</p>
        <div className="flex items-center mt-2">
          <button onClick={handleRatingClick} className="focus:outline-none">
            <FaStar
              size={24}
              className={`mr-1 ${hasVoted ? "text-yellow-400" : "text-gray-400"}`}
            />
          </button>
          <span className="text-white ml-2">{rating}</span>
        </div>
        <Link
          to={`/recipe/${recipe.recipe_id}`}
          className="text-blue-500 mt-2 inline-block"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
