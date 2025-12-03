const express = require('express');
const { body, validationResult } = require('express-validator');
const Module = require('../models/Module');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all modules
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const modules = await Module.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: modules.length,
            data: modules
        });
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/modules
// @desc    Create new module
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('videoUrl').trim().notEmpty().withMessage('Video URL is required').isURL().withMessage('Please provide a valid URL'),
    body('category').optional().isIn(['recycling', 'energy', 'water', 'biodiversity', 'climate', 'waste', 'transport', 'other'])
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

        const { title, description, videoUrl, category } = req.body;

        const module = await Module.create({
            title,
            description,
            videoUrl,
            category,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: module
        });
    } catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/modules/:id
// @desc    Delete module
// @access  Private (Teacher, Admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        await Module.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Delete module error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
