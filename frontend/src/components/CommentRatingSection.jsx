// ----- CommentRatingSection.jsx -----
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";

const CommentRatingSection = () => {
  const { id: recipeId } = useParams();
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentTitle, setCommentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/comments/recipe/${recipeId}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setCommentError('Failed to load comments.');
      } finally {
        setIsLoading(false);
      }
    };
    if (recipeId) fetchComments();
  }, [recipeId]);

  const handleCommentSubmit = async e => {
    e.preventDefault();
    setCommentError(null);
    if (!user) {
      setCommentError('You must be logged in to comment');
      return;
    }
    if (!commentInput.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipe_id: recipeId,
          user_id: user.user_id,
          title: commentTitle,
          text: commentInput,
        }),
      });
      if (!res.ok) throw new Error();
      // refresh
      const listRes = await fetch(
        `http://localhost:5000/api/comments/recipe/${recipeId}`,
        { credentials: 'include' }
      );
      if (!listRes.ok) throw new Error();
      setComments(await listRes.json());
      setCommentInput('');
      setCommentTitle('');
    } catch {
      setCommentError('Failed to post comment.');
    }
  };

  const handleDelete = async commentId => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) throw new Error();
      setComments(cs => cs.filter(c => c.comment_id !== commentId));
    } catch {
      alert('Failed to delete comment');
    }
  };

  const handleEdit = async comment => {
    const newText = window.prompt('Edit comment:', comment.text);
    if (!newText || newText === comment.text) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${comment.comment_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: newText }),
        }
      );
      if (!res.ok) throw new Error();
      const { comment: updated } = await res.json();
      setComments(cs => cs.map(c => c.comment_id === updated.comment_id ? updated : c));
    } catch {
      alert('Failed to update comment');
    }
  };

  const formatDate = dateString => {
    const opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, opts);
  };

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white text-lg mb-2">Comments</h3>
      {commentError && <p className="text-red-400 mb-2">{commentError}</p>}
      {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <input
            type="text"
            value={commentTitle}
            onChange={e => setCommentTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
          />
          <textarea
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
          >
            Submit
          </button>
        </form>
      ) : (
        <p className="text-yellow-400 mb-4">Please log in to comment</p>
      )}
      {isLoading ? (
        <p className="text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.comment_id} className="bg-gray-700 p-3 rounded relative">
              {comment.title && <h4 className="font-medium text-blue-300">{comment.title}</h4>}
              <p className="text-white mb-2">{comment.text}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>By: {comment.username || 'Anonymous'}</span>
                {comment.created_at && <span>{formatDate(comment.created_at)}</span>}
              </div>
              {(user?.role === 'admin' || user?.user_id === comment.user_id) && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button onClick={() => handleEdit(comment)} className="text-yellow-400 hover:text-yellow-600 text-sm">Edit</button>
                  <button onClick={() => handleDelete(comment.comment_id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentRatingSection;