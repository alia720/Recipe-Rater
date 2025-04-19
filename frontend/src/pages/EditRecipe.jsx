import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PhotoManager from "../components/PhotoManager.jsx";
import { useUser } from "../context/UserContext";

// --- Helper Function to Parse Combined Steps ---
// (Keep this function as is)
const parseCombinedSteps = (combinedSteps = "") => {
  // ... (parsing logic remains the same)
  const descMarker = "Description:";
  const ingMarker = "\nIngredients:\n";
  const instMarker = "\nInstructions:\n";

  let description = "";
  let ingredients = "";
  let instructions = "";

  try {
    // Find the starting index of each section marker
    let descStart = combinedSteps.indexOf(descMarker);
    let ingStart = combinedSteps.indexOf(ingMarker);
    let instStart = combinedSteps.indexOf(instMarker);

    // Adjust indices if markers are missing at the very beginning
    if (descStart === -1 && ingStart === -1 && instStart === -1) {
      // No markers found, assume entire text is instructions or description?
      // Let's default to putting it in instructions for now.
      return {
        description: "",
        ingredients: "",
        instructions: combinedSteps.trim(),
      };
    }
    if (descStart !== 0) descStart = -1; // Only recognize Description: if it's at the start

    // Determine end points based on the next marker found
    let descEnd =
        ingStart !== -1
            ? ingStart
            : instStart !== -1
                ? instStart
                : combinedSteps.length;
    let ingEnd = instStart !== -1 ? instStart : combinedSteps.length;

    if (descStart !== -1) {
      description = combinedSteps
          .substring(descStart + descMarker.length, descEnd)
          .trim();
    }

    if (ingStart !== -1) {
      ingredients = combinedSteps
          .substring(ingStart + ingMarker.length, ingEnd)
          .trim();
    } else if (descStart === -1 && instStart !== -1) {
      // Handle case where Ingredients might be missing but Instructions present
      description = combinedSteps.substring(0, instStart).trim(); // Treat text before Instructions as description
    }

    if (instStart !== -1) {
      instructions = combinedSteps
          .substring(instStart + instMarker.length)
          .trim();
    } else if (ingStart !== -1) {
      // Handle case where Instructions might be missing but Ingredients present
      // The previous logic already captured ingredients correctly in this case.
    } else if (descStart !== -1) {
      // Only description was found
    } else {
      // Fallback if parsing logic didn't catch edge cases well
      console.warn("Could not fully parse steps, check format:", combinedSteps);
      // Put unparsed parts in instructions as a safety measure
      if (!description && !ingredients && !instructions) {
        instructions = combinedSteps.trim();
      }
    }
  } catch (e) {
    console.error("Error parsing steps:", e);
    // Fallback: put everything in instructions if parsing fails badly
    return {
      description: "",
      ingredients: "",
      instructions: combinedSteps.trim(),
    };
  }

  return { description, ingredients, instructions };
};

// --- Helper Function to Combine Steps ---
// (Keep this function as is)
const combineSteps = (description, ingredients, instructions) => {
  // Recreate the expected combined format
  return `Description: ${description.trim()}\nIngredients:\n${ingredients.trim()}\nInstructions:\n${instructions.trim()}`;
};

const EditRecipe = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // --- State for separate fields ---
  const [name, setName] = useState("");
  const [availableCats, setAvailableCats] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]); // Stores array of selected category IDs (numbers)
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  // --- End State for separate fields ---

  const [originalRecipe, setOriginalRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false); // Added loading state for categories

  // Fetch existing recipe data and categories
  useEffect(() => {
    const fetchRecipeAndCategories = async () => {
      setLoading(true);
      setLoadingCategories(true); // Start category loading
      setFetchError("");
      try {
        // --- Fetch Recipe Details ---
        const recipeRes = await fetch(
            `http://localhost:5000/api/recipes/${recipeId}`
        );
        if (!recipeRes.ok) {
          if (recipeRes.status === 404) throw new Error("Recipe not found.");
          throw new Error(`Failed to fetch recipe (Status: ${recipeRes.status})`);
        }
        const recipeData = await recipeRes.json();
        setOriginalRecipe(recipeData);
        setName(recipeData.name);

        // --- Parse Steps ---
        const {
          description: parsedDesc,
          ingredients: parsedIng,
          instructions: parsedInst,
        } = parseCombinedSteps(recipeData.steps);
        setDescription(parsedDesc);
        setIngredients(parsedIng);
        setInstructions(parsedInst);

        // --- Fetch All Categories ---
        const catRes = await fetch(`http://localhost:5000/api/categories`);
        if (!catRes.ok) {
          throw new Error(`Failed to fetch categories (Status: ${catRes.status})`);
        }
        const catData = await catRes.json();
        setAvailableCats(catData.data ?? []);

        // --- Fetch Selected Categories for this Recipe ---
        const belongsToRes = await fetch(
            `http://localhost:5000/api/belongs-to/recipe/${recipeId}`
        );
        if (!belongsToRes.ok) {
          throw new Error(`Failed to fetch recipe category links (Status: ${belongsToRes.status})`);
        }
        const belongsToRows = await belongsToRes.json();
        // Ensure IDs are stored as numbers
        setSelectedCats(belongsToRows.map(r => Number(r.category_id)));

      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(err.message || "Could not load recipe data or categories.");
      } finally {
        setLoading(false);
        setLoadingCategories(false); // Finish category loading
      }
    };

    fetchRecipeAndCategories();
  }, [recipeId]); // Only depends on recipeId

  // --- Handle Checkbox Change ---
  const handleCategoryChange = (event) => {
    const categoryId = Number(event.target.value); // Get the ID (as number)
    const isChecked = event.target.checked;

    setSelectedCats(prevSelectedCats => {
      if (isChecked) {
        // Add the category ID if it's not already present
        return [...new Set([...prevSelectedCats, categoryId])];
      } else {
        // Remove the category ID
        return prevSelectedCats.filter(id => id !== categoryId);
      }
    });
  };

  // --- Handle Form Submission ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!name.trim() || !ingredients.trim() || !instructions.trim() || selectedCats.length === 0) {
      setError("Name, Ingredients, and Instructions cannot be empty, and at least one category must be selected.");
      setLoading(false);
      return;
    }

    // Combine steps
    const combinedStepsString = combineSteps(description, ingredients, instructions);

    try {
      // --- Update Recipe Core Data (name, steps) ---
      const updateRecipeRes = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          steps: combinedStepsString,
        }),
      });

      if (!updateRecipeRes.ok) {
        const errorData = await updateRecipeRes.json().catch(() => ({}));
        if (updateRecipeRes.status === 404) throw new Error("Recipe not found (maybe deleted?).");
        throw new Error(errorData.error || `Failed to update recipe details (Status: ${updateRecipeRes.status})`);
      }

      // --- Sync Category Links ---
      // 1. Get current links from server *again* to be safe (or could use state if confident)
      const currentLinksRes = await fetch(`http://localhost:5000/api/belongs-to/recipe/${recipeId}`);
      if (!currentLinksRes.ok) throw new Error("Could not fetch current category links for comparison.");
      const currentLinks = await currentLinksRes.json();
      const currentCategoryIds = currentLinks.map(r => Number(r.category_id)); // Ensure numbers

      // 2. Compute differences
      const idsToAdd = selectedCats.filter(id => !currentCategoryIds.includes(id));
      const idsToDelete = currentCategoryIds.filter(id => !selectedCats.includes(id));

      // 3. Perform additions (run in parallel)
      await Promise.all(
          idsToAdd.map(categoryId =>
              fetch("http://localhost:5000/api/belongs-to", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipe_id: Number(recipeId), // Ensure recipeId is number if needed
                  category_id: categoryId,
                }),
              }).then(res => {
                if (!res.ok) console.error(`Failed to add category link for ${categoryId}`);
                return res;
              })
          )
      );

      // 4. Perform deletions (run in parallel)
      await Promise.all(
          idsToDelete.map(categoryId =>
              fetch(`http://localhost:5000/api/belongs-to/${categoryId}/${recipeId}`, {
                method: "DELETE",
              }).then(res => {
                if (!res.ok) console.error(`Failed to delete category link for ${categoryId}`);
                return res;
              })
          )
      );

      alert("Recipe updated successfully!");
      if (user.role === "admin") navigate("/home");
      else navigate(`/profile`);

    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // --- Loading and Error States ---
  if (loading && !originalRecipe) { // Show loading only on initial fetch
    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          Loading recipe details...
        </div>
    );
  }

  if (fetchError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded text-center max-w-md">
            <p className="font-semibold mb-2">Error Loading Recipe</p>
            <p>{fetchError}</p>
            <Link
                to={user.role === 'admin' ? "/home" : "/profile"} // Navigate back appropriately
                className="text-blue-300 hover:text-blue-200 mt-3 block"
            >
              &larr; Go Back
            </Link>
          </div>
        </div>
    );
  }

  // --- Render Form ---
  return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
        <form
            onSubmit={handleUpdate}
            className="bg-gray-900 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-3xl" // Increased max-width
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Edit Recipe</h2>

          {error && (
              <p className="text-red-400 mb-4 text-center bg-red-900/50 p-3 rounded border border-red-700">
                {error}
              </p>
          )}

          <div className="space-y-5"> {/* Add spacing between form elements */}

            {/* --- Category Checkboxes --- */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium text-lg">
                Categories <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                  <p className="text-sm text-gray-400 italic">Loading categories...</p>
              ) : availableCats.length === 0 ? (
                  <p className="text-sm text-yellow-400 italic">No categories found.</p>
              ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 p-3 bg-gray-800 border border-gray-700 rounded max-h-48 overflow-y-auto">
                    {availableCats.map(cat => (
                        <div key={cat.category_id} className="flex items-center">
                          <input
                              type="checkbox"
                              id={`category-${cat.category_id}`}
                              value={cat.category_id}
                              checked={selectedCats.includes(cat.category_id)}
                              onChange={handleCategoryChange}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label
                              htmlFor={`category-${cat.category_id}`}
                              className="ml-2 text-sm font-medium text-gray-300 cursor-pointer"
                          >
                            {cat.name}
                          </label>
                        </div>
                    ))}
                  </div>
              )}
              {selectedCats.length === 0 && !loadingCategories && availableCats.length > 0 && (
                  <p className="text-xs text-red-400 mt-1">Please select at least one category.</p>
              )}
            </div>


            {/* --- Name Input --- */}
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-1 font-medium">
                Recipe Name <span className="text-red-500">*</span>
              </label>
              <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
                  required
              />
            </div>

            {/* --- Description Textarea --- */}
            <div>
              <label htmlFor="description" className="block text-gray-300 mb-1 font-medium">
                Description
              </label>
              <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
                  rows="3"
                  placeholder="A short description of the recipe..."
              />
            </div>

            {/* --- Ingredients Textarea --- */}
            <div>
              <label htmlFor="ingredients" className="block text-gray-300 mb-1 font-medium">
                Ingredients <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-2">(one per line recommended)</span>
              </label>
              <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
                  rows="6" // Slightly increased rows
                  required
                  placeholder="e.g.&#10;1 cup Flour&#10;2 Eggs&#10;1/2 tsp Salt"
              />
            </div>

            {/* --- Instructions Textarea --- */}
            <div>
              <label htmlFor="instructions" className="block text-gray-300 mb-1 font-medium">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
                  rows="8"
                  required
                  placeholder="Step-by-step instructions..."
              />
            </div>

            {/* ------------- PHOTO SECTION ------------- */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-blue-300">Photos</h3>
              <PhotoManager recipeId={recipeId} />
            </div>

            {/* --- Action Buttons --- */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-700">
              <Link
                  to={user.role === 'admin' ? "/home" : "/profile"} // Navigate back appropriately
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-150 px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
  );
};

export default EditRecipe;