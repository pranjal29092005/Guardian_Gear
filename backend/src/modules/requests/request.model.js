const mongoose = require('mongoose');
const { REQUEST_TYPES, REQUEST_STAGES } = require('../../utils/constants');

const requestSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(REQUEST_TYPES),
        required: [true, 'Request type is required']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
    },
    maintenanceFor: {
        type: String,
        enum: ['EQUIPMENT', 'WORK_CENTER'],
        default: 'EQUIPMENT',
        required: true
    },
    workCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter'
    },
    equipmentCategorySnapshot: {
        type: String,
        required: true
    },
    maintenanceTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTeam',
        required: [true, 'Maintenance team is required']
    },
    assignedTechnicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    stage: {
        type: String,
        enum: Object.values(REQUEST_STAGES),
        default: REQUEST_STAGES.NEW,
        required: true
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    durationHours: {
        type: Number,
        default: null,
        min: 0
    },
    inProgressAt: {
        type: Date,
        default: null
    },
    createdByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by user is required']
    }
}, {
    timestamps: true
});

// Indexes
requestSchema.index({ stage: 1 });
requestSchema.index({ equipmentId: 1 });
requestSchema.index({ maintenanceTeamId: 1 });
requestSchema.index({ assignedTechnicianId: 1 });
requestSchema.index({ type: 1 });

// Validation: Preventive requests must have scheduledDate
requestSchema.pre('save', function (next) {
    if (this.type === REQUEST_TYPES.PREVENTIVE && !this.scheduledDate) {
        return next(new Error('Preventive requests must have a scheduled date'));
    }
    if (this.type === REQUEST_TYPES.CORRECTIVE && this.scheduledDate) {
        return next(new Error('Corrective requests cannot have a scheduled date'));
    }
    next();
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', requestSchema);

module.exports = MaintenanceRequest;
