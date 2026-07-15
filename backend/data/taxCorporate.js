// Phase 9 – Tax & Corporate
// Knowledge dataset powering the /api/tax-corporate endpoint.

const taxCorporatePhase9 = {
  lastUpdatedNote: "Last updated: 2026-07-13",
  topics: [
    {
      key: "income-tax",
      title: "Income Tax",
      category: "Direct Tax",
      procedure: [
        "Understand applicable income heads and residency status",
        "Maintain source-wise records of income and deductions",
        "Compute taxable income and tax payable",
        "File ITR within the prescribed due date",
        "Respond to notices / e-proceedings (if any)",
      ],
      requiredDocuments: [
        "Form 16/16A/16B (as applicable)",
        "Bank statements",
        "AIS/annual information statements (if applicable)",
        "Deduction proofs (80C/80D/others as applicable)",
        "PAN and Aadhaar details",
      ],
      fees: "Professional fee varies by complexity (DIY / assisted filing available).",
      timeline: "Typical filing workflow: 1–3 weeks depending on document readiness.",
      faqs: [
        {
          q: "Which ITR form should I file?",
          a: "The correct ITR depends on income type (salary/business/capital gains/etc.) and turnover. Consult a CA/Tax Consultant for exact applicability.",
        },
        {
          q: "Is it mandatory to respond to e-notices?",
          a: "Yes, if you receive a notice. Timely response helps reduce penalties/adjustments.",
        },
      ],
      downloadForms: [
        {
          label: "ITR checklist template",
          url: "https://example.com/itr-checklist.pdf",
        },
        {
          label: "Common deduction worksheet",
          url: "https://example.com/deduction-worksheet.pdf",
        },
      ],
    },

    {
      key: "gst",
      title: "GST",
      category: "Indirect Tax",
      procedure: [
        "Assess eligibility and registration requirements",
        "Collect business address, HSN/SAC details and documents",
        "Apply for GST registration on the portal",
        "File monthly/quarterly returns as per eligibility",
        "Maintain invoices, credit notes and reconciliation",
      ],
      requiredDocuments: [
        "PAN/Aadhaar (authorized signatory)",
        "Proof of business address",
        "Bank account details",
        "Photos of place of business",
        "HSN/SAC and business nature details",
      ],
      fees: "Professional fee varies (registration vs compliance).",
      timeline: "Registration: typically 15–30 days; compliance timelines vary by return frequency.",
      faqs: [
        {
          q: "What is the difference between GST registration and GST returns?",
          a: "Registration creates your GST identity; returns are periodic filings of sales/purchases and tax liabilities.",
        },
      ],
      downloadForms: [
        {
          label: "GST registration document checklist",
          url: "https://example.com/gst-registration-checklist.pdf",
        },
      ],
    },

    {
      key: "customs",
      title: "Customs",
      category: "Trade & Import/Export",
      procedure: [
        "Determine classification (HS code) and valuation",
        "Check applicable duties, exemptions and restrictions",
        "Prepare import/export documents",
        "File customs declaration (as applicable)",
        "Coordinate with clearing agent / authorized officer",
        "Track compliance and assessments",
      ],
      requiredDocuments: [
        "Commercial invoice",
        "Packing list",
        "Bill of lading / airway bill",
        "Import/export license (if applicable)",
        "HS code / product description",
      ],
      fees: "Depends on shipment complexity and handling requirements.",
      timeline: "Customs clearance timelines vary; typical clearance can range from days to weeks.",
      downloadForms: [
        {
          label: "Customs filing checklist",
          url: "https://example.com/customs-filing-checklist.pdf",
        },
      ],
      faqs: [
        {
          q: "Do I need a CHA for customs work?",
          a: "Often, yes—especially for complex shipments. A CHA helps with classification, valuation and documentation.",
        },
      ],
    },

    {
      key: "corporate-law",
      title: "Corporate Law",
      category: "Corporate Compliance",
      procedure: [
        "Review corporate structure and governance requirements",
        "Maintain statutory registers and records",
        "Convene board and shareholders meetings as required",
        "File statutory filings with ROC where applicable",
        "Update company policies and maintain compliance calendar",
      ],
      requiredDocuments: [
        "Articles/charter documents",
        "Board/committee resolutions",
        "Minutes and attendance records",
        "Updated director/officer details",
      ],
      fees: "Depends on company type and compliance scope.",
      timeline: "Compliance cycle depends on notice/annual calendar.",
      faqs: [
        {
          q: "What is the compliance calendar?",
          a: "A schedule of statutory filings and board actions for the company across the financial year.",
        },
      ],
    },

    {
      key: "company-law",
      title: "Company Law",
      category: "Company Law",
      procedure: [
        "Determine applicable provisions based on company type",
        "Ensure ROC filings are completed",
        "Comply with annual filings and auditor requirements",
        "Maintain statutory disclosures and records",
        "Handle changes in directors/shareholders where applicable",
      ],
      requiredDocuments: [
        "ROC forms (as applicable)",
        "Auditor details / reports",
        "Board resolutions",
        "Shareholding records",
      ],
      fees: "Depends on restructuring and filing complexity.",
      timeline: "Annual and event-based timelines vary.",
      downloadForms: [
        {
          label: "Company compliance calendar template",
          url: "https://example.com/company-compliance-calendar.pdf",
        },
      ],
    },

    {
      key: "roc",
      title: "ROC (Registrar of Companies)",
      category: "Registrations & Filings",
      procedure: [
        "Identify the event requiring ROC filing (annual returns, changes, etc.)",
        "Prepare and approve documents (board/shareholders)",
        "Complete ROC form(s) and supporting attachments",
        "Verify and submit on the relevant portal",
        "Track acknowledgement and follow up on resubmissions/queries",
      ],
      requiredDocuments: [
        "Incorporation/registration documents",
        "Board/shareholder resolutions",
        "Director KYC details",
        "Supporting schedules/annexures",
      ],
      fees: "Depends on number of filings and event type.",
      timeline: "Processing timelines vary by portal and queries.",
      faqs: [
        {
          q: "Why do ROC submissions sometimes get queried?",
          a: "Common reasons include document mismatch, missing attachments, or inconsistencies in director/shareholder data.",
        },
      ],
    },

    {
      key: "trademark",
      title: "Trademark",
      category: "IP",
      procedure: [
        "Perform trademark search (conflicting marks)",
        "Select class(es) and applicant details",
        "Prepare application and supporting documents",
        "File application and respond to examination objections",
        "Publish for opposition (as applicable)",
        "Proceed through registration process",
      ],
      requiredDocuments: [
        "Applicant details",
        "Logo/mark representation",
        "Goods/services description",
        "Class selection",
        "Proofs (if applicable)",
      ],
      fees: "Depends on classes and stage (search, filing, response).",
      timeline: "Multi-stage process; timelines vary by examination and opposition.",
      downloadForms: [
        {
          label: "Trademark application checklist",
          url: "https://example.com/trademark-application-checklist.pdf",
        },
      ],
      faqs: [
        {
          q: "Do I need to register in which class?",
          a: "Class depends on goods/services. Selecting the right class reduces rejection/coverage issues.",
        },
      ],
    },

    {
      key: "startup-registration",
      title: "Startup Registration",
      category: "Startup",
      procedure: [
        "Assess eligibility criteria for relevant startup scheme(s)",
        "Prepare documents including incorporation/identity details",
        "Compile statements about innovation and business activities",
        "Apply through the designated portal (as applicable)",
        "Respond to queries and maintain compliance for ongoing validity",
      ],
      requiredDocuments: [
        "Incorporation details",
        "Promoter/director KYC",
        "Pitch deck / innovation summary",
        "Financial and incorporation documents",
      ],
      fees: "Depends on consultation and documentation support.",
      timeline: "Typically 2–6+ weeks depending on portal queries.",
      faqs: [
        {
          q: "Is startup registration the same as trademark?",
          a: "No. Startup registration is eligibility/recognition for schemes; trademark protects brand/IP.",
        },
      ],
      downloadForms: [
        {
          label: "Startup eligibility document checklist",
          url: "https://example.com/startup-eligibility-checklist.pdf",
        },
      ],
    },
  ],
};

module.exports = taxCorporatePhase9;

