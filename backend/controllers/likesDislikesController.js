// controllers/likesDislikesController.js
import pool from '../db.js';

/**
 * Get all likes/dislikes (with optional pagination).
 */
export const getAllLikesDislikes = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM likes_dislikes ORDER BY user_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM likes_dislikes');
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
        console.error('Error fetching likes/dislikes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all likes/dislikes from a particular user.
 */
export const getLikesDislikesByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM likes_dislikes WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching likes/dislikes by user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all likes/dislikes for a particular recipe.
 */
export const getLikesDislikesByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM likes_dislikes WHERE recipe_id = ?', [recipeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching likes/dislikes by recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single record by composite key.
 */
export const getLikesDislikesRecord = async (req, res) => {
    const { userId, recipeId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM likes_dislikes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'likes_dislikes record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching likes_dislikes record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new like/dislike record.
 */
export const createLikesDislikes = async (req, res) => {
    const { user_id, recipe_id, liked } = req.body;
    if (user_id == null || recipe_id == null || liked == null) {
        return res.status(400).json({ error: 'user_id, recipe_id, and liked (true/false) are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO likes_dislikes (user_id, recipe_id, liked) VALUES (?, ?, ?)',
            [user_id, recipe_id, liked]
        );
        res.status(201).json({ message: 'likes_dislikes record created successfully' });
    } catch (error) {
        console.error('Error creating likes_dislikes record:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Record already exists (user_id, recipe_id) is unique.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update a like/dislike entry. (Change from like to dislike or vice versa)
 */
export const updateLikesDislikes = async (req, res) => {
    const { userId, recipeId } = req.params;
    const { liked } = req.body; // boolean

    if (liked == null) {
        return res.status(400).json({ error: 'liked field (true/false) is required.' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT * FROM likes_dislikes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'likes_dislikes record not found' });
        }

        await pool.query(
            'UPDATE likes_dislikes SET liked = ? WHERE user_id = ? AND recipe_id = ?',
            [liked, userId, recipeId]
        );
        res.json({ message: 'likes_dislikes record updated successfully' });
    } catch (error) {
        console.error('Error updating likes_dislikes record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a like/dislike record.
 */
export const deleteLikesDislikes = async (req, res) => {
    const { userId, recipeId } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM likes_dislikes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'likes_dislikes record not found' });
        }

        await pool.query(
            'DELETE FROM likes_dislikes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
        res.json({ message: 'likes_dislikes record deleted successfully' });
    } catch (error) {
        console.error('Error deleting likes_dislikes record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
