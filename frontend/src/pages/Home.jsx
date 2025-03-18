import React from "react";
import RecipeCard from "../components/RecipeCard";

// Dummy recipe data – in real app, fetch this from API.
const dummyRecipes = [
  {
    id: 1,
    title: "Spaghetti Bolognese",
    image: "https://www.tamingtwins.com/wp-content/uploads/2025/01/spaghetti-bolognese-10.jpg",
    description: "A classic Italian dish with a rich, meaty sauce.",
  },
  {
    id: 2,
    title: "Chicken Curry",
    image: "https://kitchenofdebjani.com/wp-content/uploads/2023/04/easy-indian-chicken-curry-Recipe-for-beginners-Debjanir-rannaghar.jpg",
    description: "A spicy and savory curry made with tender chicken.",
  },
  {
    id: 3,
    title: "Vegan Salad Bowl",
    image: "https://images.immediate.co.uk/production/volatile/sites/30/2021/07/Buddha-bowl-salad-eade933.jpg?quality=90&resize=556,505",
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
