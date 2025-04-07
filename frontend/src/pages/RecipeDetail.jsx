import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CommentRatingSection from "../components/CommentRatingSection";
import { useUser } from "../context/UserContext";

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error("Recipe not found");
        }
        
        const data = await res.json();
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe. Please try again.");
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-400">{error || "Recipe not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">{recipe.name}</h1>
        
        {/* Recipe details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <p className="whitespace-pre-wrap">{recipe.steps}</p>
        </div>
        
        {/* Ingredients section if available */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc pl-5">
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>{ing.amount} {ing.name}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Comment and rating section */}
        <CommentRatingSection />
      </div>
    </div>
  );
};

export default RecipeDetail;