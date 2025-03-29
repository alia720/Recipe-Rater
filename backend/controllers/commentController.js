// controllers/commentController.js
import pool from '../db.js';

/**
 * Get all comments (with optional pagination).
 */
export const getAllComments = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM comments ORDER BY comment_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM comments');
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
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single comment by ID.
 */
export const getCommentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all comments for a specific recipe.
 */
export const getCommentsByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM comments WHERE recipe_id = ?', [recipeId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching comments by recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all comments by a particular user.
 */
export const getCommentsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM comments WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching comments by user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new comment.
 */
export const createComment = async (req, res) => {
    const { recipe_id, user_id, title, text } = req.body;
    if (!recipe_id || !user_id) {
        return res.status(400).json({ error: 'recipe_id and user_id are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO comments (recipe_id, user_id, title, text) VALUES (?, ?, ?, ?)',
            [recipe_id, user_id, title || null, text || null]
        );
        res.status(201).json({ message: 'Comment created successfully' });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing comment.
 */
export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { title, text } = req.body;

    try {
        // Check if comment exists
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const updatedTitle = title ?? existing[0].title;
        const updatedText = text ?? existing[0].text;

        await pool.query(
            'UPDATE comments SET title = ?, text = ? WHERE comment_id = ?',
            [updatedTitle, updatedText, id]
        );
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a comment.
 */
export const deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        await pool.query('DELETE FROM comments WHERE comment_id = ?', [id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
