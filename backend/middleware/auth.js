const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Restrict to specific user types
exports.restrictTo = (...userTypes) => {
    return (req, res, next) => {
        if (!userTypes.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This route is only for ${userTypes.join(' or ')} users.`
            });
        }
        next();
    };
};
