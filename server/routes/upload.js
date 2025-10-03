const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Upload = require('../models/Upload');
const { parseData } = require('../utils/dataParser');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    const allowedExtensions = ['.csv', '.json'];
    
    const hasValidType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (hasValidType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'), false);
    }
  }
});

// POST /api/upload - Handle file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('📤 Upload request received');
  try {
    let content, originalName, fileType;
    
    if (req.file) {
      // File upload
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          error: 'Uploaded file is empty'
        });
      }
      content = req.file.buffer.toString('utf8');
      originalName = req.file.originalname;
      fileType = originalName.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
    } else if (req.body.text) {
      // Text upload
      if (!req.body.text.trim()) {
        return res.status(400).json({
          error: 'Text data cannot be empty'
        });
      }
      content = req.body.text;
      originalName = 'pasted-data';
      fileType = null; // Will be auto-detected
    } else {
      return res.status(400).json({
        error: 'No file or text data provided'
      });
    }

    // Parse the data
    const parseResult = await parseData(content, fileType);
    
    // Generate upload ID
    const uploadId = `u_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    // Create upload record
    const uploadRecord = new Upload({
      uploadId,
      originalName,
      fileType: parseResult.fileType,
      country: req.body.country || 'Not specified',
      erp: req.body.erp || 'Not specified',
      rowsParsed: parseResult.parsedLength,
      totalRows: parseResult.originalLength,
      parsedData: parseResult.data,
      piiMasked: false
    });
    
    await uploadRecord.save();
    
    res.json({
      uploadId,
      meta: {
        fileType: parseResult.fileType,
        rowsParsed: parseResult.parsedLength,
        originalRows: parseResult.originalLength,
        dataScore: parseResult.dataScore
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    
    res.status(400).json({
      error: error.message || 'Upload failed'
    });
  }
});

// GET /api/upload/:uploadId - Get upload details
router.get('/upload/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const upload = await Upload.findOne({ uploadId }).select('-parsedData');
    
    if (!upload) {
      return res.status(404).json({
        error: 'Upload not found'
      });
    }
    
    res.json({
      uploadId: upload.uploadId,
      originalName: upload.originalName,
      fileType: upload.fileType,
      country: upload.country,
      erp: upload.erp,
      rowsParsed: upload.rowsParsed,
      totalRows: upload.totalRows,
      createdAt: upload.createdAt
    });
    
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({
      error: 'Failed to retrieve upload'
    });
  }
});

// GET /api/upload/:uploadId/preview - Get data preview
router.get('/upload/:uploadId/preview', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const upload = await Upload.findOne({ uploadId });
    
    if (!upload) {
      return res.status(404).json({
        error: 'Upload not found'
      });
    }
    
    const preview = upload.parsedData.slice(0, limit);
    
    res.json({
      data: preview,
      total: upload.parsedData.length,
      showing: preview.length
    });
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      error: 'Failed to get preview'
    });
  }
});

module.exports = router;