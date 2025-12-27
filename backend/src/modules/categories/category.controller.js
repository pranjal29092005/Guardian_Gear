const categoryService = require('./category.service');

class CategoryController {
    async getAll(req, res, next) {
        try {
            console.log('[CategoryController] GET_ALL - User:', req.user);

            const categories = await categoryService.getAll();

            console.log('[CategoryController] GET_ALL - Categories count:', categories.length);

            res.json({ success: true, data: categories });
        } catch (error) {
            console.error('[CategoryController] GET_ALL - Error:', error.message);
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            console.log('[CategoryController] CREATE - Request body:', req.body);
            console.log('[CategoryController] CREATE - User:', req.user);

            const category = await categoryService.create(req.body);

            console.log('[CategoryController] CREATE - Category created:', category._id);

            res.status(201).json({ success: true, data: category });
        } catch (error) {
            console.error('[CategoryController] CREATE - Error:', error.message);
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;

            console.log('[CategoryController] UPDATE - Category ID:', id);
            console.log('[CategoryController] UPDATE - Request body:', req.body);

            const category = await categoryService.update(id, req.body);

            console.log('[CategoryController] UPDATE - Category updated:', category._id);

            res.json({ success: true, data: category });
        } catch (error) {
            console.error('[CategoryController] UPDATE - Error:', error.message);
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            console.log('[CategoryController] DELETE - Category ID:', id);

            const result = await categoryService.delete(id);

            console.log('[CategoryController] DELETE - Category deleted successfully');

            res.json({ success: true, data: result });
        } catch (error) {
            console.error('[CategoryController] DELETE - Error:', error.message);
            next(error);
        }
    }
}

module.exports = new CategoryController();
