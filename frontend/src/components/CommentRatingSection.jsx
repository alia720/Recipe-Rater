import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

const CommentRatingSection = () => {
  const { id: recipeId } = useParams();
  const { user } = useUser();
  
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentTitle, setCommentTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/comments/recipe/${recipeId}`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        
        const data = await response.json();
        setComments(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments. Please try again.");
        setIsLoading(false);
      }
    };

    if (recipeId) {
      fetchComments();
    }
  }, [recipeId]);

  // Submit a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to leave a comment");
      return;
    }
    
    if (!commentInput.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          recipe_id: recipeId,
          user_id: user.user_id,
          title: commentTitle,
          text: commentInput
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      
      // Refresh comments after posting
      const updatedResponse = await fetch(`http://localhost:5000/api/comments/recipe/${recipeId}`, {
        credentials: "include"
      });
      
      if (!updatedResponse.ok) {
        throw new Error("Failed to refresh comments");
      }
      
      const updatedData = await updatedResponse.json();
      setComments(updatedData);
      
      // Clear input fields
      setCommentInput("");
      setCommentTitle("");
      setError(null);
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again.");
    }
  };

  // Handle star rating
  const handleRatingSubmit = async (value) => {
    if (!user) {
      setError("You must be logged in to rate this recipe");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          recipe_id: recipeId,
          user_id: user.user_id,
          rating_value: value
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }
      
      setUserRating(value);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit rating. Please try again.");
    }
  };

  // Render 5 stars for rating
  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <FaStar
          key={index}
          className="cursor-pointer"
          color={ratingValue <= userRating ? "#ffc107" : "#e4e5e9"}
          size={24}
          onClick={() => handleRatingSubmit(ratingValue)}
        />
      );
    });
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
      {/* Rating Section */}
      <div className="mb-6">
        <h3 className="text-white text-lg mb-2">Rate this Recipe</h3>
        <div className="flex items-center">
          {renderStars()}
        </div>
        {!user && <p className="text-yellow-400 mt-2 text-sm">Login to rate this recipe</p>}
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-white text-lg mb-2">Comments</h3>
        
        {error && <p className="text-red-400 mb-2">{error}</p>}
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <input
              type="text"
              value={commentTitle}
              onChange={(e) => setCommentTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full p-2 rounded bg-gray-700 text-white mb-2"
            />
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Leave a comment..."
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows="3"
              required
            ></textarea>
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
            >
              Submit
            </button>
          </form>
        ) : (
          <p className="text-yellow-400 mb-4">Please login to leave a comment</p>
        )}
        
        {isLoading ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.comment_id} className="bg-gray-700 p-3 rounded">
                {comment.title && (
                  <h4 className="font-medium text-blue-300">{comment.title}</h4>
                )}
                <p className="text-white mb-2">{comment.text}</p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>By: {comment.username || "Anonymous"}</span>
                  {comment.created_at && (
                    <span>{formatDate(comment.created_at)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommentRatingSection;