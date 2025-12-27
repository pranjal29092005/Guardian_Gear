const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../auth/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getMe);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/password', userController.changePassword);

module.exports = router;
