import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const RecipeCard = ({ recipe }) => {
  // Use local state for rating and vote status, for now.
  const [rating, setRating] = useState(recipe.rating || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleRatingClick = () => {
    if (!hasVoted) {
      setRating(rating + 1);
      setHasVoted(true);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <img
        src={recipe.image}
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
        <p className="text-gray-400">{recipe.description}</p>
        <div className="flex items-center mt-2">
          {/* Star button: color changes when clicked */}
          <button onClick={handleRatingClick} className="focus:outline-none">
            <FaStar
              size={24}
              className={`mr-1 ${hasVoted ? "text-yellow-400" : "text-gray-400"}`}
            />
          </button>
          <span className="text-white ml-2">{rating}</span>
        </div>
        <Link
          to={`/recipe/${recipe.id}`}
          className="text-blue-500 mt-2 inline-block"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
