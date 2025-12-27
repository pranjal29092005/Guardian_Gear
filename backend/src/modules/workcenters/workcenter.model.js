const mongoose = require('mongoose');

const workcenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Work center name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Work center code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    tag: {
        type: String,
        trim: true
    },
    alternativeWorkcenters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter'
    }],
    costPerHour: {
        type: Number,
        min: 0,
        default: 0
    },
    capacityTimeEfficiency: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    oeeTarget: {
        type: Number,
        min: 0,
        max: 100,
        default: 85
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

// Index for faster searches
workcenterSchema.index({ code: 1 });
workcenterSchema.index({ status: 1 });

const WorkCenter = mongoose.model('WorkCenter', workcenterSchema);

module.exports = WorkCenter;
