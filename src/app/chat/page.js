'use client';

/**
 * Document Q&A Chat Page
 * 
 * Upload a document and chat with AI about it.
 */

import { useState } from 'react';
import FileUpload from '@/components/upload/FileUpload';
import ChatWindow from '@/components/chat/ChatWindow';
import Footer from '@/components/layout/Footer';

export default function ChatPage() {
  const [file, setFile] = useState(null);
  const [documentContext, setDocumentContext] = useState('');
  const [isReady, setIsReady] = useState(false);

  function handleFileSelect(selectedFile) {
    setFile(selectedFile);
    if (selectedFile) {
      setDocumentContext(`Document: ${selectedFile.name} (${selectedFile.type})`);
      setIsReady(true);
    } else {
      setIsReady(false);
      setDocumentContext('');
    }
  }

  return (
    <main>
      <h2 className="section-title">Document Q&A</h2>
      <p className="section-subtitle">
        Upload a legal document and ask questions about it. Get instant, AI-powered answers 
        grounded in your document&apos;s content.
      </p>

      <Footer />

      {/* File Upload (collapsed when file is selected) */}
      {!isReady ? (
        <FileUpload
          onFileSelect={handleFileSelect}
          id="chat-upload"
          label="Upload a document to start chatting"
          sublabel="Your document will be used as context for the Q&A"
        />
      ) : (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="file-preview">
            <span className="file-preview__icon" aria-hidden="true">
              {file?.name?.endsWith('.pdf') ? '📕' : '📄'}
            </span>
            <div className="file-preview__info">
              <div className="file-preview__name">{file?.name}</div>
              <div className="file-preview__size">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                {' · '}Ready for Q&A
              </div>
            </div>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => { setFile(null); setIsReady(false); }}
              aria-label="Change document"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isReady && (
        <ChatWindow
          documentContext={documentContext}
          documentFile={file}
        />
      )}
    </main>
  );
}
