import React from "react";
import { useParams } from "react-router-dom";
import CommentRatingSection from "../components/CommentRatingSection";

const RecipeDetail = () => {
  const { id } = useParams();
  // For now, using dummy data; in a real app, fetch data based on the id.
  const recipe = {
    id,
    title: "Sample Recipe",
    image: "https://www.tamingtwins.com/wp-content/uploads/2025/01/spaghetti-bolognese-10.jpg",
    description: "A delicious sample recipe.",
    ingredients: ["1 cup ingredient A", "2 tbsp ingredient B"],
    instructions: "Mix all ingredients and cook for 20 minutes.",
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <img
        src={recipe.image}
        alt={recipe.title}
        className="w-full max-w-md mb-4 rounded"
      />
      <p className="mb-4">{recipe.description}</p>
      <h2 className="text-2xl font-bold mb-2">Ingredients</h2>
      <ul className="list-disc ml-6 mb-4">
        {recipe.ingredients.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-bold mb-2">Instructions</h2>
      <p>{recipe.instructions}</p>

      {/* Add Comment & Rating Section */}
      <CommentRatingSection />
    </div>
  );
};

export default RecipeDetail;
