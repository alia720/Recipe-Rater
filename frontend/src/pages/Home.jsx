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
  }, [sortBy]);

  return (
    <div className="p-4 bg-black min-h-screen">
      {/* Toggle-style Sorting Controls */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-6 py-2 rounded-md transition-all duration-300 ${
              sortBy === "newest"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-transparent text-gray-400 hover:bg-gray-700"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setSortBy("top_rated")}
            className={`px-6 py-2 rounded-md transition-all duration-300 ${
              sortBy === "top_rated"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-transparent text-gray-400 hover:bg-gray-700"
            }`}
          >
            Popular
          </button>
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