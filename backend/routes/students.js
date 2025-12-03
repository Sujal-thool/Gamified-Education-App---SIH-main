const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');

// @route   GET /api/students/performance
// @desc    Get student performance data
// @access  Private (Student, Teacher, Admin)
router.get('/performance', protect, async (req, res) => {
    try {
        let query = { role: 'student', isActive: true };

        // If student, only return their own data
        if (req.user.role === 'student') {
            query._id = req.user._id;
        }

        const students = await User.find(query).select('-password');

        const performanceData = await Promise.all(students.map(async (student) => {
            // Get completed tasks
            const tasks = await Task.find({
                'submissions.student': student._id
            });

            const taskSubmissions = tasks.map(task => {
                const submission = task.submissions.find(s => s.student.toString() === student._id.toString());
                return {
                    taskId: task._id,
                    taskTitle: task.title,
                    status: submission.status,
                    pointsAwarded: submission.status === 'approved' ? task.points : 0,
                    submittedAt: submission.submittedAt
                };
            });

            const completedTasksCount = taskSubmissions.filter(s => s.status === 'approved').length;

            // Get quiz attempts
            const quizzes = await Quiz.find({
                'attempts.student': student._id
            });

            const quizAttempts = [];
            quizzes.forEach(quiz => {
                const attempts = quiz.attempts.filter(a => a.student.toString() === student._id.toString());
                attempts.forEach(attempt => {
                    quizAttempts.push({
                        quizId: quiz._id,
                        quizTitle: quiz.title,
                        score: attempt.score,
                        pointsEarned: attempt.pointsAwarded,
                        attemptedAt: attempt.attemptedAt
                    });
                });
            });

            return {
                id: student._id,
                name: student.name,
                email: student.email,
                totalPoints: student.points,
                totalTasks: tasks.length, // Tasks they have interacted with
                completedTasks: completedTasksCount,
                totalQuizzes: quizAttempts.length,
                taskSubmissions,
                quizAttempts
            };
        }));

        res.json({
            success: true,
            data: performanceData
        });

    } catch (error) {
        console.error('Get student performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
