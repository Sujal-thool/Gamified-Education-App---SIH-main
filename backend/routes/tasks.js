const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Files of type pdf, doc, docx, jpg, jpeg, png only!'));
    }
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, status } = req.query;
    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by status for students (their submissions)
    if (status && req.user.role === 'student') {
      query['submissions.student'] = req.user._id;
      query['submissions.status'] = status;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get user's assigned tasks
// @access  Private
router.get('/my-tasks', protect, async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'student') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.createdBy = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('submissions.student', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('submissions.student', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), upload.single('resourceFile'), [
  body('title').not().isEmpty().trim().escape(),
  body('description').not().isEmpty().trim().escape(),
  body('points').isInt({ min: 1 }),
  body('dueDate').isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's a file and validation fails, delete the uploaded file
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, category, points, difficulty, dueDate, assignedTo: assignedToStr } = req.body;

    // Parse assignedTo if it comes as a string (from FormData)
    let assignedTo = [];
    if (assignedToStr) {
      try {
        assignedTo = JSON.parse(assignedToStr);
      } catch (e) {
        // If it's a single ID string or array not stringified properly
        assignedTo = Array.isArray(assignedToStr) ? assignedToStr : [assignedToStr];
      }
    }

    // Validate assigned users if provided
    if (assignedTo.length > 0) {
      const validUsers = await User.find({
        _id: { $in: assignedTo },
        role: 'student',
        isActive: true
      });

      if (validUsers.length !== assignedTo.length) {
        // If there's a file and validation fails, delete the uploaded file
        if (req.file) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Some assigned users are invalid or not students'
        });
      }
    }

    const taskData = {
      title,
      description,
      category,
      points,
      difficulty,
      dueDate,
      createdBy: req.user._id,
      assignedTo
    };

    if (req.file) {
      taskData.resourceFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype
      };
    }

    const task = await Task.create(taskData);

    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/tasks/:id/submit
// @desc    Submit task (students only)
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), [
  body('description').trim().isLength({ min: 3, max: 500 }).withMessage('Description must be between 3 and 500 characters')
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

    const { description } = req.body;
    const taskId = req.params.id;

    let files = [];
    if (req.file) {
      files.push({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if task is assigned to student (or open to all)
    const isAssigned = task.assignedTo.length === 0 || task.assignedTo.some(id => id.toString() === req.user._id.toString());
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this task'
      });
    }

    // Check if already submitted
    const existingSubmission = task.submissions.find(
      sub => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      if (existingSubmission.status === 'rejected') {
        // Allow resubmission: update existing submission
        existingSubmission.description = description;
        existingSubmission.files = files;
        existingSubmission.status = 'pending';
        existingSubmission.submittedAt = new Date();
        existingSubmission.feedback = ''; // Clear previous feedback
        // Points awarded remains as is or can be reset, usually reset if re-graded
        existingSubmission.pointsAwarded = 0;
      } else {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this task'
        });
      }
    } else {
      // Add new submission
      task.submissions.push({
        student: req.user._id,
        description,
        files
      });
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task submitted successfully',
      data: task
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/tasks/:id/review
// @desc    Review task submission (teacher/admin only)
// @access  Private (Teacher, Admin)
router.put('/:id/review', protect, authorize('teacher', 'admin'), [
  body('submissionId').notEmpty().withMessage('Submission ID is required'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('feedback').optional().trim().isLength({ max: 300 }).withMessage('Feedback cannot exceed 300 characters'),
  body('pointsAwarded').optional().isInt({ min: 0 }).withMessage('Points awarded must be a non-negative integer')
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

    const { submissionId, status, feedback = '', pointsAwarded = 0 } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const submission = task.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update submission
    submission.status = status;
    submission.feedback = feedback;
    submission.pointsAwarded = pointsAwarded;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();

    await task.save();

    // Update student points if approved
    if (status === 'approved' && pointsAwarded > 0) {
      await User.findByIdAndUpdate(
        submission.student,
        {
          $inc: {
            points: pointsAwarded,
            tasksCompleted: 1
          }
        }
      );
    } else if (status === 'approved') {
      await User.findByIdAndUpdate(
        submission.student,
        { $inc: { tasksCompleted: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: task
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user created the task or is admin
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Teacher, Admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Allow deletion if user is admin or teacher (regardless of creator)
    // This resolves issues with orphaned tasks or shared management
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

