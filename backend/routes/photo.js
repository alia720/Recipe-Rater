// routes/photo.js
import { Router } from 'express';
import {
    getAllPhotos,
    getPhotoById,
    getPhotosByRecipe,
    searchPhotos,
    createPhoto,
    updatePhoto,
    deletePhoto
} from '../controllers/photoController.js';

const router = Router();

// GET all photos
router.get('/', getAllPhotos);

// GET single photo by ID
router.get('/:id', getPhotoById);

// GET photos by recipe
router.get('/recipe/:recipeId', getPhotosByRecipe);

// SEARCH photos by name or caption
router.get('/search/query', searchPhotos);

// CREATE a new photo
router.post('/', createPhoto);

// UPDATE a photo
router.put('/:id', updatePhoto);

// DELETE a photo
router.delete('/:id', deletePhoto);

export default router;
