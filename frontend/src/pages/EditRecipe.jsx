import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useParams, useNavigate, Link } from "react-router-dom";
import PhotoManager from "../components/PhotoManager.jsx";
import { useUser } from "../context/UserContext";

const user = useUser();

// --- Helper Function to Parse Combined Steps ---
// NOTE: This parser assumes a specific format based on the AddRecipe logic.
// It might fail if the format is inconsistent in existing data.
const parseCombinedSteps = (combinedSteps = "") => {
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
const combineSteps = (description, ingredients, instructions) => {
  // Recreate the expected combined format
  return `Description: ${description.trim()}\nIngredients:\n${ingredients.trim()}\nInstructions:\n${instructions.trim()}`;
};

const EditRecipe = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  // --- State for separate fields ---
  const [name, setName] = useState("");
  const [availableCats,setAvailableCats] = useState([]);
  const [selectedCats,setSelectedCats] = useState([]);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  // --- End State for separate fields ---

  const [originalRecipe, setOriginalRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  // Fetch existing recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch(
          `http://localhost:5000/api/recipes/${recipeId}`
        );
        if (!res.ok) {
          if (res.status === 404) throw new Error("Recipe not found.");
          throw new Error(`Failed to fetch recipe (Status: ${res.status})`);
        }
        const data = await res.json();
        setOriginalRecipe(data);
        setName(data.name);
        
        // set categories here

        /* fetch all categories */
        if (availableCats.length === 0) {
          const catRes = await fetch(`http://localhost:5000/api/categories`);
          const catData = await catRes.json();
          setAvailableCats(catData.data ?? []);

        }
        /* ----- fetch links (belongs_to) to pre‑select ----- */
        const belongsToRes = await fetch(
            `http://localhost:5000/api/belongs-to/recipe/${recipeId}`
        );
        const belongsToRows = await belongsToRes.json();
        setSelectedCats(belongsToRows.map(r => r.category_id));


        // --- Parse the combined steps string ---
        const {
          description: parsedDesc,
          ingredients: parsedIng,
          instructions: parsedInst,
        } = parseCombinedSteps(data.steps);

        setDescription(parsedDesc);
        setIngredients(parsedIng);
        setInstructions(parsedInst);
        // --- End Parsing ---
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(err.message || "Could not load recipe data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!name.trim() || !ingredients.trim() || !instructions.trim() || selectedCats.length === 0)  {
      setError("Name, Ingredients, and Instructions cannot be empty and must have at least one category selected.");
      setLoading(false);
      return;
    }

    // --- Combine separate fields back into steps string ---
    const combinedStepsString = combineSteps(
      description,
      ingredients,
      instructions
    );
    // --- End Combining ---

    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          steps: combinedStepsString, // Send the combined string
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 404)
          throw new Error("Recipe not found (maybe deleted?).");
        throw new Error(
          errorData.error || `Failed to update recipe (Status: ${res.status})`
        );
      }

      alert("Recipe updated successfully!");
      /* sync category */
      /*  get current links from server (after update) */
      const curRes = await fetch(`http://localhost:5000/api/belongs-to/recipe/${recipeId}`);
      const curRows = await curRes.json();
      const currentIds = curRows.map(r => r.category_id);

      /* Compute addition and deletions*/
      const toAdd = selectedCats.filter(id => !currentIds.includes(id));
      const toDelete = currentIds.filter(id => !selectedCats.includes(id));

      /* Perform add*/
      await Promise.all(
          toAdd.map(id => fetch("http://localhost:5000/api/belongs-to",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipe_id: recipeId,
              category_id: id,
            })
          })
          )
      );

      /* Perform delete*/
      await Promise.all(
          toDelete.map(id => fetch(`http://localhost:5000/api/belongs-to/${id}/${recipeId}`,{
            method: "DELETE",
          })
          )
      );
      if (user.role === "admin") navigate("/home");
      else      navigate(`/profile`);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Loading and Error States (remain mostly the same) ---
  if (loading && !originalRecipe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading recipe details...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded text-center">
          <p>{fetchError}</p>
          <Link
            to="/profile"
            className="text-blue-300 hover:text-blue-200 mt-2 block"
          >
            &larr; Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  // --- Render Form with Separate Fields ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <form
        onSubmit={handleUpdate}
        className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Recipe</h2>

        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-900 p-2 rounded border border-red-700">
            {error}
          </p>
        )}

        <div>
          {/* Category multi‑select */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Categories
            </label>
            {availableCats.length === 0 ? (
                <p className="text-sm text-gray-400 italic"> Loading categories</p>
                ):(
            <select
                multiple
                value={selectedCats}
                onChange={(e) =>
                    setSelectedCats(
                        Array.from(e.target.selectedOptions, opt => Number(opt.value))
                    )
                }
                className="w-full h-40 p-2 rounded bg-gray-800 text-white border
               border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {availableCats.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
              ))}
            </select>)}
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>


          {/* --- Name Input (remains the same) --- */}
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Recipe Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* --- Description Textarea --- */}
          <div>
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
            />
          </div>

          {/* --- Ingredients Textarea --- */}
          <div>
            <label htmlFor="ingredients" className="block text-gray-300 mb-2">
              Ingredients (one per line recommended)
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="5"
              required
            />
          </div>

          {/* --- Instructions Textarea --- */}
          <div>
            <label htmlFor="instructions" className="block text-gray-300 mb-2">
              Instructions
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="8"
              required
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Link
              to="/profile"
              className="text-gray-400 hover:text-gray-200 transition-colors duration-150"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        {/* ------------- PHOTO SECTION ------------- */}
        <h3 className="text-xl font-semibold mt-8 mb-4">Photos</h3>
        <PhotoManager recipeId={recipeId} />

      </form>
    </div>
  );
};

export default EditRecipe;
