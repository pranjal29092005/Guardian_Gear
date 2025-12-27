const WorkCenter = require('./workcenter.model');
const ApiError = require('../../utils/ApiError');

class WorkCenterService {
    async getAll() {
        const workcenters = await WorkCenter.find()
            .populate('alternativeWorkcenters', 'name code')
            .sort({ createdAt: -1 });

        return workcenters;
    }

    async getById(id) {
        const workcenter = await WorkCenter.findById(id)
            .populate('alternativeWorkcenters', 'name code');

        if (!workcenter) {
            throw new ApiError(404, 'Work center not found');
        }

        return workcenter;
    }

    async create(data) {
        // Validate that alternative workcenters exist
        if (data.alternativeWorkcenters && data.alternativeWorkcenters.length > 0) {
            const validAlternatives = await WorkCenter.find({
                _id: { $in: data.alternativeWorkcenters }
            });

            if (validAlternatives.length !== data.alternativeWorkcenters.length) {
                throw new ApiError(400, 'One or more alternative work centers not found');
            }
        }

        const workcenter = await WorkCenter.create(data);
        return workcenter;
    }

    async update(id, data) {
        // Validate that alternative workcenters exist
        if (data.alternativeWorkcenters && data.alternativeWorkcenters.length > 0) {
            const validAlternatives = await WorkCenter.find({
                _id: { $in: data.alternativeWorkcenters }
            });

            if (validAlternatives.length !== data.alternativeWorkcenters.length) {
                throw new ApiError(400, 'One or more alternative work centers not found');
            }
        }

        const workcenter = await WorkCenter.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).populate('alternativeWorkcenters', 'name code');

        if (!workcenter) {
            throw new ApiError(404, 'Work center not found');
        }

        return workcenter;
    }

    async delete(id) {
        // Soft delete - set to INACTIVE
        const workcenter = await WorkCenter.findByIdAndUpdate(
            id,
            { status: 'INACTIVE' },
            { new: true }
        );

        if (!workcenter) {
            throw new ApiError(404, 'Work center not found');
        }

        return workcenter;
    }

    // Get only ACTIVE work centers (for dropdowns)
    async getActiveWorkcenters() {
        return await WorkCenter.find({ status: 'ACTIVE' })
            .select('name code tag')
            .sort({ name: 1 });
    }
}

module.exports = new WorkCenterService();
