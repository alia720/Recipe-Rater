import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { uploadImage } from "../utils/imageUpload";

const AddRecipe = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([""])
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file) => {
    try {
      const result = await uploadImage(file);
      if (result?.url) {
        setImageUrls((prev) => [...prev, result.url]);
      }
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      setError("You must be logged in to submit a recipe");
      setLoading(false);
      return;
    }

    try {
      // Create recipe and associate it with the current user using user.user_id
      const recipeRes = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,  // Added foreign key property
          name: title,
          steps: `Description: ${description}\nIngredients:\n${ingredients}\nInstructions:\n${instructions}`
        })
      });

      if (!recipeRes.ok) throw new Error("Failed to create recipe");
      const recipeData = await recipeRes.json();

      // Upload images provided via file input
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedImages = await Promise.all(uploadPromises);
      const allImageUrls = [
        ...imageUrls.filter(url => url.trim()),
        ...uploadedImages.map(img => img?.url).filter(Boolean)
      ];

      // Create photo records for each image URL
      await Promise.all(
          allImageUrls.map(url => {
            // Extract the filename from the URL (for storage in the database)
            const filename = url.split('/').pop();
            return fetch("http://localhost:5000/api/photos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recipe_id: recipeData.recipeId,
                name: filename,  // Only storing the filename; adjust if you need the full URL
                caption: ""
              })
            });
          })
      );

      navigate(`/recipe/${recipeData.recipeId}`);
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to create recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-2xl"
      >
        <h2 className="text-2xl text-white mb-6 text-center">Add New Recipe</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div>
          <label className="block text-gray-300 mb-2">Category</label>
          <div className="space-y-2">

          {categories.map((category, index) => (
            <select
              key={index}
              value={category}
              onChange={(e) => {
                const newCategories = [...categories];
                newCategories[index] = e.target.value;
                setCategories(newCategories);
              }}
              className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Appetizer">Appetizer</option>
              <option value="Beverage">Beverage</option>
              <option value="Other">Other</option>
            </select>
          ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategories([...categories, ""])}
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Ingredients (one per line)
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
              rows="6"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Images</label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <input
                  key={index}
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...imageUrls];
                    newUrls[index] = e.target.value;
                    setImageUrls(newUrls);
                  }}
                  placeholder="Image URL"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500"
                />
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageUrls([...imageUrls, ""])}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  Add URL
                </button>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles([...e.target.files])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="text-blue-500 hover:text-blue-400 text-sm cursor-pointer"
                >
                  Upload Files
                </label>
              </div>
              {files.length > 0 && (
                <div className="text-gray-400 text-sm">
                  {files.length} file(s) selected for upload
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipe;
