'use client';

/**
 * SimplifiedView Component
 * 
 * Displays document simplification results with:
 * - Multi-tier reading level switcher (5th Grade, General Adult, Legal Expert)
 * - Original ↔ Simplified view toggle
 * - Section-by-section breakdown with importance tags
 * - Interactive Jargon Glossary & term definitions
 */

import { useState } from 'react';

const READING_LEVELS = [
  { key: '5th-grade', label: '🧒 5th Grade', description: 'Simple words, everyday analogies, zero jargon' },
  { key: 'general', label: '👤 General Adult', description: 'Clear conversational English for general readers' },
  { key: 'expert', label: '⚖️ Legal Expert', description: 'In-depth legal breakdown with contractual mechanics' },
];

export default function SimplifiedView({ data }) {
  const [viewMode, setViewMode] = useState('simplified');
  const [readingLevel, setReadingLevel] = useState('general');

  if (!data) return null;

  // Select appropriate summary by reading level
  const getSummaryText = () => {
    if (readingLevel === '5th-grade' && data.summaryFifthGrade) {
      return data.summaryFifthGrade;
    }
    if (readingLevel === 'expert' && data.summaryExpert) {
      return data.summaryExpert;
    }
    return data.summary;
  };

  // Select appropriate section text by reading level and view mode
  const getSectionText = (section) => {
    if (viewMode === 'original') {
      return section.originalText || section.simplifiedText;
    }
    if (readingLevel === '5th-grade' && section.simplifiedFifthGrade) {
      return section.simplifiedFifthGrade;
    }
    if (readingLevel === 'expert' && section.simplifiedExpert) {
      return section.simplifiedExpert;
    }
    return section.simplifiedText;
  };

  const activeLevelConfig = READING_LEVELS.find(l => l.key === readingLevel) || READING_LEVELS[1];

  return (
    <div>
      {/* Document header */}
      <div className="glass-card glass-card--accent" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
              {data.title || 'Document Analysis'}
            </h2>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {data.documentType && <span className="badge badge--accent">{data.documentType}</span>}
              {data.readingLevel && <span className="badge badge--info">Original Level: {data.readingLevel}</span>}
            </div>
          </div>
        </div>
        {data.tldr && (
          <p style={{ marginTop: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic' }}>
            <strong>⚡ TL;DR:</strong> {data.tldr}
          </p>
        )}
      </div>

      {/* Reading Level Selector */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 'var(--space-2xs)' }}>
              🎯 Adjustable Reading Level
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {activeLevelConfig.description}
            </div>
          </div>

          <div className="reading-level-bar" role="group" aria-label="Reading Level Options">
            {READING_LEVELS.map(level => (
              <button
                key={level.key}
                className={`reading-level-btn ${readingLevel === level.key ? 'reading-level-btn--active' : ''}`}
                onClick={() => setReadingLevel(level.key)}
                id={`reading-level-${level.key}`}
                title={level.description}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {getSummaryText() && (
        <div className="analysis-section">
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
            <h3 className="analysis-section__title" style={{ marginBottom: 0 }}>📋 Document Summary</h3>
            <span className="badge badge--info">{activeLevelConfig.label} View</span>
          </div>
          <div className="glass-card">
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.92rem' }}>
              {getSummaryText()}
            </p>
          </div>
        </div>
      )}

      {/* Section-by-section breakdown */}
      {data.sections && data.sections.length > 0 && (
        <div className="analysis-section">
          <div className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
            <div>
              <h3 className="analysis-section__title" style={{ marginBottom: 'var(--space-2xs)' }}>📑 Section Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Showing {data.sections.length} clauses in {viewMode === 'simplified' ? `${activeLevelConfig.label}` : 'Original'} text
              </p>
            </div>
            <div className="simplified-toggle">
              <button
                className={`simplified-toggle__btn ${viewMode === 'simplified' ? 'simplified-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('simplified')}
                id="toggle-simplified-btn"
              >
                ✨ Simplified
              </button>
              <button
                className={`simplified-toggle__btn ${viewMode === 'original' ? 'simplified-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('original')}
                id="toggle-original-btn"
              >
                📜 Original
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-md">
            {data.sections.map((section, index) => (
              <div
                key={index}
                className={`glass-card glass-card--risk-${section.importance || 'medium'}`}
              >
                <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {viewMode === 'simplified' ? section.simplifiedHeading : section.originalHeading}
                  </h4>
                  <span className={`badge badge--${section.importance === 'high' ? 'danger' : section.importance === 'low' ? 'success' : 'warning'}`}>
                    {section.importance} importance
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                  {getSectionText(section)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key terms / Glossary with tooltips */}
      {data.keyTerms && data.keyTerms.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">📚 Key Legal Terms Glossary</h3>
          <div className="key-terms">
            {data.keyTerms.map((term, index) => (
              <div key={index} className="key-term">
                <div className="key-term__word">
                  <span className="jargon-term" tabIndex={0}>
                    {term.term}
                    <span className="jargon-tooltip" role="tooltip">
                      💡 {term.definition}
                    </span>
                  </span>
                </div>
                <div className="key-term__definition">{term.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
