const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    memberIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Index
teamSchema.index({ name: 1 });

const MaintenanceTeam = mongoose.model('MaintenanceTeam', teamSchema);

module.exports = MaintenanceTeam;
