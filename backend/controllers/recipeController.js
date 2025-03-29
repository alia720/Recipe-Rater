// controllers/recipeController.js
import pool from '../db.js';

/**
 * Get all recipes (with optional pagination).
 */
export const getAllRecipes = async (req, res) => {
    try {
        // Optional: handle pagination via query parameters (limit & page)
        const limit = parseInt(req.query.limit) || 10; // default 10
        const page = parseInt(req.query.page) || 1;    // default page 1
        const offset = (page - 1) * limit;

        const [rows] = await pool.query('SELECT * FROM recipe LIMIT ? OFFSET ?', [limit, offset]);

        // You can also get total count to include in your response
        const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM recipe');
        const totalItems = countRows[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single recipe by ID.
 */
export const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching recipe by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Search for recipes by name (partial match).
 * Example: GET /api/recipes/search?query=chicken
 */
export const searchRecipes = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const searchTerm = `%${query}%`; // partial matching
        const [rows] = await pool.query(
            'SELECT * FROM recipe WHERE name LIKE ?',
            [searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new recipe.
 */
export const createRecipe = async (req, res) => {
    const { name, steps } = req.body;
    // Basic validation
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const [result] = await pool.query('INSERT INTO recipe (name, steps) VALUES (?, ?)', [
            name,
            steps || null
        ]);
        // result.insertId contains the newly created ID
        res.status(201).json({
            message: 'Recipe created successfully',
            recipeId: result.insertId
        });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing recipe by ID.
 */
export const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { name, steps } = req.body;

    try {
        // Check if the recipe exists
        const [existing] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Update the fields that are provided
        await pool.query('UPDATE recipe SET name = ?, steps = ? WHERE recipe_id = ?', [
            name || existing[0].name, // if name is not provided, keep existing
            steps || existing[0].steps,
            id
        ]);

        res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a recipe by ID.
 */
export const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the recipe exists
        const [existing] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await pool.query('DELETE FROM recipe WHERE recipe_id = ?', [id]);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
