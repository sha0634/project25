const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Internship title is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Remote', 'On-site', 'Hybrid'],
        default: 'Remote'
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        trim: true
    },
    stipend: {
        type: String,
        required: [true, 'Stipend is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    requirements: {
        type: String
    },
    skills: [{
        type: String
    }],
    applicationDeadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Draft'],
        default: 'Active'
    },
    applicants: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Applied', 'Shortlisted', 'Rejected', 'Accepted'],
            default: 'Applied'
        }
    }],
    // Microtasks that company can assign per internship
    microtasks: [{
        title: { type: String },
        type: { type: String, enum: ['quiz', 'github', 'task'], default: 'task' },
        // For quiz type, store questions and correct answer index
        quizQuestions: [{
            question: { type: String },
            options: [{ type: String }],
            correctIndex: { type: Number }
        }],
        instructions: { type: String },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // studentId
        assignedAt: { type: Date },
        dueDate: { type: Date },
        submission: {
            submittedAt: Date,
            submissionType: { type: String }, // e.g., 'link', 'files', 'answers'
            content: mongoose.Schema.Types.Mixed // store link or answers object
        },
        status: { type: String, enum: ['Assigned', 'Submitted', 'Graded', 'Expired'], default: 'Assigned' },
        score: Number,
        feedback: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
