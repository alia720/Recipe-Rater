import pool from '../db.js';

export const combinedSearch = async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const searchTerm = `%${query}%`;
        
        const [recipeRows] = await pool.query(
            `SELECT 
                r.recipe_id, 
                r.name,
                COALESCE(r.steps, 'No description available') AS description,
                'recipe' AS type,
                COALESCE(
                    (SELECT CONCAT('http://localhost:5000/uploads/', p.name) 
                     FROM photo p 
                     WHERE p.recipe_id = r.recipe_id 
                     LIMIT 1),
                    '/placeholder-food.png'
                ) AS photo_url
             FROM recipe r
             WHERE r.name LIKE ?
             LIMIT 10`,
            [searchTerm]
        );
        
        const [ingredientRows] = await pool.query(
            `SELECT 
                i.ingredient_id, 
                i.name,
                i.recipe_id,
                r.name AS recipe_name,
                'ingredient' AS type
             FROM ingredient i
             JOIN recipe r ON i.recipe_id = r.recipe_id
             WHERE i.name LIKE ?
             LIMIT 10`,
            [searchTerm]
        );
        
        const [categoryRows] = await pool.query(
            `SELECT 
                c.category_id, 
                c.name,
                'category' AS type
             FROM category c
             WHERE c.name LIKE ?
             LIMIT 5`,
            [searchTerm]
        );
        
        res.json({
            recipes: recipeRows,
            ingredients: ingredientRows,
            categories: categoryRows
        });
    } catch (error) {
        console.error('Error in combined search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
