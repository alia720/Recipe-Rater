import { Router } from 'express';
import { combinedSearch } from '../controllers/searchController.js';

const router = Router();

// GET combined search results
router.get('/', combinedSearch);

export default router;