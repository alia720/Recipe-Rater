// controllers/customerController.js
import pool from '../db.js';

/**
 * Get all customers with optional pagination.
 */
export const getAllCustomers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page  = parseInt(req.query.page)  || 1;
        const offset = (page - 1) * limit;

        // We can join the user table if we want more user info, e.g. name, username
        const [rows] = await pool.query(
            `SELECT c.user_id, c.loyalty_level, u.name, u.username
       FROM customer c
       JOIN user u ON c.user_id = u.user_id
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        // total count
        const [countRes] = await pool.query('SELECT COUNT(*) AS count FROM customer');
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
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single customer by user_id.
 */
export const getCustomerByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        // Optionally join user table for more info
        const [rows] = await pool.query(
            `SELECT c.user_id, c.loyalty_level, u.name, u.username
       FROM customer c
       JOIN user u ON c.user_id = u.user_id
       WHERE c.user_id = ?`,
            [userId]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new customer row (for an existing user).
 * The user_id must exist in 'user' table.
 */
export const createCustomer = async (req, res) => {
    const { user_id, loyalty_level } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        const [userRows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [user_id]);
        if (!userRows.length) {
            return res.status(400).json({ error: 'User ID does not exist in user table' });
        }

        await pool.query(
            'INSERT INTO customer (user_id, loyalty_level) VALUES (?, ?)',
            [user_id, loyalty_level || null]
        );
        res.status(201).json({ message: 'Customer record created successfully' });
    } catch (error) {
        console.error('Error creating customer:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This user is already a customer.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update a customer's loyalty_level.
 */
export const updateCustomer = async (req, res) => {
    const { userId } = req.params;
    const { loyalty_level } = req.body;

    try {
        // Check existence
        const [existing] = await pool.query('SELECT * FROM customer WHERE user_id = ?', [userId]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Customer record not found' });
        }

        const newLoyalty = loyalty_level ?? existing[0].loyalty_level;
        await pool.query(
            'UPDATE customer SET loyalty_level = ? WHERE user_id = ?',
            [newLoyalty, userId]
        );
        res.json({ message: 'Customer record updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a customer record (user remains in 'user' table).
 */
export const deleteCustomer = async (req, res) => {
    const { userId } = req.params;
    try {
        const [existing] = await pool.query('SELECT * FROM customer WHERE user_id = ?', [userId]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Customer record not found' });
        }

        await pool.query('DELETE FROM customer WHERE user_id = ?', [userId]);
        res.json({ message: 'Customer record deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
