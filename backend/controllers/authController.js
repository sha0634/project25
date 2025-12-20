const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
    try {
        console.log('Signup request received:', req.body);
        const { username, email, password, userType, profile } = req.body;

        // Validate required fields
        if (!username || !email || !password || !userType) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        console.log('Checking for existing user...');
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({
                success: false,
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        console.log('Creating new user...');
        // Create user object based on userType
        const userData = {
            username,
            email,
            password,
            userType: userType.toLowerCase(),
            profile: {
                fullName: username, // Initialize with username
                ...(profile || {})
            }
        };

        // Create new user
        const user = await User.create(userData);
        console.log('User created successfully:', user._id);

        // Generate token
        const token = generateToken(user._id);

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Signup error details:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Send response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Login or register using Google ID token
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Missing idToken' });
        }

        const fetchLib = global.fetch || require('node-fetch');

        // Verify token with Google
        const verifyRes = await fetchLib(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!verifyRes.ok) {
            const txt = await verifyRes.text();
            return res.status(401).json({ success: false, message: 'Invalid Google ID token', details: txt });
        }

        const payload = await verifyRes.json();

        // payload contains: email, email_verified, name, picture, sub
        if (!payload.email || payload.email_verified !== 'true' && payload.email_verified !== true) {
            return res.status(400).json({ success: false, message: 'Google account email not verified' });
        }

        const email = payload.email.toLowerCase();
        const fullName = payload.name || (email.split('@')[0] || 'User');

        // Check if user exists
        let user = await User.findOne({ email });
        let created = false;

        if (!user) {
            // Create a username from name or email local part
            let baseUsername = (fullName || email.split('@')[0]).replace(/\s+/g, '_').toLowerCase();
            // Ensure uniqueness
            let username = baseUsername;
            let i = 0;
            while (await User.findOne({ username })) {
                i += 1;
                username = `${baseUsername}${i}`;
            }

            // Generate a random password since password is required by schema
            const randomPassword = crypto.randomBytes(16).toString('hex');

            const userData = {
                username,
                email,
                password: randomPassword,
                userType: 'student',
                profile: {
                    fullName,
                    profilePicture: payload.picture || '',
                    emailVerified: true
                }
            };

            user = await User.create(userData);
            created = true;
        } else {
            // Existing user: ensure emailVerified and profile picture are up-to-date
            let updated = false;
            if (!user.profile) user.profile = {};
            if (!user.profile.emailVerified) {
                user.profile.emailVerified = true;
                updated = true;
            }
            if (payload.picture && user.profile.profilePicture !== payload.picture) {
                user.profile.profilePicture = payload.picture;
                updated = true;
            }
            if (updated) {
                try { await user.save(); } catch (e) { console.warn('Failed saving updated user after Google login', e); }
            }
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.status(200).json({ success: true, message: 'Login successful', token, user: user.toPublicJSON(), newUser: created });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ success: false, message: 'Google login failed', error: error.message });
    }
};
