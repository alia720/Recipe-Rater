import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CommentRatingSection from "../components/CommentRatingSection";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the recipe from backend using the recipe_id
    fetch(`http://localhost:5000/api/recipes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recipe:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  if (!recipe) {
    return <div className="text-white p-4">Recipe not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">{recipe.name}</h1>
        <p className="mb-4 text-center whitespace-pre-wrap">{recipe.steps}</p>
        {/* Comment and rating section */}
        <CommentRatingSection />
      </div>
    </div>
  );
};

export default RecipeDetail;
