import React from "react";
import RecipeCard from "../components/RecipeCard";

// Dummy recipe data – in real app, fetch this from an API.
const dummyRecipes = [
  {
    id: 1,
    title: "Spaghetti Bolognese",
    image: "https://via.placeholder.com/400x300",
    description: "A classic Italian dish with a rich, meaty sauce.",
  },
  {
    id: 2,
    title: "Chicken Curry",
    image: "https://via.placeholder.com/400x300",
    description: "A spicy and savory curry made with tender chicken.",
  },
  {
    id: 3,
    title: "Vegan Salad Bowl",
    image: "https://via.placeholder.com/400x300",
    description: "A fresh, colorful bowl packed with nutrients.",
  },
];

const Home = () => {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-black min-h-screen">
      {dummyRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default Home;
