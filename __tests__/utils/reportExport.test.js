import { generateMarkdownReport } from '@/utils/reportExport';

describe('Report Export Utilities', () => {
  it('generates markdown report for simplify analysis', () => {
    const data = {
      title: 'Commercial Lease Agreement',
      documentType: 'Lease Agreement',
      tldr: 'Standard office lease with 3-year term.',
      summary: 'This lease defines tenant responsibilities.',
      sections: [
        {
          simplifiedHeading: 'Rent & Security Deposit',
          originalText: 'Tenant shall pay $3,000 monthly.',
          simplifiedText: 'You pay $3,000 every month by the 1st.',
          importance: 'high',
        },
      ],
      keyTerms: [
        { term: 'Indemnity', definition: 'Protection against legal liability' },
      ],
    };

    const report = generateMarkdownReport('simplify', data, 'Commercial Lease');
    expect(report).toContain('LegalLens AI — Document Analysis Report');
    expect(report).toContain('Commercial Lease Agreement');
    expect(report).toContain('Standard office lease with 3-year term.');
    expect(report).toContain('Rent & Security Deposit');
    expect(report).toContain('Indemnity');
    expect(report).toContain('DISCLAIMER');
  });

  it('generates markdown report for risk analysis', () => {
    const data = {
      overallRiskLevel: 'high',
      overallRiskSummary: 'Uncapped indemnity and automatic renewal detected.',
      redFlags: [
        { title: 'Uncapped Liability', description: 'No maximum financial limit.', clause: 'Section 12' },
      ],
      risks: [
        { title: 'Auto-renewal', severity: 'high', description: 'Renews without reminder.', recommendation: 'Add notice' },
      ],
    };

    const report = generateMarkdownReport('risk', data);
    expect(report).toContain('Risk Assessment Summary');
    expect(report).toContain('HIGH');
    expect(report).toContain('Uncapped Liability');
    expect(report).toContain('Auto-renewal');
  });

  it('generates markdown report for comparison analysis', () => {
    const data = {
      summaryOfChanges: 'Landlord version adds penalty clauses.',
      differences: [
        {
          category: 'Addition',
          section: 'Clause 9',
          documentAText: 'Not present',
          documentBText: 'Late fee $100/day',
          significance: 'high',
          explanation: 'Adds harsh late fees.',
        },
      ],
    };

    const report = generateMarkdownReport('compare', data);
    expect(report).toContain('Document Comparison Summary');
    expect(report).toContain('Late fee $100/day');
  });
});
