import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
// import { FiXCircle, FiSearch } from 'react-icons/fi'; // Example if using react-icons

// Simple SVG Spinner Component 
const LoadingSpinner = () => (
    <svg className="animate-spin h-10 w-10 text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Simple SVG for "Not Found" 
const NotFoundIcon = () => (
    <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l4 4m0-4l-4 4"></path>
    </svg>
);


const Home = () => {
  /* ---------- state ---------- */
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [availableCats, setAvailableCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  /* ---------- grab ?query= from URL ---------- */
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query");

  /* ---------- fetch categories once ---------- */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
        .then(r => r.ok ? r.json() : Promise.reject(`Category fetch failed: ${r.status}`))
        .then(data => setAvailableCats(data.data ?? []))
        .catch(err => {
          console.error("Failed to fetch categories:", err);
          setAvailableCats([]);
        });
  }, []);

  /* ---------- fetch recipes whenever filters change ---------- */
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        let url;
        let isSearch = query && query.trim();

        if (isSearch) {
          url = `${import.meta.env.VITE_API_URL}/api/search?query=${encodeURIComponent(query)}`;
        } else {
          const params = new URLSearchParams({ sort: sortBy });
          if (selectedCat) params.append("category", selectedCat);
          url = `${import.meta.env.VITE_API_URL}/api/recipes?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); // Try to get error details
          throw new Error(errorData.error || `Workspace failed with status: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          // Use data.recipes for search results, data.data otherwise (adjust based on your API)
          setRecipes(isSearch ? (data.recipes ?? []) : (data.data ?? []));
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
        if (isMounted) setRecipes([]); // Clear recipes on error
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecipes();

    return () => { isMounted = false }; // Cleanup function
  }, [query, sortBy, selectedCat]);

  /* ---------- clear search helper ---------- */
  const clearSearch = () => navigate("/home"); // Navigate back to the base home route

  /* ---------- UI ---------- */
  return (
      // --- Main Container ---
      <div className="bg-gray-950 min-h-screen text-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto"> {/* Center content */}

          {/* --- Top Bar: Filters or Search Info --- */}
          <div className="mb-8 p-4 bg-gray-900 rounded-xl shadow-lg">
            {query ? (
                // --- Search Active View ---
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-lg text-center sm:text-left">
                    Showing results for: <span className="font-semibold text-blue-400">"{query}"</span>
                  </p>
                  <button
                      onClick={clearSearch}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition-colors duration-200 shadow hover:shadow-md"
                  >
                    {/* <FiXCircle className="h-5 w-5" />  Use icon library or SVG */}
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Clear Search
                  </button>
                </div>
            ) : (
                // --- Default Filters View ---
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                  {/* Sort Buttons */}
                  <div className="inline-flex bg-gray-800 rounded-lg p-1 shadow-inner">
                    {["newest", "top_rated"].map(opt => (
                        <button
                            key={opt}
                            onClick={() => setSortBy(opt)}
                            className={`px-5 py-2 rounded-md transition-all duration-300 text-sm font-medium ${
                                sortBy === opt
                                    ? opt === "newest"
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" // Active gradient
                                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" // Active gradient
                                    : "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-100" // Inactive
                            }`}
                        >
                          {opt === "newest" ? "✨ Newest" : "🔥 Popular"}
                        </button>
                    ))}
                  </div>

                  {/* Category Dropdown */}
                  <select
                      value={selectedCat}
                      onChange={e => setSelectedCat(e.target.value)}
                      disabled={availableCats.length === 0} // Disable if no categories loaded
                      className={`px-4 py-2.5 rounded-lg bg-gray-800 text-gray-200 border border-gray-700
                                     hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                                     transition-all duration-300 shadow-sm text-sm appearance-none ${availableCats.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ // Basic custom arrow styling (optional)
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        paddingRight: '2.5rem' // Make space for arrow
                      }}
                  >
                    <option value="">All Categories</option>
                    {availableCats.length > 0 ? (
                        availableCats.map(c => (
                            <option key={c.category_id} value={c.category_id}>
                              {c.name}
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading categories...</option>
                    )}
                  </select>
                </div>
            )}
          </div>


          {/* --- Recipes Grid / Loading / No Results --- */}
          <div className="mt-8">
            {loading ? (
                <div className="text-center py-16">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-400">Loading recipes...</p>
                </div>
            ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {recipes.map(r => (
                      <RecipeCard key={r.recipe_id} recipe={r} />
                  ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6">
                  <NotFoundIcon />
                  <p className="mt-5 text-xl font-semibold text-gray-300">No Recipes Found</p>
                  <p className="mt-2 text-gray-500">
                    {query
                        ? "Try adjusting your search term or clearing the search."
                        : "Try changing the sort order or category filter."}
                  </p>
                  {!query && availableCats.length === 0 && (
                      <p className="mt-2 text-sm text-yellow-500">Note: Categories failed to load, filtering may be limited.</p>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Home;