import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  BarChart3, 
  ExternalLink, 
  Share2, 
  Globe,
  Settings,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const RecentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/reports?limit=20`);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Load reports error:', error);
      setError(error.response?.data?.error || 'Failed to load reports');
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

  const copyShareLink = (reportId) => {
    const shareUrl = `${window.location.origin}/share/${reportId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
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
              Recent Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your analysis history
            </p>
          </div>
        </div>
        
        <button
          onClick={loadReports}
          disabled={loading}
          className="btn-secondary"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-6 text-center">
          <div className="text-danger-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to Load Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button onClick={loadReports} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && reports.length === 0 && (
        <div className="card p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No Reports Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start by analyzing your first invoice dataset to see reports here.
          </p>
          <Link to="/" className="btn-primary">
            Create Your First Analysis
          </Link>
        </div>
      )}

      {/* Reports List */}
      {reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.reportId} className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-primary-600" />
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                        {report.reportId}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReadinessColor(report.readinessLabel)}`}>
                        {report.readinessLabel} Readiness
                      </div>
                      
                      <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                        {report.overallScore}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4" />
                      <span>{report.country}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>{report.erp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 sm:flex-shrink-0">
                  <button
                    onClick={() => copyShareLink(report.reportId)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy share link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  
                  <Link
                    to={`/report/${report.reportId}`}
                    className="btn-primary inline-flex items-center space-x-1 text-sm"
                  >
                    <span className="hidden sm:inline">View Report</span>
                    <span className="sm:hidden">View</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {reports.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>
            Showing {reports.length} recent reports • Reports are automatically deleted after 7 days
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentReports;