const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const PDFDocument = require('pdfkit');
const { parseCV } = require('../utils/cvParser');
const fetch = global.fetch || require('node-fetch');

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

                // Skip education updates - user wants to manage qualifications manually

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

        // Delete old profile picture if exists
        if (user.profile.profilePicture) {
            try {
                const oldFilePath = path.join(__dirname, '..', user.profile.profilePicture);
                await fs.unlink(oldFilePath);
                console.log('Deleted old profile picture:', oldFilePath);
            } catch (err) {
                console.log('Could not delete old profile picture (may not exist):', err.message);
            }
        }

        // Store relative path to profile picture
        const picturePath = `/uploads/profile-pictures/${req.file.filename}`;
        user.profile.profilePicture = picturePath;

        await user.save();

        console.log('Profile picture saved to DB:', picturePath);
        console.log('File saved to disk:', req.file.path);
        console.log('Full URL will be: http://localhost:5000' + picturePath);

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

// @desc    Get another student's limited profile (for companies viewing applicants)
// @route   GET /api/profile/student/:id
// @access  Private (company or student)
exports.getStudentProfileById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email userType profile');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only allow companies or the student themselves to read this
        if (req.user.userType !== 'company' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get student profile by id error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
};

// @desc    Get student's resume as PDF (serve file or generate from parsed text)
// @route   GET /api/profile/student/:id/resume
// @access  Private (company or the student)
exports.getStudentResumePdf = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('profile email username userType');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.user.userType !== 'company' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const resumePath = user.profile?.resume || user.profile?.resumePath || null;
        const resumeText = user.profile?.resumeText || null;

        // If resume file exists on disk, force a download of the original file
        if (resumePath) {
            const localPath = path.join(__dirname, '..', resumePath.replace(/^\/+/, ''));
            if (fsSync.existsSync(localPath)) {
                // Use res.download to set appropriate headers so browsers download the file
                const filename = path.basename(localPath);
                return res.download(localPath, filename, (err) => {
                    if (err) {
                        console.error('Error sending resume file:', err);
                        // If download fails, fall back to sending the file stream
                        try {
                            return res.sendFile(localPath);
                        } catch (sendErr) {
                            console.error('Fallback sendFile error:', sendErr);
                            return res.status(500).json({ success: false, message: 'Error serving resume file' });
                        }
                    }
                });
            }
        }

        // If parsed resume text exists, generate a PDF on the fly
        if (resumeText) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="resume-${user._id}.pdf"`);

            const doc = new PDFDocument({ autoFirstPage: true });
            doc.pipe(res);

            // Simple layout: header and text body
            doc.fontSize(14).text(user.profile?.fullName || user.username || 'Candidate', { underline: true });
            doc.moveDown();
            doc.fontSize(10).text(resumeText, { align: 'left' });

            doc.end();
            return;
        }

        return res.status(404).json({ success: false, message: 'No resume available for this user' });

    } catch (error) {
        console.error('Get student resume PDF error:', error);
        res.status(500).json({ success: false, message: 'Error fetching resume', error: error.message });
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

                const {
                    fullName,
                    phone,
                    location,
                    bio,
                    profilePicture,
                    education,
                    skills,
                    resume,
                    qualifications,
                    timezone,
                    emailVerified,
                    phoneVerified,

                    // Role & Goal
                    currentStatus,
                    targetRole,
                    primaryGoal,

                    // Availability
                    availableStartDate,
                    weeklyAvailabilityHours,
                    commitmentDurationWeeks,
                    canWorkDuringExams,

                    // Education (form fields)
                    highestEducationLevel,
                    degreeProgram,
                    institutionName,
                    educationStartYear,
                    educationEndYear,
                    educationCGPA,

                    // Skills (topSkills)
                    topSkills,

                    // Experience
                    priorInternship,
                    priorWorkExperience,

                    // Links
                    links,

                    // Resume metadata
                    resumePath,
                    resumeLastUpdated,

                    // Preferences
                    internshipTypePreference,
                    workModePreference,
                    preferredDomains,
                    preferredCompanySize,

                    // Declarations
                    declarations
                } = req.body;

        console.log('========== UPDATE PROFILE REQUEST ==========');
        console.log('User ID:', req.user.id);
        console.log('Data received:', { fullName, phone, location, bio, skills: skills?.length, qualifications });
        console.log('============================================');

        // Update profile fields
        if (fullName !== undefined) user.profile.fullName = fullName;
        if (phone !== undefined) user.profile.phone = phone;
        if (location !== undefined) user.profile.location = location;
        if (bio !== undefined) user.profile.bio = bio;
        if (profilePicture !== undefined) user.profile.profilePicture = profilePicture;
        if (education !== undefined) user.profile.education = education;
        if (skills !== undefined) user.profile.skills = skills;
        if (resume !== undefined) user.profile.resume = resume;
        if (qualifications !== undefined) user.profile.qualifications = qualifications;

        // Role & Goal
        if (currentStatus !== undefined) user.profile.currentStatus = currentStatus;
        if (targetRole !== undefined) user.profile.targetRole = targetRole;
        if (primaryGoal !== undefined) user.profile.primaryGoal = primaryGoal;

        // Availability (store as flat fields on profile)
        if (availableStartDate !== undefined) user.profile.availableStartDate = availableStartDate;
        if (weeklyAvailabilityHours !== undefined) user.profile.weeklyAvailabilityHours = weeklyAvailabilityHours;
        if (commitmentDurationWeeks !== undefined) user.profile.commitmentDurationWeeks = commitmentDurationWeeks;
        if (canWorkDuringExams !== undefined) user.profile.canWorkDuringExams = canWorkDuringExams;

        // Timezone & verifications
        if (timezone !== undefined) user.profile.timezone = timezone;
        if (emailVerified !== undefined) user.profile.emailVerified = !!emailVerified;
        if (phoneVerified !== undefined) user.profile.phoneVerified = !!phoneVerified;

        // Education form fields (structured)
        if (highestEducationLevel !== undefined || degreeProgram !== undefined || institutionName !== undefined || educationStartYear !== undefined || educationEndYear !== undefined || educationCGPA !== undefined) {
            // keep backward-compatible education array, push or replace first item
            const eduObj = {
                degree: degreeProgram || highestEducationLevel || '',
                institution: institutionName || '',
                duration: {
                    start: educationStartYear ? new Date(educationStartYear.toString()) : undefined,
                    end: educationEndYear ? new Date(educationEndYear.toString()) : undefined
                },
                cgpa: educationCGPA || '',
                verificationStatus: user.profile.education && user.profile.education[0] ? user.profile.education[0].verificationStatus : 'Not Verified'
            };
            user.profile.education = [eduObj];
        }

        // Skills (topSkills) - accept array of strings or objects, normalize to objects and limit to 5
        if (topSkills !== undefined) {
            let normalized = [];
            if (Array.isArray(topSkills)) {
                if (topSkills.length > 0 && typeof topSkills[0] === 'string') {
                    normalized = topSkills.map(s => ({ skillName: s, selfRatedLevel: undefined, howLearned: '' }));
                } else {
                    // assume already object-shaped
                    normalized = topSkills.map(s => ({
                        skillName: s.skillName || s.name || '',
                        selfRatedLevel: s.selfRatedLevel || s.level || undefined,
                        howLearned: s.howLearned || s.source || ''
                    }));
                }
            } else if (typeof topSkills === 'string') {
                normalized = topSkills.split(',').map(s => ({ skillName: s.trim(), selfRatedLevel: undefined, howLearned: '' }));
            }
            user.profile.topSkills = normalized.slice(0,5);
        }

        // Experience
        if (priorInternship !== undefined) user.profile.priorInternship = priorInternship;
        if (priorWorkExperience !== undefined) user.profile.priorWorkExperience = priorWorkExperience;

        // Links (structured)
        if (links !== undefined) {
            user.profile.links = user.profile.links || {};
            if (links.github !== undefined) user.profile.links.github = links.github;
            if (links.portfolio !== undefined) user.profile.links.portfolio = links.portfolio;
            // accept either linkedIn or linkedin
            if (links.linkedIn !== undefined) user.profile.links.linkedIn = links.linkedIn;
            if (links.linkedin !== undefined) user.profile.links.linkedIn = links.linkedin;
        }

        // Resume metadata
        if (resumePath !== undefined) user.profile.resumePath = resumePath;
        if (resumeLastUpdated !== undefined) user.profile.resumeLastUpdated = resumeLastUpdated;

        // Preferences
        if (internshipTypePreference !== undefined && internshipTypePreference !== '') user.profile.internshipTypePreference = internshipTypePreference;
        if (workModePreference !== undefined && workModePreference !== '') user.profile.workModePreference = workModePreference;
        if (preferredDomains !== undefined) user.profile.preferredDomains = preferredDomains;
        if (preferredCompanySize !== undefined) user.profile.preferredCompanySize = preferredCompanySize;

        // Declarations
        if (declarations !== undefined) user.profile.declarations = declarations;

        await user.save();

        console.log('========== PROFILE UPDATED ==========');
        console.log('Full Name:', user.profile.fullName);
        console.log('Phone:', user.profile.phone);
        console.log('Bio:', user.profile.bio);
        console.log('Skills:', user.profile.skills);
        console.log('Qualifications:', user.profile.qualifications);
        console.log('=====================================');

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

// @desc    Compare job description with student's resume using Gemini AI
// @route   POST /api/profile/student/compare-jd
// @access  Private
exports.compareJDWithResume = async (req, res) => {
    try {
        const { jdText } = req.body;

        if (!jdText || typeof jdText !== 'string' || jdText.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Job description text (jdText) is required in request body' });
        }

        const user = await User.findById(req.user.id).select('profile');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const resumeText = user.profile && user.profile.resumeText ? user.profile.resumeText : '';
        if (!resumeText) {
            return res.status(400).json({ success: false, message: 'No parsed resume text available for this user. Please upload a PDF resume first.' });
        }

        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!geminiKey) {
            return res.status(500).json({ success: false, message: 'Gemini API key not configured on server (set GEMINI_API_KEY)' });
        }

        const model = process.env.GEMINI_MODEL || 'text-bison-001';
        const prompt = `You are an expert career coach. Compare the candidate's resume against the job description and produce:
1) A concise comparison paragraph (2-4 sentences) summarizing fit.
2) Two short lists prefixed with headings "What's good:" and "What to improve:" with 3-6 brief bullet points each.

Resume:\n${resumeText}\n\nJob Description:\n${jdText}\n\nRespond in plain text.`;

        // Try multiple strategies for calling a text-generation model:
        // 1) Use @google/genai client if available
        // 2) Try REST v1beta2 :generate (new endpoint)
        // 3) Try REST v1beta2 :generateText (older compatibility endpoint used in newsletter)
        // 4) Fallback to OpenAI ChatCompletion if OPENAI_API_KEY present

        let resultText = '';

        // Helper to parse JSON response shapes
        const parseGenResponse = (json) => {
            if (!json) return '';
            if (json.candidates && Array.isArray(json.candidates) && json.candidates[0]) {
                // some responses put text in candidates[0].content
                const cand = json.candidates[0];
                if (typeof cand === 'string') return cand;
                if (cand.content) return cand.content;
                if (cand.text) return cand.text;
            }
            if (json.output && Array.isArray(json.output) && json.output.length > 0) {
                try {
                    return json.output.map(o => (o.content || []).map(c => c.text || c).join('\n')).join('\n');
                } catch (e) { /* ignore */ }
            }
            if (typeof json.result === 'string') return json.result;
            if (typeof json.text === 'string') return json.text;
            return '';
        };

        // 1) try @google/genai client (same as newsletter controller)
        try {
            let GoogleGenAI;
            try { GoogleGenAI = require('@google/genai').GoogleGenAI; } catch (e) { GoogleGenAI = null; }

            const requestPrompt = `${prompt}`;

            if (GoogleGenAI) {
                const ai = new GoogleGenAI({ apiKey: geminiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: requestPrompt,
                    config: { temperature: 0.2 }
                });
                resultText = response?.text || '';
            }
        } catch (e) {
            console.warn('genai client check failed', e && e.message ? e.message : e);
        }

        // 2) Try modern REST generate endpoint
        if (!resultText) {
            try {
                const urlBase = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate`;
                let url = urlBase;
                const headers = { 'Content-Type': 'application/json' };
                if (typeof geminiKey === 'string' && geminiKey.startsWith('ya29.')) {
                    headers['Authorization'] = `Bearer ${geminiKey}`;
                } else {
                    const sep = urlBase.includes('?') ? '&' : '?';
                    url = `${urlBase}${sep}key=${encodeURIComponent(geminiKey)}`;
                }
                const body = { prompt: { text: prompt }, temperature: 0.2, max_output_tokens: 512 };
                const aiResp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
                if (aiResp.ok) {
                    const aiJson = await aiResp.json();
                    resultText = parseGenResponse(aiJson) || '';
                } else {
                    const errText = await aiResp.text();
                    console.warn('generate endpoint failed', aiResp.status, errText);
                }
            } catch (err) {
                console.warn('generate endpoint error', err && err.message ? err.message : err);
            }
        }

        // 3) Try older generateText endpoint (newsletterController uses this)
        if (!resultText) {
            try {
                const urlBase2 = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText`;
                let url2 = urlBase2;
                if (!(typeof geminiKey === 'string' && geminiKey.startsWith('ya29.'))) {
                    const sep2 = urlBase2.includes('?') ? '&' : '?';
                    url2 = `${urlBase2}${sep2}key=${encodeURIComponent(geminiKey)}`;
                }
                const fetchBody = { prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 512 };
                const resp = await fetch(url2, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fetchBody) });
                if (resp.ok) {
                    const json = await resp.json();
                    resultText = parseGenResponse(json) || '';
                } else {
                    const errText = await resp.text();
                    console.warn(':generateText failed', resp.status, errText);
                }
            } catch (e) {
                console.warn('generateText error', e && e.message ? e.message : e);
            }
        }

        // 4) Fallback to OpenAI if available
        if (!resultText && process.env.OPENAI_API_KEY) {
            try {
                const openaiKey = process.env.OPENAI_API_KEY;
                const oresp = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
                    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: 'You are an expert career coach.' }, { role: 'user', content: prompt }], max_tokens: 512, temperature: 0.2 })
                });
                if (oresp.ok) {
                    const oj = await oresp.json();
                    resultText = oj.choices && oj.choices[0] && oj.choices[0].message && oj.choices[0].message.content ? oj.choices[0].message.content : '';
                } else {
                    const et = await oresp.text();
                    console.warn('OpenAI fallback failed', oresp.status, et);
                }
            } catch (e) {
                console.warn('OpenAI call error', e && e.message ? e.message : e);
            }
        }

        if (!resultText) {
            return res.status(502).json({ success: false, message: 'No text-generation model available for this API key and no fallback succeeded' });
        }

        return res.status(200).json({ success: true, analysis: resultText });

    } catch (error) {
        console.error('compareJDWithResume error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
