// controllers/recipeController.js
const pool = require('../db');

// Get all recipes
exports.getRecipes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM recipe');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
};

// Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [recipeId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
};

// Create a new recipe
exports.createRecipe = async (req, res) => {
    try {
        const { name, steps } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const [result] = await pool.query('INSERT INTO recipe (name, steps) VALUES (?, ?)', [name, steps]);
        const insertedRecipe = { recipe_id: result.insertId, name, steps };
        res.status(201).json(insertedRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Error creating recipe' });
    }
};

// Update an existing recipe
exports.updateRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { name, steps } = req.body;
        // Optional: Validate that name exists if required
        const [result] = await pool.query(
            'UPDATE recipe SET name = ?, steps = ? WHERE recipe_id = ?',
            [name, steps, recipeId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json({ recipe_id: recipeId, name, steps });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Error updating recipe' });
    }
};

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const [result] = await pool.query('DELETE FROM recipe WHERE recipe_id = ?', [recipeId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Error deleting recipe' });
    }
};
