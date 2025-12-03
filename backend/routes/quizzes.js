const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quizzes/my-quizzes
// @desc    Get user's created quizzes
// @access  Private (Teacher, Admin)
router.get('/my-quizzes', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      createdBy: req.user._id,
      isActive: true
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/quizzes
// @desc    Create new quiz
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn(['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other']).withMessage('Invalid category'),
  body('points').isInt({ min: 1, max: 50 }).withMessage('Points must be between 1 and 50'),
  body('timeLimit').optional().isInt({ min: 1, max: 60 }).withMessage('Time limit must be between 1 and 60 minutes'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question').trim().isLength({ min: 10, max: 500 }).withMessage('Question must be between 10 and 500 characters'),
  body('questions.*.options').isArray({ min: 2, max: 4 }).withMessage('Each question must have 2-4 options'),
  body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be a valid option index'),
  body('questions.*.explanation').optional().trim().isLength({ max: 300 }).withMessage('Explanation cannot exceed 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, category, points, timeLimit = 10, questions } = req.body;

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: Correct answer index is out of range`
        });
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      points,
      timeLimit,
      questions,
      createdBy: req.user._id
    });

    await quiz.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/quizzes/:id/attempt
// @desc    Submit quiz attempt (students only)
// @access  Private (Student)
router.post('/:id/attempt', protect, authorize('student'), [
  body('answers').isArray().withMessage('Answers must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { answers } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if already attempted
    const existingAttempt = quiz.attempts.find(
      attempt => attempt.student.toString() === req.user._id.toString()
    );

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already attempted this quiz'
      });
    }

    // Validate answers length
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of answers must match number of questions'
      });
    }

    // Calculate score
    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (answers[i] === quiz.questions[i].correctAnswer) {
        score++;
      }
    }

    const percentage = (score / quiz.questions.length) * 100;
    const pointsAwarded = Math.floor((percentage / 100) * quiz.points);

    // Add attempt
    quiz.attempts.push({
      student: req.user._id,
      answers,
      score: percentage,
      pointsAwarded
    });

    await quiz.save();

    // Update student points
    if (pointsAwarded > 0) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $inc: {
            points: pointsAwarded,
            quizzesTaken: 1
          }
        }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { quizzesTaken: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: percentage,
        pointsAwarded,
        correctAnswers: score,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quizzes/:id/results
// @desc    Get quiz results (teacher/admin only)
// @access  Private (Teacher, Admin)
router.get('/:id/results', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('attempts.student', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user created the quiz or is admin
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these results'
      });
    }

    res.json({
      success: true,
      data: {
        quiz: {
          title: quiz.title,
          totalQuestions: quiz.questions.length,
          points: quiz.points
        },
        attempts: quiz.attempts,
        totalAttempts: quiz.attempts.length
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('category').isIn(['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other']).withMessage('Invalid category'),
  body('points').isInt({ min: 1, max: 50 }).withMessage('Points must be between 1 and 50'),
  body('timeLimit').optional().isInt({ min: 1, max: 60 }).withMessage('Time limit must be between 1 and 60 minutes'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question').trim().isLength({ min: 10, max: 500 }).withMessage('Question must be between 10 and 500 characters'),
  body('questions.*.options').isArray({ min: 2, max: 4 }).withMessage('Each question must have 2-4 options'),
  body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be a valid option index'),
  body('questions.*.explanation').optional().trim().isLength({ max: 300 }).withMessage('Explanation cannot exceed 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Removed ownership check to allow all teachers to update quizzes


    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: updatedQuiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private (Teacher, Admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Removed ownership check to allow all teachers to delete quizzes


    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

