const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');
const ApiError = require('../../utils/ApiError');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No token provided');
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, jwtSecret);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            teamIds: decoded.teamIds || []
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(401, 'Invalid token'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Token expired'));
        }
        next(error);
    }
};

module.exports = authenticate;
