"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  folder?: string;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  url?: string;
}

export default function FileUpload({
  onUpload,
  accept = "image/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  folder = "general",
  className = ""
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    if (accept && accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
      });

      if (!isValidType) {
        return `File type not allowed. Accepted: ${accept}`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validatedFiles: UploadedFile[] = fileArray.map(file => {
      const error = validateFile(file);
      const id = Math.random().toString(36).substr(2, 9);
      
      return {
        id,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploading: false,
        uploaded: false,
        error: error || undefined
      };
    });

    setFiles(prev => [...prev, ...validatedFiles]);
  }, [files.length, maxFiles, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    const validFiles = files.filter(f => !f.error && !f.uploaded);
    
    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      return;
    }

    // Set uploading state
    setFiles(prev => prev.map(f => 
      validFiles.some(vf => vf.id === f.id) 
        ? { ...f, uploading: true }
        : f
    ));

    try {
      await onUpload(validFiles.map(f => f.file));
      
      // Set uploaded state
      setFiles(prev => prev.map(f => 
        validFiles.some(vf => vf.id === f.id) 
          ? { ...f, uploading: false, uploaded: true }
          : f
      ));
      
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      // Set error state
      setFiles(prev => prev.map(f => 
        validFiles.some(vf => vf.id === f.id) 
          ? { ...f, uploading: false, error: 'Upload failed' }
          : f
      ));
      
      toast.error('Upload failed');
    }
  }, [files, onUpload]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length > 0 ? 'mt-4' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept} (max {maxSize}MB per file)
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {file.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <File className="w-10 h-10 text-gray-400" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                
                {file.uploaded && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                
                {file.error && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={uploadFiles}
            disabled={files.some(f => f.uploading || f.error)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload {files.filter(f => !f.uploaded && !f.error).length} file(s)
          </button>
        </div>
      )}

      {/* Error Messages */}
      {files.some(f => f.error) && (
        <div className="mt-2 space-y-1">
          {files
            .filter(f => f.error)
            .map((file) => (
              <p key={file.id} className="text-sm text-red-600">
                {file.file.name}: {file.error}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}