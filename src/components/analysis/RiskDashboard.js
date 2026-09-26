'use client';

/**
 * RiskDashboard Component
 * 
 * Complete risk analysis dashboard with gauge, stats, obligations, and red flags.
 */

export default function RiskDashboard({ data }) {
  if (!data) return null;

  const riskColors = {
    low: 'var(--color-success)',
    medium: 'var(--color-warning)',
    high: 'var(--color-danger)',
    critical: 'var(--color-critical)',
  };

  const riskPercents = { low: 25, medium: 50, high: 75, critical: 95 };
  const gaugeColor = riskColors[data.overallRiskLevel] || riskColors.medium;
  const gaugePercent = riskPercents[data.overallRiskLevel] || 50;

  return (
    <div>
      {/* Risk Gauge */}
      <div className="risk-meter">
        <div
          className="risk-meter__gauge"
          style={{
            '--gauge-color': gaugeColor,
            '--gauge-percent': `${gaugePercent}%`,
            color: gaugeColor,
          }}
          role="meter"
          aria-valuenow={gaugePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall risk level: ${data.overallRiskLevel}`}
        >
          {data.overallRiskLevel === 'low' ? '✓' : data.overallRiskLevel === 'critical' ? '⛔' : '⚠'}
        </div>
        <div className="risk-meter__info">
          <div className="risk-meter__level" style={{ color: gaugeColor }}>
            {data.overallRiskLevel?.toUpperCase()} RISK
          </div>
          <p className="risk-meter__summary">{data.overallRiskSummary}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="risk-stats">
        <div className="risk-stat">
          <div className="risk-stat__number" style={{ color: 'var(--color-info)' }}>
            {data.obligations?.length || 0}
          </div>
          <div className="risk-stat__label">Obligations</div>
        </div>
        <div className="risk-stat">
          <div className="risk-stat__number" style={{ color: 'var(--color-danger)' }}>
            {data.risks?.length || 0}
          </div>
          <div className="risk-stat__label">Risks Found</div>
        </div>
        <div className="risk-stat">
          <div className="risk-stat__number" style={{ color: 'var(--color-success)' }}>
            {data.rights?.length || 0}
          </div>
          <div className="risk-stat__label">Your Rights</div>
        </div>
        <div className="risk-stat">
          <div className="risk-stat__number" style={{ color: 'var(--color-warning)' }}>
            {data.deadlines?.length || 0}
          </div>
          <div className="risk-stat__label">Key Deadlines</div>
        </div>
      </div>

      {/* Red Flags */}
      {data.redFlags && data.redFlags.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">🚩 Red Flags</h3>
          <div className="flex flex-col gap-sm">
            {data.redFlags.map((flag, i) => (
              <div key={i} className="glass-card glass-card--risk-critical">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: 'var(--space-xs)' }}>
                  ⛔ {flag.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-xs)' }}>
                  {flag.description}
                </p>
                {flag.clause && (
                  <span className="text-sm text-muted">📍 {flag.clause}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {data.risks && data.risks.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">⚠️ Identified Risks</h3>
          <div className="flex flex-col gap-sm">
            {data.risks.map((risk, i) => (
              <div key={i} className={`glass-card glass-card--risk-${risk.severity}`}>
                <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{risk.title}</h4>
                  <span className={`badge badge--${risk.severity === 'critical' ? 'critical' : risk.severity === 'high' ? 'danger' : risk.severity === 'low' ? 'success' : 'warning'}`}>
                    {risk.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-sm)' }}>
                  {risk.description}
                </p>
                {risk.recommendation && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-info)', background: 'var(--color-info-bg)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                    💡 <strong>Recommendation:</strong> {risk.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Obligations */}
      {data.obligations && data.obligations.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">📋 Your Obligations</h3>
          <div className="flex flex-col gap-sm">
            {data.obligations.map((obl, i) => (
              <div key={i} className={`glass-card glass-card--risk-${obl.riskLevel || 'medium'}`}>
                <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  <span className="badge badge--accent">{obl.id}</span>
                  {obl.deadline && obl.deadline !== 'Ongoing' && (
                    <span className="badge badge--warning">⏰ {obl.deadline}</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--space-xs)' }}>
                  {obl.description}
                </p>
                {obl.party && <p className="text-sm text-muted">Party: {obl.party}</p>}
                {obl.consequence && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-danger)', marginTop: 'var(--space-xs)' }}>
                    ⚠ If not met: {obl.consequence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rights */}
      {data.rights && data.rights.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">🛡️ Your Rights</h3>
          <div className="flex flex-col gap-sm">
            {data.rights.map((right, i) => (
              <div key={i} className="glass-card glass-card--risk-low">
                <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 'var(--space-xs)' }}>
                  {right.description}
                </p>
                {right.conditions && (
                  <p className="text-sm text-muted">Conditions: {right.conditions}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Clauses */}
      {data.missingClauses && data.missingClauses.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-section__title">❓ Potentially Missing Clauses</h3>
          <div className="flex flex-col gap-sm">
            {data.missingClauses.map((clause, i) => (
              <div key={i} className="glass-card glass-card--risk-medium">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                  {clause.clause}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>
                  {clause.importance}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-info)' }}>
                  💡 {clause.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
