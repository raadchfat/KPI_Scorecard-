import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { UploadedFiles } from '../types';
import { isValidExcelFile, isValidFileSize, formatFileSize } from '../utils/formatters';
import { validateUploadedFiles } from '../services/dataIntegrator';

interface FileUploaderProps {
  onFilesChange: (files: UploadedFiles) => void;
  onValidationComplete: (isValid: boolean, errors: string[]) => void;
}

interface FileUploadState {
  file: File | null;
  isUploaded: boolean;
  error: string | null;
  isDragOver: boolean;
}

export function FileUploader({ onFilesChange, onValidationComplete }: FileUploaderProps) {
  const [fileStates, setFileStates] = useState<Record<keyof UploadedFiles, FileUploadState>>({
    opportunities: { file: null, isUploaded: false, error: null, isDragOver: false },
    lineItems: { file: null, isUploaded: false, error: null, isDragOver: false },
    jobTimes: { file: null, isUploaded: false, error: null, isDragOver: false },
    appointments: { file: null, isUploaded: false, error: null, isDragOver: false }
  });

  const [isValidating, setIsValidating] = useState(false);

  const handleFileUpload = useCallback(async (
    fileType: keyof UploadedFiles,
    file: File
  ) => {
    // Reset error state
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], error: null }
    }));

    // Validate file type
    if (!isValidExcelFile(file)) {
      setFileStates(prev => ({
        ...prev,
        [fileType]: {
          ...prev[fileType],
          file: null,
          isUploaded: false,
          error: 'File must be an Excel file (.xlsx or .xls)'
        }
      }));
      return;
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      setFileStates(prev => ({
        ...prev,
        [fileType]: {
          ...prev[fileType],
          file: null,
          isUploaded: false,
          error: 'File size must be under 10MB'
        }
      }));
      return;
    }

    // Update file state
    setFileStates(prev => ({
      ...prev,
      [fileType]: {
        ...prev[fileType],
        file,
        isUploaded: true,
        error: null
      }
    }));

    // Update parent component
    const currentFiles: UploadedFiles = {
      opportunities: fileStates.opportunities.file,
      lineItems: fileStates.lineItems.file,
      jobTimes: fileStates.jobTimes.file,
      appointments: fileStates.appointments.file
    };
    
    const updatedFiles: UploadedFiles = {
      ...currentFiles,
      [fileType]: file
    };
    
    onFilesChange(updatedFiles);

    // Validate all files
    await validateAllFiles(updatedFiles);
  }, [fileStates, onFilesChange]);

  const validateAllFiles = async (files: UploadedFiles) => {
    setIsValidating(true);
    try {
      const result = await validateUploadedFiles(files);
      onValidationComplete(result.isValid, result.errors);
    } catch (error) {
      onValidationComplete(false, [error instanceof Error ? error.message : 'Validation failed']);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent, fileType: keyof UploadedFiles) => {
    e.preventDefault();
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragOver: true }
    }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, fileType: keyof UploadedFiles) => {
    e.preventDefault();
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragOver: false }
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, fileType: keyof UploadedFiles) => {
    e.preventDefault();
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragOver: false }
    }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(fileType, files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFiles) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(fileType, file);
    }
  }, [handleFileUpload]);

  const removeFile = useCallback((fileType: keyof UploadedFiles) => {
    setFileStates(prev => ({
      ...prev,
      [fileType]: { file: null, isUploaded: false, error: null, isDragOver: false }
    }));

    const currentFiles: UploadedFiles = {
      opportunities: fileStates.opportunities.file,
      lineItems: fileStates.lineItems.file,
      jobTimes: fileStates.jobTimes.file,
      appointments: fileStates.appointments.file
    };
    
    const updatedFiles: UploadedFiles = {
      ...currentFiles,
      [fileType]: null
    };
    
    onFilesChange(updatedFiles);
  }, [fileStates, onFilesChange]);

  const getFileTypeLabel = (fileType: keyof UploadedFiles): string => {
    switch (fileType) {
      case 'opportunities': return 'Opportunities Report';
      case 'lineItems': return 'Line Items Sold Report';
      case 'jobTimes': return 'Job Times Report';
      case 'appointments': return 'Appointments Report';
      default: return fileType;
    }
  };

  const getFileTypeDescription = (fileType: keyof UploadedFiles): string => {
    switch (fileType) {
      case 'opportunities': return 'Sales opportunities and outcomes';
      case 'lineItems': return 'Detailed service/product breakdowns';
      case 'jobTimes': return 'Time efficiency and job completion metrics';
      case 'appointments': return 'Appointment scheduling and completion tracking';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Excel Files</h2>
        <p className="text-gray-600">
          Upload the four required Excel files to generate KPI reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(fileStates) as Array<keyof UploadedFiles>).map((fileType) => {
          const state = fileStates[fileType];
          
          return (
            <div
              key={fileType}
              className={`upload-zone ${
                state.isDragOver ? 'active' : ''
              } ${state.isUploaded ? 'border-green-500 bg-green-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, fileType)}
              onDragLeave={(e) => handleDragLeave(e, fileType)}
              onDrop={(e) => handleDrop(e, fileType)}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">
                      {getFileTypeLabel(fileType)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getFileTypeDescription(fileType)}
                    </p>
                  </div>
                </div>

                {state.isUploaded && state.file ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {state.file.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(state.file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(fileType)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileInput(e, fileType)}
                      className="hidden"
                      id={`file-input-${fileType}`}
                    />
                    <label
                      htmlFor={`file-input-${fileType}`}
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          Excel files only (.xlsx, .xls)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {state.error && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{state.error}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isValidating && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Validating files...</span>
          </div>
        </div>
      )}
    </div>
  );
} 