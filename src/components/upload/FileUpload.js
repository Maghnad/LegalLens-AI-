'use client';

/**
 * FileUpload Component
 * 
 * Drag-and-drop file upload with validation and preview.
 * Supports PDF, DOCX, and TXT files.
 */

import { useRef, useState, useCallback } from 'react';
import { formatFileSize } from '@/utils/fileHelpers';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/validators';

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.docx,.txt',
  multiple = false,
  maxFiles = 2,
  label = 'Upload Legal Document',
  sublabel = 'Supports PDF, DOCX, and TXT files (max 10MB)',
  id = 'file-upload',
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const validateFile = useCallback((file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `"${file.name}" is not a supported file type. Use ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const handleFiles = useCallback((fileList) => {
    setError('');
    const newFiles = Array.from(fileList).slice(0, maxFiles);

    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setFiles(newFiles);
    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : newFiles[0]);
    }
  }, [maxFiles, multiple, onFileSelect, validateFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : newFiles[0] || null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { pdf: '📕', docx: '📘', txt: '📄' };
    return icons[ext] || '📄';
  };

  return (
    <div>
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        aria-label={label}
        id={id}
      >
        <span className="upload-zone__icon" aria-hidden="true">📂</span>
        <p className="upload-zone__text">{label}</p>
        <p className="upload-zone__subtext">{sublabel}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="upload-zone__input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <div className="disclaimer-banner" style={{ marginTop: 'var(--space-md)', background: 'var(--color-danger-bg)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-danger)' }}>
          <span className="disclaimer-banner__icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-preview">
              <span className="file-preview__icon" aria-hidden="true">{getFileIcon(file.name)}</span>
              <div className="file-preview__info">
                <div className="file-preview__name">{file.name}</div>
                <div className="file-preview__size">{formatFileSize(file.size)}</div>
              </div>
              <button
                className="file-preview__remove"
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                aria-label={`Remove ${file.name}`}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
