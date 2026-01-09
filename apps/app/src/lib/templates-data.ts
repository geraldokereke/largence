import {
  Shield,
  Users,
  FileCheck,
  Building2,
  Briefcase,
  Globe,
  FileText,
  Scale,
  Home,
  Truck,
  ShoppingCart,
  Laptop,
  Heart,
  GraduationCap,
  Zap,
  Package,
} from "lucide-react";

export interface Template {
  id: number;
  name: string;
  category: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  jurisdictions: string[];
  popularity: number;
  usageCount: number;
  lastUpdated: string;
  featured: boolean;
  detailedDescription: string;
  keyFeatures: string[];
  includedClauses: string[];
  suitableFor: string[];
  previewContent: string;
}

export const templates: Template[] = [
  {
    id: 1,
    name: "Employment Contract",
    category: "Employment",
    type: "employment",
    description:
      "Comprehensive employment agreement with terms, compensation, and benefits",
    icon: Users,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.8,
    usageCount: 1243,
    lastUpdated: "2 days ago",
    featured: true,
    detailedDescription:
      "A comprehensive employment contract that establishes the legal relationship between an employer and employee. This template covers all essential terms including job description, compensation, benefits, working hours, leave entitlements, and termination conditions. Fully compliant with local labor laws in Nigeria, Ghana, Kenya, and South Africa.",
    keyFeatures: [
      "Detailed job description and responsibilities",
      "Comprehensive compensation and benefits structure",
      "Clear working hours and overtime provisions",
      "Leave entitlements (annual, sick, maternity/paternity)",
      "Performance evaluation framework",
      "Termination and notice period clauses",
    ],
    includedClauses: [
      "Confidentiality Agreement",
      "Non-Compete Clause",
      "Intellectual Property Rights",
      "Probation Period Terms",
      "Performance Standards",
      "Disciplinary Procedures",
      "Dispute Resolution",
      "Data Protection Compliance",
    ],
    suitableFor: [
      "Full-time employees",
      "Part-time staff",
      "Senior executives",
      "Technical roles",
      "Administrative positions",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">EMPLOYMENT CONTRACT</h3>
        <p><strong>1. PARTIES</strong></p>
        <p>This Employment Agreement is entered into between [Company Name] ("Employer") and [Employee Name] ("Employee").</p>
        <p><strong>2. POSITION AND DUTIES</strong></p>
        <p>The Employee is hired for the position of [Job Title] and shall perform duties as assigned...</p>
        <p><strong>3. COMPENSATION</strong></p>
        <p>The Employee shall receive a gross salary of [Amount] per [Period]...</p>
      </div>
    `,
  },
  {
    id: 2,
    name: "Non-Disclosure Agreement (NDA)",
    category: "Contracts",
    type: "nda",
    description: "Protect confidential information with mutual or one-way NDA",
    icon: Shield,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.9,
    usageCount: 2156,
    lastUpdated: "1 week ago",
    featured: true,
    detailedDescription:
      "A legally binding Non-Disclosure Agreement to protect sensitive business information, trade secrets, and proprietary data. Available in both mutual (two-way) and unilateral (one-way) formats. Includes provisions for handling confidential information, duration of confidentiality, and consequences of breach.",
    keyFeatures: [
      "Mutual or unilateral NDA options",
      "Clear definition of confidential information",
      "Specific exclusions and permitted disclosures",
      "Duration and termination provisions",
      "Return or destruction of information clauses",
      "Injunctive relief provisions",
    ],
    includedClauses: [
      "Definition of Confidential Information",
      "Obligations of Receiving Party",
      "Permitted Disclosures",
      "Term and Termination",
      "Return of Materials",
      "No License Grant",
      "Remedies and Injunctive Relief",
      "Jurisdiction and Governing Law",
    ],
    suitableFor: [
      "Business partnerships",
      "Investor discussions",
      "Employee onboarding",
      "Contractor engagements",
      "Merger & acquisition talks",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">NON-DISCLOSURE AGREEMENT</h3>
        <p><strong>1. DEFINITION</strong></p>
        <p>"Confidential Information" means all non-public information disclosed by one party to the other...</p>
        <p><strong>2. OBLIGATIONS</strong></p>
        <p>The Receiving Party shall maintain confidentiality and not disclose Confidential Information...</p>
        <p><strong>3. TERM</strong></p>
        <p>This Agreement shall remain in effect for [Duration] from the Effective Date...</p>
      </div>
    `,
  },
  {
    id: 3,
    name: "Service Agreement",
    category: "Contracts",
    type: "service",
    description:
      "Professional services contract with scope, deliverables, and payment terms",
    icon: Briefcase,
    jurisdictions: ["Nigeria", "Ghana", "Kenya"],
    popularity: 4.7,
    usageCount: 987,
    lastUpdated: "3 days ago",
    featured: false,
    detailedDescription:
      "A professional service agreement for businesses providing services to clients. Clearly defines the scope of services, deliverables, payment terms, timelines, and quality standards. Includes provisions for service level agreements (SLAs), warranties, and liability limitations.",
    keyFeatures: [
      "Detailed scope of services and deliverables",
      "Clear payment terms and invoicing schedule",
      "Service level agreements (SLAs)",
      "Change order procedures",
      "Warranty and liability provisions",
      "Termination and suspension rights",
    ],
    includedClauses: [
      "Scope of Services",
      "Payment Terms",
      "Service Level Agreements",
      "Warranties and Representations",
      "Limitation of Liability",
      "Indemnification",
      "Termination Rights",
      "Dispute Resolution",
    ],
    suitableFor: [
      "Consulting firms",
      "IT service providers",
      "Marketing agencies",
      "Professional advisors",
      "Maintenance contractors",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">SERVICE AGREEMENT</h3>
        <p><strong>1. SERVICES</strong></p>
        <p>The Service Provider agrees to provide the following services: [Description]...</p>
        <p><strong>2. COMPENSATION</strong></p>
        <p>The Client shall pay [Amount] for the services rendered...</p>
        <p><strong>3. DELIVERABLES</strong></p>
        <p>The Service Provider shall deliver [Specific Deliverables] by [Date]...</p>
      </div>
    `,
  },
  {
    id: 4,
    name: "Privacy Policy",
    category: "Compliance",
    type: "privacy",
    description: "GDPR and NDPR compliant privacy policy for data protection",
    icon: Shield,
    jurisdictions: ["EU", "Nigeria"],
    popularity: 4.6,
    usageCount: 756,
    lastUpdated: "1 week ago",
    featured: true,
    detailedDescription:
      "A comprehensive privacy policy compliant with GDPR (EU) and NDPR (Nigeria) regulations. Covers data collection, processing, storage, user rights, and security measures. Essential for websites, mobile apps, and any business handling personal data.",
    keyFeatures: [
      "GDPR and NDPR compliance",
      "Clear data collection disclosure",
      "User rights and consent mechanisms",
      "Data retention and deletion policies",
      "Third-party sharing transparency",
      "Cookie policy integration",
    ],
    includedClauses: [
      "Data Collection and Use",
      "Legal Basis for Processing",
      "User Rights (Access, Rectification, Erasure)",
      "Data Security Measures",
      "International Data Transfers",
      "Cookie Policy",
      "Children's Privacy",
      "Policy Updates",
    ],
    suitableFor: [
      "Websites and web applications",
      "Mobile applications",
      "E-commerce platforms",
      "SaaS products",
      "Data processing services",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">PRIVACY POLICY</h3>
        <p><strong>1. INFORMATION WE COLLECT</strong></p>
        <p>We collect information you provide directly, including name, email, and usage data...</p>
        <p><strong>2. HOW WE USE YOUR INFORMATION</strong></p>
        <p>Your information is used to provide services, improve user experience...</p>
        <p><strong>3. YOUR RIGHTS</strong></p>
        <p>You have the right to access, rectify, or erase your personal data...</p>
      </div>
    `,
  },
  {
    id: 5,
    name: "Board Resolution",
    category: "Corporate",
    type: "board",
    description: "Document board decisions and corporate governance actions",
    icon: Building2,
    jurisdictions: ["Nigeria", "Ghana"],
    popularity: 4.5,
    usageCount: 543,
    lastUpdated: "2 weeks ago",
    featured: false,
    detailedDescription:
      "Formal board resolution template for documenting corporate decisions and actions. Used for approving contracts, appointments, financial decisions, and other significant corporate matters. Ensures proper corporate governance and legal compliance.",
    keyFeatures: [
      "Formal resolution structure",
      "Multiple resolution types (ordinary, special)",
      "Proper voting and quorum documentation",
      "Director signature blocks",
      "Date and reference tracking",
      "Attachment provisions",
    ],
    includedClauses: [
      "Meeting Details",
      "Quorum Confirmation",
      "Resolution Text",
      "Voting Results",
      "Director Signatures",
      "Effective Date",
      "Filing Requirements",
      "Certified True Copy Declaration",
    ],
    suitableFor: [
      "Private limited companies",
      "Public companies",
      "Non-profit organizations",
      "Holding companies",
      "Subsidiaries",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">BOARD RESOLUTION</h3>
        <p><strong>RESOLVED THAT:</strong></p>
        <p>The Board of Directors hereby approves [Action/Decision]...</p>
        <p><strong>FURTHER RESOLVED THAT:</strong></p>
        <p>The [Designated Person] is authorized to execute all necessary documents...</p>
      </div>
    `,
  },
  {
    id: 6,
    name: "Consulting Agreement",
    category: "Contracts",
    type: "consulting",
    description:
      "Independent contractor agreement with IP and confidentiality clauses",
    icon: Briefcase,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.7,
    usageCount: 892,
    lastUpdated: "4 days ago",
    featured: false,
    detailedDescription:
      "A comprehensive consulting agreement for independent contractors and consultants. Clearly establishes the independent contractor relationship, scope of work, deliverables, intellectual property ownership, and confidentiality obligations. Includes tax and liability provisions specific to consulting arrangements.",
    keyFeatures: [
      "Independent contractor status confirmation",
      "Detailed scope of work and deliverables",
      "Flexible payment structures (hourly, project-based, retainer)",
      "Intellectual property ownership clauses",
      "Confidentiality and non-solicitation provisions",
      "Expense reimbursement terms",
    ],
    includedClauses: [
      "Independent Contractor Status",
      "Scope of Services",
      "Compensation and Payment",
      "Intellectual Property Rights",
      "Confidentiality Obligations",
      "Non-Solicitation",
      "Termination Rights",
      "Tax Responsibilities",
    ],
    suitableFor: [
      "Business consultants",
      "IT contractors",
      "Strategy advisors",
      "Project managers",
      "Specialized experts",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">CONSULTING AGREEMENT</h3>
        <p><strong>1. INDEPENDENT CONTRACTOR</strong></p>
        <p>The Consultant is an independent contractor and not an employee...</p>
        <p><strong>2. SERVICES</strong></p>
        <p>The Consultant shall provide [Consulting Services] as described...</p>
        <p><strong>3. COMPENSATION</strong></p>
        <p>The Client shall pay [Rate] for services rendered...</p>
      </div>
    `,
  },
  {
    id: 7,
    name: "Terms of Service",
    category: "Compliance",
    type: "terms",
    description:
      "Website or app terms of service with user obligations and limitations",
    icon: FileCheck,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.4,
    usageCount: 654,
    lastUpdated: "1 week ago",
    featured: false,
    detailedDescription:
      "Comprehensive terms of service agreement for websites and applications. Defines user rights, obligations, acceptable use policies, liability limitations, and dispute resolution mechanisms. Essential for protecting your business from legal liability.",
    keyFeatures: [
      "User account and registration terms",
      "Acceptable use policy",
      "Content ownership and licensing",
      "Liability limitations and disclaimers",
      "Termination and suspension rights",
      "Dispute resolution procedures",
    ],
    includedClauses: [
      "Account Registration",
      "Acceptable Use Policy",
      "User Content License",
      "Prohibited Activities",
      "Disclaimer of Warranties",
      "Limitation of Liability",
      "Indemnification",
      "Termination Rights",
    ],
    suitableFor: [
      "SaaS platforms",
      "E-commerce websites",
      "Mobile applications",
      "Social networks",
      "Online marketplaces",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">TERMS OF SERVICE</h3>
        <p><strong>1. ACCEPTANCE OF TERMS</strong></p>
        <p>By accessing our service, you agree to be bound by these terms...</p>
        <p><strong>2. USE LICENSE</strong></p>
        <p>We grant you a limited, non-exclusive license to use our service...</p>
        <p><strong>3. USER OBLIGATIONS</strong></p>
        <p>You agree to use the service lawfully and not engage in prohibited activities...</p>
      </div>
    `,
  },
  {
    id: 8,
    name: "Cross-Border Agreement",
    category: "International",
    type: "crossborder",
    description:
      "International trade agreement with jurisdiction and dispute resolution",
    icon: Globe,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.6,
    usageCount: 432,
    lastUpdated: "5 days ago",
    featured: false,
    detailedDescription:
      "Specialized agreement for international business transactions involving parties in different countries. Addresses jurisdictional issues, applicable law, currency exchange, international payment terms, and cross-border dispute resolution.",
    keyFeatures: [
      "Multi-jurisdiction compatibility",
      "Choice of law provisions",
      "International payment terms (LC, TT, etc.)",
      "Currency and exchange rate clauses",
      "International arbitration provisions",
      "Force majeure and hardship clauses",
    ],
    includedClauses: [
      "Governing Law and Jurisdiction",
      "International Payment Terms",
      "Currency Provisions",
      "Import/Export Compliance",
      "International Arbitration",
      "Force Majeure",
      "Sanctions Compliance",
      "Cross-Border Data Transfer",
    ],
    suitableFor: [
      "Import/export businesses",
      "International distributors",
      "Cross-border service providers",
      "Joint ventures",
      "Global partnerships",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">CROSS-BORDER AGREEMENT</h3>
        <p><strong>1. PARTIES AND JURISDICTIONS</strong></p>
        <p>This Agreement is between parties located in [Country A] and [Country B]...</p>
        <p><strong>2. GOVERNING LAW</strong></p>
        <p>This Agreement shall be governed by the laws of [Jurisdiction]...</p>
        <p><strong>3. DISPUTE RESOLUTION</strong></p>
        <p>Disputes shall be resolved through international arbitration...</p>
      </div>
    `,
  },
  {
    id: 9,
    name: "Lease Agreement",
    category: "Corporate",
    type: "lease",
    description:
      "Commercial or residential property lease with comprehensive terms",
    icon: Home,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.7,
    usageCount: 1089,
    lastUpdated: "1 week ago",
    featured: true,
    detailedDescription:
      "Comprehensive lease agreement for commercial or residential properties. Covers rent, security deposit, maintenance responsibilities, use restrictions, renewal options, and termination conditions. Compliant with local tenancy laws.",
    keyFeatures: [
      "Commercial and residential options",
      "Detailed rent and payment terms",
      "Security deposit provisions",
      "Maintenance and repair obligations",
      "Use restrictions and permitted activities",
      "Renewal and termination clauses",
    ],
    includedClauses: [
      "Lease Term and Renewal",
      "Rent and Payment Schedule",
      "Security Deposit",
      "Maintenance Responsibilities",
      "Use Restrictions",
      "Alterations and Improvements",
      "Default and Remedies",
      "Termination Provisions",
    ],
    suitableFor: [
      "Office spaces",
      "Retail locations",
      "Residential apartments",
      "Warehouses",
      "Co-working spaces",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">LEASE AGREEMENT</h3>
        <p><strong>1. PROPERTY</strong></p>
        <p>The Landlord leases to the Tenant the property located at [Address]...</p>
        <p><strong>2. TERM</strong></p>
        <p>The lease term shall be [Duration] commencing on [Start Date]...</p>
        <p><strong>3. RENT</strong></p>
        <p>The monthly rent shall be [Amount] payable on [Day] of each month...</p>
      </div>
    `,
  },
  {
    id: 10,
    name: "Partnership Agreement",
    category: "Corporate",
    type: "partnership",
    description: "Business partnership agreement with profit sharing and governance",
    icon: Users,
    jurisdictions: ["Nigeria", "Ghana", "Kenya"],
    popularity: 4.5,
    usageCount: 678,
    lastUpdated: "6 days ago",
    featured: false,
    detailedDescription:
      "Formal partnership agreement establishing the legal relationship between business partners. Defines capital contributions, profit and loss sharing, decision-making authority, partner obligations, and exit procedures.",
    keyFeatures: [
      "Capital contribution requirements",
      "Profit and loss sharing ratios",
      "Management and decision-making authority",
      "Partner obligations and duties",
      "Exit and buyout provisions",
      "Dispute resolution mechanisms",
    ],
    includedClauses: [
      "Partnership Formation",
      "Capital Contributions",
      "Profit and Loss Allocation",
      "Management Authority",
      "Partner Duties",
      "Withdrawal and Buyout",
      "Dissolution Procedures",
      "Non-Compete",
    ],
    suitableFor: [
      "General partnerships",
      "Limited partnerships",
      "Professional partnerships",
      "Joint ventures",
      "Small business partnerships",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">PARTNERSHIP AGREEMENT</h3>
        <p><strong>1. FORMATION</strong></p>
        <p>The Partners hereby form a partnership under the name [Partnership Name]...</p>
        <p><strong>2. CAPITAL CONTRIBUTIONS</strong></p>
        <p>Each Partner shall contribute [Amount] as initial capital...</p>
        <p><strong>3. PROFIT SHARING</strong></p>
        <p>Profits and losses shall be shared in the ratio [Ratio]...</p>
      </div>
    `,
  },
  {
    id: 11,
    name: "Sales Contract",
    category: "Contracts",
    type: "sales",
    description: "Purchase and sale agreement for goods with delivery terms",
    icon: ShoppingCart,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.6,
    usageCount: 823,
    lastUpdated: "3 days ago",
    featured: false,
    detailedDescription:
      "Standard sales contract for the purchase and sale of goods. Includes product specifications, pricing, delivery terms, warranties, and risk of loss provisions. Suitable for both one-time and recurring sales.",
    keyFeatures: [
      "Detailed product specifications",
      "Clear pricing and payment terms",
      "Delivery and shipping provisions",
      "Warranties and quality assurance",
      "Risk of loss and title transfer",
      "Returns and refund policies",
    ],
    includedClauses: [
      "Goods Description",
      "Purchase Price",
      "Payment Terms",
      "Delivery and Shipping",
      "Risk of Loss",
      "Warranties",
      "Inspection Rights",
      "Returns and Refunds",
    ],
    suitableFor: [
      "Product manufacturers",
      "Wholesalers",
      "Distributors",
      "Retailers",
      "B2B sales",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">SALES CONTRACT</h3>
        <p><strong>1. GOODS</strong></p>
        <p>The Seller agrees to sell and the Buyer agrees to purchase [Description]...</p>
        <p><strong>2. PRICE</strong></p>
        <p>The total purchase price shall be [Amount]...</p>
        <p><strong>3. DELIVERY</strong></p>
        <p>Goods shall be delivered to [Address] by [Date]...</p>
      </div>
    `,
  },
  {
    id: 12,
    name: "Shareholder Agreement",
    category: "Corporate",
    type: "shareholder",
    description: "Rights and obligations of company shareholders",
    icon: Building2,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.8,
    usageCount: 934,
    lastUpdated: "4 days ago",
    featured: true,
    detailedDescription:
      "Comprehensive shareholder agreement governing the relationship between company shareholders. Addresses share ownership, voting rights, dividend policies, transfer restrictions, and dispute resolution. Essential for protecting minority shareholders and ensuring smooth corporate governance.",
    keyFeatures: [
      "Share ownership and classes",
      "Voting rights and procedures",
      "Dividend policy and distribution",
      "Transfer restrictions and pre-emption rights",
      "Drag-along and tag-along rights",
      "Deadlock resolution mechanisms",
    ],
    includedClauses: [
      "Share Ownership",
      "Voting Rights",
      "Board Composition",
      "Dividend Policy",
      "Share Transfer Restrictions",
      "Pre-emption Rights",
      "Drag-Along/Tag-Along",
      "Exit Provisions",
    ],
    suitableFor: [
      "Startups",
      "Private limited companies",
      "Family businesses",
      "Joint venture companies",
      "Investment holdings",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">SHAREHOLDER AGREEMENT</h3>
        <p><strong>1. SHAREHOLDING</strong></p>
        <p>The Shareholders hold shares in [Company Name] as follows...</p>
        <p><strong>2. BOARD OF DIRECTORS</strong></p>
        <p>The Board shall consist of [Number] directors nominated by...</p>
        <p><strong>3. TRANSFER OF SHARES</strong></p>
        <p>No Shareholder shall transfer shares without offering to other Shareholders...</p>
      </div>
    `,
  },
  {
    id: 13,
    name: "Vendor Agreement",
    category: "Contracts",
    type: "vendor",
    description: "Supply agreement for goods or services with ongoing terms",
    icon: Truck,
    jurisdictions: ["Nigeria", "Ghana", "Kenya"],
    popularity: 4.5,
    usageCount: 567,
    lastUpdated: "1 week ago",
    featured: false,
    detailedDescription:
      "Ongoing vendor or supplier agreement for the regular provision of goods or services. Includes pricing schedules, delivery terms, quality standards, payment terms, and performance metrics. Ideal for establishing long-term supplier relationships.",
    keyFeatures: [
      "Ongoing supply relationship",
      "Volume-based pricing",
      "Quality and performance standards",
      "Delivery schedules and logistics",
      "Payment terms and credit limits",
      "Exclusivity and non-compete options",
    ],
    includedClauses: [
      "Scope of Supply",
      "Pricing and Payment",
      "Delivery Terms",
      "Quality Standards",
      "Performance Metrics",
      "Warranties",
      "Termination Rights",
      "Liability and Indemnification",
    ],
    suitableFor: [
      "Manufacturing companies",
      "Retail businesses",
      "Service providers",
      "Restaurants and hospitality",
      "Construction firms",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">VENDOR AGREEMENT</h3>
        <p><strong>1. SUPPLY TERMS</strong></p>
        <p>The Vendor shall supply [Goods/Services] to the Company as ordered...</p>
        <p><strong>2. PRICING</strong></p>
        <p>Pricing shall be as set forth in Schedule A, subject to adjustment...</p>
        <p><strong>3. DELIVERY</strong></p>
        <p>The Vendor shall deliver within [Timeframe] of receiving purchase orders...</p>
      </div>
    `,
  },
  {
    id: 14,
    name: "Software License Agreement",
    category: "Contracts",
    type: "software",
    description: "End-user license for software products and SaaS platforms",
    icon: Laptop,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.7,
    usageCount: 1456,
    lastUpdated: "2 days ago",
    featured: true,
    detailedDescription:
      "Software license agreement for granting end-users the right to use software products or SaaS platforms. Covers license scope, restrictions, support and maintenance, updates, data ownership, and termination. Available in perpetual and subscription models.",
    keyFeatures: [
      "License grant and scope",
      "Usage restrictions and limitations",
      "Support and maintenance terms",
      "Update and upgrade provisions",
      "Data ownership and privacy",
      "Audit rights and compliance",
    ],
    includedClauses: [
      "License Grant",
      "Permitted Uses",
      "Restrictions",
      "Support Services",
      "Updates and Upgrades",
      "Data Rights",
      "Audit Rights",
      "Termination",
    ],
    suitableFor: [
      "SaaS companies",
      "Software vendors",
      "Mobile app developers",
      "Enterprise software providers",
      "Cloud service platforms",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">SOFTWARE LICENSE AGREEMENT</h3>
        <p><strong>1. LICENSE GRANT</strong></p>
        <p>Licensor grants Licensee a non-exclusive, non-transferable license to use...</p>
        <p><strong>2. RESTRICTIONS</strong></p>
        <p>Licensee shall not copy, modify, reverse engineer, or distribute the Software...</p>
        <p><strong>3. SUPPORT</strong></p>
        <p>Licensor shall provide technical support as described in Schedule A...</p>
      </div>
    `,
  },
  {
    id: 15,
    name: "Loan Agreement",
    category: "Corporate",
    type: "loan",
    description: "Business or personal loan with repayment terms and security",
    icon: Scale,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.6,
    usageCount: 712,
    lastUpdated: "5 days ago",
    featured: false,
    detailedDescription:
      "Formal loan agreement documenting the terms of a business or personal loan. Includes principal amount, interest rate, repayment schedule, security provisions, covenants, and default remedies. Suitable for both secured and unsecured loans.",
    keyFeatures: [
      "Loan amount and disbursement",
      "Interest rate and calculation method",
      "Repayment schedule and terms",
      "Security and collateral provisions",
      "Financial and operational covenants",
      "Default provisions and remedies",
    ],
    includedClauses: [
      "Loan Amount and Disbursement",
      "Interest Rate",
      "Repayment Schedule",
      "Security/Collateral",
      "Representations and Warranties",
      "Covenants",
      "Events of Default",
      "Remedies",
    ],
    suitableFor: [
      "Business loans",
      "Personal loans",
      "Bridge financing",
      "Working capital loans",
      "Equipment financing",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">LOAN AGREEMENT</h3>
        <p><strong>1. LOAN</strong></p>
        <p>The Lender agrees to lend to the Borrower the principal sum of [Amount]...</p>
        <p><strong>2. INTEREST</strong></p>
        <p>Interest shall accrue at the rate of [Rate]% per annum...</p>
        <p><strong>3. REPAYMENT</strong></p>
        <p>The Borrower shall repay in [Number] installments commencing on [Date]...</p>
      </div>
    `,
  },
  {
    id: 16,
    name: "Data Processing Agreement",
    category: "Compliance",
    type: "dpa",
    description: "GDPR-compliant data processing agreement for processors",
    icon: Shield,
    jurisdictions: ["EU", "Nigeria", "Multi-jurisdiction"],
    popularity: 4.8,
    usageCount: 891,
    lastUpdated: "3 days ago",
    featured: true,
    detailedDescription:
      "GDPR and NDPR compliant Data Processing Agreement (DPA) for relationships between data controllers and data processors. Essential for any business processing personal data on behalf of another entity. Includes all required GDPR provisions and security obligations.",
    keyFeatures: [
      "GDPR Article 28 compliance",
      "Data processing instructions",
      "Security measures and obligations",
      "Sub-processor management",
      "Data breach notification procedures",
      "Data subject rights assistance",
    ],
    includedClauses: [
      "Processing Instructions",
      "Security Measures",
      "Sub-Processing",
      "Data Subject Rights",
      "Data Breach Notification",
      "International Transfers",
      "Audit Rights",
      "Return/Deletion of Data",
    ],
    suitableFor: [
      "Cloud service providers",
      "Marketing platforms",
      "Payroll processors",
      "CRM vendors",
      "Third-party services",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">DATA PROCESSING AGREEMENT</h3>
        <p><strong>1. DEFINITIONS</strong></p>
        <p>"Personal Data," "Processing," "Controller," and "Processor" have the meanings set forth in GDPR...</p>
        <p><strong>2. PROCESSING OF PERSONAL DATA</strong></p>
        <p>Processor shall process Personal Data only on documented instructions from Controller...</p>
        <p><strong>3. SECURITY</strong></p>
        <p>Processor shall implement appropriate technical and organizational measures...</p>
      </div>
    `,
  },
  {
    id: 17,
    name: "Franchise Agreement",
    category: "Corporate",
    type: "franchise",
    description: "Franchisee rights and obligations for business franchising",
    icon: Building2,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.5,
    usageCount: 423,
    lastUpdated: "1 week ago",
    featured: false,
    detailedDescription:
      "Comprehensive franchise agreement granting the right to operate a business under the franchisor's brand and system. Covers territory, fees, training, operations, quality control, marketing, and termination. Protects both franchisor and franchisee interests.",
    keyFeatures: [
      "Franchise grant and territory",
      "Initial and ongoing fees",
      "Training and support provisions",
      "Operating standards and quality control",
      "Marketing and advertising obligations",
      "Renewal and termination rights",
    ],
    includedClauses: [
      "Franchise Grant",
      "Territory",
      "Franchise Fees",
      "Training and Support",
      "Operating Standards",
      "Quality Control",
      "Marketing Fund",
      "Termination and Renewal",
    ],
    suitableFor: [
      "Restaurant franchises",
      "Retail franchises",
      "Service franchises",
      "Education franchises",
      "Fitness franchises",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">FRANCHISE AGREEMENT</h3>
        <p><strong>1. GRANT OF FRANCHISE</strong></p>
        <p>Franchisor grants Franchisee the right to operate [Business Type] in [Territory]...</p>
        <p><strong>2. FEES</strong></p>
        <p>Franchisee shall pay an initial franchise fee of [Amount] and ongoing royalties of [Percentage]...</p>
        <p><strong>3. TRAINING</strong></p>
        <p>Franchisor shall provide initial training and ongoing support...</p>
      </div>
    `,
  },
  {
    id: 18,
    name: "Distribution Agreement",
    category: "International",
    type: "distribution",
    description: "Distributor rights for product distribution in specific territories",
    icon: Package,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.6,
    usageCount: 645,
    lastUpdated: "6 days ago",
    featured: false,
    detailedDescription:
      "Distribution agreement appointing a distributor to sell products in a specific territory. Covers exclusivity, sales targets, pricing, marketing support, inventory, and termination. Essential for expanding into new markets through distributors.",
    keyFeatures: [
      "Territory and exclusivity provisions",
      "Sales targets and performance metrics",
      "Pricing and discount structures",
      "Marketing and promotional support",
      "Inventory and minimum orders",
      "Termination and stock buyback",
    ],
    includedClauses: [
      "Appointment and Territory",
      "Exclusivity",
      "Sales Targets",
      "Pricing and Payment",
      "Marketing Support",
      "Inventory Requirements",
      "Performance Review",
      "Termination Rights",
    ],
    suitableFor: [
      "Product manufacturers",
      "Brand owners",
      "International expansion",
      "Consumer goods",
      "Industrial products",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">DISTRIBUTION AGREEMENT</h3>
        <p><strong>1. APPOINTMENT</strong></p>
        <p>Supplier appoints Distributor as [exclusive/non-exclusive] distributor in [Territory]...</p>
        <p><strong>2. SALES TARGETS</strong></p>
        <p>Distributor shall achieve minimum sales of [Amount] per [Period]...</p>
        <p><strong>3. PRICING</strong></p>
        <p>Supplier shall sell products to Distributor at [Discount]% off retail price...</p>
      </div>
    `,
  },
  {
    id: 19,
    name: "Website Terms and Conditions",
    category: "Compliance",
    type: "website-terms",
    description: "Website usage terms with disclaimers and user agreements",
    icon: FileText,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.4,
    usageCount: 789,
    lastUpdated: "4 days ago",
    featured: false,
    detailedDescription:
      "Comprehensive website terms and conditions governing the use of your website. Covers intellectual property, user conduct, disclaimers, limitations of liability, and governing law. Essential for protecting your business from legal claims.",
    keyFeatures: [
      "Intellectual property protection",
      "User conduct and prohibited uses",
      "Content disclaimer",
      "Limitation of liability",
      "Links to third-party sites",
      "Modifications and updates",
    ],
    includedClauses: [
      "Use License",
      "Intellectual Property",
      "Prohibited Uses",
      "Disclaimer",
      "Limitations of Liability",
      "Accuracy of Information",
      "Links to Other Sites",
      "Modifications",
    ],
    suitableFor: [
      "Corporate websites",
      "E-commerce sites",
      "Blogs and content sites",
      "Service platforms",
      "Information portals",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">WEBSITE TERMS AND CONDITIONS</h3>
        <p><strong>1. AGREEMENT TO TERMS</strong></p>
        <p>By accessing this website, you agree to be bound by these Terms and Conditions...</p>
        <p><strong>2. INTELLECTUAL PROPERTY</strong></p>
        <p>All content on this website is owned by or licensed to us...</p>
        <p><strong>3. DISCLAIMER</strong></p>
        <p>The website is provided "as is" without warranties of any kind...</p>
      </div>
    `,
  },
  {
    id: 20,
    name: "Internship Agreement",
    category: "Employment",
    type: "internship",
    description: "Internship terms for student or graduate programs",
    icon: GraduationCap,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.3,
    usageCount: 512,
    lastUpdated: "1 week ago",
    featured: false,
    detailedDescription:
      "Internship agreement for student or graduate intern programs. Clarifies the educational nature of the internship, learning objectives, supervision, stipend (if any), working hours, and confidentiality. Complies with local labor laws regarding internships.",
    keyFeatures: [
      "Educational objectives and learning goals",
      "Duration and working hours",
      "Supervision and mentorship",
      "Stipend or unpaid status",
      "Confidentiality obligations",
      "Evaluation and feedback process",
    ],
    includedClauses: [
      "Internship Purpose",
      "Learning Objectives",
      "Duration and Hours",
      "Stipend/Compensation",
      "Supervision",
      "Confidentiality",
      "Intellectual Property",
      "Termination",
    ],
    suitableFor: [
      "Student internships",
      "Graduate programs",
      "Work experience placements",
      "Industrial training",
      "Co-op programs",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">INTERNSHIP AGREEMENT</h3>
        <p><strong>1. INTERNSHIP POSITION</strong></p>
        <p>The Intern is engaged for the position of [Title] for educational purposes...</p>
        <p><strong>2. DURATION</strong></p>
        <p>The internship shall commence on [Start Date] and end on [End Date]...</p>
        <p><strong>3. LEARNING OBJECTIVES</strong></p>
        <p>The Intern shall gain experience in [Areas] under supervision...</p>
      </div>
    `,
  },
  {
    id: 21,
    name: "Freelance Contract",
    category: "Employment",
    type: "freelance",
    description: "Project-based agreement for freelance professionals",
    icon: Briefcase,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.7,
    usageCount: 1324,
    lastUpdated: "2 days ago",
    featured: true,
    detailedDescription:
      "Freelance contract for project-based work with independent professionals. Clearly defines project scope, deliverables, timeline, payment terms, revisions, and intellectual property ownership. Ideal for designers, developers, writers, and other creative professionals.",
    keyFeatures: [
      "Project scope and deliverables",
      "Timeline and milestones",
      "Payment structure and schedule",
      "Revision policy",
      "IP ownership and licensing",
      "Independent contractor status",
    ],
    includedClauses: [
      "Scope of Work",
      "Deliverables",
      "Timeline and Milestones",
      "Payment Terms",
      "Revisions",
      "Intellectual Property",
      "Independent Contractor",
      "Termination",
    ],
    suitableFor: [
      "Graphic designers",
      "Web developers",
      "Content writers",
      "Photographers",
      "Marketing consultants",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">FREELANCE CONTRACT</h3>
        <p><strong>1. PROJECT SCOPE</strong></p>
        <p>Freelancer shall complete [Project Description] as detailed in Scope of Work...</p>
        <p><strong>2. DELIVERABLES</strong></p>
        <p>Freelancer shall deliver [Specific Deliverables] by [Deadline]...</p>
        <p><strong>3. PAYMENT</strong></p>
        <p>Client shall pay [Amount] upon completion and approval of deliverables...</p>
      </div>
    `,
  },
  {
    id: 22,
    name: "Memorandum of Understanding (MOU)",
    category: "Corporate",
    type: "mou",
    description: "Non-binding agreement outlining mutual cooperation terms",
    icon: FileCheck,
    jurisdictions: ["Multi-jurisdiction"],
    popularity: 4.5,
    usageCount: 876,
    lastUpdated: "5 days ago",
    featured: false,
    detailedDescription:
      "Memorandum of Understanding documenting the intention of parties to work together. While generally non-binding, it outlines cooperation areas, responsibilities, and next steps. Commonly used for partnerships, joint ventures, and collaborative projects before formal agreements.",
    keyFeatures: [
      "Purpose and objectives",
      "Areas of cooperation",
      "Responsibilities of each party",
      "Resource commitments",
      "Timeline and milestones",
      "Non-binding nature clarification",
    ],
    includedClauses: [
      "Purpose",
      "Scope of Cooperation",
      "Responsibilities",
      "Resources",
      "Timeline",
      "Confidentiality",
      "Non-Binding Nature",
      "Next Steps",
    ],
    suitableFor: [
      "Business partnerships",
      "Joint ventures",
      "Research collaborations",
      "Strategic alliances",
      "Government partnerships",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">MEMORANDUM OF UNDERSTANDING</h3>
        <p><strong>1. PURPOSE</strong></p>
        <p>This MOU outlines the intent of the parties to collaborate on [Project/Purpose]...</p>
        <p><strong>2. COOPERATION</strong></p>
        <p>The parties agree to cooperate in [Areas] to achieve [Objectives]...</p>
        <p><strong>3. NON-BINDING</strong></p>
        <p>This MOU is a statement of intent and is not legally binding...</p>
      </div>
    `,
  },
  {
    id: 23,
    name: "Power of Attorney",
    category: "Corporate",
    type: "poa",
    description: "Legal authorization to act on behalf of another party",
    icon: Scale,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.4,
    usageCount: 467,
    lastUpdated: "1 week ago",
    featured: false,
    detailedDescription:
      "Power of Attorney document granting legal authority to an agent to act on behalf of the principal. Available in general, special, or durable forms. Specifies the scope of authority, duration, and any limitations. Must comply with local notarization and witnessing requirements.",
    keyFeatures: [
      "General or limited power of attorney",
      "Specific powers granted",
      "Duration and effective date",
      "Revocation provisions",
      "Successor agent provisions",
      "Notarization requirements",
    ],
    includedClauses: [
      "Grant of Authority",
      "Powers Granted",
      "Limitations",
      "Duration",
      "Revocation",
      "Successor Agent",
      "Indemnification",
      "Governing Law",
    ],
    suitableFor: [
      "Business transactions",
      "Real estate matters",
      "Financial affairs",
      "Legal proceedings",
      "Health care decisions",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">POWER OF ATTORNEY</h3>
        <p><strong>1. PRINCIPAL AND AGENT</strong></p>
        <p>I, [Principal Name], hereby appoint [Agent Name] as my attorney-in-fact...</p>
        <p><strong>2. POWERS</strong></p>
        <p>The Agent is authorized to [Specific Powers] on my behalf...</p>
        <p><strong>3. DURATION</strong></p>
        <p>This Power of Attorney shall be effective from [Date] until [Date/Revocation]...</p>
      </div>
    `,
  },
  {
    id: 24,
    name: "Non-Compete Agreement",
    category: "Employment",
    type: "noncompete",
    description: "Restrictive covenant preventing competitive activities",
    icon: Shield,
    jurisdictions: ["Nigeria", "Ghana", "Kenya", "South Africa"],
    popularity: 4.6,
    usageCount: 734,
    lastUpdated: "3 days ago",
    featured: false,
    detailedDescription:
      "Non-compete agreement restricting an individual from engaging in competitive business activities during and after employment or business relationship. Specifies restricted activities, geographic scope, duration, and consideration. Must be reasonable to be enforceable.",
    keyFeatures: [
      "Restricted competitive activities",
      "Geographic scope",
      "Duration of restriction",
      "Consideration provided",
      "Non-solicitation provisions",
      "Remedies for breach",
    ],
    includedClauses: [
      "Restricted Activities",
      "Geographic Scope",
      "Duration",
      "Consideration",
      "Non-Solicitation",
      "Confidentiality",
      "Remedies",
      "Severability",
    ],
    suitableFor: [
      "Senior employees",
      "Sales personnel",
      "Business partners",
      "Contractors",
      "Former business owners",
    ],
    previewContent: `
      <div class="space-y-3">
        <h3 class="font-semibold">NON-COMPETE AGREEMENT</h3>
        <p><strong>1. COVENANT NOT TO COMPETE</strong></p>
        <p>Employee agrees not to engage in [Competitive Activities] within [Geographic Area]...</p>
        <p><strong>2. DURATION</strong></p>
        <p>This restriction shall apply during employment and for [Period] thereafter...</p>
        <p><strong>3. CONSIDERATION</strong></p>
        <p>In consideration for this agreement, Employee receives [Consideration]...</p>
      </div>
    `,
  },
];

export const categories = [
  { id: "all", name: "All Templates", count: templates.length },
  {
    id: "employment",
    name: "Employment",
    count: templates.filter((t) => t.category === "Employment").length,
  },
  {
    id: "contracts",
    name: "Contracts",
    count: templates.filter((t) => t.category === "Contracts").length,
  },
  {
    id: "compliance",
    name: "Compliance",
    count: templates.filter((t) => t.category === "Compliance").length,
  },
  {
    id: "corporate",
    name: "Corporate",
    count: templates.filter((t) => t.category === "Corporate").length,
  },
  {
    id: "international",
    name: "International",
    count: templates.filter((t) => t.category === "International").length,
  },
];
