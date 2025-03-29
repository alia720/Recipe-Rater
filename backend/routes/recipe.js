// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Route to get all recipes
router.get('/recipes', recipeController.getRecipes);

// Route to get a recipe by id
router.get('/recipes/:id', recipeController.getRecipeById);

// Route to create a new recipe
router.post('/recipes', recipeController.createRecipe);

// Route to update an existing recipe
router.put('/recipes/:id', recipeController.updateRecipe);

// Route to delete a recipe
router.delete('/recipes/:id', recipeController.deleteRecipe);

module.exports = router;
