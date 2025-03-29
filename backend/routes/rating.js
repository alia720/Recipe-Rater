// routes/rating.js
import { Router } from 'express';
import {
    getAllRatings,
    getRatingById,
    getRatingsByRecipe,
    getRatingsByUser,
    getAverageRatingForRecipe,
    createRating,
    updateRating,
    deleteRating
} from '../controllers/ratingController.js';

const router = Router();

// GET all ratings (with pagination)
router.get('/', getAllRatings);

// GET single rating by ID
router.get('/:id', getRatingById);

// GET ratings for a particular recipe
router.get('/recipe/:recipeId', getRatingsByRecipe);

// GET ratings by a particular user
router.get('/user/:userId', getRatingsByUser);

// GET average rating for a recipe
router.get('/recipe/:recipeId/average', getAverageRatingForRecipe);

// CREATE a new rating
router.post('/', createRating);

// UPDATE a rating
router.put('/:id', updateRating);

// DELETE a rating
router.delete('/:id', deleteRating);

export default router;
