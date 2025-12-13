const User = require('../models/User');
const path = require('path');
const { parseCV } = require('../utils/cvParser');

// @desc    Upload resume
// @route   POST /api/profile/student/upload-resume
// @access  Private
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Store relative path to resume
        const resumePath = `/uploads/resumes/${req.file.filename}`;
        user.profile.resume = resumePath;

        // Parse CV to extract information (only for PDFs)
        let extractedData = null;
        if (req.file.mimetype === 'application/pdf') {
            try {
                const absolutePath = path.join(__dirname, '..', 'uploads', 'resumes', req.file.filename);
                console.log('Parsing CV from:', absolutePath);
                
                extractedData = await parseCV(absolutePath);

                console.log('========== CV SCAN RESULTS ==========');
                console.log('Raw Text Length:', extractedData.rawText?.length);
                console.log('Raw Text Preview:', extractedData.rawText?.substring(0, 500));
                console.log('Skills Found:', extractedData.skills);
                console.log('Education Found:', extractedData.education);
                console.log('Bio Found:', extractedData.bio);
                console.log('====================================');

                // Store the raw text from CV
                if (extractedData.rawText) {
                    user.profile.resumeText = extractedData.rawText;
                    console.log('Resume text saved to user profile, length:', user.profile.resumeText.length);
                } else {
                    console.log('WARNING: No raw text extracted from CV!');
                }

                // Update profile with extracted data
                // Only add new skills, don't overwrite existing ones
                if (extractedData.skills && extractedData.skills.length > 0) {
                    const existingSkills = user.profile.skills || [];
                    const newSkills = extractedData.skills.filter(
                        skill => !existingSkills.some(
                            existing => existing.toLowerCase() === skill.toLowerCase()
                        )
                    );
                    user.profile.skills = [...existingSkills, ...newSkills];
                    console.log('Skills updated:', user.profile.skills);
                }

                // Add new education entries
                if (extractedData.education && extractedData.education.length > 0) {
                    const existingEducation = user.profile.education || [];
                    user.profile.education = [...existingEducation, ...extractedData.education];
                    console.log('Education updated:', user.profile.education);
                }

                // Update bio if empty
                if (extractedData.bio && !user.profile.bio) {
                    user.profile.bio = extractedData.bio;
                    console.log('Bio updated:', user.profile.bio);
                }
            } catch (parseError) {
                console.error('CV parsing error:', parseError);
                console.error('Parse error stack:', parseError.stack);
                // Continue without failing - parsing is optional
            }
        } else {
            console.log('Skipping CV parsing - file type is:', req.file.mimetype);
        }

        await user.save();

        console.log('========== SAVED TO DATABASE ==========');
        console.log('User ID:', user._id);
        console.log('Resume Path:', user.profile.resume);
        console.log('Resume Text Length:', user.profile.resumeText?.length);
        console.log('Resume Text Preview (first 500 chars):', user.profile.resumeText?.substring(0, 500));
        console.log('Resume Text Full Content:', user.profile.resumeText);
        console.log('Skills Count:', user.profile.skills?.length);
        console.log('Skills:', user.profile.skills);
        console.log('Education Count:', user.profile.education?.length);
        console.log('Education:', user.profile.education);
        console.log('Bio:', user.profile.bio);
        console.log('Full Name:', user.profile.fullName);
        console.log('=======================================');

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            resumePath: resumePath,
            fileName: req.file.originalname,
            extractedData: extractedData // Send extracted data to frontend
        });

    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resume',
            error: error.message
        });
    }
};

// @desc    Delete resume
// @route   DELETE /api/profile/student/delete-resume
// @access  Private
exports.deleteResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resumePath = user.profile.resume;

        // Delete file from filesystem if it exists
        if (resumePath) {
            const fs = require('fs');
            const fullPath = path.join(__dirname, '..', resumePath.replace(/^\//, ''));
            
            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (fileError) {
                console.error('Error deleting resume file:', fileError);
                // Continue even if file deletion fails
            }
        }

        // Remove resume path from database
        user.profile.resume = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resume',
            error: error.message
        });
    }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Store relative path to profile picture
        const picturePath = `/uploads/profile-pictures/${req.file.filename}`;
        user.profile.profilePicture = picturePath;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePicture: picturePath
        });

    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture',
            error: error.message
        });
    }
};

// @desc    Get student profile
// @route   GET /api/profile/student
// @access  Private
exports.getStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.userType !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This route is for students only.'
            });
        }

        res.status(200).json({
            success: true,
            profile: user.profile,
            user: {
                username: user.username,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Update student profile
// @route   PUT /api/profile/student
// @access  Private
exports.updateStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.userType !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This route is for students only.'
            });
        }

        const { fullName, phone, location, bio, profilePicture, education, skills, resume } = req.body;

        // Update profile fields
        if (fullName !== undefined) user.profile.fullName = fullName;
        if (phone !== undefined) user.profile.phone = phone;
        if (location !== undefined) user.profile.location = location;
        if (bio !== undefined) user.profile.bio = bio;
        if (profilePicture !== undefined) user.profile.profilePicture = profilePicture;
        if (education !== undefined) user.profile.education = education;
        if (skills !== undefined) user.profile.skills = skills;
        if (resume !== undefined) user.profile.resume = resume;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: user.profile
        });

    } catch (error) {
        console.error('Update student profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// @desc    Get company profile
// @route   GET /api/profile/company
// @access  Private
exports.getCompanyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This route is for companies only.'
            });
        }

        res.status(200).json({
            success: true,
            profile: user.profile,
            user: {
                username: user.username,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Get company profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// @desc    Update company profile
// @route   PUT /api/profile/company
// @access  Private
exports.updateCompanyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.userType !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This route is for companies only.'
            });
        }

        const { fullName, phone, location, bio, profilePicture, companyName, industry, companySize, website, description } = req.body;

        // Update profile fields
        if (fullName !== undefined) user.profile.fullName = fullName;
        if (phone !== undefined) user.profile.phone = phone;
        if (location !== undefined) user.profile.location = location;
        if (bio !== undefined) user.profile.bio = bio;
        if (profilePicture !== undefined) user.profile.profilePicture = profilePicture;
        if (companyName !== undefined) user.profile.companyName = companyName;
        if (industry !== undefined) user.profile.industry = industry;
        if (companySize !== undefined) user.profile.companySize = companySize;
        if (website !== undefined) user.profile.website = website;
        if (description !== undefined) user.profile.description = description;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: user.profile
        });

    } catch (error) {
        console.error('Update company profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};
