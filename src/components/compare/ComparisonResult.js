'use client';

/**
 * ComparisonResult Component
 * 
 * Displays the results of comparing two legal documents with diff visualization.
 */

import { getCategoryIcon } from '@/utils/formatters';
import ExportReportBar from '@/components/layout/ExportReportBar';

export default function ComparisonResult({ data }) {
  if (!data) return null;

  const significanceColors = {
    low: { badge: 'info', border: 'var(--color-info)' },
    medium: { badge: 'warning', border: 'var(--color-warning)' },
    high: { badge: 'danger', border: 'var(--color-danger)' },
    critical: { badge: 'critical', border: 'var(--color-critical)' },
  };

  const categoryClass = {
    Addition: 'addition',
    Removal: 'removal',
    Modification: 'modification',
    Reworded: 'reworded',
  };

  return (
    <div>
      <ExportReportBar
        analysisType="compare"
        data={data}
        docTitle={`${data.documentA?.title || 'Doc A'} vs ${data.documentB?.title || 'Doc B'}`}
      />
      {/* Overview */}
      <div className="glass-card glass-card--accent" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
          📊 Comparison Summary
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: 'var(--space-md)' }}>
          {data.summaryOfChanges}
        </p>

        {/* Document labels */}
        <div className="diff-container" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.documentA?.title || 'Document A'}</div>
              {data.documentA?.type && <span className="badge badge--info">{data.documentA.type}</span>}
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.2rem' }}>📄</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.documentB?.title || 'Document B'}</div>
              {data.documentB?.type && <span className="badge badge--accent">{data.documentB.type}</span>}
            </div>
          </div>
        </div>

        {/* Overall assessment */}
        {data.overallAssessment && (
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }}>
            <strong>Assessment:</strong> {data.overallAssessment}
          </div>
        )}
        {data.recommendation && (
          <div style={{ padding: 'var(--space-md)', background: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-info)', fontSize: '0.88rem' }}>
            💡 <strong>Recommendation:</strong> {data.recommendation}
          </div>
        )}
      </div>

      {/* Differences */}
      {data.differences && data.differences.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">
            🔍 Detailed Differences ({data.differences.length})
          </h3>
          <div className="flex flex-col gap-md">
            {data.differences.map((diff, i) => {
              const sig = significanceColors[diff.significance] || significanceColors.medium;
              const catClass = categoryClass[diff.category] || 'modification';

              return (
                <div key={i} className="glass-card" style={{ borderLeft: `3px solid ${sig.border}` }}>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                      <span>{getCategoryIcon(diff.category)}</span>
                      <span className={`badge badge--${sig.badge}`}>{diff.category}</span>
                      {diff.section && (
                        <span className="text-sm text-muted">in {diff.section}</span>
                      )}
                    </div>
                    <span className={`badge badge--${sig.badge}`}>{diff.significance} impact</span>
                  </div>

                  {/* Side-by-side diff */}
                  <div className="diff-container" style={{ marginBottom: 'var(--space-md)' }}>
                    <div className={`diff-item diff-item--${diff.category === 'Addition' ? 'removal' : catClass}`}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Document A
                      </div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {diff.documentAText || 'Not present'}
                      </p>
                    </div>
                    <div className={`diff-item diff-item--${diff.category === 'Removal' ? 'removal' : 'addition'}`}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--space-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Document B
                      </div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {diff.documentBText || 'Not present'}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-xs)' }}>
                    {diff.explanation}
                  </p>
                  {diff.impact && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-warning)', marginTop: 'var(--space-xs)' }}>
                      ⚡ Impact: {diff.impact}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
