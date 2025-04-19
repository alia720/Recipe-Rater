import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const AddRecipe = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // --- State for Form Fields ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrls, setImageUrls] = useState([""]); // For external URLs
  const [files, setFiles] = useState([]); // For file uploads

  // --- State for Categories ---
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCatIds, setSelectedCatIds] = useState([]); // Stores array of selected category IDs (numbers)
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // --- State for Submission Process ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Fetch Available Categories on Mount ---
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      setCategoryError('');
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch categories: ${res.statusText}`);
        }
        const data = await res.json();
        setAvailableCategories(data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoryError("Failed to load categories. Please ensure the backend is running and categories exist.");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- Handle Category Checkbox Change ---
  const handleCategoryChange = (event) => {
    const categoryId = Number(event.target.value); // Get the ID (as number)
    const isChecked = event.target.checked;

    setSelectedCatIds(prevSelectedIds => {
      if (isChecked) {
        // Add the category ID if it's not already present
        return [...new Set([...prevSelectedIds, categoryId])];
      } else {
        // Remove the category ID
        return prevSelectedIds.filter(id => id !== categoryId);
      }
    });
    // Clear category-specific error when user interacts
    if (categoryError.includes("select at least one")) {
      setCategoryError('');
    }
    if (error.includes("select at least one category")) {
      setError('');
    }
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCategoryError(''); // Clear previous category error
    setLoading(true);

    // --- Validation ---
    if (!user) {
      setError("You must be logged in to submit a recipe");
      setLoading(false);
      return;
    }
    // --- UPDATED category validation ---
    if (selectedCatIds.length === 0) {
      setError("Please select at least one category for the recipe.");
      // Optionally set categoryError too for specific highlighting
      // setCategoryError("A category selection is required.");
      setLoading(false);
      return;
    }
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError("Title, Ingredients, and Instructions are required.");
      setLoading(false);
      return;
    }
    // --- End Validation ---

    let createdRecipeId = null;

    try {
      // --- Step 1: Create Recipe ---
      const recipePayload = { user_id: user.user_id, name: title, steps: `Description: ${description.trim()}\nIngredients:\n${ingredients.trim()}\nInstructions:\n${instructions.trim()}` };
      console.log("Creating recipe:", recipePayload);
      const recipeRes = await fetch("http://localhost:5000/api/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recipePayload) });
      if (!recipeRes.ok) {
        const errorData = await recipeRes.json().catch(() => ({ error: 'Failed to parse recipe error' }));
        throw new Error(errorData.error || `Recipe creation failed: ${recipeRes.statusText}`);
      }
      const recipeData = await recipeRes.json();
      if (!recipeData || !recipeData.recipeId) throw new Error("Valid recipeId not returned.");
      createdRecipeId = recipeData.recipeId;
      console.log("Recipe created with ID:", createdRecipeId);

      // --- Step 2: Link Categories ---
      const linkPromises = selectedCatIds.map(catId => {
        console.log(`Linking category ID: ${catId} to recipe ID: ${createdRecipeId}`);
        return fetch("http://localhost:5000/api/belongs-to", { // Corrected endpoint if needed
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id: catId, recipe_id: createdRecipeId })
        }).then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            // Throw specific error to be caught by Promise.allSettled or Promise.all
            throw new Error(errData?.error || `Linking category ${catId} failed: ${res.statusText}`);
          }
          console.log(`Successfully linked category ${catId}`);
          return res.json(); // Or return some success indicator
        });
      });

      // Wait for all linking operations, collecting results/errors
      const linkResults = await Promise.allSettled(linkPromises);
      const linkErrors = linkResults.filter(r => r.status === 'rejected');

      if (linkErrors.length > 0) {
        const errorMessages = linkErrors.map(e => e.reason?.message || 'Unknown category linking error').join('; ');
        console.error("Failed to link some categories:", errorMessages);
        // Add as a non-critical warning unless linking is absolutely mandatory
        setError(prev => (prev ? prev + '; ' : '') + `Warning: Failed to link categories: ${errorMessages}`);
      } else {
        console.log("All selected categories linked successfully.");
      }


      // --- Step 3: Process Photos ---
      // (Keep photo processing logic as is)
      const photoPromises = [];
      // File Uploads
      files.forEach(file => {
        const formData = new FormData();
        formData.append('photoFile', file);
        formData.append('recipe_id', createdRecipeId);
        const uploadPromise = fetch('http://localhost:5000/api/photos', { method: 'POST', body: formData })
            .then(async res => { if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.error || `Upload failed for ${file.name}: ${res.statusText}`); } return res.json(); });
        photoPromises.push(uploadPromise);
      });
      // External URLs
      imageUrls.forEach(url => {
        const trimmedUrl = url.trim();
        if (trimmedUrl && trimmedUrl.startsWith('http')) {
          const urlPromise = fetch('http://localhost:5000/api/photos/url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipe_id: createdRecipeId, name: trimmedUrl, caption: '' })})
              .then(async res => { if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.error || `Adding URL ${trimmedUrl} failed: ${res.statusText}`); } return res.json(); });
          photoPromises.push(urlPromise);
        }
      });

      if (photoPromises.length > 0) {
        console.log(`Processing ${photoPromises.length} photos...`);
        const photoResults = await Promise.allSettled(photoPromises);
        const photoErrors = photoResults.filter(r => r.status === 'rejected');
        if (photoErrors.length > 0) {
          const photoErrorMessages = photoErrors.map(e => e.reason?.message || 'Unknown photo error').join('; ');
          console.warn("Some photo operations failed:", photoErrorMessages);
          setError(prev => (prev ? prev + '; ' : '') + `Photo processing failed: ${photoErrorMessages}`);
        } else {
          console.log("All photo operations successful.");
        }
      } else {
        console.log("No photos to process.");
      }


      // --- Step 4: Navigate if no critical errors ---
      // Navigate only if the core recipe creation was successful.
      if (!error.includes("Recipe creation failed") && !error.includes("valid recipeId not returned")) {
        console.log("Submission process complete. Navigating...");
        // Add a small delay or success message before navigation?
        // alert("Recipe submitted successfully!"); // Optional: Simple alert
        navigate(`/recipe/${createdRecipeId}`);
      } else {
        console.log("Submission finished with warnings/errors, staying on page.");
      }

    } catch (err) {
      console.error("Critical error during submission process:", err);
      // Focus on the critical error that stopped the process
      setError(`Submission failed: ${err.message}. Check console.`);
      // Indicate if recipe might exist partially
      if (createdRecipeId) {
        setError(prev => `${prev} (Recipe ID ${createdRecipeId} might have been created, but subsequent steps failed).`);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Render Component ---
  return (
      <div className="flex items-center justify-center min-h-screen bg-black py-12 px-4">
        <form
            onSubmit={handleSubmit}
            className="bg-gray-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl border border-gray-800" // Slightly wider form
        >
          <h2 className="text-2xl md:text-3xl text-white mb-6 text-center font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Add New Recipe
          </h2>

          {/* Combined Error Display */}
          {error && (
              <p className="text-red-400 mb-4 text-center px-4 py-2 bg-red-900/50 rounded border border-red-700 text-sm">
                {error}
              </p>
          )}
          {/* Specific Category Error (optional, can be merged with general error) */}
          {categoryError && !error.includes("select at least one") && ( // Avoid duplicate messages
              <p className="text-yellow-500 mb-4 text-center px-4 py-2 bg-yellow-900/30 rounded border border-yellow-700 text-sm">
                {categoryError}
              </p>
          )}

          <div className="space-y-6"> {/* Increased spacing */}

            {/* --- Category Checkboxes --- */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium text-lg">
                Categories <span className="text-red-500">*</span> {/* Added required indicator */}
              </label>
              {categoryLoading ? (
                  <div className="w-full p-3 rounded bg-gray-800 text-gray-400 border border-gray-700 italic animate-pulse">
                    Loading categories…
                  </div>
              ) : availableCategories.length === 0 ? (
                  <div className="w-full p-3 rounded bg-gray-800 text-yellow-500 border border-gray-700 italic text-sm">
                    {categoryError || "No categories available to select."} {/* Show fetch error if exists */}
                  </div>
              ) : (
                  // --- Checkbox Grid ---
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3 p-4 bg-gray-800/50 border border-gray-700 rounded max-h-52 overflow-y-auto">
                    {availableCategories.map(cat => (
                        <div key={cat.category_id} className="flex items-center">
                          <input
                              type="checkbox"
                              id={`category-${cat.category_id}`}
                              value={cat.category_id}
                              checked={selectedCatIds.includes(cat.category_id)}
                              onChange={handleCategoryChange}
                              // --- Green Checkbox Styling ---
                              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-offset-gray-900 focus:ring-2 cursor-pointer"
                          />
                          <label
                              htmlFor={`category-${cat.category_id}`}
                              className="ml-2 text-sm font-medium text-gray-300 hover:text-gray-100 cursor-pointer transition-colors duration-150"
                          >
                            {cat.name}
                          </label>
                        </div>
                    ))}
                  </div>
              )}
              {/* --- Removed the "Hold Ctrl/Cmd" text --- */}
              {/* Show hint if categories loaded but none selected */}
              {availableCategories.length > 0 && selectedCatIds.length === 0 && !categoryLoading && (
                  <p className="text-xs text-red-400 mt-1.5">Please select at least one category.</p>
              )}
            </div>
            {/* --- End Category Checkboxes --- */}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-300 mb-1.5 font-medium">Title <span className="text-red-500">*</span></label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recipe Name" className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 transition duration-150 ease-in-out" required />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-gray-300 mb-1.5 font-medium">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short, enticing description..." className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 transition duration-150 ease-in-out" rows="3" />
            </div>

            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-gray-300 mb-1.5 font-medium">Ingredients <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(one per line recommended)</span></label>
              <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g.&#10;1 cup Flour&#10;2 Large Eggs&#10;1/2 tsp Salt" className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 transition duration-150 ease-in-out" rows="6" required />
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-gray-300 mb-1.5 font-medium">Instructions <span className="text-red-500">*</span></label>
              <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Step 1: Do this...&#10;Step 2: Then do that..." className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 transition duration-150 ease-in-out" rows="8" required />
            </div>

            {/* Combined Image Handling Section */}
            <div className="pt-5 border-t border-gray-700/50">
              <label className="block text-gray-300 mb-3 font-semibold text-lg">Add Photos <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
              {/* Input for External URLs */}
              <div className="space-y-2 mb-4 border border-gray-700 p-4 rounded-md bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-2">Enter external image URLs (one per line):</p>
                {imageUrls.map((url, index) => (
                    <div key={`url-${index}`} className="flex items-center space-x-2">
                      <input type="url" value={url} onChange={(e) => {const newUrls = [...imageUrls]; newUrls[index] = e.target.value; setImageUrls(newUrls.filter((u, i) => i <= index || u.trim() !== ''));}} placeholder="https://example.com/image.jpg" className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 text-sm" />
                      {imageUrls.length > 1 && (
                          <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-400 text-xs p-1 rounded hover:bg-gray-700">✕</button>
                      )}
                    </div>
                ))}
                <button type="button" onClick={() => setImageUrls([...imageUrls, ""])} className="text-blue-500 hover:text-blue-400 text-xs mt-1">+ Add URL field</button>
              </div>
              {/* Input for File Uploads */}
              <div className="border border-gray-700 p-4 rounded-md bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-2">Or upload image files:</p>
                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" accept="image/png, image/jpeg, image/gif, image/webp" />
                <label htmlFor="file-upload" className="cursor-pointer inline-block bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors duration-200 text-sm shadow">Choose Files...</label>
                {files.length > 0 && (
                    <div className="text-gray-400 text-xs mt-2 space-y-1">
                      <span className="font-medium">Selected:</span>
                      {Array.from(files).map((f, idx) => <span key={idx} className="block ml-2 truncate">{f.name} ({ (f.size / 1024).toFixed(1) } KB)</span>)}
                    </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                // Disable if submitting OR if categories are loading OR if no categories exist OR (if categories exist but none are selected)
                disabled={loading || categoryLoading || availableCategories.length === 0 || (availableCategories.length > 0 && selectedCatIds.length === 0)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-6 font-semibold text-lg shadow-lg hover:shadow-green-500/30 flex items-center justify-center"
            >
              {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
              ) : "Submit Recipe"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddRecipe;