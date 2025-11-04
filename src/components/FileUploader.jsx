/**
 * FILE: src/components/FileUploader.jsx
 * PURPOSE: Drag & drop file uploader for raw data ingestion
 * 
 * FEATURES:
 * - Drag & drop interface
 * - File type validation
 * - Template downloads
 * - Organization selection
 * - Upload progress
 * - File preview
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Check, AlertCircle, X } from 'lucide-react';

export default function FileUploader({ 
  onUploadComplete, 
  isDarkMode,
  allowedOrganizations = ['ILO', 'SDG', 'UNICEF', 'WHO']
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('ILO');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const allowedFileTypes = [
    '.csv',
    '.xlsx',
    '.xls',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const getOrgEmoji = (org) => {
    const emojis = {
      'ILO': '🏆',
      'SDG': '🎯',
      'UNICEF': '👶',
      'WHO': '🏥'
    };
    return emojis[org] || '📊';
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFile = (file) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = allowedFileTypes.includes(fileExtension) || allowedFileTypes.includes(file.type);
    
    if (!isValidType) {
      setUploadStatus('error');
      setErrorMessage('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setErrorMessage('File too large. Maximum size is 50MB.');
      return;
    }
    
    setUploadedFile(file);
    setUploadStatus(null);
    setErrorMessage('');
    
    // Generate file preview
    if (file.type === 'text/csv' || fileExtension === '.csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(0, 5); // First 5 lines
        setFilePreview({
          type: 'csv',
          content: lines
        });
      };
      reader.readAsText(file);
    } else {
      setFilePreview({
        type: 'excel',
        content: null
      });
    }
  };
  
  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    
    try {
      // Simulate upload with progress
      // TODO: Replace with actual API call
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('organization', selectedOrg);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }
      
      // Success
      setUploadStatus('success');
      setIsUploading(false);
      
      // Call callback
      if (onUploadComplete) {
        onUploadComplete({
          fileName: uploadedFile.name,
          organization: selectedOrg,
          size: uploadedFile.size,
          uploadDate: new Date().toISOString()
        });
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        setUploadedFile(null);
        setFilePreview(null);
        setUploadProgress(0);
        setUploadStatus(null);
      }, 2000);
      
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };
  
  const handleReset = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    setUploadStatus(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDownloadTemplate = () => {
    const templateFile = `${selectedOrg.toLowerCase()}-template.csv`;
    const link = document.createElement('a');
    link.href = `/datacommons/templates/${templateFile}`;
    link.download = templateFile;
    link.click();
  };
  
  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📤 Upload Raw Data
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Upload CSV or Excel files to start the ingestion pipeline
        </p>
      </div>
      
      <div className="p-6">
        {/* Organization Selector */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Select Organization
          </label>
          <div className="grid grid-cols-4 gap-3">
            {allowedOrganizations.map((org) => (
              <button
                key={org}
                onClick={() => setSelectedOrg(org)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedOrg === org
                    ? 'border-blue-500 bg-blue-500/10'
                    : isDarkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">{getOrgEmoji(org)}</div>
                <div className={`text-sm font-medium ${
                  selectedOrg === org 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {org}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Template Download */}
        <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                📋 Need a template?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Download the {selectedOrg} CSV template with required columns
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : isDarkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!uploadedFile ? (
            <>
              <div className={`mb-4 ${isDragging ? 'scale-110' : ''} transition-transform`}>
                <Upload className={`h-16 w-16 mx-auto ${
                  isDragging 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
              </div>
              
              <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </h4>
              
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                or click to browse
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Select File
              </button>
              
              <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 50MB
              </p>
            </>
          ) : (
            <>
              {/* File Info */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      uploadStatus === 'success' 
                        ? 'bg-green-500/10' 
                        : uploadStatus === 'error'
                        ? 'bg-red-500/10'
                        : 'bg-blue-500/10'
                    }`}>
                      {uploadStatus === 'success' ? (
                        <Check className="h-6 w-6 text-green-500" />
                      ) : uploadStatus === 'error' ? (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <FileText className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {uploadedFile.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(uploadedFile.size / 1024).toFixed(2)} KB • {selectedOrg}
                      </div>
                    </div>
                  </div>
                  
                  {!isUploading && uploadStatus !== 'success' && (
                    <button
                      onClick={handleReset}
                      className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  )}
                </div>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Uploading...
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Status Messages */}
                {uploadStatus === 'success' && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                    <p className="text-sm text-green-500 font-medium">
                      ✓ Upload successful! File added to ingestion queue.
                    </p>
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                    <p className="text-sm text-red-500 font-medium">
                      ✗ {errorMessage}
                    </p>
                  </div>
                )}
                
                {/* File Preview */}
                {filePreview && filePreview.type === 'csv' && (
                  <div className="mb-4">
                    <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Preview (first 5 lines):
                    </h5>
                    <pre className={`text-xs p-3 rounded overflow-x-auto font-mono ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {filePreview.content.join('\n')}
                    </pre>
                  </div>
                )}
                
                {/* Action Buttons */}
                {!isUploading && uploadStatus !== 'success' && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
                    >
                      Upload to {selectedOrg}
                    </button>
                    <button
                      onClick={handleReset}
                      className={`px-4 py-2 rounded-lg border font-medium ${
                        isDarkMode 
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

