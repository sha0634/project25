const express = require('express');
const router = express.Router();
const {
    getAllInternships,
    getInternship,
    createInternship,
    updateInternship,
    deleteInternship,
    applyToInternship,
    getCompanyInternships,
    getStudentApplications
} = require('../controllers/internshipController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllInternships);
router.get('/:id', getInternship);

// Protected routes
router.post('/', protect, createInternship);
router.put('/:id', protect, updateInternship);
router.delete('/:id', protect, deleteInternship);
router.post('/:id/apply', protect, applyToInternship);

// Company specific routes
router.get('/company/my-internships', protect, getCompanyInternships);

// Student specific routes
router.get('/student/my-applications', protect, getStudentApplications);

module.exports = router;
