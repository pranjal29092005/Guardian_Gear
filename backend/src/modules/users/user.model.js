const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../../utils/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER,
        required: true
    },
    avatarUrl: {
        type: String,
        default: null
    },
    teamIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTeam'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Validate technician has teams
userSchema.pre('save', function (next) {
    if (this.role === USER_ROLES.TECHNICIAN && (!this.teamIds || this.teamIds.length === 0)) {
        return next(new Error('TECHNICIAN must belong to at least one team'));
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
