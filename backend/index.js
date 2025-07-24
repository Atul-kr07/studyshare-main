const express = require('express');
const mysql = require('mysql2/promise');
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
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const email = profile.emails[0].value;
    const name = profile.displayName;
    let [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    let user;
    if (rows.length === 0) {
      // Create user if not exists
      await conn.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
      [rows] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    }
    user = rows[0];
    conn.end();
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
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
  // Redirect to frontend dashboard or profile
  res.redirect('http://localhost:5173');
});

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Atul@9798',
  database: 'studyshare'
};

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
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user
app.get('/api/me', authenticate, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile endpoint
app.post('/api/update-profile', authenticate, async (req, res) => {
  const { name, college, phone, degree_year, about } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE users SET name = ?, college = ?, phone = ?, degree_year = ?, about = ? WHERE id = ?',
      [name, college, phone, degree_year, about, req.user.id]
    );
    conn.end();
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

// Helper to convert ISO to MySQL DATETIME (robust)
const mysqlDatetime = (dateString) => {
  if (!dateString) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

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

  // Always use current server time for uploadedAt
  const uploadedAtMysql = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log('Using server uploadedAt:', uploadedAtMysql);

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO resources (title, description, category, fileType, fileUrl, uploadedBy, uploadedAt, downloads, rating, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        description,
        category,
        fileType,
        fileUrl,
        uploadedBy,
        uploadedAtMysql, // always use server time
        downloads || 0,
        rating || 0,
        JSON.stringify(tags || [])
      ]
    );
    conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error('Resource upload error:', err);
    res.status(500).json({ error: 'Failed to save resource' });
  }
});

// Get all resources
app.get('/api/resources', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(`
      SELECT r.*, u.name AS uploaderName
      FROM resources r
      LEFT JOIN users u ON r.uploadedBy = u.id
      ORDER BY r.uploadedAt DESC
    `);
    conn.end();
    // Parse tags from JSON
    const resources = rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') }));
    res.json({ resources });
  } catch (err) {
    console.error('Fetch resources error:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Delete resource endpoint
app.delete('/api/resources/:id', authenticate, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    // Only allow deletion if the resource belongs to the user
    const [rows] = await conn.execute('SELECT uploadedBy FROM resources WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      conn.end();
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (String(rows[0].uploadedBy) !== String(req.user.id)) {
      conn.end();
      return res.status(403).json({ error: 'Not authorized to delete this resource' });
    }
    await conn.execute('DELETE FROM resources WHERE id = ?', [req.params.id]);
    conn.end();
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
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT id, name, avatar FROM users WHERE id = ?', [req.params.id]);
    conn.end();
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));
