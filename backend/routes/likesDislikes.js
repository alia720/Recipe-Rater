// routes/likesDislikes.js
import { Router } from 'express';
import {
    getAllLikesDislikes,
    getLikesDislikesByUser,
    getLikesDislikesByRecipe,
    getLikesDislikesRecord,
    createLikesDislikes,
    updateLikesDislikes,
    deleteLikesDislikes
} from '../controllers/likesDislikesController.js';

const router = Router();

// GET all likes_dislikes
router.get('/', getAllLikesDislikes);

// GET by user
router.get('/user/:userId', getLikesDislikesByUser);

// GET by recipe
router.get('/recipe/:recipeId', getLikesDislikesByRecipe);

// GET single record by userId & recipeId
router.get('/:userId/:recipeId', getLikesDislikesRecord);

// CREATE likes_dislikes record
router.post('/', createLikesDislikes);

// UPDATE a like/dislike
router.put('/:userId/:recipeId', updateLikesDislikes);

// DELETE a record
router.delete('/:userId/:recipeId', deleteLikesDislikes);

export default router;
