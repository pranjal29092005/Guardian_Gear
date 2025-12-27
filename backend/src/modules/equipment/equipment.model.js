const mongoose = require('mongoose');
const { EQUIPMENT_STATUS } = require('../../utils/constants');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Equipment name is required'],
        trim: true
    },
    serialNumber: {
        type: String,
        required: [true, 'Serial number is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    ownerEmployeeName: {
        type: String,
        trim: true,
        default: ''
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    warrantyUntil: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    assignedDate: {
        type: Date,
        default: null
    },
    scrapDate: {
        type: Date,
        default: null
    },
    workCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter',
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    technician: {
        type: String,
        trim: true,
        default: ''
    },
    defaultMaintenanceTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTeam',
        required: [true, 'Default maintenance team is required']
    },
    status: {
        type: String,
        enum: Object.values(EQUIPMENT_STATUS),
        default: EQUIPMENT_STATUS.ACTIVE,
        required: true
    },
    notes: [{
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
equipmentSchema.index({ serialNumber: 1 });
equipmentSchema.index({ department: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;
