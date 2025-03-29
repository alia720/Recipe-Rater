// routes/comment.js
import { Router } from 'express';
import {
    getAllComments,
    getCommentById,
    getCommentsByRecipe,
    getCommentsByUser,
    createComment,
    updateComment,
    deleteComment
} from '../controllers/commentController.js';

const router = Router();

// GET all comments
router.get('/', getAllComments);

// GET single comment by ID
router.get('/:id', getCommentById);

// GET comments by recipe
router.get('/recipe/:recipeId', getCommentsByRecipe);

// GET comments by user
router.get('/user/:userId', getCommentsByUser);

// CREATE a new comment
router.post('/', createComment);

// UPDATE a comment
router.put('/:id', updateComment);

// DELETE a comment
router.delete('/:id', deleteComment);

export default router;
