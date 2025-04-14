import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SearchResults = ({ searchQuery, onClose }) => {
  const [results, setResults] = useState({
    recipes: [],
    ingredients: [],
    categories: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({
        recipes: [],
        ingredients: [],
        categories: []
      });
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) throw new Error("Failed to fetch search results");
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (!searchQuery.trim()) return null;

  const hasResults = results.recipes.length > 0 || results.ingredients.length > 0 || results.categories.length > 0;

  return (
    <div className="absolute z-50 w-80 max-h-96 overflow-y-auto bg-black/95 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl mt-2 left-0">
      {isLoading ? (
        <div className="p-4 text-center text-gray-400">
          <div className="animate-pulse">Searching...</div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-400">{error}</div>
      ) : (
        <>
          {!hasResults ? (
            <div className="p-4 text-center text-gray-400">No results found</div>
          ) : (
            <>
              {results.recipes.length > 0 && (
                <div className="p-3">
                  <h3 className="text-purple-400 text-sm font-semibold mb-2 uppercase tracking-wider">Recipes</h3>
                  <ul className="space-y-2">
                    {results.recipes.map((recipe) => (
                      <li key={recipe.recipe_id} className="group">
                        <Link 
                          to={`/recipe/${recipe.recipe_id}`} 
                          onClick={onClose}
                          className="flex items-center p-2 hover:bg-gray-800/60 rounded transition-colors"
                        >
                          {recipe.photo_url && (
                            <div className="w-10 h-10 rounded overflow-hidden mr-3 bg-gray-800 flex-shrink-0">
                              <img 
                                src={recipe.photo_url} 
                                alt={recipe.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = '/placeholder-food.png';
                                }}
                              />
                            </div>
                          )}
                          <div className="text-white group-hover:text-purple-300 transition-colors">{recipe.name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.ingredients.length > 0 && (
                <div className={`p-3 ${results.recipes.length > 0 ? 'border-t border-gray-800' : ''}`}>
                  <h3 className="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wider">Ingredients</h3>
                  <ul className="space-y-2">
                    {results.ingredients.map((ingredient) => (
                      <li key={ingredient.ingredient_id} className="group">
                        <Link 
                          to={`/recipe/${ingredient.recipe_id}`} 
                          onClick={onClose}
                          className="block p-2 hover:bg-gray-800/60 rounded transition-colors"
                        >
                          <div className="text-white group-hover:text-blue-300 transition-colors">{ingredient.name}</div>
                          <div className="text-gray-400 text-sm">Used in: {ingredient.recipe_name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.categories.length > 0 && (
                <div className={`p-3 ${(results.recipes.length > 0 || results.ingredients.length > 0) ? 'border-t border-gray-800' : ''}`}>
                  <h3 className="text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">Categories</h3>
                  <ul className="space-y-2">
                    {results.categories.map((category) => (
                      <li key={category.category_id} className="group">
                        <Link 
                          to={`/category/${category.category_id}`} 
                          onClick={onClose}
                          className="block p-2 hover:bg-gray-800/60 rounded transition-colors"
                        >
                          <div className="text-white group-hover:text-teal-300 transition-colors">{category.name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </div>
  );
};

export default SearchResults;