// controllers/ratingController.js
import pool from '../db.js';

/**
 * Get all ratings (with optional pagination).
 */
export const getAllRatings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM rating ORDER BY rating_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // Get total count for pagination
        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM rating');
        const totalItems = countResult[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single rating by ID.
 */
export const getRatingById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM rating WHERE rating_id = ?', [id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching rating by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all ratings for a given recipe.
 */
export const getRatingsByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM rating WHERE recipe_id = ?', [recipeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ratings by recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all ratings by a particular user.
 */
export const getRatingsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM rating WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ratings by user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get the average rating for a given recipe.
 */
export const getAverageRatingForRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT AVG(rating_value) as avgRating FROM rating WHERE recipe_id = ?', [recipeId]);
        const avgRating = rows[0].avgRating;
        res.json({ recipeId, avgRating: avgRating ? parseFloat(avgRating).toFixed(2) : null });
    } catch (error) {
        console.error('Error calculating average rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new rating.
 * We also enforce the unique (recipe_id, user_id) constraint.
 */
export const createRating = async (req, res) => {
    const { recipe_id, user_id, rating_value } = req.body;
    if (!recipe_id || !user_id || !rating_value) {
        return res.status(400).json({ error: 'recipe_id, user_id, and rating_value are required.' });
    }

    try {
        // Insert the new rating
        await pool.query(
            'INSERT INTO rating (recipe_id, user_id, rating_value) VALUES (?, ?, ?)',
            [recipe_id, user_id, rating_value]
        );

        res.status(201).json({ message: 'Rating created successfully' });
    } catch (error) {
        console.error('Error creating rating:', error);
        // If the (recipe_id, user_id) pair already exists, it might be a Duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'You have already rated this recipe.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update a rating's value. (Patch or Put)
 */
export const updateRating = async (req, res) => {
    const { id } = req.params;
    const { rating_value } = req.body;

    if (!rating_value) {
        return res.status(400).json({ error: 'rating_value is required to update' });
    }

    try {
        // Check if rating exists
        const [existing] = await pool.query('SELECT * FROM rating WHERE rating_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        // Update rating
        await pool.query('UPDATE rating SET rating_value = ? WHERE rating_id = ?', [rating_value, id]);
        res.json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a rating by ID.
 */
export const deleteRating = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if rating exists
        const [existing] = await pool.query('SELECT * FROM rating WHERE rating_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Rating not found' });
        }

        await pool.query('DELETE FROM rating WHERE rating_id = ?', [id]);
        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
