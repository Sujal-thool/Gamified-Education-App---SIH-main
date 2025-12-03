const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a task description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other']
  },
  points: {
    type: Number,
    required: [true, 'Please provide points for this task'],
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceFile: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Submission description cannot exceed 500 characters']
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    feedback: String,
    pointsAwarded: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

