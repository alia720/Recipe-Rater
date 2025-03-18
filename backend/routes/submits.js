// routes/submitsRoutes.js
const express = require('express');
const router = express.Router();
const submitsController = require('../controllers/submitsController');

// Creates a user->recipe submission link
router.post('/', submitsController.linkUserRecipe);

module.exports = router;
