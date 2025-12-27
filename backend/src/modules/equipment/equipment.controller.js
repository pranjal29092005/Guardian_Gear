const equipmentService = require('./equipment.service');

class EquipmentController {
    async getAll(req, res, next) {
        try {
            const { department, category, status } = req.query;
            const filters = { department, category, status };

            const equipment = await equipmentService.getAll(filters);

            res.status(200).json({
                success: true,
                data: equipment
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await equipmentService.getById(id);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const equipment = await equipmentService.create(req.body);

            res.status(201).json({
                success: true,
                data: equipment
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const equipment = await equipmentService.update(id, req.body);

            res.status(200).json({
                success: true,
                data: equipment
            });
        } catch (error) {
            next(error);
        }
    }

    async getActive(req, res, next) {
        try {
            const equipment = await equipmentService.getActiveEquipment();

            res.status(200).json({
                success: true,
                data: equipment
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EquipmentController();
