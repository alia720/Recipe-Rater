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
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'ORDER BY c.comment_id DESC LIMIT ? OFFSET ?',
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
        const [rows] = await pool.query(
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'WHERE c.comment_id = ?', 
            [id]
        );
        
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
        const [rows] = await pool.query(
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'WHERE c.recipe_id = ? ' +
            'ORDER BY c.comment_id DESC',
            [recipeId]
        );
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
        const [rows] = await pool.query(
            'SELECT c.*, r.name as recipe_name FROM comments c ' +
            'LEFT JOIN recipe r ON c.recipe_id = r.recipe_id ' +
            'WHERE c.user_id = ? ' +
            'ORDER BY c.comment_id DESC',
            [userId]
        );
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
    
    // Validate required fields
    if (!recipe_id || !user_id || !text) {
        return res.status(400).json({ error: 'Recipe ID, user ID, and comment text are required.' });
    }

    try {
        // Check if recipe exists
        const [recipeCheck] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [recipe_id]);
        if (!recipeCheck.length) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Check if user exists
        const [userCheck] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (!userCheck.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Insert the comment
        const [result] = await pool.query(
            'INSERT INTO comments (recipe_id, user_id, title, text, created_at) VALUES (?, ?, ?, ?, NOW())',
            [recipe_id, user_id, title || null, text]
        );

        // Fetch the newly created comment with user info
        const [newComment] = await pool.query(
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'WHERE c.comment_id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Comment created successfully',
            comment: newComment[0]
        });
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
    const userId = req.session?.user?.user_id; // Get user ID from session

    try {
        // Check if comment exists
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user owns this comment or is admin
        if (userId !== existing[0].user_id) {
            const [adminCheck] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [userId]);
            if (!adminCheck.length) {
                return res.status(403).json({ error: 'Unauthorized to update this comment' });
            }
        }

        // Update the comment
        const updatedTitle = title ?? existing[0].title;
        const updatedText = text ?? existing[0].text;

        await pool.query(
            'UPDATE comments SET title = ?, text = ? WHERE comment_id = ?',
            [updatedTitle, updatedText, id]
        );

        // Get the updated comment
        const [updated] = await pool.query(
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'WHERE c.comment_id = ?',
            [id]
        );

        res.json({
            message: 'Comment updated successfully',
            comment: updated[0]
        });
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
    const userId = req.session?.user?.user_id; 

    try {
        // Check if comment exists
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is the owner of this comment
        const isOwner = userId === existing[0].user_id;
        
        // If not owner, check if user is an admin
        let isAdmin = false;
        if (!isOwner && userId) {
            const [adminCheck] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [userId]);
            isAdmin = adminCheck.length > 0;
        }

        // If neither owner nor admin, deny access
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await pool.query('DELETE FROM comments WHERE comment_id = ?', [id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};