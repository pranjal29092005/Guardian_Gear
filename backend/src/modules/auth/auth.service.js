const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');

class AuthService {
    async login(email, password) {
        // Find user with password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new ApiError(403, 'Account is inactive');
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                teamIds: user.teamIds
            },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        // Return user data (without password)
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            teamIds: user.teamIds
        };

        return { token, user: userData };
    }
}

module.exports = new AuthService();
