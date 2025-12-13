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
        
        // Student-specific fields
        education: [{
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startDate: Date,
            endDate: Date,
            current: Boolean
        }],
        skills: [{
            type: String
        }],
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
