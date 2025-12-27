const teamService = require('./team.service');

class TeamController {
    async getAll(req, res, next) {
        try {
            console.log('[TeamController] GET_ALL - User:', req.user);

            const teams = await teamService.getAll();

            console.log('[TeamController] GET_ALL - Teams count:', teams.length);

            res.status(200).json({
                success: true,
                data: teams
            });
        } catch (error) {
            console.error('[TeamController] GET_ALL - Error:', error.message);
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;

            console.log('[TeamController] GET_BY_ID - Team ID:', id);

            const team = await teamService.getById(id);

            res.status(200).json({
                success: true,
                data: team
            });
        } catch (error) {
            console.error('[TeamController] GET_BY_ID - Error:', error.message);
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            console.log('[TeamController] CREATE - Request body:', req.body);

            const team = await teamService.create(req.body);

            console.log('[TeamController] CREATE - Team created:', team._id);

            res.status(201).json({
                success: true,
                data: team
            });
        } catch (error) {
            console.error('[TeamController] CREATE - Error:', error.message);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            console.log('[TeamController] UPDATE - Team ID:', id);
            console.log('[TeamController] UPDATE - Request body:', req.body);

            const team = await teamService.update(id, req.body);

            res.status(200).json({
                success: true,
                data: team
            });
        } catch (error) {
            console.error('[TeamController] UPDATE - Error:', error.message);
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            console.log('[TeamController] DELETE - Team ID:', id);

            const result = await teamService.delete(id);

            console.log('[TeamController] DELETE - Team deleted successfully');

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('[TeamController] DELETE - Error:', error.message);
            next(error);
        }
    }

    async addMember(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            console.log('[TeamController] ADD_MEMBER - Team ID:', id, 'User ID:', userId);

            const team = await teamService.addMember(id, userId);

            console.log('[TeamController] ADD_MEMBER - Member added successfully');

            res.status(200).json({
                success: true,
                data: team
            });
        } catch (error) {
            console.error('[TeamController] ADD_MEMBER - Error:', error.message);
            next(error);
        }
    }

    async removeMember(req, res, next) {
        try {
            const { id, userId } = req.params;

            console.log('[TeamController] REMOVE_MEMBER - Team ID:', id, 'User ID:', userId);

            const team = await teamService.removeMember(id, userId);

            console.log('[TeamController] REMOVE_MEMBER - Member removed successfully');

            res.status(200).json({
                success: true,
                data: team
            });
        } catch (error) {
            console.error('[TeamController] REMOVE_MEMBER - Error:', error.message);
            next(error);
        }
    }
}

module.exports = new TeamController();
