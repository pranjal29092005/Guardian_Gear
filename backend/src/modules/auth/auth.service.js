const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

    async register({ name, email, password }) {
        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: 'USER' // Default role
        });

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

    async forgotPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal if email exists
            return { message: 'If the email exists, a reset link has been sent' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In production, send email with reset link
        // For now, just log it (in development)
        console.log('Reset Token:', resetToken);
        console.log('Reset Link:', `http://localhost:5173/reset-password?token=${resetToken}`);

        return { message: 'Password reset link sent' };
    }

    async resetPassword(token, newPassword) {
        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            throw new ApiError(400, 'Invalid or expired reset token');
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password reset successfully' };
    }
}

module.exports = new AuthService();
