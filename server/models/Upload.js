const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  uploadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalName: String,
  fileType: {
    type: String,
    enum: ['csv', 'json'],
    required: true
  },
  country: String,
  erp: String,
  rowsParsed: {
    type: Number,
    default: 0
  },
  totalRows: {
    type: Number,
    default: 0
  },
  parsedData: [{
    type: mongoose.Schema.Types.Mixed
  }],
  piiMasked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days in seconds
  }
});

module.exports = mongoose.model('Upload', uploadSchema);