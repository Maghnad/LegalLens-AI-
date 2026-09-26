'use client';

/**
 * Header Component
 * 
 * Fixed top header showing current page title and actions.
 */

import { usePathname } from 'next/navigation';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analyze': 'Document Analysis',
  '/compare': 'Contract Comparison',
  '/chat': 'Document Q&A',
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'LegalLens AI';

  return (
    <header className="header" role="banner">
      <h1 className="header__title">{title}</h1>
      <div className="header__actions">
        <span className="badge badge--accent">AI-Powered</span>
      </div>
    </header>
  );
}
