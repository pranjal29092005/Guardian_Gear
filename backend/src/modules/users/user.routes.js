const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../auth/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../utils/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getMe);

// Get all users (MANAGER only)
router.get('/', requireRole([USER_ROLES.MANAGER]), userController.getAllUsers);

// Update user profile
router.put('/profile', userController.updateProfile);

// Change password
router.put('/password', userController.changePassword);

module.exports = router;
