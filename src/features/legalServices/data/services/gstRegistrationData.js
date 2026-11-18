// Extracted & Researched content for "GST Registration" — VakeelSetu Legal Services
// Primary Statutes: Central Goods and Services Tax Act, 2017 & CGST Rules, 2017

export const gstRegistrationData = {
  serviceSlug: "gst-registration",
  categorySlug: "government-registration-certificates",
  categoryTitle: "Government Registration & Certificates",
  title: "GST Registration",
  h1: "GST Registration & Statutory Indirect Tax Advisory",
  seoTitle: "GST Registration under CGST Act, 2017 | Online Portal Guide | VakeelSetu",
  metaTitle: "GST Registration in India | Mandatory Thresholds, Documents & Procedure",
  metaDescription:
    "Complete statutory guide to GST Registration under the CGST Act, 2017. Overview of FORM GST REG-01 filing, mandatory Section 24 criteria, documents, and GSTIN issuance.",
  shortIntro:
    "Goods and Services Tax (GST) Registration is a mandatory statutory registration under the CGST Act, 2017 for businesses exceeding the ₹40 Lakhs/₹20 Lakhs turnover threshold or engaged in inter-state supplies. It grants a unique 15-digit GSTIN, authorizing tax collection, valid tax invoicing, and seamless Input Tax Credit (ITC) claims nationwide.",

  trustChips: [
    { label: "Bar Council-Enrolled Advocates", icon: "shield" },
    { label: "CGST Act & Rules Compliance", icon: "file" },
    { label: "Confidential", icon: "lock" },
    { label: "Phone & Video Consultation", icon: "phone" },
  ],

  introduction: {
    summary:
      "Goods and Services Tax (GST) Registration is the statutory process through which a business or taxable person is formally enrolled under India's indirect tax regime and allotted a unique 15-digit Goods and Services Tax Identification Number (GSTIN). Regulated under Chapter VI of the Central Goods and Services Tax Act, 2017 and State GST enactments, GST operates as a destination-based consumption tax across supply chains.\n\nObtaining registration authorizes a taxpayer to collect GST on taxable outward supplies, issue statutory tax invoices, and pass on Input Tax Credit (ITC) to downstream commercial purchasers. Operating without registration when legally liable attracts strict civil penalties and denial of credit mechanisms under Section 122 of the Act.",
    highlights: [
      "Allotment of unique 15-digit alphanumeric Goods and Services Tax Identification Number (GSTIN).",
      "Statutory threshold: ₹40 Lakhs for goods (₹20 Lakhs special states) and ₹20 Lakhs for services (₹10 Lakhs special states).",
      "Compulsory registration under Section 24 for inter-state supplies, e-commerce vendors, and RCM taxpayers.",
      "Enables legal issuance of tax invoices, interstate transit with e-Way bills, and input tax credit claims.",
    ],
  },

  applicableLaws: [
    {
      act: "Central Goods and Services Tax Act, 2017 (CGST Act)",
      section: "Chapter VI (Sections 22 to 30)",
      title: "Statutory Framework for GST Registration",
      summary:
        "Section 22 governs persons liable by turnover threshold, Section 23 specifies persons not liable, Section 24 mandates compulsory registration without threshold, and Section 25 prescribes the registration procedure. Sections 26 to 30 regulate deemed registration, amendments, cancellation, and revocation.",
      tag: "Principal GST Statute",
    },
    {
      act: "Central Goods and Services Tax Rules, 2017",
      section: "Rules 8 to 26 (FORM GST REG-01 to REG-30)",
      title: "Procedural Rules & Timelines",
      summary:
        "Prescribes electronic application requirements in FORM GST REG-01, Aadhaar authentication mandates, officer verification timelines, and electronic grant of registration certificate in FORM GST REG-06.",
      tag: "Procedural Rules",
    },
    {
      act: "Integrated Goods and Services Tax Act, 2017 (IGST Act)",
      section: "Section 5 & Section 20",
      title: "Inter-State Supplies & Cross-Border Framework",
      summary:
        "Governs tax applicability, place of supply determinations, and compulsory registration mandates for entities engaged in inter-state trade or international imports/exports.",
      tag: "Inter-State Tax",
    },
  ],

  documentsRequired: [
    {
      category: "Promoter & Business Identity",
      items: [
        {
          name: "PAN Card of Business / Applicant",
          detail: "Permanent Account Number of proprietor, partnership firm, LLP, or incorporated company.",
        },
        {
          name: "Aadhaar Card of Authorized Signatories",
          detail: "Aadhaar authentication document for promoter, managing partner, or primary director.",
        },
        {
          name: "Passport Size Photographs",
          detail: "Recent passport-sized photographs of proprietor, partners, or authorized directors.",
        },
      ],
    },
    {
      category: "Principal Place of Business Proof",
      items: [
        {
          name: "Ownership Document / Utility Bill",
          detail: "Electricity bill, property tax receipt, or municipal khata copy under 60 days old.",
        },
        {
          name: "Registered Rent / Lease Agreement",
          detail: "Executed tenancy agreement along with No Objection Certificate (NOC) from landlord.",
        },
        {
          name: "Entity Constitution Documents",
          detail: "Partnership Deed, Certificate of Incorporation, MOA & AOA, or registered LLP Agreement.",
        },
      ],
    },
    {
      category: "Banking & Formal Authorization",
      items: [
        {
          name: "Bank Account Proof",
          detail: "Cancelled cheque, bank passbook front page, or bank statement displaying entity name & IFSC.",
        },
        {
          name: "Letter of Authorization / Board Resolution",
          detail: "Formal board resolution or authorization letter appointing the designated primary authorized signatory.",
        },
      ],
    },
  ],

  legalProcedure: [
    {
      step: 1,
      tag: "TRN GENERATION",
      title: "Generate Temporary Reference Number (Part-A)",
      description:
        "The applicant enters legal PAN, business email, and primary mobile number on the common GST portal to complete dual OTP verification and generate a 15-digit TRN.",
      milestone: "TRN Generated",
    },
    {
      step: 2,
      tag: "FORM GST REG-01",
      title: "Electronic Application & Document Filing (Part-B)",
      description:
        "Using TRN, the applicant completes all statutory tabs of FORM GST REG-01 including business constitution, principal place of business, HSN/SAC codes, and uploads supporting documents.",
      milestone: "ARN Issued",
    },
    {
      step: 3,
      tag: "AADHAAR AUTH",
      title: "Biometric & Aadhaar OTP Authentication",
      description:
        "Authorized signatories execute Aadhaar e-KYC authentication via automated portal link. Successful e-KYC expedites approval without mandatory pre-registration physical inspection.",
      milestone: "e-KYC Complete",
    },
    {
      step: 4,
      tag: "OFFICER AUDIT",
      title: "Jurisdictional Officer Verification",
      description:
        "The jurisdictional tax officer scrutinizes the submitted documents within 7 working days. If clarifications are needed, FORM GST REG-03 notice is issued and responded to via REG-04 within 7 days.",
      milestone: "Verification Cleared",
    },
    {
      step: 5,
      tag: "CERTIFICATE ISSUANCE",
      title: "Grant of GSTIN & Certificate (FORM GST REG-06)",
      description:
        "Upon statutory approval, the official GST Registration Certificate is electronically issued in FORM GST REG-06 along with allotment of the permanent 15-digit GSTIN.",
      milestone: "GSTIN Active",
    },
  ],

  faqs: [
    {
      question: "What is the turnover threshold for mandatory GST registration?",
      answer:
        "Under Section 22 of the CGST Act, 2017, businesses exclusively engaged in intra-state supply of goods must register if aggregate turnover exceeds ₹40 Lakhs (₹20 Lakhs for special category states). For service providers, the mandatory threshold is ₹20 Lakhs (₹10 Lakhs in special category states).",
    },
    {
      question: "When is GST registration compulsory regardless of turnover?",
      answer:
        "Under Section 24 of the CGST Act, registration is mandatory irrespective of turnover for persons making inter-state taxable supplies, casual taxable persons, non-resident taxable persons, e-commerce sellers, and entities required to pay tax under the Reverse Charge Mechanism (RCM).",
    },
    {
      question: "How long does it take to obtain a GST registration certificate?",
      answer:
        "When application details and Aadhaar authentication are completely verified without discrepancies, the GSTIN and certificate (FORM GST REG-06) are generally approved and issued within 3 to 7 working days by the tax authority.",
    },
    {
      question: "Can an entity operate across multiple states with one GST number?",
      answer:
        "No. GST is a state-specific indirect tax regime. If an enterprise conducts commercial operations or maintains branches across multiple states or Union Territories, it must obtain a distinct GSTIN for each respective state.",
    },
    {
      question: "Is bank account information compulsory at the initial application stage?",
      answer:
        "Under Rule 10A of the CGST Rules, bank account details can be furnished after registration is approved, within 30 days of certificate grant or before filing the first GST return, whichever is earlier.",
    },
  ],

  whyVakeelSetu: [
    {
      title: "Bar Council-Enrolled Advocates",
      description: "Guidance and drafting by advocates enrolled with the Bar Council of India.",
    },
    {
      title: "Document & Procedure Guidance",
      description: "Help with the required forms, documents and the applicable procedure.",
    },
    {
      title: "Phone & Video Consultation",
      description: "Consult from anywhere; your discussion is kept confidential.",
    },
  ],

  whyChooseVakeelSetu: [
    {
      title: "Bar Council-Enrolled Advocates",
      description: "Guidance and drafting by advocates enrolled with the Bar Council of India.",
    },
    {
      title: "Document & Procedure Guidance",
      description: "Help with the required forms, documents and the applicable procedure.",
    },
    {
      title: "Phone & Video Consultation",
      description: "Consult from anywhere; your discussion is kept confidential.",
    },
  ],

  consultationCta: {
    badge: "Tax Advocate Consultation",
    title: "Speak with an Advocate Regarding GST Registration",
    description:
      "Get independent legal advice and guidance tailored to your legal requirements under applicable Indian laws.",
    points: [
      "Review of legal provisions and statutory compliance",
      "Drafting and documentation by verified advocates",
      "Direct consultation via phone or video call",
    ],
    ctaText: "Consult an Advocate",
    ctaLink: "/advocates",
  },

  researchSources: [
    {
      title: "Central Goods and Services Tax Act, 2017 (Act No. 12 of 2017)",
      source: "Ministry of Finance, Department of Revenue, Government of India",
      citation: "Chapter VI, Sections 22, 23, 24, 25, 26, 27, 28, 29, 30",
    },
    {
      title: "Central Goods and Services Tax Rules, 2017",
      source: "Central Board of Indirect Taxes and Customs (CBIC)",
      citation: "Rules governing registration, FORM GST REG-01, and FORM GST REG-06",
    },
  ],

  disclaimer:
    "Note: This document is a general introductory overview for informational purposes and is not a substitute for case-specific legal or tax advice. GST thresholds, exemptions, forms and procedures may change through amendments and notifications. Applicants should verify the latest requirements on the official GST portal and with the appropriate tax authority before applying.",
};
