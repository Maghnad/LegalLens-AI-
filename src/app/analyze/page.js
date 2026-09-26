'use client';

/**
 * Document Analysis Page
 * 
 * Upload a document and choose between multiple analysis types:
 * - Simplification
 * - Risk Analysis
 * - Checklists
 * - Lawyer Preparation
 */

import { useState } from 'react';
import FileUpload from '@/components/upload/FileUpload';
import SimplifiedView from '@/components/analysis/SimplifiedView';
import RiskDashboard from '@/components/analysis/RiskDashboard';
import NegotiationView from '@/components/analysis/NegotiationView';
import ChecklistView from '@/components/checklist/ChecklistView';
import LawyerPrep from '@/components/checklist/LawyerPrep';
import ExportReportBar from '@/components/layout/ExportReportBar';
import Footer from '@/components/layout/Footer';

const ANALYSIS_TYPES = [
  { key: 'simplify', label: '✨ Simplify', description: 'Get a plain-English breakdown with reading levels' },
  { key: 'risk', label: '🔍 Risk Analysis', description: 'Find risks and obligations' },
  { key: 'negotiate', label: '💬 Negotiation & Redlines', description: 'Balanced clause suggestions and talking points' },
  { key: 'checklist', label: '✅ Checklist & Calendar', description: 'Actionable to-dos and .ics deadline export' },
  { key: 'lawyer-prep', label: '🧑‍⚖️ Lawyer Prep', description: 'Prepare for consultation' },
];

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('simplify');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysisType', analysisType);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Analysis failed');
        return;
      }

      setResult(data.result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze document. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function renderResult() {
    if (!result) return null;

    switch (analysisType) {
      case 'simplify':
        return <SimplifiedView data={result} />;
      case 'risk':
        return <RiskDashboard data={result} />;
      case 'negotiate':
        return <NegotiationView data={result} />;
      case 'checklist':
        return <ChecklistView data={result} />;
      case 'lawyer-prep':
        return <LawyerPrep data={result} />;
      default:
        return <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{JSON.stringify(result, null, 2)}</pre>;
    }
  }

  return (
    <main>
      <h2 className="section-title">Document Analysis</h2>
      <p className="section-subtitle">
        Upload a legal document and select an analysis type to get started.
      </p>

      <Footer />

      {/* File Upload */}
      <FileUpload
        onFileSelect={setFile}
        id="analyze-upload"
        label="Upload your legal document"
        sublabel="Drag & drop or click — supports PDF, DOCX, TXT (max 10MB)"
      />

      {/* Analysis Type Selection */}
      {file && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            Choose Analysis Type
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
            {ANALYSIS_TYPES.map(type => (
              <button
                key={type.key}
                className={`glass-card ${analysisType === type.key ? 'glass-card--accent' : ''}`}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: analysisType === type.key ? '1px solid var(--color-accent)' : undefined,
                }}
                onClick={() => { setAnalysisType(type.key); setResult(null); }}
                id={`type-${type.key}`}
              >
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                  {type.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {type.description}
                </div>
              </button>
            ))}
          </div>

          <button
            className="btn btn--primary btn--lg w-full"
            style={{ marginTop: 'var(--space-lg)' }}
            onClick={handleAnalyze}
            disabled={isLoading}
            id="analyze-btn"
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing document...
              </>
            ) : (
              <>🔬 Analyze Document</>
            )}
          </button>
        </div>
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
            AI is analyzing your document... This may take a moment.
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-xl)' }}>
            <ExportReportBar
              analysisType={analysisType}
              data={result}
              docTitle={file?.name || 'Legal Document'}
            />
            {renderResult()}
          </div>
        </div>
      )}
    </main>
  );
}
