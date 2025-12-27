const authService = require('./auth.service');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await authService.login(email, password);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email and password are required'
                });
            }

            const result = await authService.register({ name, email, password });

            res.status(201).json({
                success: true,
                data: result,
                message: 'Account created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            await authService.forgotPassword(email);

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to your email'
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Token and new password are required'
                });
            }

            await authService.resetPassword(token, password);

            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
