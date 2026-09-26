'use client';

/**
 * NegotiationView Component
 * 
 * Interactive negotiation assistant:
 * - Balanced alternative clause suggestions with editable copy-paste text
 * - Negotiation talking points & persuasive scripts for counteroffers
 * - Fallback positions & compromise strategies
 */

import { useState } from 'react';

export default function NegotiationView({ data }) {
  const [activeTab, setActiveTab] = useState('clauses');
  const [copiedId, setCopiedId] = useState(null);
  const [editedClauses, setEditedClauses] = useState({});
  const [checkedPoints, setCheckedPoints] = useState({});

  if (!data) return null;

  const handleCopyClause = async (id, text) => {
    try {
      const textToCopy = editedClauses[id] !== undefined ? editedClauses[id] : text;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      // Fallback
    }
  };

  const handleClauseChange = (id, newText) => {
    setEditedClauses(prev => ({ ...prev, [id]: newText }));
  };

  const togglePointChecked = (id) => {
    setCheckedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { key: 'clauses', label: '📝 Balanced Clause Suggestions', count: data.clauseSuggestions?.length || 0 },
    { key: 'scripts', label: '🗣️ Negotiation Talking Points', count: data.talkingPoints?.length || 0 },
  ];

  return (
    <div>
      {/* Negotiation Overview Card */}
      <div className="glass-card glass-card--accent" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: '1.3rem' }}>💬</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Negotiation & Balanced Redlines
            </h3>
          </div>
          {data.documentType && (
            <span className="badge badge--accent">{data.documentType}</span>
          )}
        </div>

        {data.negotiationSummary && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginTop: 'var(--space-sm)' }}>
            {data.negotiationSummary}
          </p>
        )}

        <div style={{
          marginTop: 'var(--space-md)',
          padding: 'var(--space-sm) var(--space-md)',
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--color-warning)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)'
        }}>
          <span>⚠️</span>
          <strong>Note:</strong> Alternative clauses are balanced starting points. Always adapt them to your specific circumstances and verify with an attorney.
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" style={{ marginBottom: 'var(--space-xl)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            id={`tab-${tab.key}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Balanced Clauses Tab */}
      {activeTab === 'clauses' && data.clauseSuggestions && (
        <div className="flex flex-col gap-lg">
          {data.clauseSuggestions.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No specific clause revisions recommended.</p>
            </div>
          ) : (
            data.clauseSuggestions.map((item, index) => {
              const currentText = editedClauses[item.id || index] !== undefined 
                ? editedClauses[item.id || index] 
                : item.suggestedText;

              return (
                <div key={item.id || index} className="glass-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
                  <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                      <span className="badge badge--accent">{item.id || `CLAUSE-${index + 1}`}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                        {item.clauseName}
                      </h4>
                    </div>
                    {item.importance && (
                      <span className={`badge badge--${item.importance === 'high' ? 'danger' : item.importance === 'low' ? 'success' : 'warning'}`}>
                        {item.importance} priority
                      </span>
                    )}
                  </div>

                  {/* Problem with original */}
                  {item.issue && (
                    <div style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--color-danger)',
                      marginBottom: 'var(--space-md)'
                    }}>
                      <strong>Concern with current wording:</strong> {item.issue}
                    </div>
                  )}

                  {/* Original excerpt if available */}
                  {item.originalText && (
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2xs)' }}>
                        📜 Current / Problematic Text:
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-sm)',
                        fontStyle: 'italic',
                        borderLeft: '2px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        "{item.originalText}"
                      </div>
                    </div>
                  )}

                  {/* Editable Proposed Balanced Clause */}
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-2xs)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                        ✨ Proposed Balanced Replacement (Editable):
                      </div>
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopyClause(item.id || index, item.suggestedText)}
                        style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        id={`copy-clause-${index}`}
                      >
                        {copiedId === (item.id || index) ? '✅ Copied to Clipboard!' : '📋 Copy Suggestion'}
                      </button>
                    </div>

                    <textarea
                      className="clause-editor"
                      value={currentText}
                      onChange={(e) => handleClauseChange(item.id || index, e.target.value)}
                      aria-label={`Editable replacement text for ${item.clauseName}`}
                    />
                  </div>

                  {/* Rationale & Benefit */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-sm)' }}>
                    {item.rationale && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-info)', background: 'var(--color-info-bg)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                        🤝 <strong>Counterparty Rationale:</strong> {item.rationale}
                      </div>
                    )}
                    {item.benefit && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-success)', background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                        🛡️ <strong>Protection for You:</strong> {item.benefit}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Talking Points Tab */}
      {activeTab === 'scripts' && data.talkingPoints && (
        <div className="flex flex-col gap-md">
          {data.talkingPoints.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No specific talking points generated.</p>
            </div>
          ) : (
            data.talkingPoints.map((point, index) => {
              const isChecked = !!checkedPoints[point.id || index];

              return (
                <div
                  key={point.id || index}
                  className={`glass-card ${isChecked ? 'glass-card--completed' : ''}`}
                  style={{ opacity: isChecked ? 0.75 : 1 }}
                >
                  <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                      <input
                        type="checkbox"
                        className="checklist-checkbox"
                        checked={isChecked}
                        onChange={() => togglePointChecked(point.id || index)}
                        id={`check-talk-${index}`}
                        aria-label={`Mark talking point for ${point.topic} as addressed`}
                      />
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0, textDecoration: isChecked ? 'line-through' : 'none' }}>
                        🗣️ {point.topic}
                      </h4>
                    </div>
                    {point.priority && (
                      <span className={`badge badge--${point.priority === 'high' ? 'danger' : point.priority === 'low' ? 'success' : 'warning'}`}>
                        {point.priority} priority
                      </span>
                    )}
                  </div>

                  {/* Suggested Script */}
                  {point.script && (
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-sm) var(--space-md)',
                      marginBottom: 'var(--space-sm)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: 'var(--space-2xs)' }}>
                        💬 Suggested Phrasing to Counterparty:
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{point.script}"
                      </p>
                    </div>
                  )}

                  {/* Objective & Fallback */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-sm)' }}>
                    {point.objective && (
                      <div style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
                        🎯 <strong>Goal:</strong> {point.objective}
                      </div>
                    )}
                    {point.fallbackPosition && (
                      <div style={{ fontSize: '0.83rem', color: 'var(--color-warning)' }}>
                        🔄 <strong>Fallback Compromise:</strong> {point.fallbackPosition}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
