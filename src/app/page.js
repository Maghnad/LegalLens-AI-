import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const features = [
    {
      href: '/analyze',
      icon: '📄',
      title: 'Document Simplification & Reading Levels',
      description: 'Convert dense legal text into plain English at adjustable reading levels (5th Grade, General Adult, Legal Expert) with glossary tooltips.',
    },
    {
      href: '/analyze',
      icon: '🔍',
      title: 'Risk & Obligation Analysis',
      description: 'Automatically identify risks, obligations, rights, deadlines, and red flags in your contracts and agreements.',
    },
    {
      href: '/analyze',
      icon: '💬',
      title: 'Negotiation & Balanced Redlines',
      description: 'Get editable, fair replacement clauses and persuasive talking point scripts with fallback positions to level the playing field.',
    },
    {
      href: '/compare',
      icon: '⚖️',
      title: 'Contract Comparison',
      description: 'Upload two documents side by side and see exactly what changed — additions, removals, and modifications highlighted clearly.',
    },
    {
      href: '/chat',
      icon: '🤖',
      title: 'Document Q&A Chat (RAG)',
      description: 'Ask questions about your legal documents and get instant, context-aware answers grounded in the document content.',
    },
    {
      href: '/analyze',
      icon: '📅',
      title: 'Checklists & Calendar Export (.ics)',
      description: 'Actionable before/after signing checklists with 1-click .ics calendar export for all critical milestones and deadlines.',
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__badge">
          <span>⚡</span>
          Powered by Google Gemini AI
        </div>
        <h1 className="hero__title">
          Understand Legal Documents with Confidence
        </h1>
        <p className="hero__subtitle">
          LegalLens AI helps you simplify complex legal documents, identify risks, compare contracts, 
          and prepare for legal consultations — all powered by advanced AI.
        </p>
        <div className="hero__actions">
          <Link href="/analyze" className="btn btn--primary btn--lg" id="cta-analyze">
            📄 Analyze a Document
          </Link>
          <Link href="/chat" className="btn btn--secondary btn--lg" id="cta-chat">
            💬 Chat with a Document
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section aria-label="Features">
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="feature-card"
              id={`feature-${index}`}
            >
              <div className="feature-card__icon">{feature.icon}</div>
              <h2 className="feature-card__title">{feature.title}</h2>
              <p className="feature-card__description">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div style={{ marginTop: 'var(--space-3xl)' }}>
        <Footer />
      </div>
    </main>
  );
}
