/**
 * Document Type Configuration
 * Defines the form fields, labels, and AI generation parameters for each document type
 */

export interface PartyConfig {
  label: string;
  placeholder: string;
  description?: string;
}

export interface FieldConfig {
  show: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export interface DocumentTypeConfig {
  id: string;
  name: string;
  description: string;
  category: "employment" | "business" | "corporate" | "legal" | "policy";
  
  // Party configuration
  parties: {
    party1: PartyConfig;
    party2: PartyConfig;
  };
  
  // Field visibility and customization
  fields: {
    compensation: FieldConfig;
    startDate: FieldConfig;
    endDate: FieldConfig;
    duration: FieldConfig;
    industry: FieldConfig;
  };
  
  // Suggested clauses for this document type
  suggestedClauses: string[];
  
  // AI generation hints
  aiContext: {
    focus: string[];
    keyProvisions: string[];
    specificInstructions: string;
  };
}

export const documentTypeConfigs: Record<string, DocumentTypeConfig> = {
  employment: {
    id: "employment",
    name: "Employment Contract",
    description: "Formal agreement between employer and employee",
    category: "employment",
    parties: {
      party1: { label: "Employee Name", placeholder: "John Doe" },
      party2: { label: "Employer/Company", placeholder: "ABC Corporation Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Salary/Compensation", required: true },
      startDate: { show: true, label: "Employment Start Date", required: true },
      endDate: { show: true, label: "Contract End Date" },
      duration: { show: true, label: "Employment Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Non-compete clause",
      "Confidentiality agreement",
      "Intellectual property rights",
      "Termination provisions",
      "Probation period",
      "Benefits and allowances",
    ],
    aiContext: {
      focus: ["employment terms", "job responsibilities", "compensation package", "benefits"],
      keyProvisions: ["working hours", "leave entitlements", "notice period", "disciplinary procedures"],
      specificInstructions: "Include comprehensive job duties, probation terms, and employee benefits typical for the jurisdiction.",
    },
  },
  
  consulting: {
    id: "consulting",
    name: "Consulting Agreement",
    description: "Agreement for professional consulting services",
    category: "business",
    parties: {
      party1: { label: "Consultant Name/Company", placeholder: "Jane Smith Consulting" },
      party2: { label: "Client/Company", placeholder: "XYZ Industries Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Consulting Fee", required: true },
      startDate: { show: true, label: "Engagement Start Date", required: true },
      endDate: { show: true, label: "Engagement End Date" },
      duration: { show: true, label: "Engagement Period" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Scope of services",
      "Intellectual property rights",
      "Confidentiality agreement",
      "Non-solicitation clause",
      "Liability limitations",
      "Termination provisions",
    ],
    aiContext: {
      focus: ["consulting services", "deliverables", "payment terms", "independence"],
      keyProvisions: ["scope of work", "payment schedule", "expenses", "independent contractor status"],
      specificInstructions: "Clearly define deliverables, milestones, and payment terms. Emphasize independent contractor relationship.",
    },
  },
  
  service: {
    id: "service",
    name: "Service Agreement",
    description: "Agreement for providing professional services",
    category: "business",
    parties: {
      party1: { label: "Service Provider", placeholder: "Service Provider Ltd" },
      party2: { label: "Client/Customer", placeholder: "Client Company Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Service Fee", required: true },
      startDate: { show: true, label: "Service Start Date", required: true },
      endDate: { show: true, label: "Service End Date" },
      duration: { show: true, label: "Contract Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Service level agreement",
      "Liability limitations",
      "Warranty provisions",
      "Termination provisions",
      "Force majeure clause",
      "Dispute resolution mechanism",
    ],
    aiContext: {
      focus: ["service description", "service levels", "payment terms", "warranties"],
      keyProvisions: ["scope of services", "performance standards", "remedies", "renewal terms"],
      specificInstructions: "Include detailed service descriptions and performance metrics where applicable.",
    },
  },
  
  nda: {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Agreement to protect confidential information",
    category: "legal",
    parties: {
      party1: { label: "Disclosing Party", placeholder: "ABC Company Ltd" },
      party2: { label: "Receiving Party", placeholder: "XYZ Corporation" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Expiration Date" },
      duration: { show: true, label: "Confidentiality Period" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Definition of confidential information",
      "Permitted disclosures",
      "Return of materials",
      "Injunctive relief",
      "Non-solicitation clause",
      "Survival provisions",
    ],
    aiContext: {
      focus: ["confidential information", "obligations", "exceptions", "duration"],
      keyProvisions: ["definition scope", "permitted uses", "disclosure restrictions", "return obligations"],
      specificInstructions: "Focus on clearly defining what constitutes confidential information and the obligations of the receiving party.",
    },
  },
  
  partnership: {
    id: "partnership",
    name: "Partnership Agreement",
    description: "Agreement establishing a business partnership",
    category: "corporate",
    parties: {
      party1: { label: "First Partner", placeholder: "Partner A Ltd" },
      party2: { label: "Second Partner", placeholder: "Partner B Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Capital Contribution" },
      startDate: { show: true, label: "Partnership Start Date", required: true },
      endDate: { show: false },
      duration: { show: true, label: "Partnership Term" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Profit sharing arrangement",
      "Decision making process",
      "Partner responsibilities",
      "Dispute resolution mechanism",
      "Exit provisions",
      "Non-compete clause",
    ],
    aiContext: {
      focus: ["partnership terms", "profit sharing", "governance", "responsibilities"],
      keyProvisions: ["capital contributions", "management structure", "dissolution procedures", "buy-out provisions"],
      specificInstructions: "Include detailed provisions for profit/loss sharing, partner roles, and partnership governance.",
    },
  },
  
  sales: {
    id: "sales",
    name: "Sales Contract",
    description: "Agreement for sale of goods or services",
    category: "business",
    parties: {
      party1: { label: "Seller", placeholder: "Seller Company Ltd" },
      party2: { label: "Buyer", placeholder: "Buyer Corporation" },
    },
    fields: {
      compensation: { show: true, label: "Purchase Price", required: true },
      startDate: { show: true, label: "Contract Date", required: true },
      endDate: { show: true, label: "Delivery Date" },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Product specifications",
      "Warranty provisions",
      "Payment terms",
      "Delivery terms",
      "Risk of loss",
      "Return and refund policy",
    ],
    aiContext: {
      focus: ["sale terms", "product description", "payment", "delivery"],
      keyProvisions: ["purchase price", "delivery schedule", "inspection rights", "title transfer"],
      specificInstructions: "Include detailed product specifications, delivery terms, and warranty provisions.",
    },
  },
  
  loan: {
    id: "loan",
    name: "Loan Agreement",
    description: "Agreement for lending money",
    category: "legal",
    parties: {
      party1: { label: "Lender", placeholder: "First Bank Ltd" },
      party2: { label: "Borrower", placeholder: "Borrower Company Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Loan Amount", required: true },
      startDate: { show: true, label: "Disbursement Date", required: true },
      endDate: { show: true, label: "Maturity Date", required: true },
      duration: { show: true, label: "Loan Term" },
      industry: { show: false },
    },
    suggestedClauses: [
      "Interest rate terms",
      "Repayment schedule",
      "Collateral/Security",
      "Default provisions",
      "Prepayment terms",
      "Representations and warranties",
    ],
    aiContext: {
      focus: ["loan amount", "interest rate", "repayment", "security"],
      keyProvisions: ["principal amount", "interest calculation", "payment schedule", "events of default"],
      specificInstructions: "Include detailed repayment schedules, interest calculation methods, and default remedies.",
    },
  },
  
  lease: {
    id: "lease",
    name: "Lease Agreement",
    description: "Agreement for property rental",
    category: "legal",
    parties: {
      party1: { label: "Landlord/Lessor", placeholder: "Property Owner Ltd" },
      party2: { label: "Tenant/Lessee", placeholder: "Tenant Name" },
    },
    fields: {
      compensation: { show: true, label: "Rent Amount", required: true },
      startDate: { show: true, label: "Lease Start Date", required: true },
      endDate: { show: true, label: "Lease End Date", required: true },
      duration: { show: true, label: "Lease Term" },
      industry: { show: false },
    },
    suggestedClauses: [
      "Security deposit",
      "Maintenance responsibilities",
      "Use restrictions",
      "Renewal options",
      "Termination provisions",
      "Property inspection rights",
    ],
    aiContext: {
      focus: ["rental terms", "property description", "tenant obligations", "landlord obligations"],
      keyProvisions: ["rent payment", "security deposit", "maintenance", "permitted use"],
      specificInstructions: "Include detailed property description, rent payment terms, and maintenance responsibilities.",
    },
  },
  
  shareholder: {
    id: "shareholder",
    name: "Shareholder Agreement",
    description: "Agreement among company shareholders",
    category: "corporate",
    parties: {
      party1: { label: "First Shareholder", placeholder: "Shareholder A" },
      party2: { label: "Second Shareholder", placeholder: "Shareholder B" },
    },
    fields: {
      compensation: { show: true, label: "Share Capital" },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: false },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Share transfer restrictions",
      "Pre-emption rights",
      "Drag-along/Tag-along rights",
      "Board composition",
      "Dividend policy",
      "Dispute resolution mechanism",
    ],
    aiContext: {
      focus: ["share ownership", "governance", "transfer restrictions", "exit provisions"],
      keyProvisions: ["shareholding percentages", "voting rights", "reserved matters", "deadlock resolution"],
      specificInstructions: "Include detailed share transfer mechanisms, governance structure, and minority protection provisions.",
    },
  },
  
  vendor: {
    id: "vendor",
    name: "Vendor Agreement",
    description: "Agreement with suppliers or vendors",
    category: "business",
    parties: {
      party1: { label: "Vendor/Supplier", placeholder: "Vendor Company Ltd" },
      party2: { label: "Purchaser/Client", placeholder: "Client Corporation" },
    },
    fields: {
      compensation: { show: true, label: "Contract Value" },
      startDate: { show: true, label: "Agreement Date", required: true },
      endDate: { show: true, label: "Contract End Date" },
      duration: { show: true, label: "Contract Term" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Quality standards",
      "Delivery terms",
      "Payment terms",
      "Liability limitations",
      "Termination provisions",
      "Compliance requirements",
    ],
    aiContext: {
      focus: ["supply terms", "quality requirements", "delivery", "pricing"],
      keyProvisions: ["product/service specifications", "ordering procedures", "acceptance criteria", "warranty"],
      specificInstructions: "Include detailed supply terms, quality standards, and delivery requirements.",
    },
  },
  
  software: {
    id: "software",
    name: "Software License Agreement",
    description: "Agreement for software licensing",
    category: "business",
    parties: {
      party1: { label: "Licensor", placeholder: "Software Company Ltd" },
      party2: { label: "Licensee", placeholder: "Licensed User/Company" },
    },
    fields: {
      compensation: { show: true, label: "License Fee", required: true },
      startDate: { show: true, label: "License Start Date", required: true },
      endDate: { show: true, label: "License End Date" },
      duration: { show: true, label: "License Term" },
      industry: { show: true },
    },
    suggestedClauses: [
      "License scope and restrictions",
      "Intellectual property rights",
      "Support and maintenance",
      "Warranty disclaimers",
      "Liability limitations",
      "Data protection compliance",
    ],
    aiContext: {
      focus: ["license grant", "usage restrictions", "intellectual property", "support"],
      keyProvisions: ["permitted users", "installation limits", "updates", "audit rights"],
      specificInstructions: "Include detailed license scope, usage restrictions, and support terms.",
    },
  },
  
  privacy: {
    id: "privacy",
    name: "Privacy Policy",
    description: "Privacy policy document for businesses",
    category: "policy",
    parties: {
      party1: { label: "Company/Organization", placeholder: "Your Company Ltd" },
      party2: { label: "Data Controller Contact", placeholder: "privacy@company.com" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: false },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Data collection practices",
      "Data usage and sharing",
      "User rights (GDPR/NDPR)",
      "Cookie policy",
      "Data retention",
      "Security measures",
    ],
    aiContext: {
      focus: ["data collection", "data usage", "user rights", "compliance"],
      keyProvisions: ["personal data types", "processing purposes", "third-party sharing", "data subject rights"],
      specificInstructions: "Ensure compliance with jurisdiction-specific data protection laws (GDPR, NDPR, POPIA, etc.).",
    },
  },
  
  dpa: {
    id: "dpa",
    name: "Data Processing Agreement",
    description: "Agreement for data processing services",
    category: "legal",
    parties: {
      party1: { label: "Data Controller", placeholder: "Controller Company Ltd" },
      party2: { label: "Data Processor", placeholder: "Processor Services Ltd" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Agreement End Date" },
      duration: { show: true, label: "Agreement Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Processing instructions",
      "Security measures",
      "Sub-processor requirements",
      "Data breach notification",
      "Audit rights",
      "Data deletion/return",
    ],
    aiContext: {
      focus: ["processing scope", "security obligations", "sub-processors", "compliance"],
      keyProvisions: ["processing activities", "technical measures", "breach procedures", "audit provisions"],
      specificInstructions: "Ensure compliance with GDPR Article 28 requirements and jurisdiction-specific data protection laws.",
    },
  },
  
  board: {
    id: "board",
    name: "Board Resolution",
    description: "Formal board resolution document",
    category: "corporate",
    parties: {
      party1: { label: "Company Name", placeholder: "ABC Corporation Ltd" },
      party2: { label: "Board Secretary", placeholder: "Company Secretary Name" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Meeting Date", required: true },
      endDate: { show: false },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Resolution particulars",
      "Voting record",
      "Authorization scope",
      "Effective date provisions",
      "Certification",
      "Filing requirements",
    ],
    aiContext: {
      focus: ["resolution content", "authorization", "voting", "certification"],
      keyProvisions: ["meeting details", "quorum confirmation", "resolution text", "authorized signatories"],
      specificInstructions: "Include proper corporate formalities, quorum requirements, and certification language.",
    },
  },
  
  franchise: {
    id: "franchise",
    name: "Franchise Agreement",
    description: "Agreement for franchise operations",
    category: "business",
    parties: {
      party1: { label: "Franchisor", placeholder: "Franchise Brand Ltd" },
      party2: { label: "Franchisee", placeholder: "Franchisee Company" },
    },
    fields: {
      compensation: { show: true, label: "Franchise Fee", required: true },
      startDate: { show: true, label: "Agreement Date", required: true },
      endDate: { show: true, label: "Agreement End Date" },
      duration: { show: true, label: "Franchise Term" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Territory rights",
      "Trademark usage",
      "Operating standards",
      "Royalty payments",
      "Training requirements",
      "Termination provisions",
    ],
    aiContext: {
      focus: ["franchise rights", "brand standards", "fees", "territory"],
      keyProvisions: ["initial fee", "royalties", "operational requirements", "renewal terms"],
      specificInstructions: "Include detailed franchise fee structure, operating standards, and territory definitions.",
    },
  },
  
  distribution: {
    id: "distribution",
    name: "Distribution Agreement",
    description: "Agreement for product distribution",
    category: "business",
    parties: {
      party1: { label: "Supplier/Principal", placeholder: "Manufacturer Ltd" },
      party2: { label: "Distributor", placeholder: "Distribution Company" },
    },
    fields: {
      compensation: { show: true, label: "Minimum Purchase/Margin" },
      startDate: { show: true, label: "Agreement Date", required: true },
      endDate: { show: true, label: "Agreement End Date" },
      duration: { show: true, label: "Distribution Term" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Territory definition",
      "Exclusivity terms",
      "Pricing and margins",
      "Marketing obligations",
      "Performance targets",
      "Termination provisions",
    ],
    aiContext: {
      focus: ["distribution rights", "territory", "pricing", "targets"],
      keyProvisions: ["products covered", "exclusivity", "minimum purchases", "marketing"],
      specificInstructions: "Include detailed territory definitions, pricing structures, and performance requirements.",
    },
  },
  
  freelance: {
    id: "freelance",
    name: "Freelance Contract",
    description: "Agreement with freelance workers",
    category: "employment",
    parties: {
      party1: { label: "Freelancer", placeholder: "Freelancer Name" },
      party2: { label: "Client/Company", placeholder: "Client Company Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Project Fee", required: true },
      startDate: { show: true, label: "Project Start Date", required: true },
      endDate: { show: true, label: "Project End Date" },
      duration: { show: true, label: "Project Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Scope of work",
      "Intellectual property rights",
      "Payment terms",
      "Revisions policy",
      "Confidentiality agreement",
      "Termination provisions",
    ],
    aiContext: {
      focus: ["project scope", "deliverables", "payment", "intellectual property"],
      keyProvisions: ["work description", "milestones", "payment schedule", "ownership"],
      specificInstructions: "Include detailed project scope, deliverables, and payment milestones. Emphasize independent contractor status.",
    },
  },
  
  internship: {
    id: "internship",
    name: "Internship Agreement",
    description: "Agreement for internship positions",
    category: "employment",
    parties: {
      party1: { label: "Intern Name", placeholder: "Student Name" },
      party2: { label: "Host Company", placeholder: "Company Name Ltd" },
    },
    fields: {
      compensation: { show: true, label: "Stipend (if applicable)" },
      startDate: { show: true, label: "Internship Start Date", required: true },
      endDate: { show: true, label: "Internship End Date", required: true },
      duration: { show: true, label: "Internship Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Learning objectives",
      "Supervision arrangements",
      "Working hours",
      "Confidentiality agreement",
      "Intellectual property rights",
      "Early termination",
    ],
    aiContext: {
      focus: ["learning objectives", "supervision", "work hours", "evaluation"],
      keyProvisions: ["duties", "mentor assignment", "feedback process", "completion certificate"],
      specificInstructions: "Focus on educational aspects and learning outcomes. Include supervision and evaluation provisions.",
    },
  },
  
  mou: {
    id: "mou",
    name: "Memorandum of Understanding",
    description: "Preliminary agreement outlining intentions",
    category: "legal",
    parties: {
      party1: { label: "First Party", placeholder: "Party A Organization" },
      party2: { label: "Second Party", placeholder: "Party B Organization" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Expiration Date" },
      duration: { show: true, label: "MOU Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Purpose and objectives",
      "Roles and responsibilities",
      "Resource commitments",
      "Confidentiality provisions",
      "Binding vs non-binding terms",
      "Amendment procedures",
    ],
    aiContext: {
      focus: ["mutual understanding", "cooperation areas", "responsibilities", "non-binding nature"],
      keyProvisions: ["scope of cooperation", "contributions", "communication protocols", "review process"],
      specificInstructions: "Clearly distinguish between binding and non-binding provisions. Focus on mutual objectives and cooperation framework.",
    },
  },
  
  poa: {
    id: "poa",
    name: "Power of Attorney",
    description: "Document granting legal authority",
    category: "legal",
    parties: {
      party1: { label: "Principal (Grantor)", placeholder: "Principal Name" },
      party2: { label: "Agent (Attorney-in-Fact)", placeholder: "Agent Name" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Expiration Date" },
      duration: { show: true, label: "POA Duration" },
      industry: { show: false },
    },
    suggestedClauses: [
      "Scope of authority",
      "Specific powers granted",
      "Limitations on authority",
      "Revocation provisions",
      "Durability provisions",
      "Successor agent provisions",
    ],
    aiContext: {
      focus: ["authority grant", "specific powers", "limitations", "revocation"],
      keyProvisions: ["powers enumerated", "effective period", "principal capacity", "agent duties"],
      specificInstructions: "Clearly enumerate specific powers granted and any limitations. Include jurisdiction-specific formalities.",
    },
  },
  
  noncompete: {
    id: "noncompete",
    name: "Non-Compete Agreement",
    description: "Agreement restricting competitive activities",
    category: "legal",
    parties: {
      party1: { label: "Restricted Party", placeholder: "Employee/Party Name" },
      party2: { label: "Protected Party", placeholder: "Employer/Company Name" },
    },
    fields: {
      compensation: { show: true, label: "Consideration (if any)" },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Restriction End Date" },
      duration: { show: true, label: "Restriction Period" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Scope of restriction",
      "Geographic limitation",
      "Time limitation",
      "Consideration provided",
      "Injunctive relief",
      "Severability provisions",
    ],
    aiContext: {
      focus: ["competition restrictions", "geographic scope", "time period", "enforceability"],
      keyProvisions: ["prohibited activities", "territory", "duration", "garden leave"],
      specificInstructions: "Ensure restrictions are reasonable and enforceable under jurisdiction-specific laws.",
    },
  },
  
  terms: {
    id: "terms",
    name: "Terms of Service",
    description: "Terms and conditions for service usage",
    category: "policy",
    parties: {
      party1: { label: "Service Provider", placeholder: "Your Company Ltd" },
      party2: { label: "Legal Contact", placeholder: "legal@company.com" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: false },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Acceptable use policy",
      "User obligations",
      "Intellectual property rights",
      "Limitation of liability",
      "Dispute resolution",
      "Governing law",
    ],
    aiContext: {
      focus: ["service terms", "user obligations", "liability", "intellectual property"],
      keyProvisions: ["service description", "user responsibilities", "prohibited conduct", "termination"],
      specificInstructions: "Include comprehensive terms covering user rights and obligations, with clear liability limitations.",
    },
  },
  
  "website-terms": {
    id: "website-terms",
    name: "Website Terms and Conditions",
    description: "Terms for website usage",
    category: "policy",
    parties: {
      party1: { label: "Website Owner", placeholder: "Website Owner Ltd" },
      party2: { label: "Legal Contact", placeholder: "legal@website.com" },
    },
    fields: {
      compensation: { show: false },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: false },
      duration: { show: false },
      industry: { show: true },
    },
    suggestedClauses: [
      "Acceptable use policy",
      "Intellectual property rights",
      "User-generated content",
      "Privacy integration",
      "Cookie usage",
      "Limitation of liability",
    ],
    aiContext: {
      focus: ["website usage", "content ownership", "user conduct", "liability"],
      keyProvisions: ["access terms", "content restrictions", "linking policy", "disclaimers"],
      specificInstructions: "Include website-specific terms for content, linking, and user conduct.",
    },
  },
  
  crossborder: {
    id: "crossborder",
    name: "Cross-Border Agreement",
    description: "International business agreement",
    category: "business",
    parties: {
      party1: { label: "First Party", placeholder: "Company A (Country)" },
      party2: { label: "Second Party", placeholder: "Company B (Country)" },
    },
    fields: {
      compensation: { show: true, label: "Contract Value" },
      startDate: { show: true, label: "Effective Date", required: true },
      endDate: { show: true, label: "Agreement End Date" },
      duration: { show: true, label: "Agreement Duration" },
      industry: { show: true },
    },
    suggestedClauses: [
      "Choice of law",
      "Dispute resolution (arbitration)",
      "Currency and payment terms",
      "Force majeure clause",
      "Language provisions",
      "Export/import compliance",
    ],
    aiContext: {
      focus: ["international terms", "governing law", "dispute resolution", "currency"],
      keyProvisions: ["jurisdiction selection", "arbitration clause", "exchange rate handling", "compliance"],
      specificInstructions: "Address cross-border complexities including choice of law, currency, and international arbitration.",
    },
  },
};

/**
 * Get configuration for a specific document type
 */
export function getDocumentTypeConfig(typeId: string): DocumentTypeConfig | undefined {
  return documentTypeConfigs[typeId];
}

/**
 * Get party labels for a document type
 */
export function getPartyLabels(typeId: string): { party1: string; party2: string } {
  const config = documentTypeConfigs[typeId];
  if (!config) {
    return { party1: "First Party", party2: "Second Party" };
  }
  return {
    party1: config.parties.party1.label,
    party2: config.parties.party2.label,
  };
}

/**
 * Get suggested clauses for a document type
 */
export function getSuggestedClauses(typeId: string): string[] {
  const config = documentTypeConfigs[typeId];
  return config?.suggestedClauses || [
    "Non-compete clause",
    "Intellectual property rights",
    "Termination provisions",
    "Force majeure clause",
    "Dispute resolution mechanism",
    "Data protection compliance",
  ];
}

/**
 * Check if a field should be shown for a document type
 */
export function shouldShowField(typeId: string, fieldName: keyof DocumentTypeConfig["fields"]): boolean {
  const config = documentTypeConfigs[typeId];
  if (!config) return true; // Default to showing if no config
  return config.fields[fieldName]?.show ?? true;
}

/**
 * Get field label for a document type
 */
export function getFieldLabel(typeId: string, fieldName: keyof DocumentTypeConfig["fields"], defaultLabel: string): string {
  const config = documentTypeConfigs[typeId];
  return config?.fields[fieldName]?.label || defaultLabel;
}
