const express = require('express');
const router = express.Router();
const {
    getAllInternships,
    getInternship,
    createInternship,
    updateInternship,
    deleteInternship,
    applyToInternship,
    updateApplicantStatus,
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

// Update applicant status (company only)
router.put('/:id/applicants/:applicantId/status', protect, updateApplicantStatus);

// Company specific routes
router.get('/company/my-internships', protect, getCompanyInternships);

// Student specific routes
router.get('/student/my-applications', protect, getStudentApplications);
router.get('/student/microtasks', protect, require('../controllers/internshipController').getStudentMicrotasks);

module.exports = router;
