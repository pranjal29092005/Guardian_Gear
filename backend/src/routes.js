const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const equipmentRoutes = require('./modules/equipment/equipment.routes');
const teamRoutes = require('./modules/teams/team.routes');
const requestRoutes = require('./modules/requests/request.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const reportRoutes = require('./routes/reports.routes');
const workcenterRoutes = require('./modules/workcenters/workcenter.routes');

const router = express.Router();

// Mount all module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/teams', teamRoutes);
router.use('/requests', requestRoutes);
router.use('/categories', categoryRoutes);
router.use('/workcenters', workcenterRoutes);

// Mount report routes at root /api level
router.use('/', reportRoutes);

module.exports = router;
