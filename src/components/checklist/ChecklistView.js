'use client';

/**
 * ChecklistView Component
 * 
 * Interactive checklist with before/after signing items, lawyer questions, and key dates.
 */

import { useState } from 'react';

import { exportSingleDateIcs, exportAllDatesIcs } from '@/utils/calendarExport';

export default function ChecklistView({ data }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState('before');
  const [exportedToast, setExportedToast] = useState('');

  if (!data) return null;

  const toggleItem = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportAll = () => {
    if (!data.keyDates || data.keyDates.length === 0) return;
    exportAllDatesIcs(data.keyDates, data.documentType || 'Legal Document');
    setExportedToast('All deadlines downloaded as .ics calendar file!');
    setTimeout(() => setExportedToast(''), 3500);
  };

  const handleExportSingle = (item) => {
    exportSingleDateIcs(item, data.documentType || 'Legal Document');
    setExportedToast(`"${item.event}" downloaded to calendar!`);
    setTimeout(() => setExportedToast(''), 3500);
  };

  const tabs = [
    { key: 'before', label: '📋 Before Signing', count: data.beforeSigning?.length || 0 },
    { key: 'after', label: '✅ After Signing', count: data.afterSigning?.length || 0 },
    { key: 'lawyer', label: '🧑‍⚖️ Questions for Lawyer', count: data.questionsForLawyer?.length || 0 },
    { key: 'dates', label: '📅 Key Dates', count: data.keyDates?.length || 0 },
  ];

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return (
    <div>
      {/* Document type badge */}
      {data.documentType && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="badge badge--accent">{data.documentType}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" role="tablist">
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

      {/* Before Signing */}
      {activeTab === 'before' && data.beforeSigning && (
        <ul className="checklist" role="list" aria-label="Before signing checklist">
          {[...data.beforeSigning]
            .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
            .map((item) => (
              <li
                key={item.id}
                className={`checklist-item ${checkedItems[item.id] ? 'checklist-item--completed' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <input
                  type="checkbox"
                  className="checklist-checkbox"
                  checked={!!checkedItems[item.id]}
                  onChange={() => toggleItem(item.id)}
                  aria-label={item.task}
                  id={`check-${item.id}`}
                />
                <div>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                    <span className="checklist-item__text">{item.task}</span>
                    <span className={`badge badge--${item.priority === 'high' ? 'danger' : item.priority === 'low' ? 'success' : 'warning'}`}>
                      {item.priority}
                    </span>
                  </div>
                  {item.details && (
                    <p className="checklist-item__details">{item.details}</p>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}

      {/* After Signing */}
      {activeTab === 'after' && data.afterSigning && (
        <ul className="checklist" role="list" aria-label="After signing checklist">
          {[...data.afterSigning]
            .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
            .map((item) => (
              <li
                key={item.id}
                className={`checklist-item ${checkedItems[item.id] ? 'checklist-item--completed' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <input
                  type="checkbox"
                  className="checklist-checkbox"
                  checked={!!checkedItems[item.id]}
                  onChange={() => toggleItem(item.id)}
                  aria-label={item.task}
                  id={`check-${item.id}`}
                />
                <div>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                    <span className="checklist-item__text">{item.task}</span>
                    <span className={`badge badge--${item.priority === 'high' ? 'danger' : item.priority === 'low' ? 'success' : 'warning'}`}>
                      {item.priority}
                    </span>
                  </div>
                  {item.deadline && (
                    <p className="checklist-item__details">⏰ Deadline: {item.deadline}</p>
                  )}
                  {item.details && (
                    <p className="checklist-item__details">{item.details}</p>
                  )}
                </div>
              </li>
            ))}
        </ul>
      )}

      {/* Questions for Lawyer */}
      {activeTab === 'lawyer' && data.questionsForLawyer && (
        <div className="flex flex-col gap-sm">
          {[...data.questionsForLawyer]
            .sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1))
            .map((item) => (
              <div key={item.id} className={`glass-card glass-card--risk-${item.priority === 'high' ? 'high' : item.priority === 'low' ? 'low' : 'medium'}`}>
                <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    🧑‍⚖️ {item.question}
                  </h4>
                  <span className={`badge badge--${item.priority === 'high' ? 'danger' : item.priority === 'low' ? 'success' : 'warning'}`}>
                    {item.priority}
                  </span>
                </div>
                {item.context && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {item.context}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Key Dates */}
      {activeTab === 'dates' && data.keyDates && (
        <div className="flex flex-col gap-md">
          {exportedToast && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              <span>✅</span> {exportedToast}
            </div>
          )}

          <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              Never miss a critical contract milestone, renewal notice, or obligation deadline.
            </p>
            <button
              className="btn btn--secondary btn--sm"
              onClick={handleExportAll}
              id="export-all-ics-btn"
              title="Export all deadlines to your calendar app (Google Calendar, Outlook, Apple Calendar)"
            >
              📅 Export All to Calendar (.ics)
            </button>
          </div>

          <div className="flex flex-col gap-sm">
            {data.keyDates.map((item, i) => (
              <div key={i} className="glass-card">
                <div className="flex items-center justify-between gap-sm" style={{ marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <span className="badge badge--warning">📅 {item.date}</span>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => handleExportSingle(item)}
                    style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                    title="Download this specific date as an .ics event"
                  >
                    🗓️ Add to Calendar
                  </button>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                  {item.event}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  ✅ <strong>Action:</strong> {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents to gather */}
      {data.documentsToGather && data.documentsToGather.length > 0 && (
        <div className="analysis-section" style={{ marginTop: 'var(--space-2xl)' }}>
          <h3 className="analysis-section__title">📂 Documents to Prepare</h3>
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
