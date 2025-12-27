const workcenterService = require('./workcenter.service');

class WorkCenterController {
    async getAll(req, res, next) {
        try {
            const workcenters = await workcenterService.getAll();

            res.status(200).json({
                success: true,
                data: workcenters
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const workcenter = await workcenterService.getById(id);

            res.status(200).json({
                success: true,
                data: workcenter
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            console.log('[WorkCenterController] Creating work center:', req.body);
            const workcenter = await workcenterService.create(req.body);

            res.status(201).json({
                success: true,
                data: workcenter
            });
        } catch (error) {
            console.error('[WorkCenterController] Create error:', error);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            console.log('[WorkCenterController] Updating work center:', id, req.body);
            const workcenter = await workcenterService.update(id, req.body);

            res.status(200).json({
                success: true,
                data: workcenter
            });
        } catch (error) {
            console.error('[WorkCenterController] Update error:', error);
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            console.log('[WorkCenterController] Deleting work center:', id);
            const workcenter = await workcenterService.delete(id);

            res.status(200).json({
                success: true,
                data: workcenter
            });
        } catch (error) {
            console.error('[WorkCenterController] Delete error:', error);
            next(error);
        }
    }

    async getActive(req, res, next) {
        try {
            const workcenters = await workcenterService.getActiveWorkcenters();

            res.status(200).json({
                success: true,
                data: workcenters
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WorkCenterController();
