'use client';

/**
 * LawyerPrep Component
 * 
 * Displays lawyer preparation analysis with briefing, questions, and recommendations.
 */

export default function LawyerPrep({ data }) {
  if (!data) return null;

  const complexityColors = {
    simple: { badge: 'success', label: 'Simple Case' },
    moderate: { badge: 'warning', label: 'Moderate Complexity' },
    complex: { badge: 'danger', label: 'Complex Case' },
  };

  const complexity = complexityColors[data.estimatedComplexity] || complexityColors.moderate;
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return (
    <div>
      {/* Complexity & lawyer type header */}
      <div className="glass-card glass-card--accent" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          <span className={`badge badge--${complexity.badge}`}>
            {complexity.label}
          </span>
          {data.suggestedLawyerType && (
            <span className="badge badge--info">
              🧑‍⚖️ Suggested: {data.suggestedLawyerType}
            </span>
          )}
        </div>
        
        {/* Briefing summary */}
        {data.briefingSummary && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
              📝 Briefing Summary
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {data.briefingSummary}
            </p>
          </div>
        )}
      </div>

      {/* Areas needing review */}
      {data.areasNeedingReview && data.areasNeedingReview.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">🔍 Areas Needing Professional Review</h3>
          <div className="flex flex-col gap-sm">
            {[...data.areasNeedingReview]
              .sort((a, b) => (priorityOrder[a.urgency] ?? 1) - (priorityOrder[b.urgency] ?? 1))
              .map((area, i) => (
                <div key={i} className={`glass-card glass-card--risk-${area.urgency === 'high' ? 'high' : area.urgency === 'low' ? 'low' : 'medium'}`}>
                  <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{area.area}</h4>
                    <span className={`badge badge--${area.urgency === 'high' ? 'danger' : area.urgency === 'low' ? 'success' : 'warning'}`}>
                      {area.urgency} urgency
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {area.reason}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Questions to ask */}
      {data.questionsToAsk && data.questionsToAsk.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">❓ Questions to Ask Your Lawyer</h3>
          <div className="flex flex-col gap-sm">
            {[...data.questionsToAsk]
              .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
              .map((q, i) => (
                <div key={i} className="glass-card">
                  <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {q.question}
                    </h4>
                    <span className={`badge badge--${q.priority === 'high' ? 'danger' : q.priority === 'low' ? 'success' : 'warning'}`}>
                      {q.priority}
                    </span>
                  </div>
                  {q.context && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, background: 'var(--color-bg-surface)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                      💡 Context to share: {q.context}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Documents to gather */}
      {data.documentsToGather && data.documentsToGather.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">📂 Documents to Bring</h3>
          <div className="flex flex-col gap-sm">
            {data.documentsToGather.map((doc, i) => (
              <div key={i} className="glass-card">
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--space-xs)' }}>
                  📄 {doc.document}
                </div>
                <p className="text-sm text-muted">{doc.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
