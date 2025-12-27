const MaintenanceTeam = require('./team.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { USER_ROLES } = require('../../utils/constants');

class TeamService {
    async getAll() {
        const teams = await MaintenanceTeam.find()
            .populate('memberIds', 'name email role avatarUrl')
            .sort({ name: 1 });

        return teams;
    }

    async getById(id) {
        const team = await MaintenanceTeam.findById(id)
            .populate('memberIds', 'name email role avatarUrl');

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        // Format the response to match frontend expectations
        return {
            _id: team._id,
            name: team.name,
            description: team.description,
            members: team.memberIds, // Use 'members' instead of 'memberIds'
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        };
    }

    async create(data) {
        const { name, description, memberIds } = data;

        // Validate that all members are TECHNICIAN or MANAGER
        if (memberIds && memberIds.length > 0) {
            const users = await User.find({ _id: { $in: memberIds } });

            const invalidUsers = users.filter(
                user => user.role !== USER_ROLES.TECHNICIAN && user.role !== USER_ROLES.MANAGER
            );

            if (invalidUsers.length > 0) {
                throw new ApiError(400, 'Only TECHNICIAN and MANAGER roles can be team members');
            }
        }

        const team = await MaintenanceTeam.create({ name, description, memberIds });

        // Update users' teamIds
        if (memberIds && memberIds.length > 0) {
            await User.updateMany(
                { _id: { $in: memberIds } },
                { $addToSet: { teamIds: team._id } }
            );
        }

        return team;
    }

    async update(id, data) {
        const team = await MaintenanceTeam.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        return team;
    }

    async addMember(teamId, userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (user.role !== USER_ROLES.TECHNICIAN && user.role !== USER_ROLES.MANAGER) {
            throw new ApiError(400, 'Only TECHNICIAN and MANAGER can be team members');
        }

        const team = await MaintenanceTeam.findById(teamId);

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        // Add to team if not already a member
        if (!team.memberIds.includes(userId)) {
            team.memberIds.push(userId);
            await team.save();
        }

        // Add team to user's teamIds
        if (!user.teamIds.includes(teamId)) {
            user.teamIds.push(teamId);
            await user.save();
        }

        // Return populated team
        const populatedTeam = await MaintenanceTeam.findById(teamId)
            .populate('memberIds', 'name email role avatarUrl');

        return populatedTeam;
    }

    async removeMember(teamId, userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const team = await MaintenanceTeam.findById(teamId);

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        // Remove from team
        team.memberIds = team.memberIds.filter(id => id.toString() !== userId.toString());
        await team.save();

        // Remove team from user's teamIds
        user.teamIds = user.teamIds.filter(id => id.toString() !== teamId.toString());
        await user.save();

        // Return populated team
        const populatedTeam = await MaintenanceTeam.findById(teamId)
            .populate('memberIds', 'name email role avatarUrl');

        return populatedTeam;
    }

    async delete(id) {
        const team = await MaintenanceTeam.findById(id);

        if (!team) {
            throw new ApiError(404, 'Team not found');
        }

        // Remove team from all members' teamIds
        await User.updateMany(
            { _id: { $in: team.memberIds } },
            { $pull: { teamIds: id } }
        );

        await team.deleteOne();
        return { message: 'Team deleted successfully' };
    }
}

module.exports = new TeamService();
