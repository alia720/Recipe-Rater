// routes/ingredient.js
import { Router } from 'express';

import {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    searchIngredients
} from '../controllers/ingredientController.js';

const router = Router();

// GET all ingredients (with optional pagination)
router.get('/', getAllIngredients);

// SEARCH ingredients by name or type (e.g., /api/ingredients/search?query=salt)
router.get('/search', searchIngredients);

// GET single ingredient by ID
router.get('/:id', getIngredientById);

// CREATE a new ingredient
router.post('/', createIngredient);

// UPDATE an ingredient by ID
router.put('/:id', updateIngredient);

// DELETE an ingredient by ID
router.delete('/:id', deleteIngredient);

export default router;
