import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import DataPreview from '../DataPreview';

const UploadStep = ({ contextData, uploadData, setUploadData, onNext, onPrev }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'text'
  const [textData, setTextData] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/json', 'text/plain'];
    const validExtensions = ['.csv', '.json'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    await uploadFile(file);
  }, [contextData]); // eslint-disable-line react-hooks/exhaustive-deps

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.csv', '.json']
    },
    multiple: false,
    disabled: isUploading
  });

  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('country', contextData.country);
      formData.append('erp', contextData.erp);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadData({
        ...response.data,
        fileName: file.name,
        fileSize: file.size
      });

      toast.success('File uploaded successfully!');
      
      // Auto-load preview
      loadPreview(response.data.uploadId);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadText = async () => {
    if (!textData.trim()) {
      toast.error('Please enter some data');
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await axios.post('/api/upload', {
        text: textData,
        country: contextData.country,
        erp: contextData.erp
      });

      setUploadData({
        ...response.data,
        fileName: 'pasted-data',
        fileSize: new Blob([textData]).size
      });

      toast.success('Data uploaded successfully!');
      
      // Auto-load preview
      loadPreview(response.data.uploadId);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const loadPreview = async (uploadId) => {
    try {
      const response = await axios.get(`/api/upload/${uploadId}/preview?limit=20`);
      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to load preview');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Invoice Data
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload your CSV or JSON file, or paste your data directly
        </p>
      </div>

      {/* Upload Method Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              uploadMethod === 'file'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setUploadMethod('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              uploadMethod === 'text'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Paste Data
          </button>
        </div>
      </div>

      {uploadMethod === 'file' ? (
        /* File Upload */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-12 w-12 mx-auto mb-4 ${
            isDragActive ? 'text-primary-600' : 'text-gray-400'
          }`} />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports CSV and JSON files (max 5MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Text Upload */
        <div className="space-y-4">
          <textarea
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            placeholder="Paste your CSV or JSON data here..."
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
            disabled={isUploading}
          />
          
          <button
            onClick={uploadText}
            disabled={isUploading || !textData.trim()}
            className="btn-primary w-full"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Data'
            )}
          </button>
        </div>
      )}

      {/* Upload Success */}
      {uploadData && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div className="flex-1">
              <p className="text-success-800 dark:text-success-200 font-medium">
                Upload successful!
              </p>
              <div className="text-sm text-success-700 dark:text-success-300 mt-1">
                <p>File: {uploadData.fileName}</p>
                <p>Size: {formatFileSize(uploadData.fileSize)}</p>
                <p>Rows parsed: {uploadData.meta?.rowsParsed || 0}</p>
                <p>Data quality: {uploadData.meta?.dataScore || 0}%</p>
              </div>
            </div>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 btn-secondary"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide' : 'Show'} Data Preview</span>
          </button>
        </div>
      )}

      {/* Data Preview */}
      {showPreview && previewData && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Data Preview (First 20 rows)
          </h3>
          <DataPreview data={previewData.data} />
        </div>
      )}

      {/* Validation Warnings */}
      {uploadData && uploadData.meta?.dataScore < 100 && (
        <div className="flex items-start space-x-2 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
          <div>
            <p className="text-warning-800 dark:text-warning-200 font-medium">
              Data Quality Warning
            </p>
            <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
              Some rows couldn't be parsed correctly. This may affect the analysis accuracy.
              Data quality score: {uploadData.meta?.dataScore || 0}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStep;