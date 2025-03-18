import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const CommentRatingSection = () => {
  // For demo purposes, we’re storing comments and rating in state.
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [rating, setRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false); // Prevent multiple votes per session

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentInput.trim()) {
      setComments([...comments, commentInput]);
      setCommentInput("");
    }
  };

  const handleRatingClick = () => {
    if (!hasVoted) {
      setRating(rating + 1);
      setHasVoted(true);
    }
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
      {/* Rating Section */}
      <div className="flex items-center mb-4">
        <button onClick={handleRatingClick} className="flex items-center text-yellow-400 mr-2">
          <FaStar size={24} />
          <span className="ml-1 text-white">{rating}</span>
        </button>
        <span className="text-white">Rating</span>
      </div>

      {/* Comments Section */}
      <div>
        <h3 className="text-white text-lg mb-2">Comments</h3>
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows="3"
          ></textarea>
          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
          >
            Submit
          </button>
        </form>
        <ul>
          {comments.map((comment, index) => (
            <li key={index} className="bg-gray-700 p-2 rounded mb-2 text-white">
              {comment}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommentRatingSection;
