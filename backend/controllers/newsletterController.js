const Newsletter = require('../models/Newsletter');

// @desc    Get all published newsletters
// @route   GET /api/newsletters
// @access  Public
exports.getAllNewsletters = async (req, res) => {
    try {
        const newsletters = await Newsletter.find({ status: 'Published' })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: newsletters.length,
            newsletters
        });

    } catch (error) {
        console.error('Get newsletters error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching newsletters',
            error: error.message
        });
    }
};

// @desc    Get single newsletter
// @route   GET /api/newsletters/:id
// @access  Public
exports.getNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        res.status(200).json({
            success: true,
            newsletter
        });

    } catch (error) {
        console.error('Get newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching newsletter',
            error: error.message
        });
    }
};

// @desc    Create new newsletter
// @route   POST /api/newsletters
// @access  Private (Company only)
exports.createNewsletter = async (req, res) => {
    try {
        const { title, company, summary, content, status } = req.body;

        // Verify user is a company
        if (req.user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Only companies can create newsletters'
            });
        }

        const newsletter = await Newsletter.create({
            title,
            company,
            companyId: req.user.id,
            summary,
            content,
            status: status || 'Published'
        });

        res.status(201).json({
            success: true,
            message: 'Newsletter created successfully',
            newsletter
        });

    } catch (error) {
        console.error('Create newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating newsletter',
            error: error.message
        });
    }
};

// @desc    Update newsletter
// @route   PUT /api/newsletters/:id
// @access  Private (Company owner only)
exports.updateNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Check if user owns this newsletter
        if (newsletter.companyId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this newsletter'
            });
        }

        const updatedNewsletter = await Newsletter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Newsletter updated successfully',
            newsletter: updatedNewsletter
        });

    } catch (error) {
        console.error('Update newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating newsletter',
            error: error.message
        });
    }
};

// @desc    Delete newsletter
// @route   DELETE /api/newsletters/:id
// @access  Private (Company owner only)
exports.deleteNewsletter = async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);

        if (!newsletter) {
            return res.status(404).json({
                success: false,
                message: 'Newsletter not found'
            });
        }

        // Check if user owns this newsletter
        if (newsletter.companyId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this newsletter'
            });
        }

        await Newsletter.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Newsletter deleted successfully'
        });

    } catch (error) {
        console.error('Delete newsletter error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting newsletter',
            error: error.message
        });
    }
};

// @desc    Get company's newsletters
// @route   GET /api/newsletters/company/my-newsletters
// @access  Private (Company only)
exports.getCompanyNewsletters = async (req, res) => {
    try {
        if (req.user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Only companies can access this route'
            });
        }

        const newsletters = await Newsletter.find({ companyId: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: newsletters.length,
            newsletters
        });

    } catch (error) {
        console.error('Get company newsletters error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching newsletters',
            error: error.message
        });
    }
};
