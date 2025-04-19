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
 * INSECURE VERSION: Reads user ID from request body. DO NOT USE IN PRODUCTION.
 */
export const updateComment = async (req, res) => {
    const { id } = req.params;
    // --- INSECURE CHANGE: Read user ID and potentially role from body ---
    const { title, text, requestingUserId /*, requestingUserRole */ } = req.body;
    // --- Note: We are now TRUSTING the client sent the correct requestingUserId ---

    // Basic validation: ensure text is provided if that's the main goal
    if (text === undefined || text === null) {
        return res.status(400).json({ error: 'Comment text is required for update.' });
    }
    // --- INSECURE CHANGE: Check if requestingUserId was sent ---
    if (requestingUserId === undefined) {
        return res.status(401).json({ error: 'Unauthorized: Missing user identification.' });
    }

    try {
        // Check if comment exists
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // --- INSECURE AUTHORIZATION ---
        // Check if the user ID sent from the client owns this comment
        const isOwner = requestingUserId === existing[0].user_id;

        // Check if the user ID sent from the client corresponds to an admin
        // NOTE: Still requires a DB check, but trusts the requestingUserId
        let isAdmin = false;
        // if (!isOwner && requestingUserRole === 'admin') { // If role was also sent (still insecure)
        // Or check if the *requestingUserId* exists in the admin table (more common but still trusts the ID)
        if (!isOwner) {
            const [adminCheck] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [requestingUserId]);
            isAdmin = adminCheck.length > 0;
        }

        // Deny if neither owner nor admin (based on client-sent data)
        if (!isOwner && !isAdmin) {
            console.warn(`INSECURE: Denying update for comment ${id}. Requesting user ${requestingUserId} is not owner ${existing[0].user_id} and not admin.`);
            return res.status(403).json({ error: 'Forbidden: You do not have permission to update this comment.' });
        }
        // --- END INSECURE AUTHORIZATION ---

        // Update the comment (only update fields provided)
        const updatedTitle = title ?? existing[0].title; // Keep original title if not provided
        // Text is required by validation above

        await pool.query(
            'UPDATE comments SET title = ?, text = ? WHERE comment_id = ?',
            [updatedTitle, text, id]
        );

        // Get the updated comment
        const [updated] = await pool.query(
            'SELECT c.*, u.username FROM comments c ' +
            'LEFT JOIN user u ON c.user_id = u.user_id ' +
            'WHERE c.comment_id = ?',
            [id]
        );

        res.json({
            message: 'Comment updated successfully (using insecure auth)',
            comment: updated[0]
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a comment.
 * INSECURE VERSION: Reads user ID from request body. DO NOT USE IN PRODUCTION.
 */
export const deleteComment = async (req, res) => {
    const { id } = req.params;
    // --- INSECURE CHANGE: Read user ID from body ---
    // Note: Reading body from DELETE needs proper Express middleware (like express.json())
    const { requestingUserId /*, requestingUserRole */ } = req.body;
    // --- Note: We are now TRUSTING the client sent the correct requestingUserId ---

    // --- INSECURE CHANGE: Check if requestingUserId was sent ---
    if (requestingUserId === undefined) {
        return res.status(401).json({ error: 'Unauthorized: Missing user identification.' });
    }

    try {
        // Check if comment exists
        const [existing] = await pool.query('SELECT * FROM comments WHERE comment_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // --- INSECURE AUTHORIZATION ---
        const isOwner = requestingUserId === existing[0].user_id;
        let isAdmin = false;
        if (!isOwner) {
            const [adminCheck] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [requestingUserId]);
            isAdmin = adminCheck.length > 0;
        }

        if (!isOwner && !isAdmin) {
            console.warn(`INSECURE: Denying delete for comment ${id}. Requesting user ${requestingUserId} is not owner ${existing[0].user_id} and not admin.`);
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this comment.' });
        }
        // --- END INSECURE AUTHORIZATION ---

        await pool.query('DELETE FROM comments WHERE comment_id = ?', [id]);
        res.json({ message: 'Comment deleted successfully (using insecure auth)' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};