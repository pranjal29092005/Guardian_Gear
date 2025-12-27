const userService = require('./user.service');

class UserController {
    async getMe(req, res, next) {
        try {
            const user = await userService.getCurrentUser(req.user.userId);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { name, email } = req.body;
            const user = await userService.updateProfile(req.user.userId, { name, email });
            res.json({ success: true, data: user, message: 'Profile updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            const result = await userService.changePassword(req.user.userId, {
                currentPassword,
                newPassword
            });

            res.json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
