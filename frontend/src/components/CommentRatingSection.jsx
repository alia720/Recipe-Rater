// ----- CommentRatingSection.jsx -----
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// --- Loading Spinner --- (Keep as is)
const LoadingSpinner = ({ size = 'h-6 w-6' }) => (
    <svg className={`animate-spin ${size} text-blue-400`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Comment Section Component ---
const CommentRatingSection = ({ recipeId: propRecipeId }) => {
  const params = useParams();
  const recipeId = propRecipeId || params.id;
  const { user } = useUser();

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentTitle, setCommentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // --- Fetch Comments Effect --- (Keep as is)
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true); setCommentError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/recipe/${recipeId}`);
        if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.error || `Failed to fetch comments (${response.status})`); }
        const data = await response.json(); setComments(data);
      } catch (err) { console.error('Error fetching comments:', err); setCommentError(`Failed to load comments: ${err.message}`);
      } finally { setIsLoading(false); }
    };
    if (recipeId) fetchComments();
  }, [recipeId]);


  // --- Submit New Comment Handler --- (Keep secure version)
  const handleCommentSubmit = async e => {
    e.preventDefault();
    setCommentError(null); setEditError(null); setDeleteError(null);
    if (!user) { setCommentError('You must be logged in to comment'); return; }
    if (!commentInput.trim()) { setCommentError('Comment cannot be empty'); return; }
    setIsSubmitting(true);
    try {
      // Assuming secure session-based POST for creating comments
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          recipe_id: recipeId, user_id: user.user_id, // user_id needed for DB insert
          title: commentTitle.trim() || null, text: commentInput.trim(),
        }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `Failed to post comment (${res.status})`); }
      const newCommentData = await res.json();
      setComments(prevComments => [{ ...newCommentData.comment, username: user.username }, ...prevComments]);
      setCommentInput(''); setCommentTitle('');
    } catch (err) { console.error('Error submitting comment:', err); setCommentError(`Failed to post comment: ${err.message}`);
    } finally { setIsSubmitting(false); }
  };

  // --- Delete Handler --- (With insecure change)
  const handleDelete = async commentId => {
    if (editingCommentId === commentId) { handleCancelEdit(); }
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setCommentError(null); setEditError(null); setDeleteError(null);

    // --- INSECURE CHANGE: Check frontend user state ---
    if (!user) {
      setDeleteError('Cannot delete: You must be logged in.'); // Use state instead of alert
      return;
    }
    // --- END INSECURE CHANGE ---

    const originalComments = [...comments];
    setComments(cs => cs.filter(c => c.comment_id !== commentId));

    try {
      const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
          {
            method: 'DELETE',
            // --- INSECURE CHANGE: Send user info in body ---
            headers: { 'Content-Type': 'application/json' }, // Needed for body
            body: JSON.stringify({
              requestingUserId: user.user_id // Send ID from frontend context
            }),
            // --- END INSECURE CHANGE ---
            // credentials: 'include' // May not be needed if not using session for auth
          }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setComments(originalComments); // Revert
        throw new Error(errData.error || `Failed to delete comment (${res.status})`);
      }
      // Success
    } catch (err) {
      console.error("Delete failed:", err);
      setComments(originalComments); // Revert
      setDeleteError(`Failed to delete comment: ${err.message}`);
    }
  };

  // --- Edit Mode Trigger --- (Keep as is)
  const handleEditClick = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditText(comment.text);
    setEditError(null); setDeleteError(null);
  };

  // --- Cancel Edit --- (Keep as is)
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
    setEditError(null);
  };

  // --- Save Edit Handler --- (With insecure change)
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) { setEditError("Comment text cannot be empty."); return; }
    setEditError(null); setDeleteError(null);

    // --- INSECURE CHANGE: Check frontend user state ---
    if (!user) {
      setEditError('Cannot save: You must be logged in.'); // Use state instead of alert
      return;
    }
    // --- END INSECURE CHANGE ---

    setIsSavingEdit(true);
    const originalComment = comments.find(c => c.comment_id === commentId);
    const originalText = originalComment ? originalComment.text : '';
    setComments(cs => cs.map(c => c.comment_id === commentId ? { ...c, text: editText.trim() } : c)); // Optimistic update

    try {
      const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // --- INSECURE CHANGE: Send user info in body ---
            body: JSON.stringify({
              text: editText.trim(), // The actual update payload
              requestingUserId: user.user_id // Send ID from frontend context
            }),
            // --- END INSECURE CHANGE ---
            // credentials: 'include' // May not be needed if not using session for auth
          }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setComments(cs => cs.map(c => c.comment_id === commentId ? { ...c, text: originalText } : c)); // Revert
        throw new Error(errData.error || `Failed to update comment (${res.status})`);
      }

      const { comment: updatedCommentFromServer } = await res.json();
      setComments(cs => cs.map(c => c.comment_id === updatedCommentFromServer.comment_id ? updatedCommentFromServer : c));
      setEditingCommentId(null);
      setEditText("");

    } catch (err) {
      console.error("Update failed:", err);
      setComments(cs => cs.map(c => c.comment_id === commentId ? { ...c, text: originalText } : c)); // Revert
      setEditError(`Failed to save edit: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- Date Formatter --- (Keep as is)
  const formatDate = isoString => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      year:'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  };

  // --- Render Section --- (Keep the nice UI from previous step)
  return (
      <div className="bg-gray-800/50 p-5 md:p-6 rounded-lg border border-gray-700/80 shadow-inner">
        {/* ... (Heading, Error Display, New Comment Form - remain the same) ... */}
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-5 border-b border-gray-700 pb-3">
          Comments & Ratings
        </h2>

        {/* --- Error Display Area --- */}
        {commentError && <div role="alert" className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded text-sm flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0"/>{commentError}</div>}
        {deleteError && <div role="alert" className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded text-sm flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0"/>{deleteError}</div>}
        {/* Edit error displayed inline below */}

        {/* --- Comment Form --- */}
        {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
              {/* ... form inputs ... */}
              <div><label htmlFor="commentTitle" className="sr-only">Comment Title (Optional)</label><input id="commentTitle" type="text" value={commentTitle} onChange={e => setCommentTitle(e.target.value)} placeholder="Title (optional)" className="w-full p-2.5 rounded-md bg-gray-700/80 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out placeholder-gray-400 text-sm"/></div>
              <div><label htmlFor="commentText" className="sr-only">Comment Text</label><textarea id="commentText" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Leave a comment..." className="w-full p-2.5 rounded-md bg-gray-700/80 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out placeholder-gray-400 text-sm" rows={4} required/></div>
              <button type="submit" disabled={isSubmitting} className={`inline-flex items-center gap-2 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-5 rounded-lg font-medium text-sm transition-all duration-200 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {isSubmitting ? ( <><LoadingSpinner size="h-4 w-4" /> Submitting...</> ) : ( <> <PaperAirplaneIcon className="h-4 w-4" /> Submit Comment</> )}
              </button>
            </form>
        ) : (
            <div className="mb-6 p-3 bg-yellow-900/30 border border-yellow-700 text-yellow-300 rounded text-center text-sm"> Please <Link to="/login" className="font-semibold underline hover:text-yellow-100">log in</Link> or <Link to="/register" className="font-semibold underline hover:text-yellow-100">register</Link> to leave a comment. </div>
        )}

        {/* --- Comments List Display --- */}
        <div className="comments-list-area">
          {isLoading ? ( <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <LoadingSpinner />
            <p className="mt-3">Loading comments...</p>
          </div>) : comments.length === 0 ? ( <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <ChatBubbleBottomCenterTextIcon className="h-10 w-10 mb-3"/>
            <p className="text-lg">No comments yet.</p>
            <p className="text-sm mt-1">Be the first to share your thoughts!</p>
          </div>) : (
              <ul className="space-y-5">
                {comments.map((comment, index) => (
                    <li
                        key={comment.comment_id}
                        className={`p-4 rounded-lg border shadow-sm relative group transition-all duration-200 ease-in-out ${editingCommentId === comment.comment_id ? 'bg-gray-700 border-blue-600' : 'bg-gray-700/60 border-gray-600/70 hover:bg-gray-700'} ${editingCommentId !== comment.comment_id ? 'animate-fade-in-up' : ''}`}
                        style={{ animationDelay: editingCommentId ? '0ms' : `${index * 75}ms` }}
                    >
                      {editingCommentId === comment.comment_id ? (
                          /* --- EDITING VIEW --- */
                          <div className="edit-comment-form space-y-3">
                            {comment.title && (<h4 className="text-md font-semibold text-blue-300 mb-1">{comment.title}</h4>)}
                            <div>
                              <label htmlFor={`edit-textarea-${comment.comment_id}`} className="sr-only">Edit Comment</label>
                              <textarea
                                  id={`edit-textarea-${comment.comment_id}`}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-2.5 rounded-md bg-gray-600 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out placeholder-gray-400 text-sm"
                                  rows={3} autoFocus
                              />
                            </div>
                            {editError && <p role="alert" className="text-red-400 text-xs">{editError}</p>}
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button type="button" onClick={handleCancelEdit} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-500 hover:bg-gray-400 text-white text-xs font-medium transition-colors" title="Cancel edit"><XCircleIcon className="h-4 w-4"/> Cancel</button>
                              <button type="button" onClick={() => handleSaveEdit(comment.comment_id)} disabled={isSavingEdit || !editText.trim()} className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white text-xs font-medium transition-colors ${isSavingEdit || !editText.trim() ? 'bg-green-800 opacity-60 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`} title="Save changes">
                                {isSavingEdit ? <LoadingSpinner size="h-4 w-4"/> : <CheckCircleIcon className="h-4 w-4"/>} Save
                              </button>
                            </div>
                          </div>
                      ) : (
                          /* --- DISPLAY VIEW --- */
                          <>
                            {(user?.role === 'admin' || user?.user_id === comment.user_id) && (
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                                  <button onClick={() => handleEditClick(comment)} className="p-1.5 rounded-full text-yellow-400 hover:text-yellow-300 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-yellow-500" aria-label="Edit comment" title="Edit comment"><PencilSquareIcon className="h-4 w-4" /></button>
                                  <button onClick={() => handleDelete(comment.comment_id)} className="p-1.5 rounded-full text-red-400 hover:text-red-300 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500" aria-label="Delete comment" title="Delete comment"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            )}
                            {comment.title && (<h4 className="text-md font-semibold text-blue-300 mb-1 pr-16">{comment.title}</h4>)}
                            <p className={`text-gray-100 mb-3 break-words ${comment.title ? '' : 'pr-16'}`}>{comment.text}</p>
                            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-600 pt-2 mt-2">
                              <span>{comment.username || 'Anonymous'}</span>
                              {comment.created_at && (<time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>)}
                            </div>
                          </>
                      )}
                    </li>
                ))}
              </ul>
          )}
        </div>
      </div>
  );
};

export default CommentRatingSection;