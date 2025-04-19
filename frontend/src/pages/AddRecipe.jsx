import React, { useState, useEffect } from "react"; // Removed useRef as it wasn't used
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
  const [selectedCatIds,   setSelectedCatIds]   = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // --- State for Submission Process ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // --- Removed unused sortBy state ---
  // const [sortBy, setSortBy] = useState("newest");

  // --- Fetch Available Categories on Mount ---
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      setCategoryError('');
      try {
        const res = await fetch("http://localhost:5000/api/categories"); // Fetch categories
        if (!res.ok) {
          // Try to get more specific error
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch categories: ${res.statusText}`);
        }
        const data = await res.json();
        // --- CORRECTED: Access data.data based on your backend controller ---
        setAvailableCategories(data.data || []); // Use data.data which contains the array
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoryError("Failed to load categories. Please ensure the backend is running and categories exist.");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []); // Empty dependency array - runs once on mount

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCategoryError('');
    setLoading(true);

    // --- Validation ---
    if (!user) {
      setError("You must be logged in to submit a recipe"); setLoading(false); return;
    }
    if (!selectedCatIds) { // Check if a category was selected
      setError("Please select a category for the recipe."); setLoading(false); return;
    }
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) {
      setError("Title, Ingredients, and Instructions are required."); setLoading(false); return;
    }
    // --- End Validation ---

    let createdRecipeId = null;

    try {
      // --- Step 1: Create Recipe ---
      const recipePayload = { user_id: user.user_id, name: title, steps: `Description: ${description}\nIngredients:\n${ingredients}\nInstructions:\n${instructions}` };
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

      // --- Step 2: Link Category ---
      // console.log(`Linking category ID: ${selectedCategoryId} to recipe ID: ${createdRecipeId}`);
      // const linkPayload = { category_id: parseInt(selectedCategoryId, 10), recipe_id: createdRecipeId };
      // // --- Ensure this endpoint matches your backend routes ---
      // const linkRes = await fetch("http://localhost:5000/api/belongs_to", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(linkPayload) });
      // if (!linkRes.ok) {
      //   const linkErrorData = await linkRes.json().catch(() => ({ error: 'Failed to parse linking error' }));
      //   console.error("Failed to link category:", linkErrorData.error || linkRes.statusText);
      //   // Adding as a non-critical warning for now
      //   setError(prev => (prev ? prev + '; ' : '') + `Warning: Failed to link category: ${linkErrorData.error || linkRes.statusText}`);
      // } else {
      //   console.log("Category linked successfully.");
      // }

      const linkPromises = selectedCatIds.map(catId => {
        fetch("http://localhost:5000/api/belongs-to", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id: catId, recipe_id: createdRecipeId })
        }).then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            throw new Error(errData?.error || `Linking category ${catId} failed: ${res.statusText}`);
          }
        })
      });

      try {
        await Promise.all(linkPromises);
        console.log("All categories linked successfully.");
      }catch (linkErr) {
        console.error("Failed to link categories:", linkErr);
        setError(prev => (prev ? prev + '; ' : '') + `Warning: Failed to link categories: ${linkErr.message}`);
      }

      // --- Step 3: Process Photos ---
      const photoPromises = [];
      // File Uploads
      files.forEach(file => {
        const formData = new FormData();
        formData.append('photoFile', file);
        formData.append('recipe_id', createdRecipeId);
        // Ensure this photo upload endpoint is correct
        const uploadPromise = fetch('http://localhost:5000/api/photos', { method: 'POST', body: formData })
            .then(async res => { if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.error || `Upload failed for ${file.name}: ${res.statusText}`); } return res.json(); });
        photoPromises.push(uploadPromise);
      });
      // External URLs
      imageUrls.forEach(url => {
        const trimmedUrl = url.trim();
        if (trimmedUrl && trimmedUrl.startsWith('http')) {
          // Ensure this photo URL endpoint is correct
          const urlPromise = fetch('http://localhost:5000/api/photos/url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipe_id: createdRecipeId, name: trimmedUrl, caption: '' })})
              .then(async res => { if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.error || `Adding URL ${trimmedUrl} failed: ${res.statusText}`); } return res.json(); });
          photoPromises.push(urlPromise);
        }
      });

      if (photoPromises.length > 0) {
        console.log(`Processing ${photoPromises.length} photos...`);
        const results = await Promise.allSettled(photoPromises);
        results.forEach((result, index) => { if (result.status === 'rejected') { console.error(`Photo operation ${index + 1} failed:`, result.reason); setError(prev => (prev ? prev + '; ' : '') + `Photo processing failed: ${result.reason?.message || 'Unknown photo error'}`); } });
        if (results.some(r => r.status === 'rejected')) console.warn("Some photo operations failed.");
        else console.log("All photo operations successful:", results);
      } else {
        console.log("No photos to process.");
      }

      // --- Step 4: Navigate if no critical errors ---
      if (!error.includes("Recipe creation failed") && !error.includes("valid recipeId not returned")) {
        console.log("Submission process complete. Navigating...");
        navigate(`/recipe/${createdRecipeId}`);
      } else {
        console.log("Submission finished with warnings/errors, staying on page.");
      }

    } catch (err) {
      console.error("Error during submission process:", err);
      setError(`Submission failed: ${err.message}. Check console.`);
      if (createdRecipeId) setError(prev => `${prev} (Recipe ID ${createdRecipeId} might have been created partially).`);
    } finally {
      setLoading(false);
    }
  };


  return (
      <div className="flex items-center justify-center min-h-screen bg-black py-12 px-4">
        <form
            onSubmit={handleSubmit}
            className="bg-gray-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl border border-gray-800"
        >
          <h2 className="text-2xl md:text-3xl text-white mb-6 text-center font-semibold">Add New Recipe</h2>

          {/* Combined Error Display */}
          {error && <p className="text-red-500 mb-4 text-center px-4 py-2 bg-red-900 bg-opacity-30 rounded border border-red-700 text-sm">{error}</p>}
          {categoryError && <p className="text-yellow-500 mb-4 text-center px-4 py-2 bg-yellow-900 bg-opacity-30 rounded border border-yellow-700 text-sm">{categoryError}</p>}


          <div className="space-y-5">

            {/* Category multi‑select */}
            <div>
              <label htmlFor="category-select"
                     className="block text-gray-300 mb-2 font-medium">
                Categories
              </label>

              {categoryLoading ? (
                  <div className="w-full p-2.5 rounded bg-gray-800 text-gray-400
                    border border-gray-700 italic">
                    Loading categories…
                  </div>
              ) : availableCategories.length === 0 ? (
                  <div className="w-full p-2.5 rounded bg-gray-800 text-yellow-500
                    border border-gray-700 italic text-sm">
                    No categories available.
                  </div>
              ) : (
                  <select
                      id="category-select"
                      multiple                                   /* ← key line */
                      value={selectedCatIds}
                      onChange={e => {
                        const ids = Array.from(
                            e.target.selectedOptions,
                            opt => Number(opt.value)
                        );
                        setSelectedCatIds(ids);
                      }}
                      className="w-full h-40 p-2.5 rounded bg-gray-800 text-white
                 border border-gray-700 focus:ring-2 focus:ring-blue-500
                 outline-none"
                      required
                  >
                    {availableCategories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                    ))}
                  </select>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl (Cmd on Mac) to select multiple
              </p>
            </div>

            {/* --- End Category Selection Dropdown --- */}


            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-gray-300 mb-2 font-medium">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" rows="3" />
            </div>
            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-gray-300 mb-2 font-medium">Ingredients (one per line)</label>
              <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" rows="5" required />
            </div>
            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-gray-300 mb-2 font-medium">Instructions</label>
              <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" rows="7" required />
            </div>

            {/* Combined Image Handling Section */}
            <div>
              <label className="block text-gray-300 mb-3 font-semibold text-lg border-t border-gray-700 pt-5">Add Photos (Optional)</label>
              {/* Input for External URLs */}
              <div className="space-y-2 mb-4 border border-gray-700 p-4 rounded-md bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-2">Enter external image URLs:</p>
                {imageUrls.map((url, index) => (
                    <input key={`url-${index}`} type="url" value={url} onChange={(e) => {const newUrls = [...imageUrls]; newUrls[index] = e.target.value; setImageUrls(newUrls);}} placeholder="https://example.com/image.jpg" className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 text-sm" />
                ))}
                <button type="button" onClick={() => setImageUrls([...imageUrls, ""])} className="text-blue-500 hover:text-blue-400 text-xs mt-1">+ Add URL field</button>
              </div>
              {/* Input for File Uploads */}
              <div className="mb-4 border border-gray-700 p-4 rounded-md bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-2">Or upload image files:</p>
                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" accept="image/png, image/jpeg, image/gif, image/webp" />
                <label htmlFor="file-upload" className="cursor-pointer inline-block bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors duration-200 text-sm">Choose Files...</label>
                {files.length > 0 && (<div className="text-gray-400 text-xs mt-2">Selected: {Array.from(files).map(f => f.name).join(', ')}</div>)}
              </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                // Disable if submitting OR if fetching categories OR if no categories exist
                disabled={loading || categoryLoading || availableCategories.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-6 font-semibold text-lg shadow-lg hover:shadow-blue-500/30"
            >
              {loading ? "Submitting..." : "Submit Recipe"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddRecipe;