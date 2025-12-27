const express = require('express');
const categoryController = require('./category.controller');
const authenticate = require('../auth/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../utils/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/categories - Get all categories (all authenticated users)
router.get('/', categoryController.getAll);

// POST /api/categories - Create category (MANAGER only)
router.post(
    '/',
    requireRole([USER_ROLES.MANAGER]),
    categoryController.create
);

// PUT /api/categories/:id - Update category (MANAGER only)
router.put(
    '/:id',
    requireRole([USER_ROLES.MANAGER]),
    categoryController.update
);

// DELETE /api/categories/:id - Delete category (MANAGER only)
router.delete(
    '/:id',
    requireRole([USER_ROLES.MANAGER]),
    categoryController.delete
);

module.exports = router;
