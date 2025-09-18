'use client';

import { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  value?: string;
}

export default function FileUpload({ onUpload, value }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { secure_url } = await response.json();
        setPreview(secure_url);
        onUpload(secure_url);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUpload('');
  }

  return (
    <div>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-auto rounded-md" />
          <button 
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
          <label htmlFor="file-upload" className="cursor-pointer text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to upload a file</p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
          </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} />
        </div>
      )}
    </div>
  );
}
