const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoUri);
        console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[DB] Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
