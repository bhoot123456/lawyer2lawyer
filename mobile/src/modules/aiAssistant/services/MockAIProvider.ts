// ============================================================
// Mock AI Provider
// Provides realistic mocked responses for all 6 AI features.
// Implements the AIProvider interface.
// Replace with OpenAIProvider for real AI integration.
// ============================================================

import { searchLawyers } from "@/services/api";
import type { AIProvider } from "./AIProvider";
import type {
  DraftLegalNoticeInput,
  DraftLegalNoticeResponse,
  SummarizeJudgmentInput,
  SummarizeJudgmentResponse,
  ExplainBareActInput,
  ExplainBareActResponse,
  GenerateCaseSummaryInput,
  CaseSummaryResponse,
  SearchLegalDocumentsInput,
  SearchDocumentsResponse,
  LegalDocumentSearchResult,
  GenerateChecklistInput,
  GenerateChecklistResponse,
  FindLawyersInput,
  FindLawyersResponse,
} from "../types";

/** Simulate network delay for realistic UX */
const delay = (minMs: number, maxMs: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs)
  );

/** Generate a unique ID */
const generateId = (): string =>
  `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * MockAIProvider - Returns realistic placeholder responses.
 * Used for development and testing. Replace with OpenAIProvider in production.
 */
export class MockAIProvider implements AIProvider {
  async generateLegalNotice(input: DraftLegalNoticeInput): Promise<DraftLegalNoticeResponse> {
    await delay(1500, 3000);
    const { noticeType, clientName, recipientName, facts, reliefSought, language } = input;
    const lang = language === "hindi" ? "हिंदी" : "English";

    const noticeTitleMap: Record<string, string> = {
      "legal-notice": "LEGAL NOTICE",
      "demand-notice": "DEMAND NOTICE",
      "eviction-notice": "EVICTION NOTICE",
      "termination-notice": "TERMINATION NOTICE",
      "breach-notice": "BREACH OF CONTRACT NOTICE",
      custom: "CUSTOM LEGAL NOTICE",
    };
    const title = noticeTitleMap[noticeType] ?? "LEGAL NOTICE";

    const body = `
${title}
Date: ${new Date().toLocaleDateString("en-IN")}
Language: ${lang}
--------------------------------------------------------------------------------

TO,
${recipientName}
Through this notice, you are hereby informed as follows:

1. CLIENT: ${clientName}
2. FACTS: ${facts}
3. RELIEF SOUGHT: ${reliefSought}

KINDLY TAKE NOTICE that unless the aforementioned relief is granted within 15 days from the receipt of this notice, our client shall be constrained to initiate appropriate legal proceedings against you, and you shall be held liable for all costs and consequences arising therefrom.

This notice is being sent without prejudice to our client's rights and contentions under the law.

Sincerely,
${clientName}
(Through Counsel)

Place: [City]
Date: ${new Date().toLocaleDateString("en-IN")}
`.trim();

    return {
      noticeTitle: title,
      noticeBody: body,
      generatedAt: new Date().toISOString(),
    };
  }

  async summarizeJudgment(input: SummarizeJudgmentInput): Promise<SummarizeJudgmentResponse> {
    await delay(2000, 3500);

    return {
      facts: `The case involves a dispute arising from ${input.judgmentText.substring(0, 100)}... The appellant contended that the lower court failed to consider material evidence on record. The respondent argued that the judgment was based on proper appreciation of facts and law.`,
      issues: `1. Whether the lower court erred in its interpretation of the applicable law?\n2. Whether the evidence on record sufficiently supports the findings?\n3. Whether the relief granted is proportionate to the injury suffered?`,
      courtFindings: `The court examined the evidence presented and found that the lower court had correctly appreciated the factual matrix. However, the court observed procedural irregularities in the manner evidence was recorded. The court noted that the balance of convenience lies in favor of maintaining the status quo.`,
      decision: `Appeal dismissed with costs. The judgment of the lower court is upheld. The court directed the parties to bear their own costs. No order as to costs.`,
      keyObservations: `The court made key observations regarding the standard of proof required in such matters. The court emphasised that substantial justice should prevail over technicalities. The court also noted the need for timely disposal of cases.`,
      ratioDecidendi: `The principle of law laid down in this case is that when there is conflicting evidence, the court must weigh the probabilities and the burden of proof lies on the party who asserts the affirmative.`,
    };
  }

  async explainBareAct(input: ExplainBareActInput): Promise<ExplainBareActResponse> {
    await delay(1500, 2500);

    const { actName, sectionNumber } = input;

    return {
      simpleExplanation: `Section ${sectionNumber} of the ${actName} deals with the legal provisions governing this area of law. In simple terms, this section provides that any person who contravenes the provisions of this Act shall be liable for penalties as prescribed. The section aims to ensure compliance with the statutory framework and protect the rights of affected parties.`,
      importantKeywords: [
        "Contravention",
        "Liability",
        "Penalty",
        "Statutory Compliance",
        "Jurisdiction",
        "Burden of Proof",
        "Remedial Measures",
      ],
      example: `Example: If a person violates Section ${sectionNumber} by failing to comply with the requirements, they may be subject to a fine of up to ₹[Amount] or imprisonment for a term of up to [Years] years, or both. For instance, in a recent case, the court held that non-compliance with this section resulted in the transaction being declared void ab initio.`,
      futureCaseReferences: `[Future case references will be populated with real citations when OpenAI integration is active]`,
    };
  }

  async generateCaseSummary(input: GenerateCaseSummaryInput): Promise<CaseSummaryResponse> {
    await delay(2000, 3500);

    const { caseFacts, parties, issues, court } = input;

    return {
      background: `This case was heard in the ${court || "Hon'ble Court"} involving ${parties || "the parties named above"}. The matter arises from ${caseFacts.substring(0, 150)}... The case has a chequered history with multiple hearings and interim orders.`,
      legalIssues: `The primary legal issues framed for consideration are:\n1. ${issues || "Whether the facts constitute a valid cause of action"}\n2. Whether the relief sought is maintainable in law\n3. Whether there are any procedural bars to the maintainability of the petition`,
      arguments: `The counsel for the petitioner argued that the facts clearly establish a prima facie case and that the balance of convenience is in favor of granting relief. The respondent's counsel countered that the petition lacks merit and is barred by limitation. Both sides relied on precedents including [Case citations].`,
      evidence: `The evidence on record includes: (1) Documentary evidence consisting of agreements and correspondence; (2) Oral evidence of witnesses; (3) Expert opinions where applicable; (4) Previous orders and judgments of coordinate benches.`,
      outcome: `After hearing both sides and perusing the record, the court disposed of the matter with the following directions: [Detailed outcome will be generated based on case-specific analysis]. The court emphasized the importance of following due process.`,
      importantPoints: [
        "The court reaffirmed the principle of natural justice",
        "Burden of proof lies on the party asserting the claim",
        "Procedural compliance is essential for maintainability",
        "Delay and laches can be a ground for denial of relief",
        "Each case must be decided on its own facts",
      ],
    };
  }

  async searchLegalDocuments(input: SearchLegalDocumentsInput): Promise<SearchDocumentsResponse> {
    await delay(1000, 2000);

    const { keyword } = input;
    const lowerKeyword = keyword.toLowerCase();

    const mockResults: LegalDocumentSearchResult[] = [
      {
        id: generateId(),
        title: `Supreme Court Guidelines on ${keyword}`,
        matchedText: `The Hon'ble Supreme Court has laid down comprehensive guidelines regarding "${keyword}" in a landmark judgment. The court held that...`,
        relevance: 95,
      },
      {
        id: generateId(),
        title: `${keyword} - Legal Framework and Procedure`,
        matchedText: `This document provides an exhaustive analysis of the legal framework governing ${keyword}. It covers the procedural aspects and statutory provisions...`,
        relevance: 88,
      },
      {
        id: generateId(),
        title: `Recent Amendments in ${keyword} Law`,
        matchedText: `The ${keyword} law has undergone significant amendments as per the latest notification. Key changes include modifications to the procedural requirements...`,
        relevance: 82,
      },
      {
        id: generateId(),
        title: `Practice and Procedure: ${keyword} Matters`,
        matchedText: `This comprehensive guide outlines the practice and procedure to be followed in ${keyword} matters before various courts and tribunals...`,
        relevance: 76,
      },
      {
        id: generateId(),
        title: `Case Law Compilation on ${keyword}`,
        matchedText: `A compilation of landmark judgments on ${keyword} from the Supreme Court and various High Courts, organized by year and subject matter...`,
        relevance: 71,
      },
    ].filter((r) => r.title.toLowerCase().includes(lowerKeyword) || r.matchedText.toLowerCase().includes(lowerKeyword));

    // Always return at least some results even if filter is empty
    const results = mockResults.length > 0
      ? mockResults
      : [
          {
            id: generateId(),
            title: `General Information on "${keyword}"`,
            matchedText: `Search results for "${keyword}" will include relevant legal documents, case laws, and statutory provisions. The system indexes documents from multiple legal databases...`,
            relevance: 60,
          },
        ];

    return {
      results,
      totalResults: results.length,
      query: keyword,
    };
  }

  async generateChecklist(input: GenerateChecklistInput): Promise<GenerateChecklistResponse> {
    await delay(1500, 2500);

    const caseType = input.caseType;

    const checklists: Record<string, GenerateChecklistResponse> = {
      civil: {
        caseType: "Civil",
        requiredDocuments: [
          "Plaint / Petition with all annexures",
          "Power of Attorney / Vakalatnama",
          "Cause title with parties' details",
          "Affidavit in support of plaint",
          "List of documents relied upon",
          "Court fee stamps / electronic payment receipt",
          "Notice under Section 80 CPC (if applicable)",
        ],
        importantDates: [
          "Date of cause of action",
          "Date of filing",
          "Date of service of summons",
          "Date of first hearing",
          "Limitation expiry date",
          "Next date of hearing",
        ],
        applicableLaws: [
          "Code of Civil Procedure, 1908",
          "Indian Evidence Act, 1872",
          "Limitation Act, 1963",
          "Specific Relief Act, 1963",
          "Indian Contract Act, 1872",
        ],
        courtProcedure: [
          "Filing of plaint with requisite court fee",
          "Service of summons to defendant",
          "Filing of written statement by defendant",
          "Replication by plaintiff (if required)",
          "Framing of issues by court",
          "Plaintiff's evidence (examination-in-chief, cross-examination)",
          "Defendant's evidence",
          "Final arguments",
          "Judgment and decree",
        ],
        estimatedTimeline: "6 months to 2 years depending on court jurisdiction and complexity",
        checklists: [
          {
            category: "Pre-Filing",
            items: [
              "Verify limitation period",
              "Draft and verify the plaint",
              "Collect all supporting documents",
              "Prepare affidavit in support",
              "Check court fee calculation",
            ],
          },
          {
            category: "Post-Filing",
            items: [
              "Obtain case number and next date",
              "Serve summons to defendant",
              "Track service reports",
              "Prepare for first hearing",
            ],
          },
        ],
      },
      criminal: {
        caseType: "Criminal",
        requiredDocuments: [
          "FIR copy",
          "Charge sheet / Final report",
          "Police investigation report",
          "Medical reports / Forensic evidence",
          "Witness statements (161 CrPC statements)",
          "Previous criminal record (if any)",
          "Identification documents",
          "Bail application / Order",
        ],
        importantDates: [
          "Date of occurrence",
          "Date of FIR registration",
          "Date of arrest",
          "Date of remand",
          "Date of charge sheet filing",
          "Date of framing of charges",
          "Next hearing date",
        ],
        applicableLaws: [
          "Code of Criminal Procedure, 1973",
          "Indian Penal Code, 1860",
          "Indian Evidence Act, 1872",
          "Bharatiya Nyaya Sanhita, 2023 (if applicable)",
          "Bharatiya Nagarik Suraksha Sanhita, 2023 (if applicable)",
        ],
        courtProcedure: [
          "Registration of FIR",
          "Investigation by police",
          "Filing of charge sheet",
          "Cognizance by magistrate",
          "Supply of documents to accused (Section 207/208 CrPC)",
          "Framing of charges",
          "Prosecution evidence",
          "Defence evidence",
          "Final arguments",
          "Judgment",
        ],
        estimatedTimeline: "1 to 5 years depending on complexity and court",
        checklists: [
          {
            category: "Investigation Stage",
            items: [
              "File complaint / inform police",
              "Preserve evidence",
              "Collect medical records (if applicable)",
              "Identify witnesses",
              "Obtain FIR copy",
            ],
          },
          {
            category: "Trial Stage",
            items: [
              "Engage counsel",
              "Apply for bail if needed",
              "File reply to bail application",
              "Prepare witnesses for examination",
              "Collect and file remaining evidence",
            ],
          },
        ],
      },
      property: {
        caseType: "Property",
        requiredDocuments: [
          "Sale deed / Title deed",
          "Mutation entries / Revenue records",
          "Property tax receipts",
          "Encumbrance certificate",
          "Site plan / Layout plan",
          "Previous chain of title documents",
          "Registered agreements / MOUs",
          "Will / Succession certificate (if inherited)",
        ],
        importantDates: [
          "Date of purchase / transfer",
          "Date of possession",
          "Date of registration",
          "Date of notice, if any",
          "Limitation period for property disputes",
        ],
        applicableLaws: [
          "Transfer of Property Act, 1882",
          "Indian Registration Act, 1908",
          "Specific Relief Act, 1963",
          "Limitation Act, 1963",
          "State-specific land revenue codes",
          "Real Estate (Regulation and Development) Act, 2016",
        ],
        courtProcedure: [
          "Filing of suit / petition with court fee",
          "Application for interim relief (if urgent)",
          "Service of notice to opposite party",
          "Filing of written statement",
          "Settlement / Mediation attempt",
          "Trial",
          "Final arguments and judgment",
        ],
        estimatedTimeline: "1 to 4 years depending on court and complexity",
        checklists: [
          {
            category: "Pre-Litigation",
            items: [
              "Verify title and encumbrances",
              "Collect all property documents",
              "Check limitation period",
              "Send legal notice if required",
              "Attempt mediation / settlement",
            ],
          },
          {
            category: "Litigation",
            items: [
              "File suit with appropriate court fee",
              "Apply for interim orders if needed",
              "Serve summons",
              "Prepare evidence (documentary and oral)",
              "Track case progress regularly",
            ],
          },
        ],
      },
      family: {
        caseType: "Family",
        requiredDocuments: [
          "Marriage certificate / proof of marriage",
          "Birth certificates of children (if any)",
          "Income proof of both parties",
          "Property details / assets statement",
          "Evidence of cruelty / dowry demand (if applicable)",
          "Medical records (if relevant)",
          "Previous court orders (if any)",
          "Photographs and communication records",
        ],
        importantDates: [
          "Date of marriage",
          "Date of separation (if applicable)",
          "Date of last cohabitation",
          "Date of birth of children",
          "Date of filing of case",
        ],
        applicableLaws: [
          "Hindu Marriage Act, 1955 / Special Marriage Act, 1954",
          "Hindu Succession Act, 1956",
          "Protection of Women from Domestic Violence Act, 2005",
          "Dowry Prohibition Act, 1961",
          "Indian Penal Code, 1860 (Section 498A etc.)",
          "Family Courts Act, 1984",
        ],
        courtProcedure: [
          "Filing of petition in appropriate family court",
          "Attempt at mediation / conciliation",
          "Service of notice to respondent",
          "Filing of reply / counter",
          "Trial / recording of evidence",
          "Judgment and decree",
        ],
        estimatedTimeline: "6 months to 3 years depending on settlement or contest",
        checklists: [
          {
            category: "Pre-Filing",
            items: [
              "Attempt reconciliation / counselling",
              "Gather all marriage-related documents",
              "Document instances of dispute",
              "List all assets and liabilities",
              "Consult with family counsellor if required",
            ],
          },
          {
            category: "During Proceedings",
            items: [
              "Attend all court hearings",
              "Comply with interim orders",
              "Maintain communication logs",
              "Keep track of maintenance payments (if ordered)",
              "Preserve all correspondence",
            ],
          },
        ],
      },
      consumer: {
        caseType: "Consumer",
        requiredDocuments: [
          "Proof of purchase / invoice / bill",
          "Warranty / Guarantee card (if applicable)",
          "Copy of complaint made to seller/service provider",
          "Defect / Deficiency evidence (photos, videos, reports)",
          "Correspondence with opposite party",
          "Legal notice copy (if sent)",
          "ID proof of complainant",
        ],
        importantDates: [
          "Date of purchase / service availed",
          "Date of defect / deficiency noticed",
          "Date of complaint to service provider",
          "Date of legal notice",
          "Limitation period (2 years from cause of action)",
        ],
        applicableLaws: [
          "Consumer Protection Act, 2019",
          "Consumer Protection (E-Commerce) Rules, 2020",
          "Legal Metrology Act, 2009",
          "Indian Contract Act, 1872",
        ],
        courtProcedure: [
          "Draft and file complaint before appropriate Consumer Commission",
          "Payment of prescribed fee",
          "Notice to opposite party",
          "Filing of written version / defence",
          "Evidence by affidavit",
          "Arguments and order",
          "Appeal (if needed) to higher commission",
        ],
        estimatedTimeline: "3 months to 1 year for District Forum; longer for higher commissions",
        checklists: [
          {
            category: "Before Filing",
            items: [
              "Send legal notice to the opposite party",
              "Wait for 30 days for response",
              "Collect all evidence of defect/deficiency",
              "Check if the service/product is covered under Consumer Protection Act",
              "Verify limitation period",
            ],
          },
          {
            category: "Filing & After",
            items: [
              "File complaint with proper jurisdiction",
              "Attach all documents as annexures",
              "Pay prescribed fee",
              "Track case status online (if available)",
              "Comply with all directions of the Commission",
            ],
          },
        ],
      },
      "cheque-bounce": {
        caseType: "Cheque Bounce",
        requiredDocuments: [
          "Original cheque and banker's memo (return memo)",
          "Legal notice sent to drawer (mandatory)",
          "Proof of delivery of legal notice",
          "Bank statement showing cheque return",
          "Proof of underlying liability / transaction",
          "Registered post / courier receipts",
          "Acknowledgement card / delivery proof",
        ],
        importantDates: [
          "Date of cheque issuance",
          "Date of cheque presentation",
          "Date of cheque return / dishonour",
          "Date of receipt of return memo from bank",
          "Date of sending legal notice",
          "Date of service of notice (30 days from receipt)",
          "15 days from service of notice to file complaint",
          "Limitation - complaint within 1 month of notice expiry",
        ],
        applicableLaws: [
          "Negotiable Instruments Act, 1881 (Section 138-142)",
          "Code of Criminal Procedure, 1973",
          "Indian Evidence Act, 1872",
          "Limitation Act, 1963",
        ],
        courtProcedure: [
          "Send legal notice within 30 days of cheque return",
          "Wait 15 days from service of notice",
          "File complaint within 1 month of notice expiry",
          "Examination of complainant (pre-summoning evidence)",
          "Issue of summons to accused",
          "Plea of accused",
          "Complainant's evidence",
          "Accused's evidence (Section 313 CrPC statement)",
          "Final arguments",
          "Judgment",
        ],
        estimatedTimeline: "6 months to 2 years depending on court and accused's cooperation",
        checklists: [
          {
            category: "Immediate Steps (within 30 days)",
            items: [
              "Get the cheque return memo from bank",
              "Send legal notice via registered post and courier",
              "Keep proof of dispatch and delivery",
              "Do not delay - strict timelines apply",
            ],
          },
          {
            category: "Legal Action (after 30+ days)",
            items: [
              "Wait for 15 days after notice service",
              "File complaint in appropriate magistrate court",
              "Pay court fee and file affidavit",
              "Appear for pre-summoning evidence",
              "Ensure summons are served to accused",
            ],
          },
        ],
      },
    };

    return checklists[caseType] ?? checklists.civil;
  }

  async findLawyers(input: FindLawyersInput): Promise<FindLawyersResponse> {
    await delay(1200, 2200);

    const specialization = input.specialization?.trim() || "general legal services";
    const state = input.state?.trim();
    const city = input.city?.trim();
    const query = [specialization, state, city].filter(Boolean).join(" • ");

    try {
      const data = await searchLawyers({
        specialization: specialization === "general legal services" ? undefined : specialization,
        state,
        city,
      });

      const lawyers = Array.isArray(data?.lawyers) ? data.lawyers : [];
      const results = lawyers.slice(0, 5).map((lawyer: any) => ({
        id: lawyer._id || lawyer.id || generateId(),
        name: lawyer.name || "Lawyer",
        specialization: lawyer.specialization || specialization,
        city: lawyer.city || city || "N/A",
        state: lawyer.state || state || "N/A",
        phone: lawyer.phone,
        about: lawyer.about,
      }));

      if (results.length > 0) {
        return {
          query,
          totalResults: results.length,
          summary: `We found ${results.length} lawyer matches that fit your requested focus on ${specialization}${state ? ` in ${state}` : ""}${city ? ` near ${city}` : ""}.`,
          results,
        };
      }
    } catch (error) {
      console.warn("Falling back to mocked lawyer results", error);
    }

    const mockResults = [
      {
        id: generateId(),
        name: "Advocate Meera Sharma",
        specialization,
        city: city || "Noida",
        state: state || "Uttar Pradesh",
        phone: "+91 98765 43210",
        about: "Experienced counsel focused on client-first advocacy and clear case strategy.",
      },
      {
        id: generateId(),
        name: "Advocate Rohan Verma",
        specialization,
        city: city || "Gurugram",
        state: state || "Haryana",
        phone: "+91 98989 11223",
        about: "Known for responsive communication and practical dispute resolution support.",
      },
      {
        id: generateId(),
        name: "Advocate Nisha Gupta",
        specialization,
        city: city || "Indore",
        state: state || "Madhya Pradesh",
        phone: "+91 98250 77889",
        about: "Combines procedural detail with a strong focus on documentation and case prep.",
      },
    ];

    return {
      query,
      totalResults: mockResults.length,
      summary: `We found ${mockResults.length} lawyer matches that fit your requested focus on ${specialization}${state ? ` in ${state}` : ""}${city ? ` near ${city}` : ""}.`,
      results: mockResults,
    };
  }
}