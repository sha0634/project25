const Newsletter = require('../models/Newsletter');

// AI-based newsletter generation from a prompt
exports.generateNewsletterFromPrompt = async (req, res) => {
    try {
        const { prompt, apiKey } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
        let text = '';

        const systemPrompt = `You are an assistant that creates concise, student-facing newsletters for a company. Given a user's prompt, return a JSON object with keys: title (short, <= 100 chars), summary (short <= 200 chars), content (HTML string with paragraphs and simple markup). Respond ONLY with valid JSON.`;

        if (effectiveKey) {
            try {
                let GoogleGenAI;
                try { GoogleGenAI = require('@google/genai').GoogleGenAI; } catch (e) { GoogleGenAI = null; }

                const requestPrompt = `${systemPrompt}\n\nUser prompt: ${prompt}`;

                if (GoogleGenAI) {
                    const ai = new GoogleGenAI({ apiKey: effectiveKey });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: requestPrompt,
                        config: { temperature: 0.3 }
                    });
                    text = response?.text || '';
                } else {
                    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${effectiveKey}`;
                    const fetchBody = { prompt: { text: requestPrompt }, temperature: 0.3, maxOutputTokens: 1024 };
                    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fetchBody) });
                    const json = await resp.json();
                    if (json.candidates && json.candidates[0] && json.candidates[0].content) text = json.candidates[0].content;
                    else if (json.output && json.output[0] && json.output[0].content) text = json.output[0].content;
                    else if (typeof json.result === 'string') text = json.result;
                }
            } catch (aiErr) {
                console.error('AI generation error:', aiErr);
            }
        }

        // Try to parse JSON from text
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                const sub = text.substring(start, end + 1);
                try { parsed = JSON.parse(sub); } catch (e2) { parsed = null; }
            }
        }

        // If parsing failed, create a minimal fallback using the prompt
        if (!parsed) {
            parsed = {
                title: (prompt.length > 60 ? prompt.slice(0, 57) + '...' : `Newsletter: ${prompt.slice(0, 60)}`),
                summary: prompt.slice(0, 180),
                content: `<p>${prompt.replace(/\n/g, '<br/>')}</p>`
            };
        }

        res.status(200).json({ success: true, newsletter: parsed });
    } catch (error) {
        console.error('Generate newsletter error:', error);
        res.status(500).json({ success: false, message: 'Error generating newsletter', error: error.message });
    }
};

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

        // Emit real-time event to connected clients (students) so they can see new newsletter immediately
        try {
            const io = req.app.get('io');
            if (io) {
                io.emit('newNewsletter', newsletter);
            }
        } catch (emitErr) {
            console.error('Error emitting newNewsletter:', emitErr);
        }

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
