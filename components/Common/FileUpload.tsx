
import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, maxSizeMB = 50 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File is too large (${sizeInMB.toFixed(2)}MB). Maximum allowed is ${maxSizeMB}MB.`);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div 
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border bg-light/50'
        }`}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleChange}
        />
        {!selectedFile ? (
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center text-secondary">
              <Upload size={20} />
            </div>
            <p className="text-sm text-dark font-medium">Click or drag proof of evidence here</p>
            <p className="text-xs text-secondary">PDF, Excel, Word (Max {maxSizeMB}MB)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-3 border border-success/30 rounded-sm">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={24} />
              <div className="text-left">
                <p className="text-sm font-semibold text-dark truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-[10px] text-secondary">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-success" size={18} />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="p-1 hover:bg-light rounded text-secondary"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-alert text-[11px] font-bold uppercase">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
