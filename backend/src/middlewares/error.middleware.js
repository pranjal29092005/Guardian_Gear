const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
    }

    console.error(`[ERROR] ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
