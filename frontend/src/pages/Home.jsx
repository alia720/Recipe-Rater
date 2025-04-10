import React, { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' or 'top_rated'

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/recipes?sort=${sortBy}`
        );
        const data = await response.json();
        setRecipes(data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [sortBy]); // Re-fetch when sorting changes

  return (
    <div className="p-4 bg-black min-h-screen">
      {/* Sorting Controls */}
      <div className="mb-4 flex justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="top_rated">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.recipe_id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Home;