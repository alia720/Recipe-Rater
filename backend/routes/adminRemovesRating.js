// routes/adminRemovesRating.js
import { Router } from 'express';
import {
    getAllAdminRemoves,
    getAdminRemovesByAdmin,
    getAdminRemovesByRating,
    getAdminRemovesRecord,
    createAdminRemoves,
    updateAdminRemoves,
    deleteAdminRemoves
} from '../controllers/adminRemovesRatingController.js';

const router = Router();

// GET all admin_removes_rating records
router.get('/', getAllAdminRemoves);

// GET by admin
router.get('/admin/:adminId', getAdminRemovesByAdmin);

// GET by rating
router.get('/rating/:ratingId', getAdminRemovesByRating);

// GET single record by composite key
router.get('/:adminId/:ratingId', getAdminRemovesRecord);

// CREATE new record
router.post('/', createAdminRemoves);

// UPDATE record (optional)
router.put('/:adminId/:ratingId', updateAdminRemoves);

// DELETE record
router.delete('/:adminId/:ratingId', deleteAdminRemoves);

export default router;
