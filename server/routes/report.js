const express = require('express');
const Report = require('../models/Report');

const router = express.Router();

// GET /api/report/:reportId - Get report by ID
router.get('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }
    
    // Return the stored report JSON
    res.json(report.reportJson);
    
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      error: 'Failed to retrieve report'
    });
  }
});

// GET /api/reports - Get recent reports (P1 feature)
router.get('/reports', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const reports = await Report.find()
      .select('reportId createdAt scores.overall meta.country meta.erp')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    const recentReports = reports.map(report => ({
      reportId: report.reportId,
      createdAt: report.createdAt,
      overallScore: report.scores.overall,
      country: report.meta.country,
      erp: report.meta.erp,
      readinessLabel: report.meta.readinessLabel
    }));
    
    res.json({
      reports: recentReports,
      total: recentReports.length
    });
    
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      error: 'Failed to retrieve reports'
    });
  }
});

// GET /api/share/:reportId - Shareable report view (P1 feature)
router.get('/share/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }
    
    // Return a simplified version for sharing
    const shareableReport = {
      reportId: report.reportId,
      scores: report.scores,
      coverage: {
        matched: report.coverage.matched,
        missing: report.coverage.missing,
        closeMatches: report.coverage.close.length
      },
      rulesSummary: {
        passed: report.ruleFindings.filter(r => r.ok).length,
        failed: report.ruleFindings.filter(r => !r.ok).length,
        total: report.ruleFindings.length
      },
      gaps: report.gaps,
      meta: {
        ...report.meta,
        sharedAt: new Date().toISOString()
      }
    };
    
    res.json(shareableReport);
    
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({
      error: 'Failed to retrieve shareable report'
    });
  }
});

// DELETE /api/report/:reportId - Delete report (admin feature)
router.delete('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const result = await Report.deleteOne({ reportId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }
    
    res.json({
      message: 'Report deleted successfully',
      reportId
    });
    
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      error: 'Failed to delete report'
    });
  }
});

// GET /api/report/:reportId/download - Download report as JSON
router.get('/report/:reportId/download', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({
        error: 'Report not found'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.json"`);
    
    res.json(report.reportJson);
    
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      error: 'Failed to download report'
    });
  }
});

module.exports = router;