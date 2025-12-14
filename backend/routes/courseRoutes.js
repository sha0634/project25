const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const https = require('https');
const Course = require('../models/Course');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'course-videos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Create course (company only) - accepts multiple files under field name 'courseVideos'
router.post('/', protect, restrictTo('company'), upload.array('courseVideos'), async (req, res) => {
  try {
    console.log('Create course request body:', req.body);
    console.log('Create course user:', req.user && req.user._id);
    const companyId = req.user._id;
    const companyName = req.user.profile?.companyName || req.user.username || '';

    const videos = (req.files || []).map(f => `/uploads/course-videos/${path.basename(f.path)}`);
    // Also accept optional video URLs from the request body (for simple frontend usage)
    let videoUrls = [];
    if (req.body.videoUrls) {
      try { videoUrls = JSON.parse(req.body.videoUrls); } catch (e) { if (Array.isArray(req.body.videoUrls)) videoUrls = req.body.videoUrls; }
    }
    // Merge provided URLs before uploaded files
    const allVideos = [...(videoUrls || []), ...videos];
    console.log('Received upload files:', req.files);
    console.log('Computed videos array (paths):', allVideos);

    const course = await Course.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      duration: req.body.duration,
      price: req.body.price,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
      prerequisites: req.body.prerequisites,
      companyId,
      companyName,
      videos: allVideos
    });

    // Emit new course event via socket.io (for live updates to students)
    try {
      const io = req.app.get('io');
      if (io) io.emit('newCourse', course);
    } catch (err) {
      console.warn('Failed to emit newCourse event', err.message);
    }

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// DEBUG: temporary seed route to create a published course (unauthenticated)
// Use this only for local testing; remove when done.
router.post('/debug/seed-course', async (req, res) => {
  try {
    const sample = {
      name: req.body.name || 'Seeded Course',
      description: req.body.description || 'This is a seeded published course for testing.',
      category: req.body.category || 'Development',
      duration: req.body.duration || '4 weeks',
      price: req.body.price || 'Free',
      isPublished: true,
      prerequisites: req.body.prerequisites || '',
      companyId: null,
      companyName: req.body.companyName || 'Seed Company',
      videos: req.body.videoUrls ? (Array.isArray(req.body.videoUrls) ? req.body.videoUrls : JSON.parse(req.body.videoUrls || '[]')) : [],
    };

    const course = await Course.create(sample);
    try { const io = req.app.get('io'); if (io) io.emit('newCourse', course); } catch (e) { console.warn('emit newCourse failed', e.message); }
    console.log('Seeded course created:', course._id);
    res.status(201).json({ success: true, course, seeded: true });
  } catch (err) {
    console.error('Seed course error:', err);
    res.status(500).json({ success: false, message: 'Failed to seed course' });
  }
});

// Update course (company only) - accepts additional files under 'courseVideos' and a JSON 'removeVideos' array
router.put('/:id', protect, restrictTo('company'), upload.array('courseVideos'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.companyId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    // New uploaded files
    const newVideos = (req.files || []).map(f => `/uploads/course-videos/${path.basename(f.path)}`);

    // Remove videos requested by client
    let removeVideos = [];
    if (req.body.removeVideos) {
      try { removeVideos = JSON.parse(req.body.removeVideos); } catch (e) { removeVideos = []; }
    }

    // Filter out removed videos from existing list
    const updatedVideos = (course.videos || []).filter(v => !removeVideos.includes(v)).concat(newVideos);

    // Attempt to delete removed files from disk (best effort)
    for (const r of removeVideos) {
      try {
        const filePath = path.join(__dirname, '..', r.replace(/^\/+/,''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete file', r, err.message);
      }
    }

    // Update allowed fields if provided
    const fields = ['name','description','category','duration','price','isPublished','prerequisites'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) course[f] = req.body[f];
    });

    course.videos = updatedVideos;
    await course.save();

    // Emit updated course event
    try {
      const io = req.app.get('io');
      if (io) io.emit('updatedCourse', course);
    } catch (err) {
      console.warn('Failed to emit updatedCourse event', err.message);
    }

    res.json({ success: true, course });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

// Get company courses
router.get('/company/my-courses', protect, restrictTo('company'), async (req, res) => {
  try {
    const companyId = req.user._id;
    const courses = await Course.find({ companyId }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// Public: Get published courses (students)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).select('-__v');
    res.json({ success: true, courses });
  } catch (err) {
    console.error('Fetch public courses error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// Enroll in a course (student only)
router.post('/:id/enroll', protect, restrictTo('student'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Prevent duplicate enrollment
    if ((course.enrolledStudents || []).some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }

    course.enrolledStudents = [...(course.enrolledStudents || []), userId];
    await course.save();

    res.json({ success: true, message: 'Enrolled successfully', course });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ success: false, message: 'Failed to enroll' });
  }
});

// Stream a protected course video (student must be enrolled or company owner)
router.get('/:id/video/:index', protect, async (req, res) => {
  try {
    const courseId = req.params.id;
    const idx = parseInt(req.params.index, 10);
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (isNaN(idx) || idx < 0 || idx >= (course.videos || []).length) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Authorization: students must be enrolled; companies can access their own courses
    const userId = req.user && req.user._id;
    // Some parts of the codebase use `userType`, others `role`; prefer `userType` from the User model
    const userType = req.user && (req.user.userType || req.user.role);

    if (userType === 'student') {
      if (!((course.enrolledStudents || []).some(id => id.toString() === userId.toString()))) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }
    } else if (userType === 'company') {
      if (course.companyId && course.companyId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const videoPath = course.videos[idx]; // e.g. /uploads/course-videos/<file>
    if (!videoPath) return res.status(404).json({ success: false, message: 'Video path missing' });

    // If the video path is a remote URL, proxy it through the server
    if (/^https?:\/\//i.test(videoPath)) {
      try {
        const client = videoPath.startsWith('https') ? https : http;
        return client.get(videoPath, (proxyRes) => {
          if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
            console.warn('Remote video fetch failed', proxyRes.statusCode, videoPath);
            return res.status(502).json({ success: false, message: 'Failed to fetch remote video' });
          }
          // Forward response headers (omit transfer-encoding to avoid chunked issues)
          Object.entries(proxyRes.headers || {}).forEach(([k, v]) => {
            if (k.toLowerCase() === 'transfer-encoding') return;
            try { res.setHeader(k, v); } catch (e) {}
          });
          proxyRes.pipe(res);
        }).on('error', (err) => {
          console.error('Error proxying remote video:', err);
          return res.status(502).json({ success: false, message: 'Failed to proxy remote video' });
        });
      } catch (err) {
        console.error('Proxy remote video error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch remote video' });
      }
    }

    // Otherwise treat as a local file path (may be stored like /uploads/course-videos/filename)
    const rel = videoPath.replace(/^\/+/, '');
    const abs = path.join(__dirname, '..', rel);

    if (!fs.existsSync(abs)) return res.status(404).json({ success: false, message: 'File not found on disk' });

    return res.sendFile(abs);
  } catch (err) {
    console.error('Protected video stream error:', err);
    return res.status(500).json({ success: false, message: 'Failed to stream video' });
  }
});

// Company-only: get enrolled students summary for a course
router.get('/:id/enrolled', protect, restrictTo('company'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (!course.companyId || course.companyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const studentIds = (course.enrolledStudents || []).map(id => id.toString());
    if (studentIds.length === 0) return res.json({ success: true, students: [] });

    // Lazy require to avoid circular issues
    const User = require('../models/User');
    // Select minimal fields: name, email, phone, resume path
    const students = await User.find({ _id: { $in: studentIds } }).select('email username profile.fullName profile.phone profile.resume profile.resumePath');

    // Map to safe summary objects
    const summaries = students.map(s => ({
      _id: s._id,
      name: s.profile?.fullName || s.username || '',
      email: s.email || '',
      phone: s.profile?.phone || '',
      resume: s.profile?.resume || s.profile?.resumePath || ''
    }));

    return res.json({ success: true, students: summaries });
  } catch (err) {
    console.error('Fetch enrolled students error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch enrolled students' });
  }
});

module.exports = router;
