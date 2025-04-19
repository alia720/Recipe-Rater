import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
// Removed unused import: import { uploadImage } from "../utils/imageUpload";

const AddRecipe = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([""]); // Keep if using categories
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageUrls, setImageUrls] = useState([""]); // For external URLs
  const [files, setFiles] = useState([]); // For file uploads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Removed unused handleFileUpload function

  // This function updates the state when files are selected
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    // Optional: Clear the input visually after selection if desired,
    // but it might prevent selecting the same file again if the user changes their mind.
    // e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors at the start
    setLoading(true); // Set loading true for the entire operation

    if (!user) {
      setError("You must be logged in to submit a recipe");
      setLoading(false); // Stop loading if user check fails
      return;
    }

    let createdRecipeId = null; // Variable to hold the ID after successful creation

    try {
      // --- Step 1: Create the Recipe ---
      const recipePayload = {
        user_id: user.user_id,
        name: title,
        steps: `Description: ${description}\nIngredients:\n${ingredients}\nInstructions:\n${instructions}`,
        // Add categories if your backend handles them:
        // categories: categories.filter(cat => cat.trim() !== ""),
      };

      console.log("Attempting to create recipe with payload:", recipePayload);
      const recipeRes = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipePayload)
      });

      if (!recipeRes.ok) {
        // Try to get specific error message from backend
        const errorData = await recipeRes.json().catch(() => ({ error: 'Failed to parse error response' }));
        // Throw an error to be caught by the main catch block below
        throw new Error(errorData.error || `Recipe creation failed with status ${recipeRes.status}`);
      }

      const recipeData = await recipeRes.json();
      console.log("Recipe creation response:", recipeData);

      // Validate backend response and get the ID
      if (!recipeData || !recipeData.recipeId) {
        console.error("Backend response issue for recipe creation:", recipeData);
        throw new Error("Recipe created, but a valid recipeId was not returned from the server.");
      }
      createdRecipeId = recipeData.recipeId; // Store the ID for use in photo uploads
      console.log("Recipe created successfully with ID:", createdRecipeId);

      // --- Step 2: Prepare Photo Upload/Add Promises (only if recipe creation succeeded) ---
      const photoPromises = [];

      // a) File Uploads
      files.forEach(file => {
        const formData = new FormData();
        formData.append('photoFile', file); // Key for the actual file ('photoFile' must match backend multer field)
        formData.append('recipe_id', createdRecipeId); // **CORRECTED KEY** for the recipe ID (must match backend expectation in req.body)
        // You can add other fields like caption if your backend expects them:
        // formData.append('caption', 'Optional caption for ' + file.name);

        console.log(`Preparing upload for file: ${file.name} with recipe_id: ${createdRecipeId}`);
        const uploadPromise = fetch('http://localhost:5000/api/photos', {
          method: 'POST',
          body: formData,
          // ** IMPORTANT: Do NOT manually set Content-Type header for FormData **
          // The browser sets it correctly, including the boundary.
        }).then(async res => { // Make inner function async to await res.json()
          if (!res.ok) {
            // Try to get detailed error message from backend JSON response
            const errData = await res.json().catch(() => null); // Catch errors if response isn't JSON
            console.error(`Upload failed for ${file.name}. Status: ${res.status}`, errData);
            throw new Error(`Upload failed for ${file.name}: ${errData?.error || res.statusText}`);
          }
          console.log(`Upload success for ${file.name}`);
          return res.json(); // Parse success response
        });
        photoPromises.push(uploadPromise);
      });

      // b) External URL Adds
      imageUrls.forEach(url => {
        const trimmedUrl = url.trim();
        if (trimmedUrl && trimmedUrl.startsWith('http')) { // Basic check if it looks like a URL
          console.log(`Preparing to add URL: ${trimmedUrl} with recipe_id: ${createdRecipeId}`);
          const urlPromise = fetch('http://localhost:5000/api/photos/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipe_id: createdRecipeId, // Use the stored ID
              name: trimmedUrl,            // Send the URL as 'name'
              caption: ''                 // Add caption if applicable
            })
          }).then(async res => { // Make inner function async
            if (!res.ok) {
              const errData = await res.json().catch(() => null);
              console.error(`Adding URL ${trimmedUrl} failed. Status: ${res.status}`, errData);
              throw new Error(`Adding URL ${trimmedUrl} failed: ${errData?.error || res.statusText}`);
            }
            console.log(`Adding URL ${trimmedUrl} success.`);
            return res.json();
          });
          photoPromises.push(urlPromise);
        } else if (trimmedUrl) {
          console.warn(`Skipping invalid URL format: ${trimmedUrl}`);
        }
      });

      // --- Step 3: Execute All Photo Promises ---
      if (photoPromises.length > 0) {
        console.log(`Attempting to process ${photoPromises.length} photos (uploads/URL additions)...`);
        const results = await Promise.all(photoPromises);
        console.log("Photo processing results:", results);
      } else {
        console.log("No photos were selected for upload or adding.");
      }


      // --- Step 4: Navigate on Full Success ---
      console.log("Submission successful! Navigating to recipe page:", createdRecipeId);
      navigate(`/recipe/${createdRecipeId}`);

    } catch (err) {
      // Catch errors from recipe creation OR photo processing
      console.error("Error during handleSubmit:", err);
      // Set a user-friendly error message based on the error caught
      setError(`Submission failed: ${err.message}. Please check console for details.`);
      // Optional: Provide more context if recipe was created but photos failed
      if (createdRecipeId && !err.message.includes("Recipe creation failed")) {
        setError(prevError => `${prevError} (Recipe was created with ID: ${createdRecipeId}, but photo processing encountered an issue.)`);
      }

    } finally {
      // --- Step 5: Final Cleanup ---
      // This runs regardless of success or failure after the try/catch block completes
      setLoading(false); // Set loading to false *once* at the very end
    }
  };

  // Remove the large commented-out block of old code here

  return (
      <div className="flex items-center justify-center min-h-screen bg-black py-12"> {/* Added padding */}
        <form
            onSubmit={handleSubmit}
            className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-2xl"
            // encType="multipart/form-data" // Not strictly needed for fetch with FormData, but doesn't hurt
        >
          <h2 className="text-2xl text-white mb-6 text-center">Add New Recipe</h2>

          {error && <p className="text-red-500 mb-4 text-center px-4 py-2 bg-red-900 bg-opacity-30 rounded">{error}</p>}

          {/* Category Input Section (kept as is) */}
          {/* <div> ... category select ... </div> */}

          <div className="space-y-4 mt-4"> {/* Added margin-top */}
            {/* Title, Description, Ingredients, Instructions Inputs (kept as is) */}
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

            {/* --- Combined Image Handling Section --- */}
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Add Photos</label> {/* Added font-semibold */}

              {/* Input for External URLs */}
              <div className="space-y-2 mb-4 border border-gray-700 p-3 rounded"> {/* Added border/padding */}
                <p className="text-sm text-gray-400 mb-2">Enter external image URLs (optional):</p>
                {imageUrls.map((url, index) => (
                    <input
                        key={`url-${index}`} // Use a more stable key if possible, but index is okay here
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...imageUrls];
                          newUrls[index] = e.target.value;
                          setImageUrls(newUrls);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 placeholder-gray-500" // Darker background
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setImageUrls([...imageUrls, ""])}
                    className="text-blue-500 hover:text-blue-400 text-sm mt-1" // Added margin-top
                >
                  + Add another URL field
                </button>
              </div>

              {/* Input for File Uploads */}
              <div className="mb-4 border border-gray-700 p-3 rounded"> {/* Added border/padding */}
                <p className="text-sm text-gray-400 mb-2">Or upload image files (JPEG, PNG, GIF, WebP):</p>
                {/* Hidden file input */}
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange} // Use the state handler
                    className="hidden" // Keep hidden, use label to trigger
                    id="file-upload"
                    accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
                />
                {/* Label styled as a button */}
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-block bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors duration-200 text-sm"
                >
                  Choose Files...
                </label>

                {/* Display selected file names */}
                {files.length > 0 && (
                    <div className="text-gray-400 text-sm mt-2">
                      Selected: {Array.from(files).map(f => f.name).join(', ')}
                    </div>
                )}
              </div>
            </div>
            {/* --- End of Image Handling Section --- */}


            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 mt-6 font-semibold text-lg" // Increased padding/margin/font-size
            >
              {loading ? "Submitting..." : "Submit Recipe"}
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddRecipe;