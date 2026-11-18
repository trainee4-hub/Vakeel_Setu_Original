export const sharePurchaseAgreementData = {
  serviceSlug: "share-purchase-agreement",
  categorySlug: "business-contracts-agreements",
  categoryTitle: "Business Contracts & Agreements",
  title: "Share Purchase Agreement",
  h1: "Share Purchase Agreement (SPA) Legal Framework",
  seoTitle: "Share Purchase Agreement (SPA) in India | Corporate M&A Legal Guide",
  metaTitle: "Share Purchase Agreement (SPA) Drafting & Compliance in India",
  metaDescription:
    "Legal framework, Conditions Precedent, representations and warranties, FEMA pricing norms, and Companies Act compliance for Share Purchase Agreements in India.",
  shortIntro:
    "A Share Purchase Agreement (SPA) is a definitive M&A contract drafted by Bar Council-enrolled corporate advocates under the Companies Act, 2013 and the Indian Contract Act, 1872, governing the acquisition and transfer of existing shares between shareholders. It details the transaction valuation, Conditions Precedent (CPs), detailed representations and warranties, indemnity survival periods, de minimis thresholds, and Form SH-4 securities transfer mechanics, ensuring compliance with FEMA FDI pricing regulations and RBI reporting.",

  trustChips: [
    { label: "Bar Council-Enrolled Advocates", icon: "shield" },
    { label: "Companies Act & FEMA Compliant", icon: "file" },
    { label: "Confidential", icon: "lock" },
    { label: "Phone & Video Consultation", icon: "phone" },
  ],

  introduction: {
    summary:
      "A Share Purchase Agreement (SPA) is a definitive legal contract governing the sale and transfer of shares in a company from an existing shareholder (the seller) to a purchaser. In Indian corporate and M&A practice, the SPA serves as the primary transaction document detailing the purchase price, transaction structure, condition precedents, representations and warranties, indemnities, closing actions and post-closing obligations.",
    highlights: [
      "Sets out purchase price mechanics, escrow arrangements, and statutory Conditions Precedent (CPs).",
      "Comprehensive representations and warranties covering capitalization, financial statements, tax, and litigation.",
      "Structured indemnification framework with de minimis thresholds, liability caps, and survival periods.",
      "Strict compliance with Section 56 of Companies Act, 2013, FEMA FDI pricing regulations, and Form FC-TRS filings.",
    ],
  },

  applicableLaws: [
    {
      act: "Companies Act, 2013",
      section: "Sections 56 & 88",
      title: "Transfer of Securities & Statutory Member Register",
      summary:
        "Section 56 governs transfer of securities, mandating execution of securities transfer form (Form SH-4) and stamp duty payment. Section 88 regulates the statutory register of members and updating of beneficial ownership.",
      tag: "Corporate Law",
    },
    {
      act: "Indian Contract Act, 1872",
      section: "Sections 10, 27, 73 & 74",
      title: "Contractual Validity & Sale of Goodwill Non-Compete",
      summary:
        "Governs contractual validity, damages for breach of warranty, and enforceability of non-compete covenants subject to Section 27 statutory exceptions relating to the sale of business goodwill.",
      tag: "Contract Code",
    },
    {
      act: "Foreign Exchange Management Act, 1999 (FEMA)",
      section: "FDI & Non-Debt Instruments Rules, 2019",
      title: "Cross-Border Transfers & RBI Pricing Guidelines",
      summary:
        "Regulates cross-border share acquisitions involving non-resident parties, mandating adherence to fair market pricing guidelines certified by Chartered Accountants and Form FC-TRS reporting on the FIRMS portal.",
      tag: "FEMA Regulations",
    },
    {
      act: "Income-tax Act, 1961",
      section: "Sections 56(2)(x), 112 & 195",
      title: "Capital Gains Tax & Withholding Tax Deductions",
      summary:
        "Governs tax implications on capital gains arising from equity transfers, fair market valuation norms under Section 56(2)(x), and statutory withholding tax obligations under Section 195 for non-resident sellers.",
      tag: "Tax Code",
    },
    {
      act: "Competition Act, 2002 & SEBI Regulations",
      section: "CCI Approvals & Takeover Regulations",
      title: "Merger Control & Public Takeovers",
      summary:
        "Mandates prior combination clearance from the Competition Commission of India (CCI) for transactions exceeding statutory asset/turnover thresholds, and SEBI (SAST) Regulations for listed companies.",
      tag: "Regulatory Clearances",
    },
  ],

  documentsRequired: [
    {
      category: "Target Company Charters & Corporate Records",
      items: [
        {
          name: "Certificate of Incorporation, MoA & AoA",
          detail: "Constitutional documents of the target company reflecting authorized capital and share transfer restrictions.",
        },
        {
          name: "Audited Financial Statements & Tax Returns (Last 3 Years)",
          detail: "Audited balance sheets, profit & loss statements, statutory audit reports, and filed income tax returns.",
        },
        {
          name: "Official Register of Members & Capitalization Table",
          detail: "Certified extract of statutory members register and fully diluted capitalization table detailing all equity and convertible instruments.",
        },
      ],
    },
    {
      category: "Securities Transfer Documents",
      items: [
        {
          name: "Original Physical Share Certificates / Demat Holding Statements",
          detail: "Original share certificate folios to be surrendered or Client Master List (CML) showing dematerialized equity holdings.",
        },
        {
          name: "Form SH-4 (Securities Transfer Form) with Stamp Duty",
          detail: "Duly filled and executed Form SH-4 bearing requisite share transfer stamp duty (0.015% under Indian Stamp Act).",
        },
      ],
    },
    {
      category: "Regulatory Approvals & Valuation Reports",
      items: [
        {
          name: "Fair Market Valuation (FMV) Report",
          detail: "Valuation report by a SEBI-registered Merchant Banker or certified Chartered Accountant complying with Rule 11UA and FEMA FDI pricing norms.",
        },
        {
          name: "Tax Clearance Certificate (Section 281 Income-tax Act)",
          detail: "Certificate from the Income Tax Assessing Officer certifying absence of pending tax demands or attachments on the shares being sold.",
        },
      ],
    },
    {
      category: "Disclosure Letter & Due Diligence Disclosures",
      items: [
        {
          name: "Disclosure Letter with Supporting Annexures",
          detail: "Formal letter executed by the seller detailing specific exceptions, litigation disclosures, or material contracts qualifying the SPA warranties.",
        },
      ],
    },
  ],

  legalProcedure: [
    {
      step: 1,
      tag: "DUE DILIGENCE",
      title: "Comprehensive Legal Due Diligence & CP Framing",
      description:
        "Conducting corporate legal diligence across title to shares, material contracts, tax liabilities, and drafting transaction Conditions Precedent (CPs).",
      milestone: "Due Diligence Complete & CPs Structured",
    },
    {
      step: 2,
      tag: "SPA DRAFTING",
      title: "Drafting Reps, Warranties, Escrow & Indemnities",
      description:
        "Drafting the SPA including consideration adjustment mechanisms, indemnity caps, de minimis thresholds, survival windows, and Disclosure Letter exceptions.",
      milestone: "SPA & Disclosure Letter Finalised",
    },
    {
      step: 3,
      tag: "CLOSING ACTIONS",
      title: "Stamping, SH-4 Execution & Fund Consideration Transfer",
      description:
        "Executing Form SH-4, payment of purchase consideration (direct or escrow), board meeting approval of share transfer, and updating share certificates.",
      milestone: "Transaction Closing Completed",
    },
    {
      step: 4,
      tag: "POST-CLOSING FILINGS",
      title: "Register of Members Update & Regulatory Filings",
      description:
        "Updating the Register of Members, filing Form FC-TRS on the RBI FIRMS portal (for cross-border FDI transfers), and filing requisite RoC forms.",
      milestone: "Statutory Filings Complete",
    },
  ],

  whyVakeelSetu: [
    {
      title: "Bar Council-Enrolled Advocates",
      description:
        "Guidance and drafting by advocates enrolled with the Bar Council of India.",
    },
    {
      title: "Document & Procedure Guidance",
      description:
        "Help with the required forms, documents and the applicable procedure.",
    },
    {
      title: "Phone & Video Consultation",
      description:
        "Consult from anywhere; your discussion is kept confidential.",
    },
  ],

  whyChooseVakeelSetu: [
    {
      title: "Bar Council-Enrolled Advocates",
      description:
        "Guidance and drafting by advocates enrolled with the Bar Council of India.",
    },
    {
      title: "Document & Procedure Guidance",
      description:
        "Help with the required forms, documents and the applicable procedure.",
    },
    {
      title: "Phone & Video Consultation",
      description:
        "Consult from anywhere; your discussion is kept confidential.",
    },
  ],

  faqs: [
    {
      question: "What is the statutory procedure to transfer shares in a Private Limited Company under Section 56 of the Companies Act, 2013?",
      answer: "Under Section 56 of the Companies Act, 2013: (1) An instrument of transfer in Form SH-4 must be duly dated and executed by or on behalf of the transferor and transferee; (2) The SH-4 must be stamped with requisite stamp duty (0.015% under Indian Stamp Act); (3) It must be delivered to the company along with original share certificates within 60 days of execution; and (4) The Board of Directors must approve the transfer in a board meeting and register the transferee in the Register of Members.",
    },
    {
      question: "What are 'Conditions Precedent' (CPs) and why are they critical in an SPA?",
      answer: "Conditions Precedent are contractual or statutory obligations that must be fully satisfied or waived before the transaction can proceed to closing and payment of funds. Standard CPs include: obtaining third-party lender consents, regulatory clearances (CCI or sectoral regulators), Board and shareholder approvals, resolution of specified tax litigation, and accuracy of warranties on the closing date.",
    },
    {
      question: "What pricing and reporting guidelines apply under FEMA when shares are sold to a foreign investor?",
      answer: "Under the Foreign Exchange Management (Non-Debt Instruments) Rules, 2019, the transfer of shares from a resident Indian to a non-resident must not be at a price less than the Fair Market Value (FMV) calculated using an internationally accepted pricing methodology (e.g. DCF) certified by a Chartered Accountant or SEBI-registered Merchant Banker. The transfer must be reported to the RBI on Form FC-TRS via the FIRMS portal within 60 days of transfer.",
    },
    {
      question: "What is a Disclosure Letter and how does it protect the seller from warranty claims?",
      answer: "A Disclosure Letter is a formal transactional document executed by the seller and delivered to the buyer at signing. It details specific exceptions, known liabilities, pending litigation, or operational facts that would otherwise constitute a breach of the general representations and warranties in the SPA. Any matter fairly disclosed in the Disclosure Letter cannot later form the basis of an indemnity claim by the buyer.",
    },
    {
      question: "How are indemnity caps, baskets, and survival periods typically structured in an Indian SPA?",
      answer: "In Indian M&A practice: (1) General operational warranties typically survive for 12 to 24 months, while fundamental warranties (title to shares, authority) and tax warranties survive up to statutory limitation periods (e.g. 7 years for tax); (2) Indemnity claims are subject to a 'basket' or 'de minimis' threshold (claims below a set threshold cannot be brought); and (3) Total liability for general warranty breaches is typically capped at 10% to 50% of the purchase consideration, with an escrow holdback.",
    },
  ],

  consultationCta: {
    headline: "Executing a Share Sale or Acquisition? Consult Corporate M&A Advocates",
    subheadline:
      "Draft comprehensive Share Purchase Agreements, structure Conditions Precedent, and navigate Companies Act, Section 56, and FEMA pricing compliance.",
    primaryButtonText: "Consult an M&A Advocate",
    secondaryButtonText: "Explore Verified Advocates",
    points: [
      "Rigorous Conditions Precedent (CP) drafting & escrow structuring",
      "Comprehensive seller representations, warranties & Disclosure Letter vetting",
      "Form SH-4 execution, stamp duty payment & board approval guidance",
      "FEMA FDI pricing compliance & Form FC-TRS RBI reporting",
    ],
  },

  researchSources: [
    {
      title: "Companies Act, 2013 (Act No. 18 of 2013)",
      source: "Ministry of Corporate Affairs, Government of India",
      citation: "Sections 56 (Transfer of securities) and 88 (Register of members)",
    },
    {
      title: "Foreign Exchange Management (Non-Debt Instruments) Rules, 2019",
      source: "Reserve Bank of India & Ministry of Finance",
      citation: "Pricing guidelines and Form FC-TRS reporting regulations",
    },
    {
      title: "Indian Stamp Act, 1899",
      source: "Department of Revenue, Ministry of Finance",
      citation: "Article 62 (Stamp duty on share transfer instruments)",
    },
  ],

  disclaimer:
    "Educational overview only; not a substitute for transaction-specific legal advice. Equity transactions involve complex corporate, tax, and foreign exchange compliance that require structured legal due diligence.",
};

