// routes/belongsTo.js
import { Router } from 'express';
import {
    getAllBelongsTo,
    getBelongsToByRecipe,
    getBelongsToByCategory,
    getBelongsToRecord,
    createBelongsTo,
    deleteBelongsTo
} from '../controllers/belongsToController.js';

const router = Router();

// GET all belongs_to records
router.get('/', getAllBelongsTo);

// GET by recipe
router.get('/recipe/:recipeId', getBelongsToByRecipe);

// GET by category
router.get('/category/:categoryId', getBelongsToByCategory);

// GET single record by composite key
router.get('/:categoryId/:recipeId', getBelongsToRecord);

// CREATE belongs_to record
router.post('/', createBelongsTo);

// DELETE belongs_to record
router.delete('/:categoryId/:recipeId', deleteBelongsTo);

export default router;
