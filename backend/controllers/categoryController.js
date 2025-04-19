// controllers/categoryController.js
import pool from '../db.js';

/**
 * Get all categories (with optional pagination).
 */
export const getAllCategories = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // Fetch categories with pagination
        const [rows] = await pool.query(
            'SELECT * FROM category ORDER BY category_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // Get total count for pagination info
        const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM category');
        const totalItems = countRows[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single category by ID.
 */
export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM category WHERE category_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Search for categories by name (partial match).
 * Example: GET /api/categories/search?query=vegan
 */
export const searchCategories = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    try {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            'SELECT * FROM category WHERE name LIKE ?',
            [searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new category.
 */
export const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO category (name, description) VALUES (?, ?)',
            [name, description || null]
        );
        res.status(201).json({
            message: 'Category created successfully',
            categoryId: result.insertId
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing category by ID.
 */
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        // Check if category exists
        const [existing] = await pool.query('SELECT * FROM category WHERE category_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // If name/description not provided, keep old values
        const updatedName = name ?? existing[0].name;
        const updatedDescription = description ?? existing[0].description;

        await pool.query(
            'UPDATE category SET name = ?, description = ? WHERE category_id = ?',
            [updatedName, updatedDescription, id]
        );

        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a category by ID.
 */
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if category exists
        const [existing] = await pool.query('SELECT * FROM category WHERE category_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await pool.query('DELETE FROM category WHERE category_id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
