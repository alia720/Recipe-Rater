// routes/submits.js
import { Router } from 'express';
import {
    getAllSubmits,
    getSubmitsByUser,
    getSubmitsByRecipe,
    getSubmitRecord,
    createSubmits,
    updateSubmits,
    deleteSubmits
} from '../controllers/submitsController.js';

const router = Router();

// GET all submits
router.get('/', getAllSubmits);

// GET submits by user
router.get('/user/:userId', getSubmitsByUser);

// GET submits by recipe
router.get('/recipe/:recipeId', getSubmitsByRecipe);

// GET single submit record by composite key
router.get('/:userId/:recipeId', getSubmitRecord);

// CREATE a new submit record (user->recipe)
router.post('/', createSubmits);

// UPDATE a submit record (optional)
router.put('/:userId/:recipeId', updateSubmits);

// DELETE a submit record
router.delete('/:userId/:recipeId', deleteSubmits);

export default router;
