const Equipment = require('./equipment.model');
const MaintenanceRequest = require('../requests/request.model');
const ApiError = require('../../utils/ApiError');
const { EQUIPMENT_STATUS, REQUEST_STAGES, REQUEST_TYPES } = require('../../utils/constants');

class EquipmentService {
    /**
     * Calculate equipment status based on maintenance requests
     * Priority: SCRAP > UNDER_MAINTENANCE > DAMAGED > ACTIVE
     */
    async calculateEquipmentStatus(equipmentId) {
        const requests = await MaintenanceRequest.find({
            equipmentId: equipmentId,
            stage: { $nin: [REQUEST_STAGES.REPAIRED] }
        }).sort({ createdAt: -1 });

        // If no open requests, equipment is ACTIVE
        if (requests.length === 0) {
            return EQUIPMENT_STATUS.ACTIVE;
        }

        // Check for SCRAP status (highest priority)
        const hasScrap = requests.some(req => req.stage === REQUEST_STAGES.SCRAP);
        if (hasScrap) {
            return EQUIPMENT_STATUS.SCRAP;
        }

        // Check for IN_PROGRESS status
        const hasInProgress = requests.some(req => req.stage === REQUEST_STAGES.IN_PROGRESS);
        if (hasInProgress) {
            return EQUIPMENT_STATUS.UNDER_MAINTENANCE;
        }

        // Check for NEW with CORRECTIVE type
        const hasCorrectiveNew = requests.some(
            req => req.stage === REQUEST_STAGES.NEW && req.type === REQUEST_TYPES.CORRECTIVE
        );
        if (hasCorrectiveNew) {
            return EQUIPMENT_STATUS.DAMAGED;
        }

        // Default to ACTIVE
        return EQUIPMENT_STATUS.ACTIVE;
    }

    async getAll(filters = {}) {
        const query = {};

        if (filters.department) {
            query.department = filters.department;
        }
        if (filters.category) {
            query.category = filters.category;
        }
        // Note: status filter is applied after calculating dynamic status

        const equipment = await Equipment.find(query)
            .populate('defaultMaintenanceTeamId', 'name')
            .populate('workCenterId', 'name code')
            .sort({ createdAt: -1 });

        // Calculate dynamic status for each equipment based on requests
        const equipmentWithStatus = await Promise.all(
            equipment.map(async (eq) => {
                const calculatedStatus = await this.calculateEquipmentStatus(eq._id);
                const eqObj = eq.toObject();
                eqObj.status = calculatedStatus;
                return eqObj;
            })
        );

        // Apply status filter if provided
        if (filters.status) {
            return equipmentWithStatus.filter(eq => eq.status === filters.status);
        }

        return equipmentWithStatus;
    }

    async getById(id) {
        const equipment = await Equipment.findById(id)
            .populate('defaultMaintenanceTeamId', 'name')
            .populate('workCenterId', 'name code');

        if (!equipment) {
            throw new ApiError(404, 'Equipment not found');
        }

        // Calculate dynamic status based on requests
        const calculatedStatus = await this.calculateEquipmentStatus(id);
        const equipmentObj = equipment.toObject();
        equipmentObj.status = calculatedStatus;

        // Calculate open request count
        const openRequestCount = await MaintenanceRequest.countDocuments({
            equipmentId: id,
            stage: { $nin: [REQUEST_STAGES.REPAIRED, REQUEST_STAGES.SCRAP] }
        });

        return {
            equipment: equipmentObj,
            openRequestCount
        };
    }

    async create(data) {
        // Check if equipment is being created with SCRAP status (shouldn't happen)
        if (data.status === EQUIPMENT_STATUS.SCRAP) {
            throw new ApiError(400, 'Cannot create equipment with SCRAP status');
        }

        const equipment = await Equipment.create(data);
        return equipment;
    }

    async update(id, data) {
        const equipment = await Equipment.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!equipment) {
            throw new ApiError(404, 'Equipment not found');
        }

        return equipment;
    }

    async addNote(equipmentId, noteText) {
        const equipment = await Equipment.findById(equipmentId);

        if (!equipment) {
            throw new ApiError(404, 'Equipment not found');
        }

        equipment.notes.push({
            text: noteText,
            createdAt: new Date()
        });

        await equipment.save();
        return equipment;
    }

    // Get only ACTIVE equipment (for dropdowns)
    async getActiveEquipment() {
        const allEquipment = await Equipment.find()
            .populate('defaultMaintenanceTeamId', 'name')
            .populate('workCenterId', 'name code')
            .select('name serialNumber category defaultMaintenanceTeamId')
            .sort({ name: 1 });

        // Filter to only ACTIVE equipment based on calculated status
        const activeEquipment = [];
        for (const eq of allEquipment) {
            const calculatedStatus = await this.calculateEquipmentStatus(eq._id);
            if (calculatedStatus === EQUIPMENT_STATUS.ACTIVE) {
                activeEquipment.push(eq);
            }
        }

        return activeEquipment;
    }
}

module.exports = new EquipmentService();
