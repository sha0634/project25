const express = require('express');
const router = express.Router();
const {
    getAllNewsletters,
    getNewsletter,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    getCompanyNewsletters,
    generateNewsletterFromPrompt
} = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllNewsletters);
router.get('/:id', getNewsletter);

// Protected routes
router.post('/', protect, createNewsletter);
router.post('/generate', protect, generateNewsletterFromPrompt);
router.put('/:id', protect, updateNewsletter);
router.delete('/:id', protect, deleteNewsletter);

// Company specific routes
router.get('/company/my-newsletters', protect, getCompanyNewsletters);

module.exports = router;
