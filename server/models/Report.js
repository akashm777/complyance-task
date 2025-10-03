const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  uploadId: {
    type: String,
    required: true,
    ref: 'Upload'
  },
  scores: {
    data: { type: Number, min: 0, max: 100 },
    coverage: { type: Number, min: 0, max: 100 },
    rules: { type: Number, min: 0, max: 100 },
    posture: { type: Number, min: 0, max: 100 },
    overall: { type: Number, min: 0, max: 100 }
  },
  coverage: {
    matched: [String],
    close: [{
      target: String,
      candidate: String,
      confidence: Number
    }],
    missing: [String]
  },
  ruleFindings: [{
    rule: String,
    ok: Boolean,
    exampleLine: Number,
    expected: mongoose.Schema.Types.Mixed,
    got: mongoose.Schema.Types.Mixed,
    value: String,
    message: String
  }],
  gaps: [String],
  meta: {
    rowsParsed: Number,
    linesTotal: Number,
    country: String,
    erp: String,
    db: { type: String, default: 'mongodb' },
    processingTime: Number,
    readinessLabel: String
  },
  reportJson: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days in seconds
  }
});

// Index for efficient queries
reportSchema.index({ createdAt: -1 });
reportSchema.index({ 'scores.overall': -1 });

module.exports = mongoose.model('Report', reportSchema);