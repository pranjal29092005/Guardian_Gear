const User = require('./user.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../../utils/ApiError');

class UserService {
    async updateProfile(userId, updateData) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        // Check if email is being changed and if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await User.findOne({ email: updateData.email });
            if (existingUser) {
                throw new ApiError('Email already in use', 400);
            }
        }

        // Update allowed fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email;

        await user.save();

        // Return user without password
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamIds: user.teamIds
        };
    }

    async changePassword(userId, { currentPassword, newPassword }) {
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ApiError('Current password is incorrect', 401);
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new ApiError('New password must be at least 6 characters', 400);
        }

        // Hash and save new password
        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        return { message: 'Password updated successfully' };
    }

    async getCurrentUser(userId) {
        const user = await User.findById(userId).populate('teamIds', 'name');

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamIds: user.teamIds
        };
    }

    async getAllUsers() {
        const users = await User.find()
            .select('name email role teamIds')
            .populate('teamIds', 'name')
            .sort({ name: 1 });

        return users;
    }

    async getTechniciansWithStats() {
        const MaintenanceRequest = require('../requests/request.model');
        const { USER_ROLES, REQUEST_STAGES } = require('../../utils/constants');


        const technicians = await User.find({ role: USER_ROLES.TECHNICIAN })
            .populate('teamIds', 'name')
            .select('name email role teamIds')
            .sort({ name: 1 });

        const techniciansWithStats = await Promise.all(
            technicians.map(async (tech) => {
                const activeRequestsCount = await MaintenanceRequest.countDocuments({
                    assignedTechnicianId: tech._id,
                    stage: { $in: [REQUEST_STAGES.NEW, REQUEST_STAGES.IN_PROGRESS] }
                });

                return {
                    _id: tech._id,
                    name: tech.name,
                    email: tech.email,
                    role: tech.role,
                    teams: tech.teamIds,
                    activeRequestsCount,
                    availability: activeRequestsCount < 3 ? 'Available' : 'Busy'
                };
            })
        );

        return techniciansWithStats.sort((a, b) => a.activeRequestsCount - b.activeRequestsCount);
    }
}

module.exports = new UserService();
