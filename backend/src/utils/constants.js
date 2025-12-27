// User Roles
const USER_ROLES = {
    USER: 'USER',
    TECHNICIAN: 'TECHNICIAN',
    MANAGER: 'MANAGER'
};

// Request Types
const REQUEST_TYPES = {
    CORRECTIVE: 'CORRECTIVE',
    PREVENTIVE: 'PREVENTIVE'
};

// Request Stages
const REQUEST_STAGES = {
    NEW: 'NEW',
    IN_PROGRESS: 'IN_PROGRESS',
    REPAIRED: 'REPAIRED',
    SCRAP: 'SCRAP'
};

// Equipment Status
const EQUIPMENT_STATUS = {
    ACTIVE: 'ACTIVE',
    DAMAGED: 'DAMAGED',
    UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
    SCRAP: 'SCRAP'
};

// Stage Transitions - Allowed moves
const ALLOWED_STAGE_TRANSITIONS = {
    NEW: ['IN_PROGRESS'],
    IN_PROGRESS: ['REPAIRED', 'SCRAP'],
    REPAIRED: [],
    SCRAP: []
};

module.exports = {
    USER_ROLES,
    REQUEST_TYPES,
    REQUEST_STAGES,
    EQUIPMENT_STATUS,
    ALLOWED_STAGE_TRANSITIONS
};
