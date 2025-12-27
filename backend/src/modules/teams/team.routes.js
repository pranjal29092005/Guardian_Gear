const express = require('express');
const teamController = require('./team.controller');
const authenticate = require('../auth/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../utils/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/teams - Get all teams
router.get('/', teamController.getAll);

// GET /api/teams/:id - Get team by ID
router.get('/:id', teamController.getById);

// POST /api/teams - Create new team (MANAGER only)
router.post('/', requireRole([USER_ROLES.MANAGER]), teamController.create);

// PUT /api/teams/:id - Update team (MANAGER only)
router.put('/:id', requireRole([USER_ROLES.MANAGER]), teamController.update);

// DELETE /api/teams/:id - Delete team (MANAGER only)
router.delete('/:id', requireRole([USER_ROLES.MANAGER]), teamController.delete);

// POST /api/teams/:id/members - Add member to team (MANAGER only)
router.post('/:id/members', requireRole([USER_ROLES.MANAGER]), teamController.addMember);

// DELETE /api/teams/:id/members/:userId - Remove member from team (MANAGER only)
router.delete('/:id/members/:userId', requireRole([USER_ROLES.MANAGER]), teamController.removeMember);

module.exports = router;
