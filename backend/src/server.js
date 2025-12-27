const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(port, () => {
    console.log(`[SERVER] GearGuard API running on port ${port}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`[ERROR] Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = server;
