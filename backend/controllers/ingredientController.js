// controllers/ingredientController.js
import pool from '../db.js';

/**
 * Get all ingredients (with optional pagination).
 */
export const getAllIngredients = async (req, res) => {
    try {
        // Optional pagination query params
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // Retrieve ingredients with pagination
        const [rows] = await pool.query(
            'SELECT * FROM ingredient ORDER BY ingredient_id LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // Get total items for pagination metadata
        const [countRows] = await pool.query('SELECT COUNT(*) as count FROM ingredient');
        const totalItems = countRows[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single ingredient by ID.
 */
export const getIngredientById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM ingredient WHERE ingredient_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching ingredient by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new ingredient.
 */
export const createIngredient = async (req, res) => {
    const { name, amount, type, recipe_id } = req.body;
    // Basic validation
    if (!name || !recipe_id) {
        return res.status(400).json({
            error: 'Both "name" and "recipe_id" fields are required.',
        });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO ingredient (name, amount, type, recipe_id) VALUES (?, ?, ?, ?)',
            [name, amount || null, type || null, recipe_id]
        );

        res.status(201).json({
            message: 'Ingredient created successfully',
            ingredientId: result.insertId,
        });
    } catch (error) {
        console.error('Error creating ingredient:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing ingredient by ID.
 */
export const updateIngredient = async (req, res) => {
    const { id } = req.params;
    const { name, amount, type, recipe_id } = req.body;

    try {
        // Check if the ingredient exists
        const [existing] = await pool.query('SELECT * FROM ingredient WHERE ingredient_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        // Retain existing values if not provided in the body
        const updatedName = name ?? existing[0].name;
        const updatedAmount = amount ?? existing[0].amount;
        const updatedType = type ?? existing[0].type;
        const updatedRecipeId = recipe_id ?? existing[0].recipe_id;

        await pool.query(
            'UPDATE ingredient SET name = ?, amount = ?, type = ?, recipe_id = ? WHERE ingredient_id = ?',
            [updatedName, updatedAmount, updatedType, updatedRecipeId, id]
        );

        res.json({ message: 'Ingredient updated successfully' });
    } catch (error) {
        console.error('Error updating ingredient:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete an ingredient by ID.
 */
export const deleteIngredient = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the ingredient exists
        const [existing] = await pool.query('SELECT * FROM ingredient WHERE ingredient_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        await pool.query('DELETE FROM ingredient WHERE ingredient_id = ?', [id]);
        res.json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Search for ingredients by name or type (partial match).
 * Example: GET /api/ingredients/search?query=salt
 */
export const searchIngredients = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    try {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            'SELECT * FROM ingredient WHERE name LIKE ? OR type LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching ingredients:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
