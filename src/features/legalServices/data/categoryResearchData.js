// Deeply Researched Indian Legal Framework across all 11 Approved Categories
// Citations: BNS 2023, BNSS 2023, BSA 2023, CPC 1908, HMA 1955, Companies Act 2013,
// RERA 2016, IT Act 2000, Consumer Protection Act 2019, NI Act 1881, Transfer of Property Act 1882

export const CATEGORY_RESEARCH = {
  // ──────────────────────────────────────────────────────────────────────────
  // 01. Government Registration & Certificates
  // ──────────────────────────────────────────────────────────────────────────
  "cat-01": {
    applicableLaws: [
      {
        act: "Special Marriage Act, 1954 / Hindu Marriage Act, 1955",
        section: "Section 8 & Section 15",
        title: "Statutory Registration of Marriages & Civil Solemnisation",
        summary: "Mandates legal registration of solemnized marriages before the Sub-Divisional Magistrate or Marriage Officer for conclusive evidentiary proof.",
        tag: "Primary Statute",
      },
      {
        act: "Registration of Births and Deaths Act, 1969",
        section: "Section 13 (Amended 2023)",
        title: "Delayed Registration of Vital Records & SDM Orders",
        summary: "Empowers the Executive Magistrate to conduct summary verification and issue orders for registering vital records past statutory deadlines.",
        tag: "Civil Records",
      },
      {
        act: "Central Gazette Publication Guidelines & Stamp Act",
        section: "Department of Publication Norms",
        title: "Official Gazette Notification for Name / Status Alteration",
        summary: "Statutory protocol for publishing name alterations, religion affirmations, and public status changes in the Gazette of India.",
        tag: "Administrative Regulation",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "LEGAL SCRUTINY",
        title: "Document Verification & Scrutiny",
        description: "Enrolled advocate audits identity credentials, age proofs, prior records, and statutory eligibility.",
        milestone: "Eligibility confirmed",
      },
      {
        step: 2,
        tag: "STAMP AFFIDAVIT",
        title: "Affidavit Drafting on Stamp Paper",
        description: "Preparation of formal statutory declarations and affirmations with lawful notarial attestation.",
        milestone: "Affidavits notarized",
      },
      {
        step: 3,
        tag: "PUBLIC NOTICE",
        title: "Newspaper Public Notice Publication",
        description: "Publication of formal legal declarations in designated regional and English daily newspapers.",
        milestone: "Publications documented",
      },
      {
        step: 4,
        tag: "PORTAL FILING",
        title: "Portal Submission & SDM Filing",
        description: "Uploading digital records to the government portal and securing the biometric appointment slot.",
        milestone: "Application submitted",
      },
      {
        step: 5,
        tag: "OFFICER AUDIT",
        title: "Physical Verification by Officer",
        description: "Advocate assists parties and independent witnesses during personal verification before the SDM.",
        milestone: "Inquiry cleared",
      },
      {
        step: 6,
        tag: "FINAL GAZETTE",
        title: "Official Gazette Notification",
        description: "Issuance of digitally signed registration certificate or final Central Gazette notification.",
        milestone: "Certificate issued",
      },
    ],
    documents: [
      {
        category: "Identity & Age Proofs",
        items: [
          { name: "Aadhaar Card / Passport / Voter ID", detail: "Self-attested government identity proofs of all primary applicants." },
          { name: "10th Class Passing Certificate / Birth Certificate", detail: "Statutory proof of majority and exact date of birth." },
        ],
      },
      {
        category: "Address & Relationship Proofs",
        items: [
          { name: "Domicile / Electricity Bill / Rent Agreement", detail: "Proof of territorial jurisdiction under the concerned registrar." },
          { name: "Marriage Photographs / Hospital Discharge Slip", detail: "Evidentiary photographs or clinical records substantiating the event." },
        ],
      },
      {
        category: "Statutory Affidavits & Witnesses",
        items: [
          { name: "Non-Judicial Stamp Paper Affidavits", detail: "Drafted as per state rules confirming factual truth and non-criminality." },
          { name: "Identity Proofs of 2 to 3 Witnesses", detail: "Aadhaar and PAN cards of adult witnesses appearing for physical attestation." },
        ],
      },
    ],
    faqs: [
      {
        question: "Is personal appearance compulsory before the SDM / Marriage Officer?",
        answer: "Yes, under Indian law, biometric verification and signatures in the official register require the personal presence of both parties along with two adult witnesses.",
      },
      {
        question: "How long does Gazette publication take for a Name Change?",
        answer: "The Controller of Publications, Ministry of Housing and Urban Affairs typically publishes the Central Gazette within 15 to 30 working days after accepting the file.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 02. Property, Real Estate & Possession
  // ──────────────────────────────────────────────────────────────────────────
  "cat-02": {
    applicableLaws: [
      {
        act: "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        section: "Section 18 & Section 31",
        title: "Homebuyer Refund, Delay Interest & Adjudication Complaints",
        summary: "Grants homebuyers the statutory right to claim full refund with compounded interest or monthly delay compensation from defaulting builders.",
        tag: "Real Estate Code",
      },
      {
        act: "Transfer of Property Act, 1882",
        section: "Section 54 & Section 106",
        title: "Conveyance of Immovable Property & Lease Termination",
        summary: "Prescribes statutory requisites for valid transfers of real property and mandatory 15-day prior notice for tenant eviction.",
        tag: "Core Property Law",
      },
      {
        act: "Registration Act, 1908 & Indian Stamp Act, 1899",
        section: "Section 17 (Compulsory Registration)",
        title: "Mandatory Registration of Conveyance Deeds & Stamp Duty",
        summary: "Renders unregistered immovable property instruments non-admissible as primary evidence under Section 49 of the Registration Act.",
        tag: "Evidentiary Statute",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "30-YR TITLE SEARCH",
        title: "Title Search & Encumbrance Check",
        description: "Advocate investigates Sub-Registrar books, EC records, bank mortgages, and municipal approval sanctions.",
        milestone: "Title audit cleared",
      },
      {
        step: 2,
        tag: "LEGAL AUDIT REPORT",
        title: "Due Diligence & Search Report",
        description: "Preparation of an exhaustive legal scrutiny report highlighting pending litigation, liens, or violations.",
        milestone: "Search report signed",
      },
      {
        step: 3,
        tag: "STATUTORY DEMAND",
        title: "Demand & Eviction Notice Dispatch",
        description: "Issuing formal statutory demand under Section 106 TP Act or Section 18 RERA via Speed Post with AD.",
        milestone: "Notice served",
      },
      {
        step: 4,
        tag: "DEED & PETITION",
        title: "Deed & RERA Petition Drafting",
        description: "Precision drafting of Sale Deed, Partition Plaint, or RERA Form M complaint with evidentiary annexures.",
        milestone: "Pleadings finalized",
      },
      {
        step: 5,
        tag: "REGISTRY FILING",
        title: "Sub-Registrar Biometric Registration",
        description: "Payment of state e-Stamp duty, biometric deed execution or formal listing before the Adjudicating Officer.",
        milestone: "Registry completed",
      },
      {
        step: 6,
        tag: "TITLE MUTATION",
        title: "Order Decree & Mutation Support",
        description: "Securing registered title deed, municipal Khata/Jamabandi mutation, or recovery warrant.",
        milestone: "Title secured",
      },
    ],
    documents: [
      {
        category: "Root Title & Conveyance Chain",
        items: [
          { name: "Parent Sale Deeds (30-Year Chain)", detail: "Original registered deeds demonstrating unbroken ownership history." },
          { name: "Encumbrance Certificate (EC Form 15)", detail: "Certified Sub-Registrar record evidencing no mortgages or court attachments." },
        ],
      },
      {
        category: "Municipal & Revenue Records",
        items: [
          { name: "Latest Mutation Extract (Khata / 7/12 / Jamabandi)", detail: "Revenue record verifying the seller's name in official land records." },
          { name: "Property Tax Receipts & NOC", detail: "Proof of zero pending municipal assessments or water/electricity dues." },
        ],
      },
      {
        category: "Builder / Allotment Records",
        items: [
          { name: "Builder-Buyer Agreement (BBA) & Payment Receipts", detail: "Sanctioned allotment letters, receipts of all paid installments, and demand notices." },
          { name: "Approved Sanction Plan & RERA Registration ID", detail: "Town planning building sanction and active RERA project disclosure." },
        ],
      },
    ],
    faqs: [
      {
        question: "Can a builder forfeit payments if the buyer cancels due to project delay?",
        answer: "No. The Supreme Court in Pioneer Urban Land v. Govindan Raghavan held that one-sided penalty clauses are unfair trade practices; buyers are entitled to full refund with interest.",
      },
      {
        question: "Why is a 30-year property title search necessary in India?",
        answer: "Under the Limitation Act, 1963, claims against immovable property or government claims can extend up to 12–30 years, making a 30-year title audit essential.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 03. Criminal Law & Bail
  // ──────────────────────────────────────────────────────────────────────────
  "cat-03": {
    applicableLaws: [
      {
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        section: "Section 482 (Anticipatory Bail) & Section 480 / 483 (Regular Bail)",
        title: "Statutory Framework for Pre-Arrest & Post-Custodial Bail",
        summary: "Governs judicial discretion to grant pre-arrest protection or bail bonds, balancing individual liberty under Article 21 against state prosecution.",
        tag: "Procedural Sanhita",
      },
      {
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        section: "Section 528 (High Court Inherent Powers)",
        title: "Quashing of Frivolous FIRs & Malicious Complaints",
        summary: "Vests the High Court with extraordinary powers to quash criminal proceedings where allegations disclose no cognizable offense or constitute abuse of process.",
        tag: "Constitutional Remedy",
      },
      {
        act: "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        section: "Substantive Criminal Penalties",
        title: "Evaluation of Essential Ingredients of Offenses",
        summary: "Statutory definitions and mens rea standards governing criminal breach of trust, cheating, criminal intimidation, and bodily harm.",
        tag: "Substantive Law",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "CASE SCRUTINY",
        title: "FIR & Case Diary Scrutiny",
        description: "Advocate analyzes the First Information Report, allegations, penal sections, and Section 35(3) BNSS arrest notice.",
        milestone: "Legal grounds identified",
      },
      {
        step: 2,
        tag: "BAIL PLEADINGS",
        title: "Bail Petition & Alibi Evidence Drafting",
        description: "Formulation of strong legal grounds, medical records, digital alibi proof, and landmark precedents.",
        milestone: "Pleadings sworn",
      },
      {
        step: 3,
        tag: "REGISTRY LISTING",
        title: "Court Registry Filing & Listing",
        description: "Formal filing in the court registry with urgent listing application and advance service to Prosecutor.",
        milestone: "Matter numbered & listed",
      },
      {
        step: 4,
        tag: "BENCH ARGUMENTS",
        title: "Oral Arguments before the Judge",
        description: "Senior advocate presents statutory grounds, highlighting lack of custodial necessity and inquiry cooperation.",
        milestone: "Arguments concluded",
      },
      {
        step: 5,
        tag: "COURT ORDER",
        title: "Judicial Order & Protection Relief",
        description: "Court grants interim protection or absolute bail subject to standard furnishing of local solvent sureties.",
        milestone: "Order pronounced",
      },
      {
        step: 6,
        tag: "SURETY RELEASE",
        title: "Surety Bond Verification & Release",
        description: "Verification of surety bonds before the Duty Magistrate, issuance of release warrant (Robkar), and jail delivery.",
        milestone: "Liberty secured",
      },
    ],
    documents: [
      {
        category: "Police & Case Records",
        items: [
          { name: "Certified Copy of FIR / Police Complaint", detail: "Primary police document detailing the informant's statement and penal sections." },
          { name: "Section 35(3) BNSS Notice / Arrest Memo", detail: "Police appearance notices or arrest documentation issued by the IO." },
        ],
      },
      {
        category: "Exculpatory Evidence",
        items: [
          { name: "Alibi Proofs (CCTV / Flight Tickets / GPS)", detail: "Conclusive proof demonstrating non-presence at the alleged scene of crime." },
          { name: "Communication Records & Bank Statements", detail: "WhatsApp chats, email exchanges, and financial transactions rebutting malicious claims." },
        ],
      },
      {
        category: "Surety & Personal Credentials",
        items: [
          { name: "Solvent Surety Identity & Property Proofs", detail: "Aadhaar, PAN, and Registry/RC copies of a local solvent family member or surety." },
          { name: "Medical Certificates & Clean Antecedents Record", detail: "Certified medical records establishing health conditions and proof of no prior convictions." },
        ],
      },
    ],
    faqs: [
      {
        question: "Can anticipatory bail be applied for after an FIR is registered?",
        answer: "Yes, anticipatory bail can be filed at any time prior to actual physical arrest as long as there is reasonable apprehension of arrest in a non-bailable case.",
      },
      {
        question: "Does the High Court have power to quash non-compoundable FIRs?",
        answer: "Yes, under Section 528 BNSS (former 482 CrPC), the Supreme Court in Gian Singh v. State of Punjab affirmed that High Courts can quash civil/commercial disputes even if technically non-compoundable.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 04. Family, Matrimonial & Domestic Relations
  // ──────────────────────────────────────────────────────────────────────────
  "cat-04": {
    applicableLaws: [
      {
        act: "Hindu Marriage Act, 1955 / Special Marriage Act, 1954",
        section: "Section 13B (HMA) / Section 28 (SMA)",
        title: "Mutual Consent Divorce & Statutory Cooling-off Waiver",
        summary: "Provides statutory mechanism for consensual marriage dissolution upon proving 1 year of separate living and complete settlement of alimony and custody.",
        tag: "Matrimonial Code",
      },
      {
        act: "Protection of Women from Domestic Violence Act, 2005 (PWDVA)",
        section: "Section 12, 18, 19 & 20",
        title: "Protection Orders, Residence Rights & Monetary Relief",
        summary: "Emergency civil remedies protecting aggrieved women against verbal, emotional, economic, and physical abuse within shared households.",
        tag: "Protective Statute",
      },
      {
        act: "Bharatiya Nagarik Suraksha Sanhita, 2023 / Family Courts Act",
        section: "Section 144 BNSS (former 125 CrPC)",
        title: "Interim Maintenance for Spouse & Dependent Minor Children",
        summary: "Summary statutory remedy guaranteeing speedy interim maintenance and child school support based on the Supreme Court's Rajnesh v. Neha guidelines.",
        tag: "Support & Alimony",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "TERMS MEDIATION",
        title: "Mediation & Settlement Formulation",
        description: "Advocate guides confidential negotiations on permanent alimony, stridhan return, and child access.",
        milestone: "Consensus reached",
      },
      {
        step: 2,
        tag: "MOU CONTRACT",
        title: "Settlement MoU Agreement Drafting",
        description: "Execution of a legally binding Memorandum of Understanding detailing financial schedules and asset divisions.",
        milestone: "MoU executed",
      },
      {
        step: 3,
        tag: "FIRST MOTION",
        title: "Joint Petition First Motion Filing",
        description: "Submission of mutual consent divorce petition before the Principal Judge, Family Court of jurisdiction.",
        milestone: "First motion recorded",
      },
      {
        step: 4,
        tag: "STATEMENT RECORD",
        title: "First Motion Statements Recording",
        description: "Parties record verified sworn statements before judge; initial alimony installment is tendered by DD.",
        milestone: "Statements admitted",
      },
      {
        step: 5,
        tag: "WAIVER PETITION",
        title: "Cooling-Off Waiver Application",
        description: "Filing formal statutory application to waive 6-month statutory waiting period where reconciliation failed.",
        milestone: "Waiver allowed",
      },
      {
        step: 6,
        tag: "FINAL DECREE",
        title: "Second Motion & Absolute Decree",
        description: "Recording second motion statements, balance alimony clearance, and pronouncement of absolute divorce decree.",
        milestone: "Decree issued",
      },
    ],
    documents: [
      {
        category: "Marriage Proofs",
        items: [
          { name: "Original Marriage Certificate & Wedding Invitation", detail: "Statutory proof of legal solemnization and date of marriage." },
          { name: "Wedding Photographs / Joint Proofs", detail: "Photographic record showing rituals or civil registration." },
        ],
      },
      {
        category: "Financial Affidavits & Settlement",
        items: [
          { name: "Affidavit of Assets and Liabilities (Rajnesh v. Neha)", detail: "Mandatory Supreme Court format disclosing 3 years ITR, bank statements, and expenses." },
          { name: "Executed Memorandum of Understanding (MoU)", detail: "Signed settlement contract detailing permanent alimony and custody terms." },
        ],
      },
      {
        category: "Child & Residence Documentation",
        items: [
          { name: "Minor Child Birth Certificate & School ID", detail: "Required for deciding legal custody and visitor access rights." },
          { name: "Proof of 1-Year Separate Living", detail: "Rent agreements or affidavits confirming cessation of cohabitation." },
        ],
      },
    ],
    faqs: [
      {
        question: "Can the 6-month cooling off period in mutual divorce be waived?",
        answer: "Yes. The Supreme Court in Amardeep Singh v. Harveen Kaur held that the 6-month period is directory and can be waived if all claims are settled and mediation has failed.",
      },
      {
        question: "What is Stridhan and can a husband retain it?",
        answer: "Stridhan constitutes absolute personal property of the woman gifted before, during, or after marriage. Refusal to return it attracts Section 406 IPC / BNS criminal prosecution.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 05. Corporate, Business & Startups
  // ──────────────────────────────────────────────────────────────────────────
  "cat-05": {
    applicableLaws: [
      {
        act: "Companies Act, 2013",
        section: "Section 7 & Section 12",
        title: "Incorporation of Companies & SPICe+ MCA Architecture",
        summary: "Regulates statutory formation, Memorandum of Association (MoA), Articles of Association (AoA), and director fiduciary duties in India.",
        tag: "Corporate Statute",
      },
      {
        act: "Indian Contract Act, 1872",
        section: "Section 10 & Section 27",
        title: "Commercial Agreements, Enforceability & Non-Compete Clauses",
        summary: "Sets foundational criteria for valid commercial contracts, trade secret covenants, and lawful restraint of trade provisions.",
        tag: "Commercial Code",
      },
      {
        act: "Limited Liability Partnership Act, 2008",
        section: "Section 11 & Section 23",
        title: "LLP Incorporation & Partnership Agreement Adjudication",
        summary: "Governs hybrid corporate vehicles providing limited liability with internal operational flexibility under an enforceable LLP agreement.",
        tag: "Enterprise Law",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "NAME APPROVAL",
        title: "Entity Structuring & Name Approval",
        description: "Advocate verifies trademark registers and MCA database for unique corporate name approval under RUN / SPICe+.",
        milestone: "Name approved",
      },
      {
        step: 2,
        tag: "DSC & DIN ALLOC",
        title: "DSC Procurement & DIN Allocation",
        description: "Class-3 Digital Signature Certificates procured for all proposed directors and partners with statutory KYC.",
        milestone: "DSC configured",
      },
      {
        step: 3,
        tag: "CHARTER DRAFT",
        title: "MoA, AoA & Founders Agreement",
        description: "Precision legal drafting of corporate charters, object clauses, shareholding vesting, and deadlock exits.",
        milestone: "Charters finalized",
      },
      {
        step: 4,
        tag: "SPICE+ FILING",
        title: "MCA SPICe+ Integrated Filing",
        description: "Integrated submission of INC-32, AGILE-PRO-S (GST/EPFO/Bank), and payment of state MCA stamp duties.",
        milestone: "MCA submission",
      },
      {
        step: 5,
        tag: "COI ISSUED",
        title: "Certificate of Incorporation Issuance",
        description: "Central Registration Centre (CRC) scrutiny, approval, and generation of official CoI certificate with CIN.",
        milestone: "CoI generated",
      },
      {
        step: 6,
        tag: "COMMENCEMENT",
        title: "PAN, TAN & INC-20A Commencement",
        description: "Allocation of corporate PAN/TAN, corporate banking activation, and filing of Form INC-20A commencement.",
        milestone: "Business operational",
      },
    ],
    documents: [
      {
        category: "Director / Promoter Credentials",
        items: [
          { name: "PAN Card of all Directors & Subscribers", detail: "Mandatory prerequisite for Indian directors and designated partners." },
          { name: "Aadhaar Card / Passport / Voter ID", detail: "Identity and citizenship proof with updated residential addresses." },
          { name: "Bank Statement / Electricity Bill (< 2 Months old)", detail: "Official proof of director residence as mandated by MCA guidelines." },
        ],
      },
      {
        category: "Registered Office Proofs",
        items: [
          { name: "Utility Bill (Electricity / Water / Gas) (< 2 Months)", detail: "Must display exact premises address matching municipal records." },
          { name: "No Objection Certificate (NOC) from Property Owner", detail: "Formal declaration permitting corporate operations from the premises." },
          { name: "Rent / Lease Agreement or Ownership Proof", detail: "Registered lease deed or municipal property tax receipt." },
        ],
      },
    ],
    faqs: [
      {
        question: "Is physical presence required for company registration in India?",
        answer: "No. The entire incorporation process through MCA SPICe+ is 100% digital via Digital Signature Certificates (DSC) without visiting government offices.",
      },
      {
        question: "What is the consequence of not filing Form INC-20A within 180 days?",
        answer: "Under Section 10A of the Companies Act, failure to file Commencement of Business results in severe fines and potential strike-off of the company by the RoC.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 06. Legal Notices, Demands & Recovery
  // ──────────────────────────────────────────────────────────────────────────
  "cat-06": {
    applicableLaws: [
      {
        act: "Negotiable Instruments Act, 1881",
        section: "Section 138 & Section 142",
        title: "Mandatory Statutory Demand Notice for Dishonoured Cheques",
        summary: "Statutory 30-day notice limitation following bank return memo, granting the defaulter 15 days cure period before criminal prosecution.",
        tag: "Special Criminal Law",
      },
      {
        act: "Code of Civil Procedure, 1908",
        section: "Order 37 Rules 1 & 2 / Section 80",
        title: "Summary Money Recovery Suits & Government Statutory Notices",
        summary: "Provides rapid civil recovery where defendant has no substantial defense on negotiable debts, contracts, and liquidated demands.",
        tag: "Civil Procedure",
      },
      {
        act: "Commercial Courts Act, 2015",
        section: "Section 12A",
        title: "Mandatory Pre-Institution Mediation Notice",
        summary: "Mandates prior institutional mediation notice before instituting commercial suits unless urgent interim relief is sought.",
        tag: "Commercial Litigation",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "DEBT AUDIT",
        title: "Evidentiary Audit & Quantification",
        description: "Advocate examines invoices, delivery challans, dishonour memos, and calculates statutory interest rates.",
        milestone: "Claim audited",
      },
      {
        step: 2,
        tag: "NOTICE DRAFTING",
        title: "Statutory Legal Notice Drafting",
        description: "Drafting of high-impact notice on advocate letterhead citing statutory provisions and limitation dates.",
        milestone: "Notice approved",
      },
      {
        step: 3,
        tag: "POSTAL DISPATCH",
        title: "Registered Post AD & Speed Post",
        description: "Dual formal dispatch via Registered Post with Acknowledgement Due, Speed Post, and electronic email notice.",
        milestone: "Service initiated",
      },
      {
        step: 4,
        tag: "SERVICE TRACKING",
        title: "Consignment Tracking & Service Proof",
        description: "Preservation of official India Post delivery certificates establishing deemed service under Section 27.",
        milestone: "Delivery proved",
      },
      {
        step: 5,
        tag: "15-DAY CURE",
        title: "Statutory Cure Period & Settlement",
        description: "Conducting structured advocate-led negotiations for amicable settlement or out-of-court dispute resolution.",
        milestone: "Cure period expired",
      },
      {
        step: 6,
        tag: "COURT COMPLAINT",
        title: "Summary Suit or Criminal Complaint",
        description: "Filing Section 138 NI Act complaint or Order 37 CPC summary suit in competent court upon non-compliance.",
        milestone: "Court action filed",
      },
    ],
    documents: [
      {
        category: "Transaction & Default Records",
        items: [
          { name: "Original Dishonoured Cheque & Bank Return Memo", detail: "Primary evidence with reason code (e.g. Funds Insufficient)." },
          { name: "Tax Invoices, Bills & Signed Delivery Proofs", detail: "Commercial proof demonstrating debt and supply of goods/services." },
        ],
      },
      {
        category: "Communications & Prior Demands",
        items: [
          { name: "Email Reminders, WhatsApp Chats & Ledger Statements", detail: "Written admissions of liability and acknowledgments of debt." },
          { name: "Proof of Postal Dispatch & Delivery Tracking Sheet", detail: "Mandatory India Post tracking report proving deemed delivery." },
        ],
      },
    ],
    faqs: [
      {
        question: "What happens if the recipient refuses to accept a legal notice sent by post?",
        answer: "Under Section 27 of the General Clauses Act, a notice sent to the correct address by Registered Post that returns with endorsement 'Refused' or 'Unclaimed' is deemed valid legal service by Supreme Court precedent.",
      },
      {
        question: "Can an individual serve a legal notice without an advocate?",
        answer: "While personal demand letters can be sent, formal statutory notices under Section 138 NI Act or Order 37 CPC require precise legal terminology and advocate verification to avoid dismissal on technical grounds.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 07. Civil, Debt Recovery & Commercial Litigation
  // ──────────────────────────────────────────────────────────────────────────
  "cat-07": {
    applicableLaws: [
      {
        act: "Consumer Protection Act, 2019",
        section: "Section 35 & Section 47",
        title: "District & State Consumer Commission Redressal",
        summary: "Provides effective summary relief against deficiency in service, unfair contract terms, and defective goods with punitive damages.",
        tag: "Consumer Law",
      },
      {
        act: "Code of Civil Procedure, 1908",
        section: "Order 39 Rules 1 & 2",
        title: "Temporary Injunctions & Interlocutory Relief",
        summary: "Empowers civil courts to grant ex-parte injunctions preserving the status quo and preventing alienation of property.",
        tag: "Injunction & Equity",
      },
      {
        act: "Specific Relief Act, 1963",
        section: "Section 10 & Section 14",
        title: "Specific Performance of Contracts & Injunctions",
        summary: "Mandates enforcement of contracts where monetary compensation is inadequate for breach of immovable property obligations.",
        tag: "Substantive Civil Law",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "CLAIM SCRUTINY",
        title: "Cause of Action & Jurisdiction Audit",
        description: "Advocate determines territorial jurisdiction, pecuniary valuation, and applicable limitation periods.",
        milestone: "Jurisdiction established",
      },
      {
        step: 2,
        tag: "PLAINT DRAFTING",
        title: "Drafting Plaint & Verified Affidavits",
        description: "Precision drafting of pleadings conforming to Order 6 & 7 CPC, supported by verified statements of truth.",
        milestone: "Pleadings prepared",
      },
      {
        step: 3,
        tag: "COURT FEE STAMP",
        title: "Court Fee Stamping & e-Filing",
        description: "Stamping with state court fees, indexing documents, and registry filing before the Senior Civil Judge.",
        milestone: "Filing numbered",
      },
      {
        step: 4,
        tag: "SUMMONS ISSUANCE",
        title: "Admission Hearing & Summons Notice",
        description: "Advocate argues prima facie admissibility; court issues official summons to the opposite party.",
        milestone: "Summons issued",
      },
      {
        step: 5,
        tag: "EVIDENCE TRIAL",
        title: "Written Statement & Evidence Record",
        description: "Scrutiny of defense pleadings, filing of replication, and recording of chief evidence and cross-examination.",
        milestone: "Evidence closed",
      },
      {
        step: 6,
        tag: "FINAL DECREE",
        title: "Final Judgment & Decree Execution",
        description: "Final advocate arguments, court pronounces binding decree; filing Order 21 execution petition for recovery.",
        milestone: "Decree executed",
      },
    ],
    documents: [
      {
        category: "Contracts & Pleadings",
        items: [
          { name: "Original Agreement / Purchase Order / Warranty", detail: "Primary contract outlining obligations, consideration, and dispute clauses." },
          { name: "Legal Notice & Opposite Party Response", detail: "Pre-litigation communication establishing unresolved dispute." },
        ],
      },
      {
        category: "Financial Proofs",
        items: [
          { name: "Bank Statements & Payment Receipts", detail: "Direct proof of payments made, dishonoured charges, or monetary loss." },
          { name: "Expert Opinion / Inspection Report", detail: "Technical reports proving deficiency or construction defects where applicable." },
        ],
      },
    ],
    faqs: [
      {
        question: "What is the pecuniary jurisdiction of District Consumer Commissions in India?",
        answer: "Under the Consumer Protection Act, 2019, District Commissions have jurisdiction for claims up to ₹50 Lakhs (revised by central notification).",
      },
      {
        question: "What is an ex-parte injunction under Order 39 CPC?",
        answer: "It is an immediate court order issued without hearing the opposite party in emergency situations to prevent immediate irreparable damage or illegal alienation of property.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 08. Intellectual Property & Brand Protection
  // ──────────────────────────────────────────────────────────────────────────
  "cat-08": {
    applicableLaws: [
      {
        act: "Trade Marks Act, 1999",
        section: "Section 18 & Section 29",
        title: "Trademark Application Filing & Infringement Prosecution",
        summary: "Statutory protection of brand identity, logo, and slogans, conferring exclusive commercial monopoly and rights against trademark passing-off.",
        tag: "IP Statute",
      },
      {
        act: "Copyright Act, 1957",
        section: "Section 13 & Section 51",
        title: "Protection of Artistic, Literary & Software Works",
        summary: "Vests exclusive economic and moral rights in creators of original literary, musical, dramatic, and software artistic creations.",
        tag: "Copyright Law",
      },
      {
        act: "Commercial Courts Act, 2015",
        section: "Commercial IP Suits",
        title: "Expedited Adjudication of Trademark & Patent Infringement",
        summary: "Specialized commercial divisions hearing intellectual property piracy, injunction petitions, and seizure of counterfeit goods.",
        tag: "Commercial Enforcement",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "TM SEARCH",
        title: "Classification & Public TM Search",
        description: "Advocate conducts phonetic, visual, and conceptual similarity checks across 45 statutory classes of IP India.",
        milestone: "Availability cleared",
      },
      {
        step: 2,
        tag: "TM-A DRAFTING",
        title: "Drafting TM-A & Form 48 Authorization",
        description: "Formulation of precise goods/services descriptions and execution of advocate Power of Attorney.",
        milestone: "Form TM-A ready",
      },
      {
        step: 3,
        tag: "GOVT E-FILING",
        title: "IP India e-Filing & TM Number",
        description: "Digital filing on Controller General portal and immediate allocation of TM number enabling instant mark usage.",
        milestone: "(TM) symbol unlocked",
      },
      {
        step: 4,
        tag: "OBJECTION REPLY",
        title: "Examination Report & Section 9 Reply",
        description: "Drafting statutory legal response with prior use evidence against objections raised by the Examiner.",
        milestone: "Objection answered",
      },
      {
        step: 5,
        tag: "JOURNAL NOTICE",
        title: "Trademark Journal Public Notice",
        description: "Official publication in weekly Trade Marks Journal for the mandatory 4-month statutory opposition period.",
        milestone: "Journal published",
      },
      {
        step: 6,
        tag: "REGISTERED (R)",
        title: "Final TM Registration Certificate",
        description: "Issuance of gold-sealed Registration Certificate, conferring exclusive 10-year renewable ownership and (R) rights.",
        milestone: "Registered (R) status",
      },
    ],
    documents: [
      {
        category: "Brand Assets & User Proofs",
        items: [
          { name: "High-Resolution Logo / Device Mark Image", detail: "Clean PNG/JPEG image or exact stylized wordmark representation." },
          { name: "User Affidavit with Prior Use Invoices", detail: "Statutory affidavit proving first commercial use date in India with sales invoices." },
        ],
      },
      {
        category: "Applicant Identification",
        items: [
          { name: "MSME / Udyam Certificate (for 50% Govt Fee Rebate)", detail: "Entitles startups and small enterprises to a 50% discount on official government fees." },
          { name: "Certificate of Incorporation / Partnership Deed", detail: "Organizational charter establishing applicant's legal persona." },
        ],
      },
    ],
    faqs: [
      {
        question: "When can I legally start using the (R) registered symbol?",
        answer: "You can only use the (R) symbol AFTER the Registrar of Trade Marks formally issues the final Registration Certificate. Using it beforehand is an offense under Section 107.",
      },
      {
        question: "How long is a trademark valid in India?",
        answer: "A trademark registration in India is valid for 10 years from the date of application and can be renewed indefinitely every 10 years upon payment of renewal fees.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 09. Employment, Labor & Service Matters
  // ──────────────────────────────────────────────────────────────────────────
  "cat-09": {
    applicableLaws: [
      {
        act: "Industrial Disputes Act, 1947",
        section: "Section 2A & Section 25F",
        title: "Wrongful Retrenchment & Statutory Severance Pay",
        summary: "Prohibits illegal termination of workmen without statutory notice, prior permission, or payment of retrenchment compensation.",
        tag: "Labor Code",
      },
      {
        act: "Payment of Gratuity Act, 1972",
        section: "Section 4 & Section 7",
        title: "Statutory Gratuity Entitlement & Employer Penalties",
        summary: "Mandates payment of gratuity upon completing 5 years of continuous service; failure attracts 10% statutory interest and penal damages.",
        tag: "Social Security",
      },
      {
        act: "Sexual Harassment of Women at Workplace (POSH) Act, 2013",
        section: "Section 9 & Section 13",
        title: "Internal Committee Inquiries & Safe Workplace Mandate",
        summary: "Statutory inquiry framework governing workplace complaints with mandatory civil redressal and employment protections.",
        tag: "Workplace Safety",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "CONTRACT AUDIT",
        title: "Employment Contract Scrutiny",
        description: "Advocate examines appointment letter, non-compete clauses, severance covenants, and PIP documentation.",
        milestone: "Breach identified",
      },
      {
        step: 2,
        tag: "DEMAND NOTICE",
        title: "Statutory Legal Demand Notice",
        description: "Serving formal advocate legal notice demanding unpaid dues, gratuity, and withdrawal of illegal termination.",
        milestone: "Notice served",
      },
      {
        step: 3,
        tag: "CONCILIATION",
        title: "Labor Department Conciliation",
        description: "Initiating statutory conciliation proceedings before the Deputy Labor Commissioner / Conciliation Officer.",
        milestone: "Conciliation listed",
      },
      {
        step: 4,
        tag: "CLAIM PETITION",
        title: "Labor Court Statement of Claim",
        description: "Drafting formal statement of claim upon failure of conciliation, seeking reinstatement with full back wages.",
        milestone: "Claim filed",
      },
      {
        step: 5,
        tag: "EVIDENCE TRIAL",
        title: "Cross-Examination & Evidence Record",
        description: "Advocate dismantles unsubstantiated misconduct charges during evidentiary cross-examination.",
        milestone: "Evidence concluded",
      },
      {
        step: 6,
        tag: "RECOVERY AWARD",
        title: "Court Award & Recovery Certificate",
        description: "Labor Court issues binding award; District Collector issues recovery certificate for unpaid salary.",
        milestone: "Award executed",
      },
    ],
    documents: [
      {
        category: "Employment Contract & History",
        items: [
          { name: "Original Appointment Letter & Offer Agreement", detail: "Core contract stipulating notice periods, designation, and severance terms." },
          { name: "Termination / Resignation / Suspension Letter", detail: "Official communication demonstrating cessation of service." },
        ],
      },
      {
        category: "Financial & Compensation Proofs",
        items: [
          { name: "Last 6 Months Salary Slips & Bank Statements", detail: "Proof of actual compensation and monthly wage deductions." },
          { name: "EPF Passbook & Form 16 / Tax Deductions", detail: "Statutory proof of continuous service and provident fund deposits." },
        ],
      },
    ],
    faqs: [
      {
        question: "Can an Indian employer enforce a non-compete clause after resignation?",
        answer: "Under Section 27 of the Indian Contract Act, post-employment non-compete clauses restraining lawful trade are void and unenforceable, as repeatedly held by the Supreme Court.",
      },
      {
        question: "Is gratuity payable if an employee resigns voluntarily?",
        answer: "Yes. Any employee who completes 5 years of continuous service with an establishment of 10+ employees is statutorily entitled to gratuity, regardless of whether they resign or are terminated.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Cyber Crime, Data & Digital Disputes
  // ──────────────────────────────────────────────────────────────────────────
  "cat-10": {
    applicableLaws: [
      {
        act: "Information Technology Act, 2000",
        section: "Section 66C & Section 66D",
        title: "Identity Theft & Cheating by Personation using Digital Devices",
        summary: "Punishes online financial phishing, unauthorized access, and fraudulent electronic impersonation with imprisonment up to 3 years and heavy fines.",
        tag: "Cyber Penal Code",
      },
      {
        act: "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        section: "Section 63 (Former Section 65B Evidence Act)",
        title: "Admissibility of Electronic Records & Digital Evidence",
        summary: "Mandatory statutory certificate certifying integrity, hash values, and custody of computer outputs and phone records for court admissibility.",
        tag: "Digital Evidence",
      },
      {
        act: "RBI Digital Lending & Cyber Fraud Guidelines",
        section: "Circular on Electronic Banking Security",
        title: "Zero Liability Protection for Unauthorized Digital Transactions",
        summary: "Mandates that customers notifying banks of unauthorized third-party digital fraud within 3 days bear zero financial liability.",
        tag: "Banking Regulation",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "FORENSIC AUDIT",
        title: "Digital Evidence & Hash Logging",
        description: "Advocate guides forensic capture of server headers, transaction UTR numbers, IP trails, and chat exports.",
        milestone: "Evidence frozen",
      },
      {
        step: 2,
        tag: "1930 PORTAL",
        title: "National Cyber Crime 1930 Portal",
        description: "Lodging formal complaint on cybercrime.gov.in and dialing 1930 to freeze fraudulent destination accounts.",
        milestone: "Lien marked",
      },
      {
        step: 3,
        tag: "SEC 91 NOTICE",
        title: "Section 91 BNSS Notice to Intermediaries",
        description: "Issuing advocate demand notices to payment gateways, telecom operators, and banks to preserve logs.",
        milestone: "Notice served",
      },
      {
        step: 4,
        tag: "CYBER CELL AUDIT",
        title: "Cyber Cell Station Representation",
        description: "Advocate attends local Cyber Crime Police Station, tenders Section 63 BSA certificate, and follows up on FIR.",
        milestone: "Investigation initiated",
      },
      {
        step: 5,
        tag: "DEFREEZE CLAIM",
        title: "Magistrate Petition for Bank Defreezing",
        description: "Filing formal petition before the Chief Judicial Magistrate under Section 503 BNSS for refund of frozen funds.",
        milestone: "Petition argued",
      },
      {
        step: 6,
        tag: "RESTITUTION",
        title: "Restitution Order & Compensation",
        description: "Magistrate directs release of seized funds to victim; filing Section 46 IT Act claim for exemplary damages.",
        milestone: "Recovery complete",
      },
    ],
    documents: [
      {
        category: "Transaction & Forensic Evidence",
        items: [
          { name: "Bank Account Statement Highlighting Fraudulent Debits", detail: "Showing exact UTR, IMPS/UPI transaction references and timestamp." },
          { name: "Raw Screenshots of Chats, Fake Portals & Phishing SMS", detail: "Unedited electronic captures preserving metadata, URLs, and caller numbers." },
        ],
      },
      {
        category: "Statutory Certificates",
        items: [
          { name: "Section 63 BSA 2023 Electronic Evidence Certificate", detail: "Mandatory affidavit authenticating digital printouts from the device owner." },
          { name: "Cyber Helpline 1930 / NCCRP Acknowledgment Slip", detail: "Official tracking number issued by the Ministry of Home Affairs." },
        ],
      },
    ],
    faqs: [
      {
        question: "How fast should an unauthorized online transaction be reported to the bank?",
        answer: "Under RBI guidelines, if reported within 3 working days, customer liability is zero. Reporting between 4 to 7 days caps liability, making immediate reporting critical.",
      },
      {
        question: "Can an aggrieved party claim civil compensation for data theft?",
        answer: "Yes. Under Section 43 and Section 46 of the IT Act, the State IT Secretary acts as the Adjudicating Officer and can award compensation up to ₹5 Crores for data breaches.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Legal Documentation, Agreements & Deeds
  // ──────────────────────────────────────────────────────────────────────────
  "cat-11": {
    applicableLaws: [
      {
        act: "Registration Act, 1908",
        section: "Section 17 & Section 32",
        title: "Compulsory Registration of Immovable Property Deeds & Wills",
        summary: "Mandates compulsory registration of deeds creating rights in immovable property and lays down protocol for presenting instruments for registry.",
        tag: "Registration Code",
      },
      {
        act: "Indian Stamp Act, 1899 & State Stamp Rules",
        section: "Section 33 & Section 35",
        title: "Impounding of Deficiently Stamped Legal Instruments",
        summary: "Instruments not properly stamped are inadmissible in evidence for any purpose until regularized by payment of 10x penalty.",
        tag: "Fiscal Statute",
      },
      {
        act: "Indian Succession Act, 1925 & Powers of Attorney Act, 1882",
        section: "Section 63 (Wills) & Section 2 (PoA)",
        title: "Statutory Execution of Testamentary Wills & Powers of Attorney",
        summary: "Prescribes statutory attestation of Wills by two independent witnesses and the authority of an attorney to act on behalf of the principal.",
        tag: "Succession & Agency",
      },
    ],
    procedure: [
      {
        step: 1,
        tag: "INTENT SCRUTINY",
        title: "Intent & Asset Inventory Audit",
        description: "Advocate verifies ownership title deeds, ancestral versus self-acquired status, and testamentary capacity.",
        milestone: "Intent validated",
      },
      {
        step: 2,
        tag: "INSTRUMENT DRAFT",
        title: "Custom Legal Instrument Drafting",
        description: "Drafting precision clauses, executor appointments, revocation of prior instruments, and indemnity protections.",
        milestone: "Instrument drafted",
      },
      {
        step: 3,
        tag: "E-STAMP DUTY",
        title: "State e-Stamp Procurement",
        description: "Accurate calculation of state-specific ad-valorem or fixed stamp duty and procurement of non-judicial e-Stamps.",
        milestone: "Duty procured",
      },
      {
        step: 4,
        tag: "WITNESS SIGNING",
        title: "Execution & Witness Attestation",
        description: "Physical signing in the presence of two independent non-beneficiary adult witnesses and doctor certification.",
        milestone: "Attestation signed",
      },
      {
        step: 5,
        tag: "SUB-REGISTRAR",
        title: "Sub-Registrar Biometric Registry",
        description: "Advocate schedules Sub-Registrar appointment; parties appear for biometric scanning and photograph capture.",
        milestone: "Registry attended",
      },
      {
        step: 6,
        tag: "REGISTERED DEED",
        title: "Official Endorsement & Certified Deed",
        description: "Sub-Registrar signs registration endorsement; issuance of registered deed with official ledger volume numbers.",
        milestone: "Registered deed in hand",
      },
    ],
    documents: [
      {
        category: "Parties & Witnesses Credentials",
        items: [
          { name: "Aadhaar Card & PAN Card of Principal / Testator", detail: "Government identity and tax proof establishing legal capacity." },
          { name: "Identity Proofs of 2 Independent Witnesses", detail: "Non-family / non-beneficiary witnesses who sign the attestation." },
        ],
      },
      {
        category: "Asset & Title Documents",
        items: [
          { name: "Property Title Deeds / Share Certificates / FD Receipts", detail: "Evidentiary proof of full title over assets described in the deed." },
          { name: "Doctor Medical Fitness Certificate (for Testamentary Wills)", detail: "Mandatory certificate certifying sound disposing state of mind of senior citizens." },
        ],
      },
    ],
    faqs: [
      {
        question: "Is it legally compulsory to register a Will in India?",
        answer: "No, Section 18 of the Registration Act makes registration of a Will optional. However, registering before the Sub-Registrar provides strong evidentiary proof and prevents post-demise challenges by disgruntled relatives.",
      },
      {
        question: "Can a Power of Attorney (PoA) be revoked at any time?",
        answer: "Yes, a General Power of Attorney can be revoked by the principal at any time by executing a registered Deed of Revocation, unless it is an irrevocable PoA coupled with interest under Section 202 of the Contract Act.",
      },
    ],
  },
};
