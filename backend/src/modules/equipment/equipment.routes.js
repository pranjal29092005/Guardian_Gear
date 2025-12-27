const express = require('express');
const equipmentController = require('./equipment.controller');
const authenticate = require('../auth/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/equipment - Get all equipment with filters
router.get('/', equipmentController.getAll);

// GET /api/equipment/active - Get only active equipment (for dropdowns)
router.get('/active', equipmentController.getActive);

// GET /api/equipment/:id - Get equipment by ID with open request count
router.get('/:id', equipmentController.getById);

// POST /api/equipment - Create new equipment
router.post('/', equipmentController.create);

// PUT /api/equipment/:id - Update equipment
router.put('/:id', equipmentController.update);

module.exports = router;
