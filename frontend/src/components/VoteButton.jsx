// src/components/VoteButton.jsx
import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useUser } from "../context/UserContext";

const VoteButton = ({ recipeId }) => {
  const { user } = useUser();
  const [voteStatus, setVoteStatus] = useState(null); // null, true (upvote), false (downvote)
  const [voteCount, setVoteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current vote count and user's vote status
  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        setLoading(true);
        
        // Get all votes for this recipe
        const votesResponse = await fetch(
          `http://localhost:5000/api/likes-dislikes/recipe/${recipeId}`,
          {
            credentials: "include"
          }
        );

        if (!votesResponse.ok) {
          throw new Error("Failed to fetch votes");
        }

        const votesData = await votesResponse.json();
        
        // Calculate vote count (upvotes - downvotes)
        const upvotes = votesData.filter(vote => vote.liked === 1).length;
        const downvotes = votesData.filter(vote => vote.liked === 0).length;
        setVoteCount(upvotes - downvotes);
        
        // If user is logged in, check if they've voted
        if (user) {
          const userVote = votesData.find(vote => vote.user_id === user.user_id);
          if (userVote) {
            setVoteStatus(userVote.liked === 1);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vote data:", err);
        setError("Failed to load votes");
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchVoteData();
    }
  }, [recipeId, user]);

  const handleVote = async (isUpvote) => {
    if (!user) {
      setError("You must be logged in to vote");
      return;
    }

    try {
      setError(null);
      
      // If user is clicking the same vote button again, they're removing their vote
      const isRemovingVote = voteStatus === isUpvote;
      
      if (isRemovingVote) {
        // Delete the vote
        const deleteResponse = await fetch(
          `http://localhost:5000/api/likes-dislikes/${user.user_id}/${recipeId}`,
          {
            method: "DELETE",
            credentials: "include"
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Failed to remove vote");
        }
        
        // Update local state
        setVoteCount(isUpvote ? voteCount - 1 : voteCount + 1);
        setVoteStatus(null);
      } else {
        // Either creating or updating a vote
        const voteData = {
          user_id: user.user_id,
          recipe_id: recipeId,
          liked: isUpvote
        };

        // Check if user has already voted
        if (voteStatus !== null) {
          // Update existing vote
          const updateResponse = await fetch(
            `http://localhost:5000/api/likes-dislikes/${user.user_id}/${recipeId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify(voteData)
            }
          );

          if (!updateResponse.ok) {
            throw new Error("Failed to update vote");
          }
          
          // Update local state (changing from downvote to upvote means +2, and vice versa)
          setVoteCount(isUpvote ? voteCount + 2 : voteCount - 2);
        } else {
          // Create new vote
          const createResponse = await fetch(
            "http://localhost:5000/api/likes-dislikes",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify(voteData)
            }
          );

          if (!createResponse.ok) {
            throw new Error("Failed to submit vote");
          }
          
          // Update local state
          setVoteCount(isUpvote ? voteCount + 1 : voteCount - 1);
        }
        
        // Set the new vote status
        setVoteStatus(isUpvote);
      }
    } catch (err) {
      console.error("Error voting:", err);
      setError("Failed to process vote. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center mr-4">
      <button
        onClick={() => handleVote(true)}
        className={`focus:outline-none ${
          voteStatus === true ? "text-orange-500" : "text-gray-400 hover:text-gray-200"
        }`}
        aria-label="Upvote"
      >
        <FaArrowUp size={24} />
      </button>
      
      <span className={`text-lg font-medium my-1 ${
        voteCount > 0 ? "text-orange-500" : voteCount < 0 ? "text-blue-500" : "text-gray-400"
      }`}>
        {voteCount}
      </span>
      
      <button
        onClick={() => handleVote(false)}
        className={`focus:outline-none ${
          voteStatus === false ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
        }`}
        aria-label="Downvote"
      >
        <FaArrowDown size={24} />
      </button>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {!user && (
        <p className="text-gray-500 text-xs mt-1">Login to vote</p>
      )}
    </div>
  );
};

export default VoteButton;