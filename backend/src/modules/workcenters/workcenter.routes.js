const express = require('express');
const router = express.Router();
const workcenterController = require('./workcenter.controller');
const authenticate = require('../auth/auth.middleware');
const { USER_ROLES } = require('../../utils/constants');

// All routes require authentication
router.use(authenticate);

// Get active work centers (for dropdowns)
router.get('/active', workcenterController.getActive);

// Get all work centers (all roles can view)
router.get('/', workcenterController.getAll);

// Get single work center (all roles can view)
router.get('/:id', workcenterController.getById);

// Middleware to check if user is MANAGER
const requireManager = (req, res, next) => {
    if (req.user.role !== USER_ROLES.MANAGER) {
        return res.status(403).json({ success: false, message: 'Access denied. Manager role required.' });
    }
    next();
};

// Create work center (MANAGER only)
router.post('/', requireManager, workcenterController.create);

// Update work center (MANAGER only)
router.put('/:id', requireManager, workcenterController.update);

// Delete work center (MANAGER only)
router.delete('/:id', requireManager, workcenterController.delete);

module.exports = router;
