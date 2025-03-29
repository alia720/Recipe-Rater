// controllers/belongsToController.js
import pool from '../db.js';

/**
 * Get all belongs_to entries (with optional pagination).
 */
export const getAllBelongsTo = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM belongs_to ORDER BY category_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM belongs_to');
        const totalItems = countResult[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching belongs_to entries:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all belongs_to records for a specific recipe.
 */
export const getBelongsToByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM belongs_to WHERE recipe_id = ?', [recipeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching belongs_to by recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all belongs_to records for a specific category.
 */
export const getBelongsToByCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM belongs_to WHERE category_id = ?', [categoryId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching belongs_to by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single belongs_to record by composite key.
 */
export const getBelongsToRecord = async (req, res) => {
    const { categoryId, recipeId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM belongs_to WHERE category_id = ? AND recipe_id = ?',
            [categoryId, recipeId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'belongs_to record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching belongs_to record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new belongs_to record (link category -> recipe).
 */
export const createBelongsTo = async (req, res) => {
    const { category_id, recipe_id } = req.body;
    if (!category_id || !recipe_id) {
        return res.status(400).json({ error: 'category_id and recipe_id are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO belongs_to (category_id, recipe_id) VALUES (?, ?)',
            [category_id, recipe_id]
        );
        res.status(201).json({ message: 'belongs_to record created successfully' });
    } catch (error) {
        console.error('Error creating belongs_to record:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Record already exists (category_id, recipe_id) pair is unique.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a belongs_to record (unlink category -> recipe).
 */
export const deleteBelongsTo = async (req, res) => {
    const { categoryId, recipeId } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM belongs_to WHERE category_id = ? AND recipe_id = ?',
            [categoryId, recipeId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'belongs_to record not found' });
        }

        await pool.query(
            'DELETE FROM belongs_to WHERE category_id = ? AND recipe_id = ?',
            [categoryId, recipeId]
        );
        res.json({ message: 'belongs_to record deleted successfully' });
    } catch (error) {
        console.error('Error deleting belongs_to record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
