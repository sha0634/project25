const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const microtaskRoutes = require('./routes/microtaskRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Project25 API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Internship routes
app.use('/api/internships', internshipRoutes);

// Microtask routes (mounted under internships)
app.use('/api/internships/:id/microtasks', microtaskRoutes);

// Newsletter routes
app.use('/api/newsletters', newsletterRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Course routes
app.use('/api/courses', courseRoutes);

// Course routes (disabled - file not present)
// app.use('/api/courses', courseRoutes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: err.message 
    });
});

// Socket.io connection handling
const connectedUsers = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // User registers their ID
    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`👤 User ${userId} registered with socket ${socket.id}`);
        console.log('📊 Connected users:', Array.from(connectedUsers.keys()));
    });

    socket.on('disconnect', () => {
        // Remove user from connected users
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                console.log(`👋 User ${userId} disconnected`);
                console.log('📊 Connected users:', Array.from(connectedUsers.keys()));
                break;
            }
        }
    });
});

// Export connectedUsers for use in controllers
app.set('connectedUsers', connectedUsers);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
