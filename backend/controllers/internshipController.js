const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const User = require('../models/User');

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

        // After creating internship, notify all students (DB + real-time emit)
        try {
            const students = await User.find({ userType: 'student' }).select('_id');
            const notifications = students.map(s => ({
                recipientId: s._id,
                type: 'new_internship',
                title: 'New Internship Posted',
                message: `${company} posted a new internship: ${title}`,
                relatedInternship: internship._id
            }));

            const created = await Notification.insertMany(notifications);

            // Emit real-time notification to connected students
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');

            let emitCount = 0;
            for (const note of created) {
                const socketId = connectedUsers.get(note.recipientId.toString());
                if (socketId && io) {
                    io.to(socketId).emit('newNotification', {
                        id: note._id,
                        type: note.type,
                        title: note.title,
                        message: note.message,
                        relatedInternship: note.relatedInternship,
                        createdAt: note.createdAt,
                        read: false
                    });
                    emitCount++;
                }
            }

            console.log(`📣 Created ${created.length} internship notifications, emitted to ${emitCount} connected students.`);
        } catch (notifyErr) {
            console.error('Error creating/emitting new-internship notifications:', notifyErr);
            // proceed without failing the create request
        }

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

// @desc    Create microtask for an internship (company owner)
// @route   POST /api/internships/:id/microtasks
// @access  Private (Company owner only)
exports.createMicrotask = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
        if (internship.companyId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { title, type, instructions, assignedTo, dueDate, quizQuestions } = req.body;

        const microtask = {
            title,
            type: type || 'task',
            instructions: instructions || '',
            // attach quizQuestions when quiz
            quizQuestions: type === 'quiz' && Array.isArray(quizQuestions) ? quizQuestions : undefined,
            assignedTo: assignedTo || null,
            assignedAt: assignedTo ? new Date() : undefined,
            dueDate: dueDate || undefined,
            status: assignedTo ? 'Assigned' : 'Assigned'
        };

        internship.microtasks.push(microtask);
        await internship.save();

        const added = internship.microtasks[internship.microtasks.length - 1];

        // If assigned to a student, create notification and emit
        if (assignedTo) {
            const NotificationModel = require('../models/Notification');
            const note = await NotificationModel.create({
                recipientId: assignedTo,
                type: 'message',
                title: 'New Microtask Assigned',
                message: `You have been assigned a microtask: ${title} for ${internship.title}`,
                relatedInternship: internship._id
            });

            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            const socketId = connectedUsers.get(assignedTo.toString());
            if (socketId && io) {
                io.to(socketId).emit('newNotification', {
                    id: note._id,
                    type: note.type,
                    title: note.title,
                    message: note.message,
                    relatedInternship: note.relatedInternship,
                    createdAt: note.createdAt,
                    read: false
                });
            }
        }

        res.status(201).json({ success: true, microtask: added });
    } catch (error) {
        console.error('Create microtask error:', error);
        res.status(500).json({ success: false, message: 'Error creating microtask', error: error.message });
    }
};

// @desc    Student submit microtask
// @route   POST /api/internships/:id/microtasks/:taskId/submit
// @access  Private (Student)
exports.submitMicrotask = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        const task = internship.microtasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Microtask not found' });

        // ensure the submitting user is the assigned student
        if (!task.assignedTo || task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to submit this microtask' });
        }

        const { submissionType, content } = req.body;

        // If quiz, expect content.answers = [selectedIndex,...]
        if (task.type === 'quiz') {
            const answers = content && content.answers ? content.answers : [];
            // grade
            const questions = task.quizQuestions || [];
            let correct = 0;
            questions.forEach((q, idx) => {
                const picked = typeof answers[idx] !== 'undefined' ? answers[idx] : null;
                if (picked !== null && picked == q.correctIndex) correct++;
            });
            const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

            task.submission = {
                submittedAt: new Date(),
                submissionType: 'answers',
                content: { answers }
            };
            task.score = score;
            task.status = 'Graded';

            await internship.save();

            // notify company about graded submission (auto-graded)
            const NotificationModel = require('../models/Notification');
            const note = await NotificationModel.create({
                recipientId: internship.companyId,
                type: 'application',
                title: 'Microtask Quiz Submitted',
                message: `${req.user.username || 'A student'} submitted quiz '${task.title}' — Score: ${score}`,
                relatedInternship: internship._id,
                relatedStudent: req.user.id
            });

            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            const companySocketId = connectedUsers.get(internship.companyId.toString());
            if (companySocketId && io) {
                io.to(companySocketId).emit('newNotification', {
                    id: note._id,
                    type: note.type,
                    title: note.title,
                    message: note.message,
                    relatedInternship: note.relatedInternship,
                    relatedStudent: note.relatedStudent,
                    createdAt: note.createdAt,
                    read: false
                });
            }

            // also notify the student about grade
            const studentNote = await NotificationModel.create({
                recipientId: req.user.id,
                type: 'status_update',
                title: 'Quiz Graded',
                message: `Your quiz '${task.title}' was graded. Score: ${score}`,
                relatedInternship: internship._id
            });
            const studentSocketId = connectedUsers.get(req.user.id.toString());
            if (studentSocketId && io) {
                io.to(studentSocketId).emit('newNotification', {
                    id: studentNote._id,
                    type: studentNote.type,
                    title: studentNote.title,
                    message: studentNote.message,
                    relatedInternship: studentNote.relatedInternship,
                    createdAt: studentNote.createdAt,
                    read: false
                });
            }

            return res.status(200).json({ success: true, message: 'Quiz submitted and graded', microtask: task });
        }

        // generic submission flow
        task.submission = {
            submittedAt: new Date(),
            submissionType: submissionType || 'link',
            content: content || null
        };
        task.status = 'Submitted';

        await internship.save();

        // notify company about submission
        const NotificationModel = require('../models/Notification');
        const note = await NotificationModel.create({
            recipientId: internship.companyId,
            type: 'application',
            title: 'Microtask Submitted',
            message: `${req.user.username || 'A student'} submitted microtask: ${task.title}`,
            relatedInternship: internship._id,
            relatedStudent: req.user.id
        });

        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const companySocketId = connectedUsers.get(internship.companyId.toString());
        if (companySocketId && io) {
            io.to(companySocketId).emit('newNotification', {
                id: note._id,
                type: note.type,
                title: note.title,
                message: note.message,
                relatedInternship: note.relatedInternship,
                relatedStudent: note.relatedStudent,
                createdAt: note.createdAt,
                read: false
            });
        }

        res.status(200).json({ success: true, message: 'Submission saved', microtask: task });
    } catch (error) {
        console.error('Submit microtask error:', error);
        res.status(500).json({ success: false, message: 'Error submitting microtask', error: error.message });
    }
};

// @desc    Company grade microtask
// @route   PUT /api/internships/:id/microtasks/:taskId/grade
// @access  Private (Company owner)
exports.gradeMicrotask = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
        if (internship.companyId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const task = internship.microtasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Microtask not found' });

        const { score, feedback } = req.body;
        task.score = score;
        task.feedback = feedback || '';
        task.status = 'Graded';

        await internship.save();

        // notify student about grade
        if (task.assignedTo) {
            const NotificationModel = require('../models/Notification');
            const note = await NotificationModel.create({
                recipientId: task.assignedTo,
                type: 'status_update',
                title: 'Microtask Graded',
                message: `Your microtask '${task.title}' has been graded. Score: ${score}`,
                relatedInternship: internship._id,
                relatedStudent: task.assignedTo
            });

            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            const socketId = connectedUsers.get(task.assignedTo.toString());
            if (socketId && io) {
                io.to(socketId).emit('newNotification', {
                    id: note._id,
                    type: note.type,
                    title: note.title,
                    message: note.message,
                    relatedInternship: note.relatedInternship,
                    createdAt: note.createdAt,
                    read: false
                });
            }
        }

        res.status(200).json({ success: true, message: 'Microtask graded', microtask: task });
    } catch (error) {
        console.error('Grade microtask error:', error);
        res.status(500).json({ success: false, message: 'Error grading microtask', error: error.message });
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

        // Get student details for notification
        const student = await User.findById(req.user.id).select('username profile.fullName email');

        // Create notification for company
        const notification = await Notification.create({
            recipientId: internship.companyId,
            type: 'application',
            title: 'New Application Received',
            message: `${student.profile.fullName || student.username} applied for ${internship.title}`,
            relatedInternship: internship._id,
            relatedStudent: req.user.id
        });

        console.log('📧 Notification created:', {
            recipientId: internship.companyId.toString(),
            notificationId: notification._id,
            message: notification.message
        });

        // Send real-time notification via Socket.io
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const companySocketId = connectedUsers.get(internship.companyId.toString());
        
        console.log('🔍 Looking for company socket:', {
            companyId: internship.companyId.toString(),
            socketId: companySocketId,
            connectedUsers: Array.from(connectedUsers.keys())
        });
        
        if (companySocketId) {
            io.to(companySocketId).emit('newNotification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                read: false
            });
            console.log('✅ Real-time notification sent to company:', internship.companyId);
        } else {
            console.log('⚠️ Company not connected, notification saved to DB only');
        }

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

// @desc    Get microtasks assigned to the student
// @route   GET /api/internships/student/microtasks
// @access  Private (Student)
exports.getStudentMicrotasks = async (req, res) => {
    try {
        if (req.user.userType !== 'student') {
            return res.status(403).json({ success: false, message: 'Only students can access this route' });
        }

        // Find internships that have microtasks assigned to this student
        const internships = await Internship.find({ 'microtasks.assignedTo': req.user.id });

        const tasks = [];
        internships.forEach(internship => {
            (internship.microtasks || []).forEach(task => {
                if (task.assignedTo && task.assignedTo.toString() === req.user.id) {
                    const taskData = {
                        internshipId: internship._id,
                        internshipTitle: internship.title,
                        taskId: task._id,
                        title: task.title,
                        type: task.type,
                        instructions: task.instructions,
                        dueDate: task.dueDate,
                        status: task.status,
                        submission: task.submission,
                        score: task.score,
                        feedback: task.feedback
                    };

                    // include quizQuestions for quiz tasks
                    if (task.type === 'quiz' && task.quizQuestions) {
                        taskData.quizQuestions = task.quizQuestions.map(q => ({ question: q.question, options: q.options }));
                    }

                    tasks.push(taskData);
                }
            });
        });

        res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error('Get student microtasks error:', error);
        res.status(500).json({ success: false, message: 'Error fetching microtasks', error: error.message });
    }
};

// @desc    Generate a simple quiz from a pasted job description (company)
// @route   POST /api/internships/:id/microtasks/generate
// @access  Private (Company owner only)
exports.generateQuiz = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
        if (internship.companyId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { apiKey, questionCount } = req.body;

        const jd = internship.description || '';
        const count = Math.min(Number(questionCount) || 4, 10);

        // If apiKey provided (or GEMINI_API_KEY env var), try to call Gemini via Google GenAI SDK
        const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
        if (effectiveKey) {
            try {
                let GoogleGenAI;
                try {
                    GoogleGenAI = require('@google/genai').GoogleGenAI;
                } catch (requireErr) {
                    console.warn('Google GenAI SDK not installed, falling back to REST fetch. Install @google/genai for best results.');
                }

                const prompt = `Generate ${count} multiple-choice questions (preferably 4 options each) from the following job description. Return ONLY a JSON array of objects with keys: question (string), options (array of strings), correctIndex (0-based integer). Job Description:\n\n${jd}`;

                let text = '';

                if (GoogleGenAI) {
                    const ai = new GoogleGenAI({ apiKey: effectiveKey });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: { temperature: 0.0, thinkingConfig: { thinkingBudget: 0 } }
                    });
                    text = response?.text || '';
                } else {
                    // Fallback to REST call if SDK not available
                    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${effectiveKey}`;
                    const fetchBody = { prompt: { text: prompt }, temperature: 0.0, maxOutputTokens: 1024 };
                    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fetchBody) });
                    const json = await resp.json();
                    if (json.candidates && json.candidates[0] && json.candidates[0].content) text = json.candidates[0].content;
                    else if (json.output && json.output[0] && json.output[0].content) text = json.output[0].content;
                    else if (typeof json.result === 'string') text = json.result;
                }

                // Try to extract JSON from text
                let parsed = null;
                try { parsed = JSON.parse(text); } catch (e) {
                    const start = text.indexOf('[');
                    const end = text.lastIndexOf(']');
                    if (start !== -1 && end !== -1) {
                        const sub = text.substring(start, end + 1);
                        try { parsed = JSON.parse(sub); } catch (e2) { parsed = null; }
                    }
                }

                if (Array.isArray(parsed) && parsed.length > 0) {
                    const questions = parsed.map(q => ({ question: q.question || q.q || '', options: Array.isArray(q.options) ? q.options : (q.opts || []).slice(0, 10), correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : (typeof q.answer === 'number' ? q.answer : 0) }));
                    return res.status(200).json({ success: true, questions });
                } else {
                    console.warn('AI returned unparseable content, falling back to heuristic');
                }
            } catch (aiErr) {
                console.error('AI quiz generation error:', aiErr);
                // fallthrough to heuristic
            }
        }

        // Fallback heuristic generator: split into sentences and create True/False style questions
        const sentences = jd.split(/(?<=[\.\?\!])\s+/).filter(s => s.trim().length > 20);
        const questions = [];
        for (let i = 0; i < count; i++) {
            const s = sentences[i] || sentences[i % sentences.length] || jd;
            const statement = s.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
            questions.push({ question: statement, options: ['True', 'False'], correctIndex: 0 });
        }

        res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ success: false, message: 'Error generating quiz', error: error.message });
    }
};

// @desc    Update an applicant's status (Shortlisted/Rejected/Accepted)
// @route   PUT /api/internships/:id/applicants/:applicantId/status
// @access  Private (Company only)
exports.updateApplicantStatus = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
        if (internship.companyId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

        const { status } = req.body;
        if (!['Shortlisted', 'Rejected', 'Accepted', 'Applied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const applicant = internship.applicants.id(req.params.applicantId);
        if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' });

        applicant.status = status;
        await internship.save();

        // Create a notification for the student
        const Notification = require('../models/Notification');
        const studentId = applicant.studentId;
        const message = status === 'Rejected'
            ? `Your application for ${internship.title} was rejected.`
            : `Your application for ${internship.title} was updated: ${status}.`;

        const notification = await Notification.create({
            recipientId: studentId,
            type: 'status_update',
            title: 'Application Update',
            message,
            relatedInternship: internship._id,
            relatedStudent: studentId
        });

        // Emit real-time notification if student is connected
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const studentSocketId = connectedUsers.get(studentId.toString());
        if (studentSocketId) {
            io.to(studentSocketId).emit('newNotification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                read: false
            });
        }

        res.status(200).json({ success: true, message: 'Applicant status updated', applicant });
    } catch (error) {
        console.error('Update applicant status error:', error);
        res.status(500).json({ success: false, message: 'Error updating applicant status', error: error.message });
    }
};

// Public version of generateQuiz (no auth/ownership check) - returns quiz based on internship JD
exports.generateQuizPublic = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

        const { questionCount } = req.body;

        const jd = internship.description || '';
        const count = Math.min(Number(questionCount) || 4, 10);

        const effectiveKey = process.env.GEMINI_API_KEY;
        if (effectiveKey) {
            try {
                let GoogleGenAI;
                try { GoogleGenAI = require('@google/genai').GoogleGenAI; } catch (e) { GoogleGenAI = null; }

                const prompt = `Generate ${count} multiple-choice questions (preferably 4 options each) from the following job description. Return ONLY a JSON array of objects with keys: question (string), options (array of strings), correctIndex (0-based integer). Job Description:\n\n${jd}`;
                let text = '';

                if (GoogleGenAI) {
                    const ai = new GoogleGenAI({ apiKey: effectiveKey });
                    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.0, thinkingConfig: { thinkingBudget: 0 } } });
                    text = response?.text || '';
                } else {
                    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${effectiveKey}`;
                    const fetchBody = { prompt: { text: prompt }, temperature: 0.0, maxOutputTokens: 1024 };
                    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fetchBody) });
                    const json = await resp.json();
                    if (json.candidates && json.candidates[0] && json.candidates[0].content) text = json.candidates[0].content;
                    else if (json.output && json.output[0] && json.output[0].content) text = json.output[0].content;
                    else if (typeof json.result === 'string') text = json.result;
                }

                let parsed = null;
                try { parsed = JSON.parse(text); } catch (e) {
                    const start = text.indexOf('[');
                    const end = text.lastIndexOf(']');
                    if (start !== -1 && end !== -1) {
                        const sub = text.substring(start, end + 1);
                        try { parsed = JSON.parse(sub); } catch (e2) { parsed = null; }
                    }
                }

                if (Array.isArray(parsed) && parsed.length > 0) {
                    const questions = parsed.map(q => ({ question: q.question || q.q || '', options: Array.isArray(q.options) ? q.options : (q.opts || []).slice(0, 10), correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : (typeof q.answer === 'number' ? q.answer : 0) }));
                    return res.status(200).json({ success: true, questions });
                }
            } catch (aiErr) {
                console.error('AI quiz generation error (public):', aiErr);
            }
        }

        // fallback heuristic
        const sentences = jd.split(/(?<=[\.\?\!])\s+/).filter(s => s.trim().length > 20);
        const questions = [];
        for (let i = 0; i < count; i++) {
            const s = sentences[i] || sentences[i % sentences.length] || jd;
            const statement = s.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
            questions.push({ question: statement, options: ['True', 'False'], correctIndex: 0 });
        }

        res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error('Generate quiz public error:', error);
        res.status(500).json({ success: false, message: 'Error generating quiz', error: error.message });
    }
};
