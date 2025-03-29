// controllers/adminRemovesRatingController.js
import pool from '../db.js';

/**
 * Get all admin_removes_rating records (with optional pagination).
 */
export const getAllAdminRemoves = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM admin_removes_rating ORDER BY remove_time DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM admin_removes_rating');
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
        console.error('Error fetching admin_removes_rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get records by a specific admin.
 */
export const getAdminRemovesByAdmin = async (req, res) => {
    const { adminId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM admin_removes_rating WHERE admin_id = ?', [adminId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching records by admin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get records by a specific rating ID.
 */
export const getAdminRemovesByRating = async (req, res) => {
    const { ratingId } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM admin_removes_rating WHERE rating_id = ?', [ratingId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching records by rating:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single record by composite key (admin_id, rating_id).
 */
export const getAdminRemovesRecord = async (req, res) => {
    const { adminId, ratingId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM admin_removes_rating WHERE admin_id = ? AND rating_id = ?',
            [adminId, ratingId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'admin_removes_rating record not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching admin_removes_rating record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a record of admin removing rating (links admin to rating).
 */
export const createAdminRemoves = async (req, res) => {
    const { admin_id, rating_id } = req.body;
    if (!admin_id || !rating_id) {
        return res.status(400).json({ error: 'admin_id and rating_id are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO admin_removes_rating (admin_id, rating_id) VALUES (?, ?)',
            [admin_id, rating_id]
        );
        res.status(201).json({ message: 'admin_removes_rating record created successfully' });
    } catch (error) {
        console.error('Error creating admin_removes_rating record:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Record already exists (admin_id, rating_id) pair is unique.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * (Optional) Update the remove_time or other fields if needed.
 */
export const updateAdminRemoves = async (req, res) => {
    const { adminId, ratingId } = req.params;
    const { remove_time } = req.body;

    try {
        const [existing] = await pool.query(
            'SELECT * FROM admin_removes_rating WHERE admin_id = ? AND rating_id = ?',
            [adminId, ratingId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'admin_removes_rating record not found' });
        }

        const newTime = remove_time || existing[0].remove_time;
        await pool.query(
            'UPDATE admin_removes_rating SET remove_time = ? WHERE admin_id = ? AND rating_id = ?',
            [newTime, adminId, ratingId]
        );
        res.json({ message: 'admin_removes_rating record updated successfully' });
    } catch (error) {
        console.error('Error updating admin_removes_rating record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a record.
 */
export const deleteAdminRemoves = async (req, res) => {
    const { adminId, ratingId } = req.params;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM admin_removes_rating WHERE admin_id = ? AND rating_id = ?',
            [adminId, ratingId]
        );
        if (!existing.length) {
            return res.status(404).json({ error: 'admin_removes_rating record not found' });
        }

        await pool.query(
            'DELETE FROM admin_removes_rating WHERE admin_id = ? AND rating_id = ?',
            [adminId, ratingId]
        );
        res.json({ message: 'admin_removes_rating record deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin_removes_rating record:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
