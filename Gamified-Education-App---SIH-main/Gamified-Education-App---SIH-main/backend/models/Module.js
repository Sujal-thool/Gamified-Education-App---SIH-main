const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a module title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    videoUrl: {
        type: String,
        required: [true, 'Please provide a video URL'],
        trim: true
    },
    category: {
        type: String,
        enum: ['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other'],
        default: 'other'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Module', moduleSchema);
