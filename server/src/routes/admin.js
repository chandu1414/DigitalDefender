const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Users, Resources, Downloads, getStats } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer storage setup for PDF uploads
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'resources');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const cleanOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${cleanOriginal}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept pdf files only
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed for upload.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper to format file size
function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// All admin routes require authentication AND admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to retrieve platform stats.' });
  }
});

// GET /api/admin/users - List all registered users with search/filter
// Strictly excludes passwords from output!
router.get('/users', (req, res) => {
  try {
    const search = req.query.search || '';
    const users = Users.list(search);

    // Format safe response for admin
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      last_login_at: u.last_login_at || 'Never',
      download_count: u.download_count || 0
    }));

    res.json({ users: safeUsers });
  } catch (err) {
    console.error('Error listing users for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user active / suspended status
router.patch('/users/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }

    const updated = Users.update(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User status updated successfully.', user: updated });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// POST /api/admin/resources - Upload new study notes PDF
router.post('/resources', upload.single('pdf'), (req, res) => {
  try {
    const { title, description, topic, author } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a PDF file to upload.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Please provide a title for the resource.' });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Please specify or select a topic tag.' });
    }

    const fileSizeFormatted = formatBytes(req.file.size);

    const resource = Resources.create({
      title,
      description: description || 'No description provided.',
      topic,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_size: fileSizeFormatted,
      author: author || 'DigitalDefender Security Team'
    });

    res.status(201).json({
      message: 'Resource uploaded and published successfully!',
      resource
    });
  } catch (err) {
    console.error('Error uploading resource:', err);
    res.status(500).json({ error: err.message || 'Failed to upload resource.' });
  }
});

// DELETE /api/admin/resources/:id - Delete a resource
router.delete('/resources/:id', (req, res) => {
  try {
    const resource = Resources.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Attempt to delete physical file if exists
    try {
      if (fs.existsSync(resource.file_path)) {
        fs.unlinkSync(resource.file_path);
      }
    } catch (fsErr) {
      console.warn('Could not delete physical file:', fsErr.message);
    }

    Resources.delete(req.params.id);

    res.json({ message: 'Resource deleted successfully.' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ error: 'Failed to delete resource.' });
  }
});

module.exports = router;
