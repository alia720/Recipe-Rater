// controllers/adminController.js
import pool from '../db.js';

/**
 * Get all admins with optional pagination.
 */
export const getAllAdmins = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page  = parseInt(req.query.page)  || 1;
        const offset = (page - 1) * limit;

        // Join user table to get name/username if desired
        const [rows] = await pool.query(
            `SELECT a.user_id, a.admin_rank, u.name, u.username
       FROM admin a
       JOIN user u ON a.user_id = u.user_id
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        // total count
        const [countRes] = await pool.query('SELECT COUNT(*) as count FROM admin');
        const totalItems = countRes[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single admin by user_id.
 */
export const getAdminByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT a.user_id, a.admin_rank, u.name, u.username
       FROM admin a
       JOIN user u ON a.user_id = u.user_id
       WHERE a.user_id = ?`,
            [userId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching admin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new admin row (for an existing user).
 */
export const createAdmin = async (req, res) => {
    const { user_id, admin_rank } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required.' });
    }

    try {
        // Optional: check if user exists
        const [userRows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (!userRows.length) {
            return res.status(400).json({ error: 'User ID does not exist in user table' });
        }

        await pool.query(
            'INSERT INTO admin (user_id, admin_rank) VALUES (?, ?)',
            [user_id, admin_rank || null]
        );
        res.status(201).json({ message: 'Admin record created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This user is already an admin.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update admin rank or other admin fields.
 */
export const updateAdmin = async (req, res) => {
    const { userId } = req.params;
    const { admin_rank } = req.body;

    try {
        // check existence
        const [existing] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [userId]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Admin record not found' });
        }

        const newRank = admin_rank ?? existing[0].admin_rank;
        await pool.query('UPDATE admin SET admin_rank = ? WHERE user_id = ?', [newRank, userId]);
        res.json({ message: 'Admin record updated successfully' });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete an admin record.
 */
export const deleteAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const [existing] = await pool.query('SELECT * FROM admin WHERE user_id = ?', [userId]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Admin record not found' });
        }

        await pool.query('DELETE FROM admin WHERE user_id = ?', [userId]);
        res.json({ message: 'Admin record deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
