const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import models
const User = require('./models/User');
const Resource = require('./models/Resource');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'studyshare_resources',
      resource_type: 'raw'
    };
  }
});

const upload = multer({ storage: storage });

const app = express();
// CORS: allow local and deployed frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL // e.g. https://studyshare-main.vercel.app
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists
      user = new User({ name, email });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google Auth endpoints
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT
  const user = req.user;
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  console.log('Setting token for user:', user._id, 'Token:', token.substring(0, 20) + '...');
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // Set to false for now, can be true in production with HTTPS
    sameSite: 'lax', // More permissive for cross-site requests
    maxAge: 24 * 60 * 60 * 1000
  });
  console.log('Cookie set, redirecting to:', process.env.FRONTEND_URL);
  // Redirect to frontend dashboard or profile
  res.redirect(process.env.FRONTEND_URL);
});

// Configure nodemailer transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set in .env
    pass: process.env.EMAIL_PASS  // set in .env
  }
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Auth middleware - Token received:', token ? token.substring(0, 20) + '...' : 'No token');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Token verified for user:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
app.get('/api/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile endpoint
app.post('/api/update-profile', authenticate, async (req, res) => {
  const { name, college, phone, degree_year, about } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name, college, phone, degree_year, about
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload resource file to Cloudinary
app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received by multer');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Create a new resource
app.post('/api/resources', authenticate, async (req, res) => {
  const {
    title,
    description,
    category,
    fileType,
    fileUrl,
    uploadedBy,
    downloads,
    rating,
    tags
  } = req.body;

  try {
    const resource = new Resource({
      title,
      description,
      category,
      fileType,
      fileUrl,
      uploadedBy,
      downloads: downloads || 0,
      rating: rating || 0,
      tags: tags || []
    });
    await resource.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Resource upload error:', err);
    res.status(500).json({ error: 'Failed to save resource' });
  }
});

// Get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name')
      .sort({ uploadedAt: -1 });
    
    // Transform to match frontend expectations
    const transformedResources = resources.map(resource => ({
      ...resource.toObject(),
      id: resource._id,
      uploaderName: resource.uploadedBy?.name || 'Unknown'
    }));
    
    res.json({ resources: transformedResources });
  } catch (err) {
    console.error('Fetch resources error:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Delete resource endpoint
app.delete('/api/resources/:id', authenticate, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (String(resource.uploadedBy) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this resource' });
    }
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Public user info endpoint
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));
