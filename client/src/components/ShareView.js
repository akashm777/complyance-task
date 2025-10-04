import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, BarChart3 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ShareView = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShareableReport();
  }, [reportId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadShareableReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/share/${reportId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Load shareable report error:', error);
      setError(error.response?.data?.error || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (label) => {
    switch (label) {
      case 'High':
        return 'text-success-600 bg-success-50 dark:bg-success-900/20';
      case 'Medium':
        return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'Low':
        return 'text-danger-600 bg-danger-50 dark:bg-danger-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <div className="text-danger-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Report Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Link to="/" className="btn-primary">
            Create Your Own Analysis
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BarChart3 className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            E-Invoicing Readiness Report
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Shared report • Generated on {new Date(report.meta?.sharedAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Score */}
      <div className="card p-8 text-center">
        <div className="mb-6">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {report.scores.overall}%
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getReadinessColor(report.meta.readinessLabel)}`}>
            {report.meta.readinessLabel} Readiness
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-gray-600 dark:text-gray-300">Country</div>
            <div className="font-semibold text-gray-900 dark:text-white">{report.meta.country}</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-gray-600 dark:text-gray-300">ERP System</div>
            <div className="font-semibold text-gray-900 dark:text-white">{report.meta.erp}</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-gray-600 dark:text-gray-300">Rows Analyzed</div>
            <div className="font-semibold text-gray-900 dark:text-white">{report.meta.rowsParsed}</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-gray-600 dark:text-gray-300">Processing Time</div>
            <div className="font-semibold text-gray-900 dark:text-white">{report.meta.processingTime}ms</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Data Quality</h3>
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(report.scores.data)}`}>
            {report.scores.data}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weight: 25%</div>
        </div>
        
        <div className="card p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Field Coverage</h3>
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(report.scores.coverage)}`}>
            {report.scores.coverage}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weight: 35%</div>
        </div>
        
        <div className="card p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Rule Compliance</h3>
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(report.scores.rules)}`}>
            {report.scores.rules}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weight: 30%</div>
        </div>
        
        <div className="card p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Technical Posture</h3>
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(report.scores.posture)}`}>
            {report.scores.posture}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Weight: 10%</div>
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          GETS Schema Coverage
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div className="text-2xl font-bold text-success-600">{report.coverage.matched.length}</div>
            <div className="text-sm text-success-700 dark:text-success-300">Matched Fields</div>
          </div>
          <div className="text-center p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <div className="text-2xl font-bold text-warning-600">{report.coverage.closeMatches}</div>
            <div className="text-sm text-warning-700 dark:text-warning-300">Close Matches</div>
          </div>
          <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <div className="text-2xl font-bold text-danger-600">{report.coverage.missing.length}</div>
            <div className="text-sm text-danger-700 dark:text-danger-300">Missing Fields</div>
          </div>
        </div>
      </div>

      {/* Rules Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Validation Rules
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div className="text-2xl font-bold text-success-600">{report.rulesSummary.passed}</div>
            <div className="text-sm text-success-700 dark:text-success-300">Rules Passed</div>
          </div>
          <div className="text-center p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
            <div className="text-2xl font-bold text-danger-600">{report.rulesSummary.failed}</div>
            <div className="text-sm text-danger-700 dark:text-danger-300">Rules Failed</div>
          </div>
        </div>
      </div>

      {/* Key Issues */}
      {report.gaps && report.gaps.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Key Issues to Address
          </h3>
          <div className="space-y-2">
            {report.gaps.slice(0, 5).map((gap, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <div className="w-2 h-2 bg-danger-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{gap}</span>
              </div>
            ))}
            {report.gaps.length > 5 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-2">
                ... and {report.gaps.length - 5} more issues
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="card p-8 text-center bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Want to analyze your own data?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Get detailed insights into your e-invoicing readiness with InvoiceMend.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center space-x-2">
          <span>Start Your Analysis</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        <p>
          Generated by Invoice Readiness Analyzer • GETS v0.1 Schema
        </p>
      </div>
    </div>
  );
};

export default ShareView;