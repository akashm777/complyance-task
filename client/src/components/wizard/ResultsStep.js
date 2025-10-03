import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Share2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Database,
  Globe
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScoreCard from '../ScoreCard';
import CoveragePanel from '../CoveragePanel';
import RuleFindings from '../RuleFindings';

const ResultsStep = ({ contextData, uploadData, reportData, setReportData, onPrev, onReset }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shareableLink, setShareableLink] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const runAnalysis = async () => {
      if (uploadData && !reportData && isMounted) {
        await analyzeData();
      }
    };
    
    runAnalysis();
    
    return () => {
      isMounted = false;
    };
  }, [uploadData?.uploadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeData = async () => {
    if (isAnalyzing) return; // Prevent duplicate calls
    
    setIsAnalyzing(true);
    
    try {
      if (!uploadData || !uploadData.uploadId) {
        throw new Error('No upload data available');
      }
      const response = await axios.post('/api/analyze', {
        uploadId: uploadData.uploadId,
        questionnaire: contextData.questionnaire
      });

      setReportData(response.data);
      setShareableLink(`${window.location.origin}/report/${response.data.reportId}`);
      toast.success('Analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!reportData) return;
    
    try {
      const response = await axios.get(`/api/report/${reportData.reportId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportData.reportId}.json`;
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
    navigator.clipboard.writeText(shareableLink);
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

  const getReadinessIcon = (label) => {
    switch (label) {
      case 'High':
        return <CheckCircle className="h-6 w-6 text-success-600" />;
      case 'Medium':
        return <AlertTriangle className="h-6 w-6 text-warning-600" />;
      case 'Low':
        return <XCircle className="h-6 w-6 text-danger-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <BarChart3 className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Analyzing Your Data
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Running field detection, rule checks, and calculating scores...
        </p>
        <div className="w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-warning-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Analysis Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please upload data first to see the analysis results.
        </p>
        <button onClick={onPrev} className="btn-primary">
          Go Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          {getReadinessIcon(reportData.meta.readinessLabel)}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analysis Complete
          </h2>
        </div>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <Database className="h-4 w-4" />
            <span>{reportData.meta.rowsParsed} rows analyzed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>{reportData.meta.country}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{reportData.meta.processingTime}ms</span>
          </div>
        </div>
      </div>

      {/* Overall Readiness */}
      <div className="card p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Overall E-Invoicing Readiness
        </h3>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-4xl font-bold text-primary-600">
            {reportData.scores.overall}%
          </div>
          <div className={`text-xl font-semibold ${getReadinessColor(reportData.meta.readinessLabel)}`}>
            {reportData.meta.readinessLabel} Readiness
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          title="Data Quality"
          score={reportData.scores.data}
          description="Parsing success rate"
          color="blue"
          weight="25%"
        />
        <ScoreCard
          title="Field Coverage"
          score={reportData.scores.coverage}
          description="GETS schema matching"
          color="green"
          weight="35%"
        />
        <ScoreCard
          title="Rule Compliance"
          score={reportData.scores.rules}
          description="Validation checks"
          color="purple"
          weight="30%"
        />
        <ScoreCard
          title="Technical Posture"
          score={reportData.scores.posture}
          description="Infrastructure readiness"
          color="orange"
          weight="10%"
        />
      </div>

      {/* Coverage Panel */}
      <CoveragePanel coverage={reportData.coverage} />

      {/* Rule Findings */}
      <RuleFindings findings={reportData.ruleFindings} />

      {/* Gaps Summary */}
      {reportData.gaps && reportData.gaps.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Key Issues to Address
          </h3>
          <div className="space-y-2">
            {reportData.gaps.map((gap, index) => (
              <div key={index} className="flex items-start space-x-2">
                <XCircle className="h-4 w-4 text-danger-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadReport}
          className="flex items-center justify-center space-x-2 btn-primary flex-1"
        >
          <Download className="h-4 w-4" />
          <span>Download Report JSON</span>
        </button>
        
        <button
          onClick={copyShareableLink}
          className="flex items-center justify-center space-x-2 btn-secondary flex-1"
        >
          <Share2 className="h-4 w-4" />
          <span>Copy Shareable Link</span>
        </button>
      </div>

      {/* New Analysis Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Want to analyze different data or try new settings?
          </p>
          <button
            onClick={onReset}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Start New Analysis</span>
          </button>
        </div>
      </div>

      {/* Shareable Link Display */}
      {shareableLink && (
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shareable Report URL
          </label>
          <div className="flex">
            <input
              type="text"
              value={shareableLink}
              readOnly
              className="flex-1 input rounded-r-none"
            />
            <button
              onClick={copyShareableLink}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This link will be valid for 7 days and can be shared with others.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsStep;