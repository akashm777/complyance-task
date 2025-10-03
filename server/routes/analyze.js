const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Upload = require('../models/Upload');
const Report = require('../models/Report');
const { detectFields, calculateCoverageScore } = require('../utils/fieldDetector');
const { runAllRuleChecks } = require('../utils/ruleChecker');

const router = express.Router();

function calculatePostureScore(questionnaire) {
  if (!questionnaire) return 0;
  
  const { webhooks, sandbox_env, retries } = questionnaire;
  let score = 0;
  
  // Each positive answer adds points
  if (webhooks) score += 40;
  if (sandbox_env) score += 40;
  if (retries) score += 20;
  
  return Math.min(100, score);
}

function calculateOverallScore(scores) {
  // Weights as specified in assignment requirements
  const weights = {
    data: 0.25,      // 25%
    coverage: 0.35,  // 35%
    rules: 0.30,     // 30%
    posture: 0.10    // 10%
  };
  
  const overall = Math.round(
    scores.data * weights.data +
    scores.coverage * weights.coverage +
    scores.rules * weights.rules +
    scores.posture * weights.posture
  );
  
  return Math.min(100, Math.max(0, overall));
}

function getReadinessLabel(overallScore) {
  if (overallScore >= 80) return 'High';
  if (overallScore >= 60) return 'Medium';
  return 'Low';
}

function generateGaps(coverage, ruleFindings) {
  const gaps = [];
  
  // Only add missing REQUIRED fields (not optional ones)
  const requiredFields = [
    'invoice.id', 'invoice.issue_date', 'invoice.currency', 
    'invoice.total_excl_vat', 'invoice.vat_amount', 'invoice.total_incl_vat',
    'seller.name', 'seller.trn', 'seller.country',
    'buyer.name', 'buyer.trn', 'buyer.country',
    'lines[].sku', 'lines[].qty', 'lines[].unit_price', 'lines[].line_total'
  ];
  
  coverage.missing.forEach(field => {
    if (requiredFields.includes(field)) {
      gaps.push(`Missing required field: ${field}`);
    }
  });
  
  // Add rule failures
  ruleFindings.forEach(finding => {
    if (!finding.ok) {
      switch (finding.rule) {
        case 'TOTALS_BALANCE':
          gaps.push('Invoice totals do not balance correctly');
          break;
        case 'LINE_MATH':
          gaps.push('Line item calculations are incorrect');
          break;
        case 'DATE_ISO':
          gaps.push('Date format is not ISO standard (YYYY-MM-DD)');
          break;
        case 'CURRENCY_ALLOWED':
          gaps.push(`Invalid currency: ${finding.value || 'unknown'}`);
          break;
        case 'TRN_PRESENT':
          gaps.push('Missing Tax Registration Numbers (TRN)');
          break;
      }
    }
  });
  
  return gaps;
}

function countTotalLines(data) {
  return data.reduce((total, row) => {
    const lines = row.lines || [];
    return total + lines.length;
  }, 0);
}

// POST /api/analyze - Analyze uploaded data
router.post('/analyze', async (req, res) => {
  console.log('🔍 Analysis request received for uploadId:', req.body.uploadId);
  const startTime = Date.now();
  
  try {
    const { uploadId, questionnaire } = req.body;
    
    if (!uploadId) {
      return res.status(400).json({
        error: 'uploadId is required'
      });
    }
    
    // Find the upload
    const upload = await Upload.findOne({ uploadId });
    if (!upload) {
      return res.status(404).json({
        error: 'Upload not found'
      });
    }
    
    const data = upload.parsedData;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        error: 'No valid data to analyze'
      });
    }
    
    // Generate report ID
    const reportId = `r_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    
    // 1. Field Detection & Coverage Analysis
    const coverage = detectFields(data);
    const coverageScore = calculateCoverageScore(coverage);
    
    // 2. Rule Checks
    const ruleResults = runAllRuleChecks(data);
    
    // 3. Calculate Scores
    const dataScore = Math.round((upload.rowsParsed / upload.totalRows) * 100);
    const postureScore = calculatePostureScore(questionnaire);
    
    const scores = {
      data: dataScore,
      coverage: coverageScore,
      rules: ruleResults.rulesScore,
      posture: postureScore,
      overall: 0 // Will be calculated below
    };
    
    scores.overall = calculateOverallScore(scores);
    
    // 4. Generate gaps and metadata
    const gaps = generateGaps(coverage, ruleResults.ruleFindings);
    const totalLines = countTotalLines(data);
    const processingTime = Date.now() - startTime;
    
    const meta = {
      rowsParsed: upload.rowsParsed,
      linesTotal: totalLines,
      country: upload.country,
      erp: upload.erp,
      db: 'mongodb',
      processingTime,
      readinessLabel: getReadinessLabel(scores.overall)
    };
    
    // 5. Create report JSON
    const reportJson = {
      reportId,
      scores,
      coverage,
      ruleFindings: ruleResults.ruleFindings,
      gaps,
      meta
    };
    
    // 6. Save report to database
    const report = new Report({
      reportId,
      uploadId,
      scores,
      coverage,
      ruleFindings: ruleResults.ruleFindings,
      gaps,
      meta,
      reportJson
    });
    
    await report.save();
    
    // 7. Return the report
    res.json(reportJson);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error.message || 'Analysis failed'
    });
  }
});

// GET /api/analyze/:uploadId/status - Check if analysis exists
router.get('/analyze/:uploadId/status', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const report = await Report.findOne({ uploadId }).select('reportId createdAt scores.overall');
    
    if (!report) {
      return res.json({
        analyzed: false
      });
    }
    
    res.json({
      analyzed: true,
      reportId: report.reportId,
      overallScore: report.scores.overall,
      createdAt: report.createdAt
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check analysis status'
    });
  }
});

module.exports = router;