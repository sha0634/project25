const Internship = require('../models/Internship');

// @desc    Get all active internships
// @route   GET /api/internships
// @access  Public
exports.getAllInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ status: 'Active' })
            .sort({ createdAt: -1 })
            .select('-applicants');

        res.status(200).json({
            success: true,
            count: internships.length,
            internships
        });

    } catch (error) {
        console.error('Get internships error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internships',
            error: error.message
        });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
exports.getInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        res.status(200).json({
            success: true,
            internship
        });

    } catch (error) {
        console.error('Get internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internship',
            error: error.message
        });
    }
};

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private (Company only)
exports.createInternship = async (req, res) => {
    try {
        const { title, company, location, type, duration, stipend, description, requirements, skills, applicationDeadline } = req.body;

        // Verify user is a company
        if (req.user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Only companies can post internships'
            });
        }

        const internship = await Internship.create({
            title,
            company,
            companyId: req.user.id,
            location,
            type,
            duration,
            stipend,
            description,
            requirements,
            skills,
            applicationDeadline
        });

        res.status(201).json({
            success: true,
            message: 'Internship created successfully',
            internship
        });

    } catch (error) {
        console.error('Create internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating internship',
            error: error.message
        });
    }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Company owner only)
exports.updateInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Check if user owns this internship
        if (internship.companyId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this internship'
            });
        }

        const updatedInternship = await Internship.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Internship updated successfully',
            internship: updatedInternship
        });

    } catch (error) {
        console.error('Update internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating internship',
            error: error.message
        });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Company owner only)
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Check if user owns this internship
        if (internship.companyId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this internship'
            });
        }

        await Internship.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Internship deleted successfully'
        });

    } catch (error) {
        console.error('Delete internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting internship',
            error: error.message
        });
    }
};

// @desc    Apply to internship
// @route   POST /api/internships/:id/apply
// @access  Private (Student only)
exports.applyToInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Verify user is a student
        if (req.user.userType !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only students can apply to internships'
            });
        }

        // Check if already applied
        const alreadyApplied = internship.applicants.some(
            applicant => applicant.studentId.toString() === req.user.id
        );

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this internship'
            });
        }

        // Add applicant
        internship.applicants.push({
            studentId: req.user.id,
            status: 'Applied'
        });

        await internship.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Apply to internship error:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying to internship',
            error: error.message
        });
    }
};

// @desc    Get company's posted internships
// @route   GET /api/internships/company/my-internships
// @access  Private (Company only)
exports.getCompanyInternships = async (req, res) => {
    try {
        if (req.user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Only companies can access this route'
            });
        }

        const internships = await Internship.find({ companyId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('applicants.studentId', 'username email profile');

        res.status(200).json({
            success: true,
            count: internships.length,
            internships
        });

    } catch (error) {
        console.error('Get company internships error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internships',
            error: error.message
        });
    }
};

// @desc    Get student's applications
// @route   GET /api/internships/student/my-applications
// @access  Private (Student only)
exports.getStudentApplications = async (req, res) => {
    try {
        if (req.user.userType !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only students can access this route'
            });
        }

        // Find all internships where the student has applied
        const internships = await Internship.find({
            'applicants.studentId': req.user.id
        }).sort({ 'applicants.appliedAt': -1 });

        // Extract application details
        const applications = internships.map(internship => {
            const application = internship.applicants.find(
                app => app.studentId.toString() === req.user.id
            );

            return {
                id: internship._id,
                company: internship.company,
                position: internship.title,
                location: internship.location,
                type: internship.type,
                stipend: internship.stipend,
                status: application.status,
                appliedAt: application.appliedAt,
                internshipStatus: internship.status
            };
        });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('Get student applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};
