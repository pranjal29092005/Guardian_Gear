const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: 'CategoryIcon'
    }
}, {
    timestamps: true
});

// Index for faster lookups
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);
