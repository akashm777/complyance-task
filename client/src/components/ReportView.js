import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Clock, Database, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScoreCard from './ScoreCard';
import CoveragePanel from './CoveragePanel';
import RuleFindings from './RuleFindings';
import API_BASE_URL from '../config/api';

const ReportView = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [reportId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/report/${reportId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Load report error:', error);
      setError(error.response?.data?.error || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/report/${reportId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const copyShareableLink = () => {
    const shareUrl = `${window.location.origin}/share/${reportId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied to clipboard!');
  };

  const getReadinessColor = (label) => {
    switch (label) {
      case 'High':
        return 'text-success-600';
      case 'Medium':
        return 'text-warning-600';
      case 'Low':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            Report Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Link to="/" className="btn-primary">
            Create New Analysis
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analyzer
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              E-Invoicing Readiness Report
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
              <span>Report ID: {reportId}</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(report.meta?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={copyShareableLink} className="btn-secondary">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button onClick={downloadReport} className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="card p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Overall E-Invoicing Readiness
        </h2>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-4xl font-bold text-primary-600">
            {report.scores.overall}%
          </div>
          <div className={`text-xl font-semibold ${getReadinessColor(report.meta.readinessLabel)}`}>
            {report.meta.readinessLabel} Readiness
          </div>
        </div>
        
        {/* Meta Information */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300 mt-4">
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4" />
            <span>{report.meta.rowsParsed} rows analyzed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>{report.meta.country}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{report.meta.processingTime}ms processing</span>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          title="Data Quality"
          score={report.scores.data}
          description="Parsing success rate"
          color="blue"
          weight="25%"
        />
        <ScoreCard
          title="Field Coverage"
          score={report.scores.coverage}
          description="GETS schema matching"
          color="green"
          weight="35%"
        />
        <ScoreCard
          title="Rule Compliance"
          score={report.scores.rules}
          description="Validation checks"
          color="purple"
          weight="30%"
        />
        <ScoreCard
          title="Technical Posture"
          score={report.scores.posture}
          description="Infrastructure readiness"
          color="orange"
          weight="10%"
        />
      </div>

      {/* Coverage Analysis */}
      <CoveragePanel coverage={report.coverage} />

      {/* Rule Findings */}
      <RuleFindings findings={report.ruleFindings} />

      {/* Gaps Summary */}
      {report.gaps && report.gaps.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Key Issues to Address
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {report.gaps.map((gap, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <div className="w-2 h-2 bg-danger-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
        <p>
          This report was generated using GETS v0.1 schema validation.
          Report will be available for 7 days from creation date.
        </p>
      </div>
    </div>
  );
};

export default ReportView;