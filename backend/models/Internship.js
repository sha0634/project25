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
