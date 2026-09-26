/**
 * AI Prompt Templates
 * 
 * All structured prompts for Gemini AI operations.
 * Each prompt is carefully engineered for legal document analysis.
 */

/** System-level context applied to all legal analysis prompts */
const LEGAL_SYSTEM_CONTEXT = `You are LegalLens AI, an expert legal document analysis assistant. 
You help users understand complex legal documents in plain, accessible language.

IMPORTANT GUIDELINES:
- Always provide clear, accurate analysis
- Use plain English that non-lawyers can understand
- Highlight potential risks and important obligations
- Never provide actual legal advice — always recommend consulting a qualified attorney for specific situations
- Be thorough but concise
- When uncertain, acknowledge limitations`;

/**
 * Prompt for simplifying/summarizing a legal document with multi-tier reading levels.
 * @param {string} [requestedLevel='general'] - '5th-grade' | 'general' | 'expert'
 */
export function getSimplifyPrompt(requestedLevel = 'general') {
  return `${LEGAL_SYSTEM_CONTEXT}

Analyze this legal document and provide a comprehensive, plain-English breakdown with explanations at multiple reading levels (5th grade simple, general adult, and legal expert).

Respond in the following JSON format:
{
  "title": "Document title or type",
  "documentType": "Type of legal document (e.g., NDA, Employment Contract, Lease Agreement)",
  "readingLevel": "Original reading level (e.g., College, Graduate, Professional)",
  "summary": "A 2-3 paragraph plain-English summary of what this document does for general adult readers",
  "summaryFifthGrade": "A short, crystal-clear 1-paragraph summary written for a 10-year-old (5th-grade level) using simple everyday words and analogies",
  "summaryExpert": "An in-depth legal breakdown detailing contractual mechanics, covenants, risk allocations, and enforceability nuances for legal professionals",
  "sections": [
    {
      "originalHeading": "Original section heading",
      "simplifiedHeading": "Plain-English heading",
      "originalText": "Key original text from this section (abbreviated if long)",
      "simplifiedText": "Clear, friendly plain-English explanation for general adult non-lawyers",
      "simplifiedFifthGrade": "Super simple 5th-grade explanation (like explaining to a middle schooler, zero jargon, clear real-world analogy)",
      "simplifiedExpert": "Precise legal breakdown detailing contractual rights, default remedies, and statutory implications",
      "importance": "high|medium|low"
    }
  ],
  "keyTerms": [
    {
      "term": "Legal term used in document",
      "definition": "Plain-English definition with a simple everyday example"
    }
  ],
  "tldr": "One-sentence summary of the entire document"
}`;
}

/**
 * Prompt for generating balanced alternative clauses and negotiation talking points.
 */
export function getNegotiationPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Analyze this legal document from the perspective of the user who needs to sign or negotiate it.
Identify one-sided, aggressive, or risky clauses, and provide concrete balanced alternative clause language that they can propose in a redline, along with persuasive negotiation talking points and fallback compromise positions.

Respond in the following JSON format:
{
  "documentType": "Type of document analyzed",
  "negotiationSummary": "High-level summary of the contract's fairness balance and key negotiation leverage points",
  "clauseSuggestions": [
    {
      "id": "CLAUSE-1",
      "clauseName": "Name of the clause (e.g., Indemnification, Mutual Termination, Non-Compete, Liability Cap)",
      "originalText": "The problematic or one-sided text from the document",
      "issue": "Why this clause is one-sided or unfair to the user",
      "suggestedText": "Complete, ready-to-copy balanced alternative clause language that is standard and fair",
      "rationale": "Why the other party should reasonably accept this revision as standard market practice",
      "benefit": "How this alternative language protects the user",
      "importance": "high|medium|low"
    }
  ],
  "talkingPoints": [
    {
      "id": "TALK-1",
      "topic": "Topic or clause name",
      "script": "What the user should say or write to the counterparty (professional, polite, and persuasive)",
      "objective": "What specific outcome the user is trying to achieve",
      "fallbackPosition": "A reasonable compromise position if the counterparty pushes back",
      "priority": "high|medium|low"
    }
  ]
}`;
}

/**
 * Prompt for risk analysis and obligation extraction.
 */
export function getRiskAnalysisPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Perform a thorough risk analysis on this legal document. Identify all obligations, rights, risks, deadlines, and potential issues.

Respond in the following JSON format:
{
  "overallRiskLevel": "low|medium|high|critical",
  "overallRiskSummary": "Brief summary of the overall risk profile",
  "obligations": [
    {
      "id": "OBL-1",
      "description": "Plain-English description of the obligation",
      "party": "Which party has this obligation",
      "deadline": "Specific deadline if any, or 'Ongoing'",
      "consequence": "What happens if not fulfilled",
      "riskLevel": "low|medium|high|critical"
    }
  ],
  "risks": [
    {
      "id": "RISK-1",
      "title": "Short risk title",
      "description": "Detailed explanation of the risk",
      "clause": "Reference to the relevant clause/section",
      "severity": "low|medium|high|critical",
      "recommendation": "What the user should consider doing about this risk"
    }
  ],
  "rights": [
    {
      "description": "Plain-English description of the right",
      "party": "Which party has this right",
      "conditions": "Any conditions for exercising this right"
    }
  ],
  "deadlines": [
    {
      "description": "What the deadline is for",
      "date": "The deadline date or timeframe",
      "consequence": "What happens if missed"
    }
  ],
  "redFlags": [
    {
      "title": "Short title of the red flag",
      "description": "Why this is concerning",
      "clause": "Where this appears in the document"
    }
  ],
  "missingClauses": [
    {
      "clause": "Name of the missing clause",
      "importance": "Why this clause is typically important",
      "recommendation": "What should be done"
    }
  ]
}`;
}

/**
 * Prompt for comparing two legal documents.
 */
export function getComparisonPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Compare these two legal documents thoroughly. The first document is "Document A" and the second is "Document B".

Identify all material differences, additions, removals, and modifications between them.

Respond in the following JSON format:
{
  "summaryOfChanges": "High-level overview of the key differences",
  "documentA": {
    "title": "Title or type of Document A",
    "type": "Document type"
  },
  "documentB": {
    "title": "Title or type of Document B", 
    "type": "Document type"
  },
  "differences": [
    {
      "id": "DIFF-1",
      "category": "Addition|Removal|Modification|Reworded",
      "section": "Which section this difference is in",
      "documentAText": "Relevant text from Document A (or 'Not present')",
      "documentBText": "Relevant text from Document B (or 'Not present')",
      "significance": "low|medium|high|critical",
      "explanation": "Plain-English explanation of what this difference means",
      "impact": "How this change affects the parties involved"
    }
  ],
  "overallAssessment": "Overall assessment of whether the changes are favorable, unfavorable, or neutral",
  "recommendation": "What the user should pay attention to or do next"
}`;
}

/**
 * Prompt for generating actionable checklists.
 */
export function getChecklistPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Based on this legal document, generate actionable checklists to help the user understand what they need to do.

Respond in the following JSON format:
{
  "documentType": "Type of document analyzed",
  "beforeSigning": [
    {
      "id": "BS-1",
      "task": "Action item description",
      "priority": "high|medium|low",
      "details": "Additional context or explanation",
      "completed": false
    }
  ],
  "afterSigning": [
    {
      "id": "AS-1",
      "task": "Action item description",
      "priority": "high|medium|low",
      "deadline": "When this should be done",
      "details": "Additional context",
      "completed": false
    }
  ],
  "questionsForLawyer": [
    {
      "id": "QL-1",
      "question": "Specific question to ask a legal professional",
      "context": "Why this question is important",
      "priority": "high|medium|low"
    }
  ],
  "documentsToGather": [
    {
      "document": "Name of document to prepare",
      "reason": "Why it is needed"
    }
  ],
  "keyDates": [
    {
      "date": "The date or timeframe",
      "event": "What happens on this date",
      "action": "What the user should do"
    }
  ]
}`;
}

/**
 * Prompt for the document chat Q&A.
 * @param {string} documentContext - Brief description/summary of the document
 */
export function getChatSystemPrompt(documentContext) {
  return `${LEGAL_SYSTEM_CONTEXT}

You are having a conversation about a legal document that the user has uploaded. Here is the context about the document:

${documentContext}

The user will ask questions about this document. Answer them clearly and accurately based on the document content.

Rules:
- Always reference specific sections or clauses when answering
- If the answer isn't in the document, say so clearly
- Offer to explain related concepts if relevant
- Suggest follow-up questions the user might want to ask
- Remind the user to consult a lawyer for specific legal advice when appropriate`;
}

/**
 * Prompt for generating suggested questions based on document type.
 */
export function getSuggestedQuestionsPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Based on this legal document, suggest 6 important questions that a non-lawyer reader should ask about it.

Respond in the following JSON format:
{
  "questions": [
    {
      "question": "The suggested question",
      "category": "Rights|Obligations|Risks|Deadlines|Costs|Termination",
      "icon": "shield|clock|alert|dollar|file|exit"
    }
  ]
}`;
}

/**
 * Prompt for lawyer preparation.
 */
export function getLawyerPrepPrompt() {
  return `${LEGAL_SYSTEM_CONTEXT}

Help the user prepare for a consultation with a legal professional about this document.

Respond in the following JSON format:
{
  "briefingSummary": "A concise briefing summary the user can share with their lawyer",
  "areasNeedingReview": [
    {
      "area": "Area title",
      "reason": "Why professional review is needed",
      "urgency": "high|medium|low"
    }
  ],
  "questionsToAsk": [
    {
      "question": "Specific, focused question for the lawyer",
      "context": "Background info to share with the lawyer",
      "priority": "high|medium|low"
    }
  ],
  "documentsToGather": [
    {
      "document": "Document or information to bring",
      "reason": "Why the lawyer might need this"
    }
  ],
  "estimatedComplexity": "simple|moderate|complex",
  "suggestedLawyerType": "Type of lawyer to consult (e.g., Real Estate Attorney, Corporate Lawyer)"
}`;
}
