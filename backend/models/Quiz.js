const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a quiz description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other']
  },
  questions: [{
    question: {
      type: String,
      required: true,
      maxlength: [500, 'Question cannot exceed 500 characters']
    },
    options: [{
      type: String,
      required: true,
      maxlength: [200, 'Option cannot exceed 200 characters']
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      maxlength: [300, 'Explanation cannot exceed 300 characters']
    }
  }],
  points: {
    type: Number,
    required: [true, 'Please provide points for this quiz'],
    min: [1, 'Points must be at least 1'],
    max: [50, 'Points cannot exceed 50']
  },
  timeLimit: {
    type: Number, // in minutes
    default: 10
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [Number], // Array of selected option indices
    score: {
      type: Number,
      default: 0
    },
    pointsAwarded: {
      type: Number,
      default: 0
    },
    completedAt: {
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

module.exports = mongoose.model('Quiz', quizSchema);

