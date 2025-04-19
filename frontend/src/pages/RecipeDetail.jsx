import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import CommentRatingSection from "../components/CommentRatingSection";
import VoteButton from "../components/VoteButton";
import { useUser } from "../context/UserContext";
import {
  ExclamationTriangleIcon,
  PhotoIcon,
  ListBulletIcon, // Icon for Ingredients
  QueueListIcon, // Icon for Instructions
  InformationCircleIcon // Icon for Description
} from "@heroicons/react/24/outline";


const parseCombinedSteps = (combinedSteps = "") => {
  const descMarker = "Description:";
  const ingMarker = "\nIngredients:\n";
  const instMarker = "\nInstructions:\n";

  let description = "";
  let ingredients = "";
  let instructions = "";

  try {
    if (!combinedSteps) return { description, ingredients, instructions }; // Handle empty/null input

    let descStart = combinedSteps.indexOf(descMarker);
    let ingStart = combinedSteps.indexOf(ingMarker);
    let instStart = combinedSteps.indexOf(instMarker);

    // Only recognize Description: if it's exactly at the start
    if (descStart !== 0) descStart = -1;

    let descEnd = ingStart !== -1 ? ingStart : instStart !== -1 ? instStart : combinedSteps.length;
    let ingEnd = instStart !== -1 ? instStart : combinedSteps.length;

    if (descStart !== -1) {
      description = combinedSteps.substring(descStart + descMarker.length, descEnd).trim();
    }

    if (ingStart !== -1) {
      ingredients = combinedSteps.substring(ingStart + ingMarker.length, ingEnd).trim();
      // If description wasn't found but ingredients were, capture text before ingredients as description
      if (descStart === -1 && description === "") {
        description = combinedSteps.substring(0, ingStart).trim();
      }
    } else if (descStart === -1 && instStart !== -1 && description === "") {
      // Handle case: No description marker, no ingredients marker, but instructions marker exists
      description = combinedSteps.substring(0, instStart).trim();
    }

    if (instStart !== -1) {
      instructions = combinedSteps.substring(instStart + instMarker.length).trim();
      // If only instructions were found (no markers before), capture leading text as description
      if (descStart === -1 && ingStart === -1 && description === "" && instructions !== combinedSteps.trim()) {
        description = combinedSteps.substring(0, instStart).trim();
      }
    } else if (ingStart !== -1) {
      // Only ingredients found after optional description; text after ingredients is instructions
      instructions = combinedSteps.substring(ingEnd).trim();
    } else if (descStart !== -1) {
      // Only description found; text after description is instructions
      instructions = combinedSteps.substring(descEnd).trim();
    } else if (!description && !ingredients && !instructions) {
      // No markers found at all, treat entire string as instructions (or description?)
      // Let's default to instructions as it's often the longest part.
      console.warn("Could not parse steps using markers, treating full text as instructions:", combinedSteps);
      instructions = combinedSteps.trim();
    }

  } catch (e) {
    console.error("Error parsing steps:", e);
    // Fallback: put everything in instructions if parsing fails badly
    return { description: "", ingredients: "", instructions: combinedSteps?.trim() || "" };
  }

  return { description, ingredients, instructions };
};


// --- Loading Spinner ---
const LoadingSpinner = ({ size = 'h-10 w-10' }) => (
    <svg className={`animate-spin ${size} text-blue-400 mx-auto`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Recipe Detail Component ---
const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [recipe, setRecipe] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- useEffect and fetch logic (keep as is from previous example) ---
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError("");
      setRecipe(null);
      setPhotos([]);
      try {
        const recipeRes = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!recipeRes.ok) {
          if (recipeRes.status === 404) throw new Error("Recipe not found.");
          const errData = await recipeRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to fetch recipe (${recipeRes.status})`);
        }
        const recipeData = await recipeRes.json();
        const photosRes = await fetch(`http://localhost:5000/api/photos/recipe/${id}`);
        let photosData = [];
        if (photosRes.ok) {
          photosData = await photosRes.json();
        } else { console.warn(`Failed to fetch photos (${photosRes.status})`); }
        const processedRecipe = {
          ...recipeData,
          categories: Array.isArray(recipeData.categories) ? recipeData.categories : (recipeData.categories ? recipeData.categories.split(',').map(c => c.trim()) : [])
        };
        setRecipe(processedRecipe);
        setPhotos(photosData);
      } catch (err) {
        console.error("Error loading recipe:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // --- useMemo for parsing steps (keep as is) ---
  const parsedSteps = useMemo(() => {
    if (recipe?.steps) { return parseCombinedSteps(recipe.steps); }
    return { description: "", ingredients: "", instructions: "" };
  }, [recipe?.steps]);

  // --- Loading State ---
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-400">Loading recipe...</p>
        </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-red-400">Error Loading Recipe</h2>
          <p className="text-gray-400">{error}</p>
          <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
            Back to Home
          </Link>
        </div>
    );
  }

  // --- Recipe Not Found Fallback ---
  if (!recipe) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <p className="text-red-400 text-xl">Recipe data is unavailable.</p>
        </div>
    );
  }

  // --- Main Organized Render ---
  return (
      <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8 animate-fade-in">
        {/* Main content card */}
        <article className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-xl max-w-4xl mx-auto border border-gray-700/50">

          {/* Section 1: Header (Title, Categories, Vote) */}
          <header className="mb-6 md:mb-8 pb-6 border-b border-gray-700/80">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Title and Categories */}
              <div className="flex-grow">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{recipe.name}</h1>
                {recipe.categories && recipe.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.categories.map((cat, index) => (
                          <span key={index} className="inline-block bg-gradient-to-r from-blue-900/70 to-purple-900/70 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                            {cat}
                                        </span>
                      ))}
                    </div>
                )}
              </div>
              {/* Vote Button */}
              <div className="flex-shrink-0 mt-2 sm:mt-0">
                <VoteButton recipeId={recipe.recipe_id} />
              </div>
            </div>
            {/* Optional Author/Date - Placed below title */}
            {/* <div className="text-sm text-gray-400 mt-4 flex gap-4">
                         <span>Author: {recipe.author_username || 'Unknown'}</span>
                         <span>Added: {formatDate(recipe.created_at)}</span>
                     </div> */}
          </header>

          {/* Section 2: Image Gallery */}
          {photos.length > 0 && (
              <section aria-labelledby="gallery-heading" className="mb-8 md:mb-10">
                <h2 id="gallery-heading" className="sr-only">Photo Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Simplified gallery - consider a carousel for many images */}
                  {photos.map((photo, index) => (
                      <div key={photo.photo_id} className="relative group overflow-hidden rounded-lg shadow-md aspect-video"> {/* Fixed aspect ratio */}
                        <img
                            src={photo.url}
                            alt={photo.caption || `${recipe.name} - Photo ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none'; const fb = e.target.parentNode.querySelector('.image-fallback'); if(fb) fb.style.display = 'flex'; }}
                            loading="lazy"
                        />
                        <div className="image-fallback hidden absolute inset-0 bg-gray-700 items-center justify-center text-gray-500"> <PhotoIcon className="h-12 w-12"/> </div>
                        {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <p className="text-sm">{photo.caption}</p>
                            </div>
                        )}
                      </div>
                  ))}
                </div>
              </section>
          )}

          {/* Section 3: Description (Optional) */}
          {parsedSteps.description && (
              <section aria-labelledby="description-heading" className="mb-8 md:mb-10 p-5 bg-gray-800/60 rounded-lg border border-gray-700">
                <h2 id="description-heading" className="flex items-center text-xl font-semibold text-gray-100 mb-3">
                  <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-400 flex-shrink-0"/>
                  Description
                </h2>
                <p className="text-gray-300 leading-relaxed">{parsedSteps.description}</p>
              </section>
          )}

          {/* Section 4: Ingredients */}
          <section aria-labelledby="ingredients-heading" className="mb-8 md:mb-10 p-5 bg-gray-800/60 rounded-lg border border-gray-700">
            <h2 id="ingredients-heading" className="flex items-center text-xl font-semibold text-gray-100 mb-4">
              <ListBulletIcon className="h-6 w-6 mr-2 text-green-400 flex-shrink-0"/>
              Ingredients
            </h2>
            {parsedSteps.ingredients ? (
                <ul className="space-y-2.5 pl-1">
                  {parsedSteps.ingredients.split('\n').map((item, index) => (
                      item.trim() && (
                          <li key={index} className="flex items-start">
                            <span className="text-green-400 font-semibold mr-2 mt-1">&#8226;</span> {/* Custom bullet */}
                            <span className="text-gray-300">{item.trim()}</span>
                          </li>
                      )
                  ))}
                </ul>
            ) : (
                <p className="text-gray-400 italic">No ingredients listed.</p>
            )}
          </section>

          {/* Section 5: Instructions */}
          <section aria-labelledby="instructions-heading" className="mb-8 md:mb-10 p-5 bg-gray-800/60 rounded-lg border border-gray-700">
            <h2 id="instructions-heading" className="flex items-center text-xl font-semibold text-gray-100 mb-4">
              <QueueListIcon className="h-6 w-6 mr-2 text-purple-400 flex-shrink-0"/>
              Instructions
            </h2>
            {parsedSteps.instructions ? (
                // Using div and custom counter for more styling control
                <div className="space-y-4 text-gray-300 instructions-list">
                  {parsedSteps.instructions.split('\n').map((step, index) => (
                      step.trim() && (
                          <div key={index} className="flex items-start instruction-step">
                                          <span className="step-number bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                               {index + 1}
                                          </span>
                            <p className="leading-relaxed">{step.trim()}</p>
                          </div>
                      )
                  ))}
                </div>
            ) : (
                <p className="text-gray-400 italic">No instructions provided.</p>
            )}
          </section>


          {/* Section 6: Comments & Ratings */}
          {/* Optional Separator */}
          <hr className="my-8 md:my-12 border-gray-700/80" />

          <section aria-labelledby="comments-ratings-heading">
            <h2 id="comments-ratings-heading" className="text-2xl font-semibold mb-6 text-white">Comments & Ratings</h2>
            <CommentRatingSection recipeId={id} />
          </section>

        </article>
      </div>
  );
};

export default RecipeDetail;