import React, { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data); // Inspect the structure in the console

        // If data is an array, use it directly; if it’s an object with a 'data' key, use that.
        const recipesArray = Array.isArray(data) ? data : data.data || [];
        setRecipes(recipesArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching recipes:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-white p-4">Loading recipes...</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-black min-h-screen">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.recipe_id} recipe={recipe} />
      ))}
    </div>
  );
};

export default Home;
