'Use client';

import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'A/components/ui/card';

interface Branch {
  id: string;
  name: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
}

export default function UploadPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  React.useEffect(() => {
    // Fetch branches from API
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        if (response.ok) {
          const data = await response.json();
          setBranches(data.branches || []);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedBranch) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a branch first',
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branchId', selectedBranch);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (response.ok && data.success) {
        setUploadStatus({
          type: 'success',
          message: `File uploaded successfully: ${file.name}`,
        });
        setSelectedBranch('');
      } else {
        setUploadStatus({
          type: 'error',
          message: data.message || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Upload Sales Data</h1>
        <p className="text-zinc-400">
          Import CSV files with sales records for your branches
        </p>
      </div>

      {/* Upload Card */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle>Select Branch & Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Branch Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Select Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={isLoadingBranches || isUploading}
              className="w-full"
            >
              <option value="">Choose a branch...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {isLoadingBranches && (
              <p className="text-xs text-zinc-500 mt-1">Loading branches...</p>
            )}
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-500/5'
                : 'bordex­zinc-700 hover:border-purple-500.50'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-purple-500/10 rounded-lg">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-zinc-400">or click to browse</p>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                disabled={isUploading}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                disabled={isUploading}
                className="mt-4 px-6 py-2 bg-gradient-purple text-white rounded-lg font-medium hover:shadow-lg transition-smooth disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </button>
            </div>
          </div>

          {/* Upload Status Messages */}
          {uploadStatus.type && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                uploadStatus.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500.30'
              }`}
            >
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <p
                className={
                  uploadStatus.type === 'success'
                    ? 'text-green-400 text-sm'
                    : 'text-red-400 text-sm'
                }
              >
                {uploadStatus.message}
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isUploading && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-blue-400 text-sm">Uploading file...</p>
            </div>
          )}

          {/* File Requirements */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-white mb-3">
              CSV File Requirements
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="text-purple-400">â€¢</span>
                <span>File must be in CSV format (.csv)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">â€¢</span>
                <span>Maximum file size: 50MB</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">â€¢</span>
                <span>Required columns: date, amount, refund, partner_id</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">â€¢</span>
                <span>Date format: YYYY-MM-DD</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
  
  Hattp:)…¸ø(€€€€€€€€€€€€€€ğ½±¤ø(€€€€€€€€€€€€ğ½Õ°ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€ğ½…É‘½¹Ñ•¹Ğø(€€€€€€ğ½…Éø(€€(€€=!…ÑÑÀè