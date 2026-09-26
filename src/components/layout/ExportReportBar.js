'use client';

/**
 * ExportReportBar Component
 * 
 * Provides 1-click actions to:
 * - Print / Save as PDF
 * - Download full analysis as Markdown (.md)
 * - Copy summary to clipboard
 */

import { useState } from 'react';
import { generateMarkdownReport, downloadTextReport, triggerPrintReport } from '@/utils/reportExport';

export default function ExportReportBar({ analysisType, data, docTitle }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleDownload = () => {
    const reportText = generateMarkdownReport(analysisType, data, docTitle);
    const filename = `${docTitle || 'legal-analysis'}-${analysisType}-report`;
    downloadTextReport(filename, reportText);
  };

  const handleCopy = async () => {
    try {
      const reportText = generateMarkdownReport(analysisType, data, docTitle);
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="glass-card" style={{
      marginBottom: 'var(--space-xl)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-md)',
      flexWrap: 'wrap',
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
      border: '1px solid rgba(99, 102, 241, 0.25)',
    }}>
      <div className="flex items-center gap-sm">
        <span style={{ fontSize: '1.25rem' }}>📑</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Analysis Complete</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Export your report for records or offline lawyer consultation
          </div>
        </div>
      </div>

      <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
        <button
          className="btn btn--secondary btn--sm"
          onClick={triggerPrintReport}
          id="export-pdf-btn"
          title="Open print preview to print or Save as PDF"
        >
          🖨️ Export PDF / Print
        </button>

        <button
          className="btn btn--secondary btn--sm"
          onClick={handleDownload}
          id="export-md-btn"
          title="Download complete structured report as Markdown (.md)"
        >
          📥 Download Report
        </button>

        <button
          className="btn btn--ghost btn--sm"
          onClick={handleCopy}
          id="copy-report-btn"
          title="Copy full analysis text to clipboard"
        >
          {copied ? '✅ Copied!' : '📋 Copy Text'}
        </button>
      </div>
    </div>
  );
}
