import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

const Home = () => {
  /* ---------- state ---------- */
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  const [availableCats, setAvailableCats] = useState([]);   // [{id,name}, …]
  const [selectedCat,  setSelectedCat]  = useState("");     // category_id or ""

  const location = useLocation();
  const navigate  = useNavigate();

  /* ---------- grab ?query= from URL ---------- */
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query");

  /* ---------- fetch categories once ---------- */
  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
        .then(r => r.json())
        .then(data => setAvailableCats(data.data ?? []))
        .catch(err => {
          console.error("Failed to fetch categories:", err);
          setAvailableCats([]);   // don’t crash UI
        });
  }, []);

  /* ---------- fetch recipes whenever filters change ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let url;
        if (query && query.trim()) {
          url = `http://localhost:5000/api/search?query=${encodeURIComponent(
              query
          )}`;
        } else {
          const params = new URLSearchParams({ sort: sortBy });
          if (selectedCat) params.append("category", selectedCat);
          url = `http://localhost:5000/api/recipes?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setRecipes(query ? data.recipes : data.data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, sortBy, selectedCat]);

  /* ---------- clear search helper ---------- */
  const clearSearch = () => navigate("/home");

  /* ---------- UI ---------- */
  return (
      <div className="p-4 bg-black min-h-screen">
        {/* --- Filters row (only when not searching) --- */}
        {!query && (
            <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
              {/* sort buttons */}
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                {["newest", "top_rated"].map(opt => (
                    <button
                        key={opt}
                        onClick={() => setSortBy(opt)}
                        className={`px-6 py-2 rounded-md transition-all duration-300 ${
                            sortBy === opt
                                ? opt === "newest"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-transparent text-gray-400 hover:bg-gray-700"
                        }`}
                    >
                      {opt === "newest" ? "New" : "Popular"}
                    </button>
                ))}
              </div>

              {/* category dropdown */}
              <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  className="px-6 py-2 rounded-md bg-gray-800 text-gray-200
                       hover:bg-gray-700 transition-all duration-300"
              >
                <option value="">All categories</option>
                {availableCats.map(c => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                ))}
              </select>
            </div>
        )}

        {/* clear‑search button */}
        {query && (
            <div className="mb-8 flex justify-center">
              <button
                  onClick={clearSearch}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Clear Search
              </button>
            </div>
        )}

        {/* recipes grid */}
        {loading ? (
            <div className="text-center text-white">Loading...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recipes.length ? (
                  recipes.map(r => <RecipeCard key={r.recipe_id} recipe={r} />)
              ) : (
                  <div className="col-span-full text-center text-white">
                    No recipes found.
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default Home;