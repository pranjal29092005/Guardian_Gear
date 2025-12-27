const requestService = require('./request.service');

class RequestController {
    async create(req, res, next) {
        try {
            console.log('[RequestController] CREATE - Request body:', req.body);
            console.log('[RequestController] CREATE - User:', req.user);

            const request = await requestService.create(req.body, req.user);

            console.log('[RequestController] CREATE - Request created successfully:', request._id);

            res.status(201).json({
                success: true,
                data: request
            });
        } catch (error) {
            console.error('[RequestController] CREATE - Error:', error.message);
            next(error);
        }
    }

    async getKanban(req, res, next) {
        try {
            console.log('[RequestController] GET_KANBAN - User:', req.user);
            console.log('[RequestController] GET_KANBAN - Equipment ID filter:', req.query.equipmentId);

            const { equipmentId } = req.query;

            let data;
            if (equipmentId) {
                // Filter by equipment
                const requests = await requestService.getByEquipmentId(equipmentId, req.user);
                data = requests;
                console.log('[RequestController] GET_KANBAN - Filtered by equipment, count:', data.length);
            } else {
                // Get all kanban data grouped by stage
                data = await requestService.getKanbanRequests(req.user);
                console.log('[RequestController] GET_KANBAN - Result counts:', {
                    NEW: data.NEW?.length || 0,
                    IN_PROGRESS: data.IN_PROGRESS?.length || 0,
                    REPAIRED: data.REPAIRED?.length || 0,
                    SCRAP: data.SCRAP?.length || 0
                });
            }

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('[RequestController] GET_KANBAN - Error:', error.message);
            next(error);
        }
    }

    async getCalendar(req, res, next) {
        try {
            const data = await requestService.getCalendarRequests(req.user);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStage(req, res, next) {
        try {
            const { id } = req.params;
            const { stage } = req.body;

            if (!stage) {
                return res.status(400).json({
                    success: false,
                    message: 'Stage is required'
                });
            }

            const request = await requestService.updateStage(id, stage, req.user);

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            next(error);
        }
    }

    async assign(req, res, next) {
        try {
            const { id } = req.params;
            const { technicianId } = req.body;

            // If no technician specified, assign to self
            const assignTo = technicianId || req.user.userId;

            const request = await requestService.assignRequest(id, assignTo, req.user);

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            next(error);
        }
    }

    async complete(req, res, next) {
        try {
            const { id } = req.params;
            const { durationHours } = req.body;

            // durationHours is optional - will be auto-calculated if not provided
            const request = await requestService.completeRequest(id, durationHours || 0, req.user);

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            next(error);
        }
    }

    async scrap(req, res, next) {
        try {
            const { id } = req.params;
            const request = await requestService.scrapRequest(id, req.user);

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
            next(error);
        }
    }

    async getRequestsPerTeam(req, res, next) {
        try {
            const data = await requestService.getRequestsPerTeam();

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getByEquipmentId(req, res, next) {
        try {
            const { equipmentId } = req.params;
            const requests = await requestService.getByEquipmentId(equipmentId, req.user);

            res.status(200).json({
                success: true,
                data: requests
            });
        } catch (error) {
            next(error);
        }
    }

    async assignTechnician(req, res, next) {
        try {
            const { id } = req.params;
            const { technicianId } = req.body;
            const managerId = req.user.userId;

            console.log('[RequestController] ASSIGN_TECHNICIAN - Request ID:', id);
            console.log('[RequestController] ASSIGN_TECHNICIAN - Technician ID:', technicianId);
            console.log('[RequestController] ASSIGN_TECHNICIAN - Manager ID:', managerId);

            const request = await requestService.assignTechnician(id, technicianId, managerId);

            console.log('[RequestController] ASSIGN_TECHNICIAN - Success');

            res.json({ success: true, data: request });
        } catch (error) {
            console.error('[RequestController] ASSIGN_TECHNICIAN - Error:', error.message);
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            console.log('[RequestController] UPDATE_STATUS - Request ID:', id);
            console.log('[RequestController] UPDATE_STATUS - New Status:', status);
            console.log('[RequestController] UPDATE_STATUS - User ID:', userId);

            const request = await requestService.updateRequestStatus(id, status, userId);

            console.log('[RequestController] UPDATE_STATUS - Success');

            res.json({ success: true, data: request });
        } catch (error) {
            console.error('[RequestController] UPDATE_STATUS - Error:', error.message);
            next(error);
        }
    }

    async getAvailableTechnicians(req, res, next) {
        try {
            console.log('[RequestController] GET_AVAILABLE_TECHNICIANS');

            const userService = require('../users/user.service');
            const technicians = await userService.getTechniciansWithStats();

            console.log('[RequestController] GET_AVAILABLE_TECHNICIANS - Count:', technicians.length);

            res.json({ success: true, data: technicians });
        } catch (error) {
            console.error('[RequestController] GET_AVAILABLE_TECHNICIANS - Error:', error.message);
            next(error);
        }
    }

    async getDashboardStats(req, res, next) {
        try {
            const stats = await requestService.getDashboardStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTeamAndTechnician(req, res, next) {
        try {
            const { id } = req.params;
            const { teamId, technicianId } = req.body;
            const managerId = req.user.userId;

            console.log('[RequestController] UPDATE_TEAM_TECHNICIAN - Request ID:', id);
            console.log('[RequestController] UPDATE_TEAM_TECHNICIAN - Team ID:', teamId);
            console.log('[RequestController] UPDATE_TEAM_TECHNICIAN - Technician ID:', technicianId);

            const request = await requestService.updateTeamAndTechnician(id, teamId, technicianId, managerId);

            console.log('[RequestController] UPDATE_TEAM_TECHNICIAN - Success');

            res.json({ success: true, data: request });
        } catch (error) {
            console.error('[RequestController] UPDATE_TEAM_TECHNICIAN - Error:', error.message);
            next(error);
        }
    }
}

module.exports = new RequestController();
