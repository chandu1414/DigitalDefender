const express = require('express');
const path = require('path');
const fs = require('fs');
const { Resources, Downloads } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/resources - Public list of resources (optionally filtered by topic)
router.get('/', optionalAuth, (req, res) => {
  try {
    const topic = req.query.topic || '';
    const resources = Resources.list(topic);
    
    // If user is authenticated, we can also annotate if they have downloaded it
    let userDownloads = [];
    if (req.user) {
      userDownloads = Downloads.listByUser(req.user.id).map(d => d.resource_id);
    }

    const formatted = resources.map(r => ({
      ...r,
      isDownloadedByUser: userDownloads.includes(r.id)
    }));

    res.json({ resources: formatted });
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to retrieve resources.' });
  }
});

// GET /api/resources/:id - Single resource detail
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const resource = Resources.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    res.json({ resource });
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Failed to retrieve resource details.' });
  }
});

// GET /api/resources/:id/download - Gated download route! Requires authentication!
router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const resource = Resources.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    // Check if file exists on disk
    const filePath = path.resolve(resource.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file is currently unavailable on server storage.' });
    }

    // Track download in database for this user and this resource
    const downloadStats = Downloads.record(req.user.id, resource.id);
    console.log(`Download recorded: User "${req.user.name}" (${req.user.email}) downloaded "${resource.title}". User total: ${downloadStats.userDownloadCount}, File total: ${downloadStats.resourceDownloadCount}`);

    // Stream download with friendly filename
    res.download(filePath, resource.file_name, (err) => {
      if (err) {
        console.error('Error streaming download:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file.' });
        }
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to process resource download.' });
  }
});

module.exports = router;
