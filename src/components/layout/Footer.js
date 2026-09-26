/**
 * Footer Component
 * 
 * Legal disclaimer footer displayed on every page.
 */

export default function Footer() {
  return (
    <footer className="disclaimer-banner" role="contentinfo">
      <span className="disclaimer-banner__icon" aria-hidden="true">⚠️</span>
      <p>
        <strong>Disclaimer:</strong> LegalLens AI is an informational tool and does not provide legal advice. 
        The analysis provided should not be relied upon as a substitute for professional legal counsel. 
        Always consult a qualified attorney for legal matters.
      </p>
    </footer>
  );
}
