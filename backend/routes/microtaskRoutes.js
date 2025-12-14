const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { createMicrotask, submitMicrotask, gradeMicrotask, generateQuiz, generateQuizPublic } = require('../controllers/internshipController');

// POST /api/internships/:id/microtasks
router.post('/', protect, createMicrotask);

// POST /api/internships/:id/microtasks/generate (company only)
router.post('/generate', protect, generateQuiz);

// POST /api/internships/:id/microtasks/generate-public (no auth) - useful for testing/demo
router.post('/generate-public', generateQuizPublic);

// POST /api/internships/:id/microtasks/:taskId/submit
router.post('/:taskId/submit', protect, submitMicrotask);

// PUT /api/internships/:id/microtasks/:taskId/grade
router.put('/:taskId/grade', protect, gradeMicrotask);

module.exports = router;
