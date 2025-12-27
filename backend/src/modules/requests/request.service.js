const MaintenanceRequest = require('./request.model');
const Equipment = require('../equipment/equipment.model');
const User = require('../users/user.model');
const equipmentService = require('../equipment/equipment.service');
const ApiError = require('../../utils/ApiError');
const {
    USER_ROLES,
    REQUEST_TYPES,
    REQUEST_STAGES,
    EQUIPMENT_STATUS,
    ALLOWED_STAGE_TRANSITIONS
} = require('../../utils/constants');

class RequestService {
    /**
     * Create a new maintenance request with auto-fill logic
     */
    async create(data, user) {
        const { equipmentId, workCenterId, maintenanceFor, type, subject, description, scheduledDate, durationHours, assignedTechnicianId } = data;

        let requestData = {
            type,
            subject,
            description: description || '',
            maintenanceFor: maintenanceFor || 'EQUIPMENT',
            createdByUserId: user.userId,
            stage: REQUEST_STAGES.NEW
        };

        // Add assigned technician if provided (optional)
        if (assignedTechnicianId) {
            requestData.assignedTechnicianId = assignedTechnicianId;
        }

        if (maintenanceFor === 'EQUIPMENT') {
            // Fetch equipment to auto-fill team and category
            const equipment = await Equipment.findById(equipmentId);

            if (!equipment) {
                throw new ApiError(404, 'Equipment not found');
            }

            // Prevent requests for scrapped equipment
            if (equipment.status === EQUIPMENT_STATUS.SCRAP) {
                throw new ApiError(400, 'Cannot create maintenance request for scrapped equipment');
            }

            // Auto-fill data from equipment
            requestData.equipmentId = equipmentId;
            requestData.equipmentCategorySnapshot = equipment.category; // Snapshot at creation
            requestData.maintenanceTeamId = equipment.defaultMaintenanceTeamId; // Auto-filled
        } else if (maintenanceFor === 'WORK_CENTER') {
            const WorkCenter = require('../workcenters/workcenter.model');
            const workCenter = await WorkCenter.findById(workCenterId);

            if (!workCenter) {
                throw new ApiError(404, 'Work center not found');
            }

            requestData.workCenterId = workCenterId;
            requestData.equipmentCategorySnapshot = workCenter.name; // Use work center name as category snapshot
            // For work centers, maintenanceTeamId should be provided in the request or use a default
            if (data.maintenanceTeamId) {
                requestData.maintenanceTeamId = data.maintenanceTeamId;
            }
        }

        // Add scheduled date for preventive requests
        if (type === REQUEST_TYPES.PREVENTIVE) {
            if (!scheduledDate) {
                throw new ApiError(400, 'Preventive requests require a scheduled date');
            }
            requestData.scheduledDate = scheduledDate;
        }

        // Add duration if provided
        if (durationHours) {
            requestData.durationHours = durationHours;
        }

        const request = await MaintenanceRequest.create(requestData);
        return await this.getById(request._id, user);
    }

    /**
     * Get requests for Kanban board with role-based filtering
     */
    async getKanbanRequests(user) {
        console.log('[RequestService] getKanbanRequests - User:', user);

        const query = {};

        // Role-based filtering
        if (user.role === USER_ROLES.USER) {
            // Users see only their own requests
            query.createdByUserId = user.userId;
            console.log('[RequestService] USER role - filtering by createdByUserId:', user.userId);
        } else if (user.role === USER_ROLES.TECHNICIAN) {
            // Technicians see only their team's requests
            query.maintenanceTeamId = { $in: user.teamIds };
            console.log('[RequestService] TECHNICIAN role - filtering by teamIds:', user.teamIds);
        } else {
            console.log('[RequestService] MANAGER role - no filtering, showing all requests');
        }
        // Managers see all requests (no filter)

        console.log('[RequestService] MongoDB query:', JSON.stringify(query));

        const requests = await MaintenanceRequest.find(query)
            .populate('equipmentId', 'name serialNumber')
            .populate('maintenanceTeamId', 'name')
            .populate('assignedTechnicianId', 'name avatarUrl')
            .populate('createdByUserId', 'name')
            .sort({ createdAt: -1 });

        console.log('[RequestService] Found requests count:', requests.length);

        // Add overdue flag
        const now = new Date();
        const requestsWithOverdue = requests.map(req => {
            const reqObj = req.toObject();
            reqObj.isOverdue = this._isOverdue(reqObj, now);
            return reqObj;
        });

        // Group by stage for Kanban
        const grouped = {
            [REQUEST_STAGES.NEW]: [],
            [REQUEST_STAGES.IN_PROGRESS]: [],
            [REQUEST_STAGES.REPAIRED]: [],
            [REQUEST_STAGES.SCRAP]: []
        };

        requestsWithOverdue.forEach(req => {
            grouped[req.stage].push(req);
        });

        console.log('[RequestService] Grouped by stage:', {
            NEW: grouped.NEW.length,
            IN_PROGRESS: grouped.IN_PROGRESS.length,
            REPAIRED: grouped.REPAIRED.length,
            SCRAP: grouped.SCRAP.length
        });

        return grouped;
    }

    /**
     * Get calendar requests (preventive only)
     */
    async getCalendarRequests(user) {
        const query = { type: REQUEST_TYPES.PREVENTIVE };

        // Apply same role-based filtering
        if (user.role === USER_ROLES.USER) {
            query.createdByUserId = user.userId;
        } else if (user.role === USER_ROLES.TECHNICIAN) {
            query.maintenanceTeamId = { $in: user.teamIds };
        }

        const requests = await MaintenanceRequest.find(query)
            .populate('equipmentId', 'name')
            .select('subject scheduledDate equipmentId stage')
            .sort({ scheduledDate: 1 });

        return requests.map(req => ({
            id: req._id,
            title: req.subject,
            start: req.scheduledDate,
            equipmentName: req.equipmentId?.name,
            stage: req.stage
        }));
    }

    /**
     * Update request stage with validation
     */
    async updateStage(requestId, newStage, user) {
        const request = await MaintenanceRequest.findById(requestId);

        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        // Validate user can modify this request
        this._validateAccessPermission(request, user);

        // Validate stage transition
        const allowedTransitions = ALLOWED_STAGE_TRANSITIONS[request.stage];
        if (!allowedTransitions.includes(newStage)) {
            throw new ApiError(400, `Cannot move from ${request.stage} to ${newStage}`);
        }

        // Track when request moves to IN_PROGRESS
        if (newStage === REQUEST_STAGES.IN_PROGRESS && request.stage !== REQUEST_STAGES.IN_PROGRESS) {
            request.inProgressAt = new Date();
        }

        // Handle REPAIRED stage - calculate duration automatically if drag-dropped
        if (newStage === REQUEST_STAGES.REPAIRED && request.stage === REQUEST_STAGES.IN_PROGRESS) {
            if (request.inProgressAt) {
                const now = new Date();
                const durationMs = now - new Date(request.inProgressAt);
                const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal place
                request.durationHours = Math.max(0.1, durationHours); // Minimum 0.1 hours
            } else {
                // Fallback: use updatedAt if inProgressAt is not set
                const durationMs = new Date() - request.updatedAt;
                const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
                request.durationHours = Math.max(0.1, durationHours);
            }
        }

        request.stage = newStage;
        await request.save();

        return await this.getById(requestId, user);
    }

    /**
     * Assign technician to request
     */
    async assignRequest(requestId, technicianId, user) {
        const request = await MaintenanceRequest.findById(requestId);

        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        // TECHNICIAN can only assign to self if they belong to the team
        if (user.role === USER_ROLES.TECHNICIAN) {
            if (technicianId !== user.userId) {
                throw new ApiError(403, 'Technicians can only assign requests to themselves');
            }

            if (!user.teamIds.includes(request.maintenanceTeamId.toString())) {
                throw new ApiError(403, 'You do not belong to this request\'s team');
            }
        }

        request.assignedTechnicianId = technicianId;
        await request.save();

        return await this.getById(requestId, user);
    }

    /**
     * Complete request (move to REPAIRED) with duration
     */
    async completeRequest(requestId, durationHours, user) {
        const request = await MaintenanceRequest.findById(requestId);

        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        this._validateAccessPermission(request, user);

        if (request.stage !== REQUEST_STAGES.IN_PROGRESS) {
            throw new ApiError(400, 'Can only complete requests in IN_PROGRESS stage');
        }

        // Calculate duration automatically if not provided or if drag-dropped
        if (!durationHours || durationHours <= 0) {
            if (request.inProgressAt) {
                const now = new Date();
                const durationMs = now - new Date(request.inProgressAt);
                const calculatedHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
                durationHours = Math.max(0.1, calculatedHours);
            } else {
                // Fallback: use updatedAt if inProgressAt is not set
                const durationMs = new Date() - request.updatedAt;
                const calculatedHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;
                durationHours = Math.max(0.1, calculatedHours);
            }
        }

        request.stage = REQUEST_STAGES.REPAIRED;
        request.durationHours = durationHours;
        await request.save();

        return await this.getById(requestId, user);
    }

    /**
     * SCRAP CASCADE: Move request to scrap and update equipment atomically
     */
    async scrapRequest(requestId, user) {
        const request = await MaintenanceRequest.findById(requestId);

        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        this._validateAccessPermission(request, user);

        if (request.stage !== REQUEST_STAGES.IN_PROGRESS) {
            throw new ApiError(400, 'Can only scrap requests in IN_PROGRESS stage');
        }

        console.log(`[SCRAP] Starting scrap cascade for request ${requestId}`);

        // Update request stage
        request.stage = REQUEST_STAGES.SCRAP;
        await request.save();

        // Update equipment status and add note (atomic operation)
        const noteText = `Equipment scrapped via Maintenance Request #${requestId} on ${new Date().toISOString()}`;

        const equipment = await Equipment.findById(request.equipmentId);
        if (equipment) {
            equipment.status = EQUIPMENT_STATUS.SCRAP;
            equipment.notes.push({
                text: noteText,
                createdAt: new Date()
            });
            await equipment.save();

            console.log(`[SCRAP] Equipment ${equipment._id} marked as SCRAP`);
        }

        return await this.getById(requestId, user);
    }

    /**
     * Get requests by equipment ID (for smart button)
     */
    async getByEquipmentId(equipmentId, user) {
        const query = { equipmentId };

        // Apply role-based filtering
        if (user.role === USER_ROLES.USER) {
            query.createdByUserId = user.userId;
        } else if (user.role === USER_ROLES.TECHNICIAN) {
            query.maintenanceTeamId = { $in: user.teamIds };
        }

        const requests = await MaintenanceRequest.find(query)
            .populate('maintenanceTeamId', 'name')
            .populate('assignedTechnicianId', 'name avatarUrl')
            .sort({ createdAt: -1 });

        return requests;
    }

    /**
     * Get single request by ID
     */
    async getById(requestId, user) {
        const request = await MaintenanceRequest.findById(requestId)
            .populate('equipmentId', 'name serialNumber category')
            .populate('maintenanceTeamId', 'name')
            .populate('assignedTechnicianId', 'name email avatarUrl')
            .populate('createdByUserId', 'name email');

        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        const reqObj = request.toObject();
        reqObj.isOverdue = this._isOverdue(reqObj, new Date());

        return reqObj;
    }

    /**
     * Get requests per team report
     */
    async getRequestsPerTeam() {
        const result = await MaintenanceRequest.aggregate([
            {
                $group: {
                    _id: '$maintenanceTeamId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'maintenanceteams',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'team'
                }
            },
            {
                $unwind: '$team'
            },
            {
                $project: {
                    teamName: '$team.name',
                    count: 1
                }
            }
        ]);

        return result;
    }

    // ===== PRIVATE HELPER METHODS =====

    /**
     * Check if request is overdue
     */
    _isOverdue(request, now) {
        if (request.type !== REQUEST_TYPES.PREVENTIVE) {
            return false;
        }

        if (request.stage === REQUEST_STAGES.REPAIRED || request.stage === REQUEST_STAGES.SCRAP) {
            return false;
        }

        return request.scheduledDate && new Date(request.scheduledDate) < now;
    }

    /**
     * Validate user has permission to access/modify request
     */
    _validateAccessPermission(request, user) {
        if (user.role === USER_ROLES.MANAGER) {
            return true; // Managers have full access
        }

        if (user.role === USER_ROLES.TECHNICIAN) {
            // Check if technician belongs to request's team
            if (!user.teamIds.includes(request.maintenanceTeamId.toString())) {
                throw new ApiError(403, 'You do not have permission to modify this request');
            }
            return true;
        }

        // Regular users cannot modify requests
        throw new ApiError(403, 'Insufficient permissions');
    }

    async assignTechnician(requestId, technicianId, managerId) {
        console.log('[RequestService] ASSIGN_TECHNICIAN - Request:', requestId, 'Technician:', technicianId);

        const request = await MaintenanceRequest.findById(requestId);
        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        if (request.stage !== REQUEST_STAGES.NEW) {
            throw new ApiError(400, 'Only NEW requests can be assigned');
        }

        const technician = await User.findById(technicianId);
        if (!technician || technician.role !== USER_ROLES.TECHNICIAN) {
            throw new ApiError(400, 'Invalid technician');
        }

        request.assignedTechnicianId = technicianId;
        await request.save();

        await request.populate('assignedTechnicianId', 'name email role');
        await request.populate('equipmentId', 'name serialNumber category');
        await request.populate('maintenanceTeamId', 'name');

        return request;
    }

    async updateTeamAndTechnician(requestId, teamId, technicianId, managerId) {
        console.log('[RequestService] UPDATE_TEAM_TECHNICIAN - Request:', requestId, 'Team:', teamId, 'Technician:', technicianId);

        const request = await MaintenanceRequest.findById(requestId);
        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        // Only managers can update team and technician
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== USER_ROLES.MANAGER) {
            throw new ApiError(403, 'Only managers can update team and technician');
        }

        // Validate team if provided
        if (teamId) {
            const MaintenanceTeam = require('../teams/team.model');
            const team = await MaintenanceTeam.findById(teamId);
            if (!team) {
                throw new ApiError(400, 'Invalid team');
            }
            request.maintenanceTeamId = teamId;
        }

        // Validate technician if provided
        if (technicianId) {
            const technician = await User.findById(technicianId);
            if (!technician || technician.role !== USER_ROLES.TECHNICIAN) {
                throw new ApiError(400, 'Invalid technician');
            }
            request.assignedTechnicianId = technicianId;
        } else if (technicianId === null) {
            // Allow clearing technician assignment
            request.assignedTechnicianId = null;
        }

        await request.save();

        await request.populate('assignedTechnicianId', 'name email role');
        await request.populate('equipmentId', 'name serialNumber category');
        await request.populate('maintenanceTeamId', 'name');

        return request;
    }

    async updateRequestStatus(requestId, newStage, userId) {
        console.log('[RequestService] UPDATE_STATUS - Request:', requestId, 'New Stage:', newStage);

        const request = await MaintenanceRequest.findById(requestId).populate('equipmentId');
        if (!request) {
            throw new ApiError(404, 'Request not found');
        }

        const user = await User.findById(userId);
        const isAssignedTech = request.assignedTechnicianId?.toString() === userId;
        const isManager = user.role === USER_ROLES.MANAGER;

        if (!isAssignedTech && !isManager) {
            throw new ApiError(403, 'Only assigned technician or manager can update status');
        }

        const validTransitions = {
            [REQUEST_STAGES.NEW]: [REQUEST_STAGES.IN_PROGRESS],
            [REQUEST_STAGES.IN_PROGRESS]: [REQUEST_STAGES.REPAIRED, REQUEST_STAGES.SCRAP]
        };

        if (!validTransitions[request.stage]?.includes(newStage)) {
            throw new ApiError(400, `Invalid transition from ${request.stage} to ${newStage}`);
        }

        request.stage = newStage;
        await request.save();

        // Update equipment status
        if (request.equipmentId) {
            const Equipment = require('../equipment/equipment.model');
            let equipmentStatus;

            if (newStage === REQUEST_STAGES.IN_PROGRESS) equipmentStatus = 'REPAIRING';
            if (newStage === REQUEST_STAGES.REPAIRED) equipmentStatus = 'ACTIVE';
            if (newStage === REQUEST_STAGES.SCRAP) equipmentStatus = 'SCRAP';

            if (equipmentStatus) {
                await Equipment.findByIdAndUpdate(request.equipmentId._id, { status: equipmentStatus });
            }
        }

        await request.populate('assignedTechnicianId', 'name email');
        await request.populate('equipmentId', 'name status');
        await request.populate('maintenanceTeamId', 'name');

        return request;
    }

    /**
     * Get dashboard statistics for managers
     */
    async getDashboardStats() {
        const Equipment = require('../equipment/equipment.model');
        const User = require('../users/user.model');
        const { USER_ROLES, REQUEST_STAGES, REQUEST_TYPES } = require('../../utils/constants');

        // Get all equipment and count repairs per equipment
        const allEquipment = await Equipment.find({});
        const allRequests = await MaintenanceRequest.find({
            stage: REQUEST_STAGES.REPAIRED
        });

        // Count repairs per equipment (equipment can be repaired max 5 times)
        const repairCounts = {};
        allRequests.forEach(req => {
            if (req.equipmentId) {
                const eqId = req.equipmentId.toString();
                repairCounts[eqId] = (repairCounts[eqId] || 0) + 1;
            }
        });

        // Critical equipment: repaired 3+ times (out of 5 max)
        const criticalEquipmentCount = Object.values(repairCounts).filter(count => count >= 3).length;

        // Get all technicians
        const technicians = await User.find({ role: USER_ROLES.TECHNICIAN });
        const totalTechnicians = technicians.length;

        // Count assigned requests per technician
        const assignedRequests = await MaintenanceRequest.countDocuments({
            assignedTechnicianId: { $ne: null },
            stage: { $in: [REQUEST_STAGES.NEW, REQUEST_STAGES.IN_PROGRESS] }
        });

        // Calculate technician utilization (assigned requests / total technicians, max 100%)
        // If no technicians, utilization is 0%
        const technicianUtilization = totalTechnicians > 0 
            ? Math.min(100, Math.round((assignedRequests / totalTechnicians) * 100))
            : 0;

        // Get all open requests (not REPAIRED or SCRAP) for counting
        const allOpenRequests = await MaintenanceRequest.find({
            stage: { $nin: [REQUEST_STAGES.REPAIRED, REQUEST_STAGES.SCRAP] }
        });

        // Calculate overdue requests (preventive requests with scheduledDate in past)
        const now = new Date();
        const overdueCount = allOpenRequests.filter(req => {
            return req.type === REQUEST_TYPES.PREVENTIVE &&
                   req.scheduledDate &&
                   new Date(req.scheduledDate) < now;
        }).length;

        // Get recent requests for table (limit 10)
        const requestsTable = await MaintenanceRequest.find({
            stage: { $nin: [REQUEST_STAGES.REPAIRED, REQUEST_STAGES.SCRAP] }
        })
            .populate('equipmentId', 'name serialNumber company location')
            .populate('assignedTechnicianId', 'name')
            .populate('createdByUserId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Format requests for table
        const formattedRequestsTable = requestsTable.map(req => ({
            _id: req._id,
            subject: req.subject,
            employee: req.createdByUserId?.name || '-',
            technician: req.assignedTechnicianId?.name || '-',
            category: req.equipmentCategorySnapshot || '-',
            stage: req.stage,
            company: req.equipmentId?.company || req.equipmentId?.location || '-'
        }));

        return {
            criticalEquipment: {
                count: criticalEquipmentCount,
                label: 'Critical Equipment',
                subtitle: '(Health < 30%)'
            },
            technicianLoad: {
                utilization: technicianUtilization,
                label: 'Technician Load',
                subtitle: technicianUtilization >= 85 ? '(Assign Carefully)' : '(Ideal)'
            },
            openRequests: {
                pending: allOpenRequests.length,
                overdue: overdueCount,
                label: 'Open Requests',
                subtitle: `${overdueCount} Overdue`
            },
            requestsTable: formattedRequestsTable
        };
    }
}

module.exports = new RequestService();
