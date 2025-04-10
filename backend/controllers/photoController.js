// controllers/photoController.js
import pool from '../db.js';

/**
 * Get all photos (with optional pagination).
 */
export const getAllPhotos = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            'SELECT * FROM photo ORDER BY photo_id  LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [countResult] = await pool.query('SELECT COUNT(*) as count FROM photo');
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
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single photo by ID.
 */
export const getPhotoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Photo not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching photo by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all photos for a specific recipe.
 */
export const getPhotosByRecipe = async (req, res) => {
    const { recipeId } = req.params;
    try {
      const [rows] = await pool.query(
        `SELECT 
          photo_id,
          CASE 
            WHEN name LIKE 'http%' THEN name
            ELSE CONCAT('http://localhost:5000/uploads/', name)
          END as url,
          caption,
          created_at
         FROM photo 
         WHERE recipe_id = ?`, 
        [recipeId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching photos by recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

/**
 * Search photos by name or caption (partial match).
 */
export const searchPhotos = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    try {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            'SELECT * FROM photo WHERE name LIKE ? OR caption LIKE ?',
            [searchTerm, searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching photos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new photo record.
 */
export const createPhoto = async (req, res) => {
    const { recipe_id, name, caption } = req.body;
    if (!recipe_id || !name) {
        return res.status(400).json({ error: 'recipe_id and name are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO photo (recipe_id, name, caption) VALUES (?, ?, ?)',
            [recipe_id, name, caption || null]
        );
        res.status(201).json({ message: 'Photo created successfully' });
    } catch (error) {
        console.error('Error creating photo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update a photo record by ID.
 */
export const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { name, caption } = req.body;

    try {
        const [existing] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const updatedName = name ?? existing[0].name;
        const updatedCaption = caption ?? existing[0].caption;

        await pool.query(
            'UPDATE photo SET name = ?, caption = ? WHERE photo_id = ?',
            [updatedName, updatedCaption, id]
        );
        res.json({ message: 'Photo updated successfully' });
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a photo by ID.
 */
export const deletePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query('SELECT * FROM photo WHERE photo_id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        await pool.query('DELETE FROM photo WHERE photo_id = ?', [id]);
        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
