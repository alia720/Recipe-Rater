import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile } from '../controllers/userController.js';

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// POST /api/users/logout
router.post('/logout', logoutUser);

// GET /api/users/profile
router.get('/profile', getProfile);

export default router;
