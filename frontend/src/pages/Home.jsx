import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const location = useLocation();
  const navigate = useNavigate();

  // Read query parameter from URL
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query");

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        if (query && query.trim() !== "") {
          // Use the combined search endpoint if a query is present
          const response = await fetch(
            `http://localhost:5000/api/search?query=${encodeURIComponent(
              query
            )}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }
          const data = await response.json();
          // Use the merged recipes from your combined search endpoint
          setRecipes(data.recipes);
        } else {
          // Otherwise, fetch all recipes with sorting
          const response = await fetch(
            `http://localhost:5000/api/recipes?sort=${sortBy}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch recipes");
          }
          const data = await response.json();
          setRecipes(data.data);
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query, sortBy]);

  // A helper to clear the search by removing the query from the URL
  const clearSearch = () => {
    // Replace URL with /home without query parameters
    navigate("/home");
  };

  return (
    <div className="p-4 bg-black min-h-screen">
      {/* Only show sorting controls if not in search mode */}
      {!query && (
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
            <div>
              <select
                onChange={(e) => setSortBy(e.target.value)}
                className={`ml-4 bg-gray-800 text-white px-4 py-2 rounded-lg ${
                  sortBy !== "newest" && sortBy !== "top_rated"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-transparent text-gray-400 hover:bg-gray-700"
                }`}
              >
                <option value="">All</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
                <option value="Appetizer">Appetizer</option>
                <option value="Beverage">Beverage</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* If in search mode, add a Clear Search button */}
      {query && (
        <div className="mb-8 flex justify-center">
          <button
            onClick={clearSearch}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Clear Search
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.recipe_id} recipe={recipe} />
            ))
          ) : (
            <div className="text-center text-white col-span-full">
              No recipes match your search
              <br />
              Please try a different search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
