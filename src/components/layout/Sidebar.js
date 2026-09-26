'use client';

/**
 * Sidebar Component
 * 
 * Main navigation sidebar with brand, feature links, and legal disclaimer.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    section: 'Analysis',
    items: [
      { href: '/analyze', icon: '📄', label: 'Analyze Document' },
      { href: '/compare', icon: '⚖️', label: 'Compare Contracts' },
      { href: '/chat', icon: '💬', label: 'Document Q&A' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">⚖</div>
          <span className="sidebar__brand-name">LegalLens AI</span>
        </div>

        <nav className="sidebar__nav">
          <Link
            href="/"
            className={`sidebar__link ${pathname === '/' ? 'sidebar__link--active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <span className="sidebar__link-icon">🏠</span>
            Dashboard
          </Link>

          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="sidebar__section-label">{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar__link ${pathname === item.href ? 'sidebar__link--active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__disclaimer">
            ⚠️ LegalLens AI provides informational analysis only and does not constitute legal advice. Always consult a qualified attorney.
          </p>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? '✕' : '☰'}
      </button>
    </>
  );
}
