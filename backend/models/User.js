const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    userType: {
        type: String,
        required: [true, 'User type is required'],
        enum: ['student', 'company'],
        lowercase: true
    },
    profile: {
        // Common fields
        fullName: {
            type: String,
            required: [true, 'Full name is required']
        },
        phone: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        profilePicture: {
            type: String, // URL to profile image
            default: ''
        },
        
        // Student-specific fields (form-backed)

        // Role & Goal
        currentStatus: {
            type: String,
            enum: ['Student', 'Graduate', 'Career Switcher']
        },
        targetRole: {
            type: String
        },
        primaryGoal: {
            type: String
        },

        // Availability
        availableStartDate: Date,
        weeklyAvailabilityHours: Number,
        commitmentDurationWeeks: Number,
        canWorkDuringExams: {
            type: Boolean,
            default: false
        },

        // Timezone and verification flags
        timezone: String,
        emailVerified: {
            type: Boolean,
            default: false
        },
        phoneVerified: {
            type: Boolean,
            default: false
        },

        // Education (simplified form fields)
        highestEducationLevel: String,
        degreeProgram: String,
        institutionName: String,
        educationStartYear: Number,
        educationEndYear: Number,
        educationCGPA: String,

        // Skills (limited top 5)
        topSkills: [{
            skillName: String,
            selfRatedLevel: {
                type: String,
                enum: ['Beginner', 'Intermediate', 'Advanced']
            },
            howLearned: String
        }],

        // Experience (optional)
        priorInternship: {
            hasInternship: { type: Boolean, default: false },
            company: String,
            role: String,
            durationWeeks: Number
        },
        priorWorkExperience: {
            hasWorkExperience: { type: Boolean, default: false },
            title: String,
            durationWeeks: Number
        },

        // Links
        links: {
            github: String,
            portfolio: String,
            linkedIn: String
        },

        // Resume metadata
        resumePath: String,
        resumeLastUpdated: Date,

        // Preferences
        internshipTypePreference: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Either']
        },
        workModePreference: {
            type: String,
            enum: ['Remote', 'Hybrid', 'Onsite', 'Either']
        },
        preferredDomains: [String],
        preferredCompanySize: String,

        // Declarations / consent
        declarations: {
            informationAccuracy: { type: Boolean, default: false },
            consentToSkillAssessment: { type: Boolean, default: false },
            consentToFeedbackScoring: { type: Boolean, default: false }
        },

        // Keep some advanced fields for compatibility (do not remove)
        skills: [{
            type: String
        }],
        qualifications: {
            type: String
        },
        resume: {
            type: String // URL to resume file
        },
        resumeText: {
            type: String // Scanned text content from resume
        },
        
        // Company-specific fields
        companyName: {
            type: String
        },
        industry: {
            type: String
        },
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
        },
        website: {
            type: String
        },
        description: {
            type: String,
            maxlength: [1000, 'Company description cannot exceed 1000 characters']
        }
    },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to get public profile (excluding password)
userSchema.methods.toPublicJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
