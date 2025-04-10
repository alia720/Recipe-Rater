import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CommentRatingSection from "../components/CommentRatingSection";
import VoteButton from "../components/VoteButton";
import { useUser } from "../context/UserContext";

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [recipe, setRecipe] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!res.ok) throw new Error("Failed to fetch recipe");
        
        const recipeData = await res.json();
        const photosRes = await fetch(`http://localhost:5000/api/photos/recipe/${id}`);
        const photosData = await photosRes.json();

        setRecipe(recipeData);
        setPhotos(photosData);
      } catch (err) {
        console.error("Error loading recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-400 text-xl">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        {/* Image Gallery */}
        {photos.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.photo_id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.caption || recipe.name}
                  className="w-full h-64 object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recipe Header with Voting */}
        <div className="flex items-center mb-8 gap-4">
          <VoteButton recipeId={recipe.recipe_id} />
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
        </div>

        {/* Recipe Details */}
        <div className="mb-8">
          <pre className="whitespace-pre-wrap font-sans text-gray-300">
            {recipe.steps}
          </pre>
        </div>

        {/* Comment Section */}
        <CommentRatingSection />
      </div>
    </div>
  );
};

export default RecipeDetail;