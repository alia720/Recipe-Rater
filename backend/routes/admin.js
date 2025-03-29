// routes/admin.js
import { Router } from 'express';
import {
    getAllAdmins,
    getAdminByUserId,
    createAdmin,
    updateAdmin,
    deleteAdmin
} from '../controllers/adminController.js';

const router = Router();

// GET all admins
router.get('/', getAllAdmins);

// GET single admin by user_id
router.get('/:userId', getAdminByUserId);

// CREATE admin record
router.post('/', createAdmin);

// UPDATE admin record
router.put('/:userId', updateAdmin);

// DELETE admin record
router.delete('/:userId', deleteAdmin);

export default router;
