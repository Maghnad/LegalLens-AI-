'use client';

/**
 * Contract Comparison Page
 * 
 * Upload two documents side-by-side and get AI-powered comparison.
 */

import { useState } from 'react';
import FileUpload from '@/components/upload/FileUpload';
import ComparisonResult from '@/components/compare/ComparisonResult';
import Footer from '@/components/layout/Footer';

export default function ComparePage() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCompare() {
    if (!fileA || !fileB) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('fileA', fileA);
      formData.append('fileB', fileB);

      const res = await fetch('/api/compare', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Comparison failed');
        return;
      }

      setResult(data.result);
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Failed to compare documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h2 className="section-title">Contract Comparison</h2>
      <p className="section-subtitle">
        Upload two legal documents to compare them side by side. AI will identify key differences, 
        additions, removals, and their significance.
      </p>

      <Footer />

      {/* Two upload zones */}
      <div className="diff-container" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            📄 Document A (Original / Earlier Version)
          </h3>
          <FileUpload
            onFileSelect={setFileA}
            id="compare-upload-a"
            label="Upload Document A"
            sublabel="The original or baseline document"
          />
        </div>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            📄 Document B (Revised / Newer Version)
          </h3>
          <FileUpload
            onFileSelect={setFileB}
            id="compare-upload-b"
            label="Upload Document B"
            sublabel="The revised or comparison document"
          />
        </div>
      </div>

      {/* Compare Button */}
      {fileA && fileB && (
        <button
          className="btn btn--primary btn--lg w-full"
          onClick={handleCompare}
          disabled={isLoading}
          id="compare-btn"
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Comparing documents...
            </>
          ) : (
            <>⚖️ Compare Documents</>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="disclaimer-banner" style={{ marginTop: 'var(--space-lg)', background: 'var(--color-danger-bg)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-danger)' }}>
          <span className="disclaimer-banner__icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner spinner--lg" />
          <div className="loading-overlay__text">
            AI is comparing your documents... This may take a moment.
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-xl)' }}>
          <ComparisonResult data={result} />
        </div>
      )}
    </main>
  );
}
