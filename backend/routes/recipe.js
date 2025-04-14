// routes/recipeRoutes.js
import { Router } from 'express';
import {
    getAllRecipes,
    getRecipeById,
    searchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe
} from '../controllers/recipeController.js';

const router = Router();

// GET all recipes (with optional pagination)
router.get('/', getAllRecipes);

// Search recipes by name (ex: /api/recipes/search?query=chicken)
router.get('/search', searchRecipes);

// GET single recipe by ID
router.get('/:id', getRecipeById);

// CREATE a new recipe
router.post('/', createRecipe);

// UPDATE a recipe by ID
router.put('/:id', updateRecipe);

// DELETE a recipe by ID
router.delete('/:id', deleteRecipe);

export default router;
