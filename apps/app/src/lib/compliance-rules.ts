// Compliance Rules Engine for Legal Documents

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  severity: "critical" | "warning" | "info";
  jurisdictions?: string[];
  documentTypes?: string[];
  check: (
    content: string,
    metadata: DocumentMetadata,
  ) => ComplianceIssue | null;
}

export interface DocumentMetadata {
  title: string;
  documentType: string;
  jurisdiction?: string;
  category?: string;
}

export interface ComplianceIssue {
  ruleId: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
}

// Common legal clauses and requirements
const COMPLIANCE_RULES: ComplianceRule[] = [
  // GDPR Requirements
  {
    id: "gdpr-data-processing",
    name: "GDPR Data Processing Clause",
    description:
      "Documents must include data processing agreement for EU/EEA operations",
    severity: "critical",
    jurisdictions: ["EU", "European Union", "EEA"],
    documentTypes: ["Employment Agreement", "Service Agreement", "Contract"],
    check: (content, metadata) => {
      const hasDataProcessing =
        /data\s+processing|personal\s+data|gdpr|data\s+protection/i.test(
          content,
        );
      if (
        !hasDataProcessing &&
        metadata.jurisdiction?.match(/EU|Europe|EEA/i)
      ) {
        return {
          ruleId: "gdpr-data-processing",
          severity: "critical",
          title: "Missing GDPR Data Processing Clause",
          description:
            "Document should include data processing and protection clauses for EU compliance",
          suggestion:
            "Add a section covering personal data processing, data subject rights, and GDPR compliance measures.",
        };
      }
      return null;
    },
  },

  // Employment Law
  {
    id: "employment-termination",
    name: "Termination Clause",
    description: "Employment contracts must include termination terms",
    severity: "critical",
    documentTypes: ["Employment Agreement", "Employment Contract"],
    check: (content, metadata) => {
      const hasTermination =
        /termination|notice\s+period|dismissal|severance/i.test(content);
      if (!hasTermination) {
        return {
          ruleId: "employment-termination",
          severity: "critical",
          title: "Missing Termination Clause",
          description: "Employment agreement lacks clear termination terms",
          suggestion:
            "Include notice period requirements, grounds for termination, and severance terms.",
        };
      }
      return null;
    },
  },

  {
    id: "employment-compensation",
    name: "Compensation Terms",
    description: "Employment contracts must clearly state compensation",
    severity: "critical",
    documentTypes: ["Employment Agreement", "Employment Contract"],
    check: (content, metadata) => {
      const hasCompensation =
        /salary|compensation|remuneration|wage|payment/i.test(content);
      if (!hasCompensation) {
        return {
          ruleId: "employment-compensation",
          severity: "critical",
          title: "Missing Compensation Terms",
          description:
            "Employment agreement must clearly state compensation details",
          suggestion:
            "Add detailed compensation structure including base salary, benefits, and payment frequency.",
        };
      }
      return null;
    },
  },

  // NDA Requirements
  {
    id: "nda-definition",
    name: "Confidential Information Definition",
    description: "NDAs must define what constitutes confidential information",
    severity: "critical",
    documentTypes: [
      "NDA",
      "Non-Disclosure Agreement",
      "Confidentiality Agreement",
    ],
    check: (content, metadata) => {
      const hasDefinition =
        /confidential\s+information|proprietary|trade\s+secret/i.test(content);
      if (!hasDefinition) {
        return {
          ruleId: "nda-definition",
          severity: "critical",
          title: "Missing Confidential Information Definition",
          description:
            "NDA must clearly define what constitutes confidential information",
          suggestion:
            "Add a section defining confidential information, including examples and exclusions.",
        };
      }
      return null;
    },
  },

  {
    id: "nda-obligations",
    name: "Recipient Obligations",
    description: "NDAs must specify recipient obligations",
    severity: "critical",
    documentTypes: ["NDA", "Non-Disclosure Agreement"],
    check: (content, metadata) => {
      const hasObligations =
        /obligations|shall\s+not\s+disclose|duty\s+to\s+maintain/i.test(
          content,
        );
      if (!hasObligations) {
        return {
          ruleId: "nda-obligations",
          severity: "warning",
          title: "Unclear Recipient Obligations",
          description: "NDA should clearly state the recipient's obligations",
          suggestion:
            "Explicitly state the duty to maintain confidentiality and restrictions on use.",
        };
      }
      return null;
    },
  },

  // General Contract Requirements
  {
    id: "governing-law",
    name: "Governing Law Clause",
    description: "Contracts should specify governing law and jurisdiction",
    severity: "warning",
    documentTypes: ["Contract", "Agreement", "Service Agreement"],
    check: (content, metadata) => {
      const hasGoverningLaw =
        /governing\s+law|jurisdiction|applicable\s+law|governed\s+by/i.test(
          content,
        );
      if (!hasGoverningLaw) {
        return {
          ruleId: "governing-law",
          severity: "warning",
          title: "Missing Governing Law Clause",
          description:
            "Contract should specify which laws govern the agreement",
          suggestion:
            "Add a clause specifying the governing law and jurisdiction for dispute resolution.",
        };
      }
      return null;
    },
  },

  {
    id: "dispute-resolution",
    name: "Dispute Resolution",
    description: "Contracts should include dispute resolution mechanism",
    severity: "warning",
    documentTypes: ["Contract", "Agreement", "Service Agreement"],
    check: (content, metadata) => {
      const hasDispute =
        /dispute\s+resolution|arbitration|mediation|litigation/i.test(content);
      if (!hasDispute) {
        return {
          ruleId: "dispute-resolution",
          severity: "warning",
          title: "Missing Dispute Resolution Clause",
          description: "Contract lacks a dispute resolution mechanism",
          suggestion:
            "Include provisions for handling disputes (arbitration, mediation, or court jurisdiction).",
        };
      }
      return null;
    },
  },

  {
    id: "force-majeure",
    name: "Force Majeure Clause",
    description: "Contracts should address force majeure events",
    severity: "info",
    documentTypes: ["Contract", "Agreement", "Service Agreement"],
    check: (content, metadata) => {
      const hasForceMajeure =
        /force\s+majeure|acts?\s+of\s+god|unforeseen\s+circumstances/i.test(
          content,
        );
      if (!hasForceMajeure) {
        return {
          ruleId: "force-majeure",
          severity: "info",
          title: "Consider Adding Force Majeure Clause",
          description: "Contract may benefit from a force majeure provision",
          suggestion:
            "Consider adding a clause addressing performance during unforeseen circumstances (natural disasters, pandemics, etc.).",
        };
      }
      return null;
    },
  },

  // African Jurisdiction Specific
  {
    id: "nigeria-data-protection",
    name: "Nigeria Data Protection Regulation",
    description: "Documents involving Nigerian data must comply with NDPR",
    severity: "critical",
    jurisdictions: ["Nigeria", "Nigerian"],
    check: (content, metadata) => {
      const hasNDPR = /ndpr|nigeria\s+data\s+protection|personal\s+data/i.test(
        content,
      );
      if (!hasNDPR && metadata.jurisdiction?.match(/nigeria/i)) {
        return {
          ruleId: "nigeria-data-protection",
          severity: "critical",
          title: "NDPR Compliance Required",
          description:
            "Nigerian operations must comply with Data Protection Regulation",
          suggestion:
            "Add clauses addressing NDPR compliance, data subject rights, and data protection measures.",
        };
      }
      return null;
    },
  },

  {
    id: "south-africa-employment",
    name: "South Africa Employment Equity",
    description:
      "SA employment contracts must comply with Employment Equity Act",
    severity: "warning",
    jurisdictions: ["South Africa", "South African"],
    documentTypes: ["Employment Agreement", "Employment Contract"],
    check: (content, metadata) => {
      const hasEquity =
        /employment\s+equity|affirmative\s+action|equal\s+opportunity/i.test(
          content,
        );
      if (!hasEquity && metadata.jurisdiction?.match(/south\s+africa/i)) {
        return {
          ruleId: "south-africa-employment",
          severity: "warning",
          title: "Consider Employment Equity Provisions",
          description:
            "South African employment contracts should address employment equity",
          suggestion:
            "Consider including provisions regarding equal opportunity and non-discrimination.",
        };
      }
      return null;
    },
  },

  // Document Quality Checks
  {
    id: "date-format",
    name: "Date Specification",
    description: "Contract should have clear effective dates",
    severity: "warning",
    check: (content, metadata) => {
      const hasDate =
        /effective\s+date|commencement\s+date|dated|this\s+\d+(?:st|nd|rd|th)?\s+day/i.test(
          content,
        );
      if (!hasDate) {
        return {
          ruleId: "date-format",
          severity: "warning",
          title: "Missing Effective Date",
          description: "Document should clearly specify the effective date",
          suggestion:
            "Add a clear effective date or commencement date for the agreement.",
        };
      }
      return null;
    },
  },

  {
    id: "parties-identification",
    name: "Party Identification",
    description: "Contracts must clearly identify all parties",
    severity: "critical",
    check: (content, metadata) => {
      const hasParties =
        /between|parties|party\s+of\s+the\s+first\s+part|hereinafter/i.test(
          content,
        );
      if (!hasParties) {
        return {
          ruleId: "parties-identification",
          severity: "critical",
          title: "Unclear Party Identification",
          description:
            "Document should clearly identify all parties to the agreement",
          suggestion:
            "Add a section clearly identifying each party with full legal names and addresses.",
        };
      }
      return null;
    },
  },
];

export function runComplianceChecks(
  content: string,
  metadata: DocumentMetadata,
): {
  issues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  suggestions: ComplianceIssue[];
  score: number;
} {
  const allIssues: ComplianceIssue[] = [];

  // Run all applicable rules
  for (const rule of COMPLIANCE_RULES) {
    // Check if rule applies to this document
    const jurisdictionMatch =
      !rule.jurisdictions ||
      rule.jurisdictions.some((j) =>
        metadata.jurisdiction?.toLowerCase().includes(j.toLowerCase()),
      );

    const documentTypeMatch =
      !rule.documentTypes ||
      rule.documentTypes.some((t) =>
        metadata.documentType?.toLowerCase().includes(t.toLowerCase()),
      );

    if (jurisdictionMatch && documentTypeMatch) {
      const issue = rule.check(content, metadata);
      if (issue) {
        allIssues.push(issue);
      }
    }
  }

  // Categorize by severity
  const issues = allIssues.filter((i) => i.severity === "critical");
  const warnings = allIssues.filter((i) => i.severity === "warning");
  const suggestions = allIssues.filter((i) => i.severity === "info");

  // Calculate compliance score (0-100)
  const criticalPenalty = issues.length * 15;
  const warningPenalty = warnings.length * 5;
  const score = Math.max(0, 100 - criticalPenalty - warningPenalty);

  return {
    issues,
    warnings,
    suggestions,
    score,
  };
}

export function getComplianceStatusColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getComplianceStatusText(score: number): string {
  if (score >= 80) return "Compliant";
  if (score >= 60) return "Needs Review";
  return "Non-Compliant";
}
