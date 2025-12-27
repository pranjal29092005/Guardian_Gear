const express = require('express');
const requestController = require('./request.controller');
const authenticate = require('../auth/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../utils/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/requests - Create new maintenance request
router.post('/', requestController.create);

// GET /api/requests/kanban - Get kanban board data with role-based filtering
router.get('/kanban', requestController.getKanban);

// GET /api/requests/calendar - Get calendar data (preventive requests only)
router.get('/calendar', requestController.getCalendar);

// PUT /api/requests/:id/stage - Update request stage (TECHNICIAN, MANAGER)
router.put(
    '/:id/stage',
    requireRole([USER_ROLES.TECHNICIAN, USER_ROLES.MANAGER]),
    requestController.updateStage
);

// PUT /api/requests/:id/assign - Assign request to technician
router.put(
    '/:id/assign',
    requireRole([USER_ROLES.TECHNICIAN, USER_ROLES.MANAGER]),
    requestController.assign
);

// PUT /api/requests/:id/complete - Complete request with duration (TECHNICIAN, MANAGER)
router.put(
    '/:id/complete',
    requireRole([USER_ROLES.TECHNICIAN, USER_ROLES.MANAGER]),
    requestController.complete
);

// PUT /api/requests/:id/scrap - Scrap request and equipment (TECHNICIAN, MANAGER)
router.put(
    '/:id/scrap',
    requireRole([USER_ROLES.TECHNICIAN, USER_ROLES.MANAGER]),
    requestController.scrap
);

// POST /api/requests/:id/assign-technician - Assign tech (MANAGER only)
router.post(
    '/:id/assign-technician',
    requireRole([USER_ROLES.MANAGER]),
    requestController.assignTechnician
);

// PUT /api/requests/:id/update-status - Update status
router.put(
    '/:id/update-status',
    requireRole([USER_ROLES.TECHNICIAN, USER_ROLES.MANAGER]),
    requestController.updateStatus
);

// GET /api/requests/available-technicians - Get available technicians
router.get(
    '/available-technicians',
    requireRole([USER_ROLES.MANAGER]),
    requestController.getAvailableTechnicians
);

// GET /api/requests/dashboard-stats - Get dashboard statistics (MANAGER only)
router.get(
    '/dashboard-stats',
    requireRole([USER_ROLES.MANAGER]),
    requestController.getDashboardStats
);

// PUT /api/requests/:id/update-team-technician - Update team and technician (MANAGER only)
router.put(
    '/:id/update-team-technician',
    requireRole([USER_ROLES.MANAGER]),
    requestController.updateTeamAndTechnician
);

module.exports = router;
