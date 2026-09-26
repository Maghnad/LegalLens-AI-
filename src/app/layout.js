import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'LegalLens AI — Smart Legal Document Assistant',
  description: 'AI-powered legal document analysis. Simplify contracts, identify risks, compare agreements, and prepare for legal consultations — all powered by Google Gemini.',
  keywords: 'legal AI, contract analysis, document simplification, risk analysis, legal assistant',
  openGraph: {
    title: 'LegalLens AI — Smart Legal Document Assistant',
    description: 'AI-powered legal document analysis. Simplify contracts, identify risks, and more.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="page-container">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
