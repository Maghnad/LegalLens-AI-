# ⚖️ LegalLens AI — Smart Legal Document Assistant

> AI-powered legal document analysis that makes legal information accessible to everyone.

![LegalLens AI](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue?style=for-the-badge&logo=google)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Chosen Vertical

**AI for Legal Assistance & Access** — Building a GenAI-powered solution that makes legal information and basic legal assistance more accessible by helping users understand, compare, and navigate legal documents.

---

## 🎯 Approach and Logic

### Problem
Legal documents are complex, filled with jargon, and difficult for non-lawyers to understand. Professional legal consultation is expensive, and many people sign contracts without fully understanding their obligations, risks, or rights.

### Solution
LegalLens AI is an intelligent, AI-powered legal document assistant that:

1. **Breaks down complex language** — Converts legal jargon into plain English that anyone can understand
2. **Identifies risks proactively** — Highlights obligations, deadlines, red flags, and missing clauses before you sign
3. **Enables informed comparison** — Shows exactly what changed between two versions of a document
4. **Provides interactive Q&A** — Lets users ask specific questions about their documents
5. **Generates actionable outputs** — Creates checklists, timelines, and preparation materials
6. **Bridges the gap to professionals** — Helps users prepare efficiently for legal consultations

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js Frontend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Dashboard │  │ Analyze  │  │ Compare  │  │   Chat   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
│       └──────────────┴──────────────┴──────────────┘       │
│                          │                                  │
│              ┌───────────┴───────────┐                     │
│              │   API Route Handlers  │                     │
│              │  /api/analyze         │                     │
│              │  /api/compare         │                     │
│              │  /api/chat (SSE)      │                     │
│              └───────────┬───────────┘                     │
│                          │                                  │
│              ┌───────────┴───────────┐                     │
│              │  Gemini AI Engine     │                     │
│              │  Structured Prompts   │                     │
│              │  JSON Output Parsing  │                     │
│              └───────────────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

### Decision-Making Logic

The AI assistant uses **context-aware prompt engineering** to make intelligent decisions:

- **Document Type Detection** — Automatically identifies the type of legal document (NDA, lease, employment contract, etc.) and adjusts analysis accordingly
- **Risk Scoring** — Uses multi-factor assessment (severity, likelihood, impact) to score risks as Low/Medium/High/Critical
- **Priority Ordering** — Obligations and checklists are auto-prioritized based on urgency and importance
- **Missing Clause Detection** — Compares against expected clauses for the detected document type
- **Contextual Q&A** — Chat responses are grounded in the uploaded document content, with citations

---

## 🚀 How the Solution Works

### Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Simplification** | Upload any legal document → Get plain-English breakdown with section-by-section analysis, key terms glossary, and reading level indicator |
| 🔍 **Risk & Obligation Analysis** | Automatic identification of obligations, rights, deadlines, penalties, red flags, and potentially missing clauses with severity scoring |
| ⚖️ **Contract Comparison** | Upload two documents → See color-coded differences with significance ratings, side-by-side diff view, and impact assessment |
| 💬 **Document Q&A Chat** | Interactive chat with streaming responses, suggested questions based on document type, and section-specific citations |
| ✅ **Actionable Checklists** | AI-generated before/after signing checklists, key dates timeline, documents to gather, and priority-ordered action items |
| 🧑‍⚖️ **Lawyer Preparation** | Briefing summary, focused questions for your attorney, areas needing review, suggested lawyer type, and complexity assessment |

### User Flow

1. **Upload** — Drag-and-drop or click to upload a legal document (PDF, DOCX, or TXT)
2. **Choose** — Select an analysis type (Simplify, Risk, Checklist, or Lawyer Prep)
3. **Analyze** — AI processes the document and returns structured, actionable results
4. **Interact** — Explore results, toggle views, check off items, or ask follow-up questions
5. **Prepare** — Use generated checklists and briefings to take informed action

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React with server-side API routes |
| **AI Engine** | Google Gemini 2.0 Flash | Document understanding, analysis, and chat |
| **Styling** | Vanilla CSS | Custom design system with glassmorphism |
| **Validation** | Zod | Type-safe input validation and sanitization |
| **Document Processing** | Mammoth.js | DOCX text extraction (PDF handled natively by Gemini) |
| **Testing** | Jest + Testing Library | Unit and integration tests |
| **Fonts** | Google Inter | Modern, clean typography |

---

## 📁 Project Structure

```
legallens/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js           # Root layout with sidebar & header
│   │   ├── page.js             # Landing dashboard
│   │   ├── globals.css         # Complete design system
│   │   ├── analyze/page.js     # Document analysis page
│   │   ├── compare/page.js     # Contract comparison page
│   │   ├── chat/page.js        # Document Q&A chat page
│   │   └── api/
│   │       ├── analyze/route.js    # Analysis API endpoint
│   │       ├── compare/route.js    # Comparison API endpoint
│   │       └── chat/route.js       # Streaming chat API (SSE)
│   │
│   ├── components/
│   │   ├── layout/             # Header, Sidebar, Footer
│   │   ├── upload/             # Drag-and-drop FileUpload
│   │   ├── analysis/           # SimplifiedView, RiskDashboard
│   │   ├── compare/            # ComparisonResult
│   │   ├── chat/               # ChatWindow
│   │   └── checklist/          # ChecklistView, LawyerPrep
│   │
│   ├── lib/
│   │   ├── gemini.js           # Gemini AI client module
│   │   ├── prompts.js          # Structured prompt templates
│   │   └── validators.js       # Zod validation schemas
│   │
│   └── utils/
│       ├── fileHelpers.js      # File processing utilities
│       └── formatters.js       # Display formatting helpers
│
└── __tests__/                  # Jest test suite
    ├── utils/
    │   ├── formatters.test.js
    │   └── fileHelpers.test.js
    └── lib/
        └── validators.test.js
```

---

## 🏃‍♂️ Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **Google Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/legallens.git
cd legallens

# 2. Install dependencies
npm install

# 3. Set up your API key
cp .env.example .env.local
# Edit .env.local and add your Gemini API key:
# GEMINI_API_KEY=your_key_here

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Building for Production

```bash
npm run build         # Create production build
npm start             # Start production server
```

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| **API Key Protection** | Stored in `.env.local`, never exposed to client bundle |
| **Server-Side AI Calls** | All Gemini interactions happen via server-side API routes |
| **File Validation** | Type, size, and extension validated on both client and server |
| **Input Sanitization** | All user text inputs sanitized using Zod schemas + custom sanitizer |
| **No Data Persistence** | Documents are processed in-memory only — nothing is stored |
| **Content Security** | No inline scripts, CSP-ready architecture |
| **Legal Disclaimer** | Prominently displayed on every page |

---

## ♿ Accessibility

- Semantic HTML5 elements (`<main>`, `<nav>`, `<header>`, `<footer>`)
- ARIA labels and roles on all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Focus-visible outlines with proper contrast
- Screen reader compatible (role="log", role="meter", aria-label)
- Responsive design for mobile, tablet, and desktop
- High-contrast text on dark backgrounds

---

## ⚠️ Assumptions

1. **Not Legal Advice** — The application provides informational analysis only and explicitly disclaims being a substitute for professional legal counsel
2. **Document Size** — Files are limited to 10MB per upload to ensure reasonable processing times
3. **Supported Formats** — PDF (native Gemini processing), DOCX (via Mammoth.js), and TXT
4. **English Language** — Optimized for English-language legal documents
5. **API Availability** — Requires an active Google Gemini API key with sufficient quota
6. **Client-Side State** — Documents and analysis results are stored in React state (not persisted across sessions) for privacy
7. **Single User** — Designed as a single-user tool; no authentication or multi-tenancy

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ using <strong>Next.js</strong> and <strong>Google Gemini AI</strong>
</p>
