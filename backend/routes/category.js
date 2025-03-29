// routes/category.js
import { Router } from 'express';
import {
    getAllCategories,
    getCategoryById,
    searchCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = Router();

// GET all categories (with optional pagination)
router.get('/', getAllCategories);

// Search categories by name (ex: /api/categories/search?query=vegan)
router.get('/search', searchCategories);

// GET single category by ID
router.get('/:id', getCategoryById);

// CREATE a new category
router.post('/', createCategory);

// UPDATE a category by ID
router.put('/:id', updateCategory);

// DELETE a category by ID
router.delete('/:id', deleteCategory);

export default router;
