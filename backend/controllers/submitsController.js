// controllers/submitsController.js
import pool from '../db.js';

/**
 * Get all submit records (with optional pagination).
 */
export const getAllSubmits = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM submits ORDER BY submit_date DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) AS count FROM submits');
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
        console.error('Error fetching submit records:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all submits by a single user.
 */
export const getSubmitsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM submits WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching submits by user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all submits for a particular recipe.
 */
export const getSubmitsByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM submits WHERE recipe_id = ?', [recipeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching submits by recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single record by composite key (user_id & recipe_id).
 */
export const getSubmitRecord = async (req, res) => {
    const { userId, recipeId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM submits WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Submit record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching submit record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new submit record (link user -> recipe).
 */
export const createSubmits = async (req, res) => {
    const { user_id, recipe_id } = req.body;
    if (!user_id || !recipe_id) {
        return res.status(400).json({ error: 'user_id and recipe_id are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO submits (user_id, recipe_id) VALUES (?, ?)',
            [user_id, recipe_id]
        );
        res.status(201).json({ message: 'Submit record created successfully' });
    } catch (error) {
        console.error('Error creating submit record:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Record already exists (user, recipe) pair is unique.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * (Optional) Update the submission date or other fields if needed.
 */
export const updateSubmits = async (req, res) => {
    const { userId, recipeId } = req.params;
    // For example, if we wanted to manually update `submit_date`.
    const { submit_date } = req.body;

    try {
        // Check if record exists
        const [existing] = await pool.query(
            'SELECT * FROM submits WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'Submit record not found' });
        }

        const newDate = submit_date || existing[0].submit_date;
        await pool.query(
            'UPDATE submits SET submit_date = ? WHERE user_id = ? AND recipe_id = ?',
            [newDate, userId, recipeId]
        );

        res.json({ message: 'Submit record updated successfully' });
    } catch (error) {
        console.error('Error updating submit record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a submit record (unlink user -> recipe).
 */
export const deleteSubmits = async (req, res) => {
    const { userId, recipeId } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM submits WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'Submit record not found' });
        }

        await pool.query(
            'DELETE FROM submits WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        res.json({ message: 'Submit record deleted successfully' });
    } catch (error) {
        console.error('Error deleting submit record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
