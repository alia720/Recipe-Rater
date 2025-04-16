// controllers/recipeController.js
import pool from '../db.js';

/**
 * Get all recipes (with optional pagination and sorting).
 */
export const getAllRecipes = async (req, res) => {
    try {
        const { sort, limit = 100, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        // Note that r.* now includes the user_id.
        let query = `
            SELECT
                r.*,
                (SELECT CONCAT('http://localhost:5000/uploads/', p.name)
                 FROM photo p
                 WHERE p.recipe_id = r.recipe_id
                    LIMIT 1) AS main_photo,
                COALESCE(SUM(ld.liked = 1), 0) AS likes,
                COALESCE(SUM(ld.liked = 0), 0) AS dislikes,
                (COALESCE(SUM(ld.liked = 1), 0) - COALESCE(SUM(ld.liked = 0), 0)) AS net_votes
            FROM recipe r
                LEFT JOIN likes_dislikes ld ON r.recipe_id = ld.recipe_id
        `;

        query += ' GROUP BY r.recipe_id';

        switch (sort) {
            case 'top_rated':
                query += ' ORDER BY net_votes DESC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY r.recipe_id DESC';
                break;
        }

        query += ' LIMIT ? OFFSET ?';

        const [rows] = await pool.query(query, [parseInt(limit), parseInt(offset)]);

        const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM recipe');
        const totalItems = countRows[0].count;

        res.json({
            data: rows,
            pagination: {
                totalItems,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get a single recipe by ID.
 */
export const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        const [recipeRows] = await pool.query(
            `SELECT
                 r.*,
                 (SELECT CONCAT('http://localhost:5000/uploads/', p.name)
                  FROM photo p
                  WHERE p.recipe_id = r.recipe_id
                     LIMIT 1) AS main_photo
             FROM recipe r
             WHERE r.recipe_id = ?`,
            [id]
        );

        if (recipeRows.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json(recipeRows[0]);
    } catch (error) {
        console.error('Error fetching recipe by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Search for recipes by name (partial match).
 * Example: GET /api/recipes/search?query=chicken
 */
export const searchRecipes = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const searchTerm = `%${query}%`; // partial matching
        const [rows] = await pool.query(
            'SELECT * FROM recipe WHERE name LIKE ?',
            [searchTerm]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Create a new recipe.
 *
 * Expects in the request body:
 *   - user_id: the ID of the user creating the recipe
 *   - name: name of the recipe
 *   - steps: (optional) recipe steps
 */
export const createRecipe = async (req, res) => {
    const { user_id, name, steps } = req.body;
    // Basic validation: ensure user_id and name are provided.
    if (!user_id || !name) {
        return res.status(400).json({ error: 'User ID and name are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO recipe (user_id, name, steps) VALUES (?, ?, ?)',
            [user_id, name, steps || null]
        );
        // result.insertId contains the newly created recipe_id
        res.status(201).json({
            message: 'Recipe created successfully',
            recipeId: result.insertId
        });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing recipe by ID.
 *
 * You may not allow updating the user_id once created. In this example, only name and steps
 * are updatable.
 */
export const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { name, steps } = req.body;

    try {
        // Check if the recipe exists
        const [existing] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Update only provided fields (user_id is not updated here)
        await pool.query('UPDATE recipe SET name = ?, steps = ? WHERE recipe_id = ?', [
            name || existing[0].name, // if name is not provided, keep existing
            steps || existing[0].steps,
            id
        ]);

        res.json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a recipe by ID.
 */
export const deleteRecipe = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the recipe exists
        const [existing] = await pool.query('SELECT * FROM recipe WHERE recipe_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await pool.query('DELETE FROM recipe WHERE recipe_id = ?', [id]);
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
/**
 * Get recipes by user ID.
 * Route example: GET /api/recipes/user/:userId
 */
export const getRecipesByUserId = async (req, res) => {
    const { userId } = req.params;
    // Optional: You can add pagination and sorting if needed (similar to getAllRecipes)
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                (SELECT CONCAT('http://localhost:5000/uploads/', p.name) 
                 FROM photo p 
                 WHERE p.recipe_id = r.recipe_id 
                 LIMIT 1) AS main_photo,
                COALESCE(SUM(ld.liked = 1), 0) AS likes,
                COALESCE(SUM(ld.liked = 0), 0) AS dislikes,
                (COALESCE(SUM(ld.liked = 1), 0) - COALESCE(SUM(ld.liked = 0), 0)) AS net_votes
            FROM recipe r
            LEFT JOIN likes_dislikes ld ON r.recipe_id = ld.recipe_id
            WHERE r.user_id = ?
            GROUP BY r.recipe_id
            ORDER BY r.recipe_id DESC
        `, [userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching recipes by user ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

