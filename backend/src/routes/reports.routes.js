const express = require('express');
const requestController = require('../modules/requests/request.controller');
const authenticate = require('../modules/auth/auth.middleware');

const router = express.Router();

// Report routes
router.get('/reports/requests-per-team', authenticate, requestController.getRequestsPerTeam);

module.exports = router;
