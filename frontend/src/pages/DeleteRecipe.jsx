import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, Link, useNavigate } from 'react-router-dom';
import userStatus from "../components/UserStatus.jsx";
import {useUser} from "../context/UserContext.jsx";

const DeleteRecipe = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const [recipeName, setRecipeName] = useState(''); // State to hold recipe name
    const [loading, setLoading] = useState(false); // Loading for delete action
    const [fetchLoading, setFetchLoading] = useState(true); // Loading for initial fetch
    const [error, setError] = useState(''); // Error for delete action
    const [fetchError, setFetchError] = useState(''); // Error for initial fetch

    // Fetch recipe name on component mount
    useEffect(() => {
        const fetchRecipeName = async () => {
            setFetchLoading(true);
            setFetchError('');
            setError(''); // Clear previous action errors
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Recipe not found. It might have already been deleted.');
                    }
                    throw new Error(`Failed to load recipe details (Status: ${res.status})`);
                }
                const data = await res.json();
                setRecipeName(data.name); // Store the recipe name
            } catch (err) {
                console.error("Fetch error:", err);
                setFetchError(err.message);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchRecipeName();
    }, [recipeId]);


    const handleDeleteConfirm = async () => {
        setLoading(true);
        setError('');
        setFetchError(''); // Clear fetch errors

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${recipeId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                if (res.status === 404) {
                    // Should be caught by initial fetch, but handle just in case
                    throw new Error('Recipe not found.');
                }
                throw new Error(errorData.error || `Failed to delete recipe (Status: ${res.status})`);
            }

            alert(`Recipe "${recipeName || 'ID: '+recipeId}" deleted successfully!`); // Use name in alert
            if (user.role === 'admin') navigate('/home');
            else
                navigate('/profile');

        } catch (err) {
            console.error("Delete error:", err);
            setError(err.message || 'Deletion failed. Please try again.');
            setLoading(false);
        }
    };

    // Decide on the display name for confirmation message
    const displayName = fetchLoading ? 'this recipe' : (recipeName ? `'${recipeName}'` : 'this recipe (name unavailable)');

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4 antialiased">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">

                {/* Title */}
                <h1 className="text-3xl font-bold mb-5 text-center text-red-500">
                    Confirm Deletion
                </h1>

                {/* Error Display Area */}
                {fetchError && !loading && ( // Show fetch error prominently if it occurs
                    <p className="text-yellow-400 mb-6 text-center bg-yellow-900 bg-opacity-50 p-3 rounded border border-yellow-700 text-sm">
                        {fetchError}
                    </p>
                )}
                {error && ( // Show delete action error
                    <p className="text-red-400 mb-6 text-center bg-red-900 bg-opacity-50 p-3 rounded border border-red-700 text-sm">
                        {error}
                    </p>
                )}


                {/* Confirmation Text (show loading state if name hasn't loaded) */}
                <p className="text-gray-300 mb-4 text-center text-lg">
                    {fetchLoading
                        ? 'Loading recipe details...'
                        : `Are you sure you want to permanently delete Recipe ${displayName}?`
                    }
                </p>

                {/* Warning Text */}
                {!fetchLoading && !fetchError && ( // Show warning only if fetch was successful
                    <p className="text-yellow-500 mb-8 font-medium text-center">
                        This action cannot be undone.
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center items-center gap-5">
                    <Link
                        to="/profile"
                        // Disable link visually and functionally if loading
                        className={`px-8 py-2.5 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out ${
                            (loading || fetchLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                        }`}
                        aria-disabled={loading || fetchLoading}
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleDeleteConfirm}
                        // Disable button if loading name or deleting, or if name fetch failed
                        disabled={loading || fetchLoading || !!fetchError}
                        className="px-8 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </div>
                        ) : (
                            'Confirm Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteRecipe;