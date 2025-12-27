const Category = require('./category.model');
const Equipment = require('../equipment/equipment.model');
const ApiError = require('../../utils/ApiError');

class CategoryService {
    /**
     * Get all categories
     */
    async getAll() {
        const categories = await Category.find().sort({ name: 1 });

        // Get equipment count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const equipmentCount = await Equipment.countDocuments({
                    category: category.name
                });

                return {
                    ...category.toObject(),
                    equipmentCount
                };
            })
        );

        return categoriesWithCount;
    }

    /**
     * Create new category
     */
    async create(data) {
        const category = await Category.create(data);
        return category;
    }

    /**
     * Update category
     */
    async update(id, data) {
        const category = await Category.findById(id);

        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        // If name is being changed, update all equipment using this category
        if (data.name && data.name !== category.name) {
            await Equipment.updateMany(
                { category: category.name },
                { category: data.name }
            );
        }

        Object.assign(category, data);
        await category.save();

        return category;
    }

    /**
     * Delete category
     */
    async delete(id) {
        const category = await Category.findById(id);

        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        // Check if category is in use
        const equipmentCount = await Equipment.countDocuments({
            category: category.name
        });

        if (equipmentCount > 0) {
            throw new ApiError(400, `Cannot delete category. ${equipmentCount} equipment items are using this category.`);
        }

        await category.deleteOne();
        return { message: 'Category deleted successfully' };
    }
}

module.exports = new CategoryService();
