// VakeelSetu Legal Services Catalogue
// Exactly 11 Approved Categories and 87 Canonical Services

export const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s*\/\s*/g, "-")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const LEGAL_SERVICES_CATEGORIES = [
  {
    id: "cat-01",
    number: "01",
    title: "Government Registration & Certificates",
    slug: "government-registration-certificates",
    shortDescription: "Official statutory registrations, gazette notifications, and government certification legal assistance.",
    iconName: "HiOutlineDocumentText",
    services: [
      {
        title: "Marriage Certificate",
        slug: "marriage-certificate",
        summary: "Legal registration of marriage under the Hindu Marriage Act, 1955 or Special Marriage Act, 1954 with official certificate issuance.",
      },
      {
        title: "Court Marriage Assistance",
        slug: "court-marriage-assistance",
        summary: "Step-by-step advocate support for solemnisation and registration of civil marriage before the Marriage Registrar.",
      },
      {
        title: "Name Change Documentation",
        slug: "name-change-documentation",
        summary: "Affidavit drafting, newspaper publication notices, and Central/State Official Gazette notification filing.",
      },
      {
        title: "Apostille Certificate / Document Apostille",
        slug: "apostille-certificate-document-apostille",
        summary: "Legalisation and MEA Hague Apostille verification for educational, commercial, and personal documents for abroad.",
      },
      {
        title: "Medical Negligence Matters",
        slug: "medical-negligence-matters",
        summary: "Legal notices, State Medical Council complaints, and Consumer Commission claims for medical malpractice and deficiency.",
      },
      {
        title: "Birth Certificate",
        slug: "birth-certificate",
        summary: "Late birth registration under Registration of Births and Deaths Act, 1969 through SDM order and municipal verification.",
      },
      {
        title: "Company Incorporation",
        slug: "company-incorporation",
        summary: "Private Limited, LLP, OPC incorporation with SPICe+ MCA filing, MOA/AOA drafting, and statutory director KYC.",
      },
      {
        title: "GST Registration",
        slug: "gst-registration",
        summary: "GST registration application, clarification drafting, and statutory tax compliance for enterprises and professionals.",
      },
      {
        title: "FSSAI Licence / Registration",
        slug: "fssai-licence-registration",
        summary: "Food safety basic registration, state licence, and central licence drafting and verification under Food Safety Act.",
      },
      {
        title: "Legal Heir Certificate",
        slug: "legal-heir-certificate",
        summary: "Tehsildar / Taluk office revenue application and advocate representation for surviving legal heir identification.",
      },
    ],
  },
  {
    id: "cat-02",
    number: "02",
    title: "Business Contracts & Agreements",
    slug: "business-contracts-agreements",
    shortDescription: "Custom drafting, risk mitigation, and commercial contract negotiation for enterprises and startups.",
    iconName: "HiOutlineBriefcase",
    services: [
      {
        title: "Non-Disclosure Agreement (NDA)",
        slug: "non-disclosure-agreement-nda",
        aliases: ["nda"],
        summary: "Unilateral or mutual confidentiality agreements protecting trade secrets, proprietary algorithms, and sensitive commercial data.",
      },
      {
        title: "Service Level Agreement (SLA)",
        slug: "service-level-agreement-sla",
        aliases: ["sla"],
        summary: "Binding metrics, uptime commitments, breach penalties, and service standards between service providers and clients.",
      },
      {
        title: "Franchise Agreement",
        slug: "franchise-agreement",
        summary: "Comprehensive commercial franchise model drafting covering royalty fee structures, brand IP licensing, and territory exclusivity.",
      },
      {
        title: "Master Services Agreement (MSA)",
        slug: "master-services-agreement-msa",
        aliases: ["msa"],
        summary: "Overarching contractual framework governing scopes of work, intellectual property ownership, and indemnification caps.",
      },
      {
        title: "Shareholders Agreement",
        slug: "shareholders-agreement",
        summary: "Governance agreements defining ROFR, drag-along/tag-along rights, voting thresholds, and minority shareholder protections.",
      },
      {
        title: "Joint Venture Agreement",
        slug: "joint-venture-agreement",
        summary: "Equity or contractual joint venture structuring specifying profit distribution, capital calls, and dispute mechanisms.",
      },
      {
        title: "Founders Agreement",
        slug: "founders-agreement",
        summary: "Co-founder equity split, vesting schedules with reverse cliff, IP assignment, and founder exit covenants.",
      },
      {
        title: "Vendor Agreement",
        slug: "vendor-agreement",
        summary: "Procurement, supply chain deliveries, QA parameters, defect remedies, and commercial dispute resolution covenants.",
      },
      {
        title: "Partnership Agreement",
        slug: "partnership-agreement",
        summary: "Partnership deed drafting under Indian Partnership Act, 1932 detailing profit ratios, duties, and dissolution terms.",
      },
      {
        title: "Consultancy Agreement",
        slug: "consultancy-agreement",
        summary: "Independent expert retainer agreement covering work deliverables, non-solicitation, and IP work-for-hire covenants.",
      },
      {
        title: "Memorandum of Understanding (MoU)",
        slug: "memorandum-of-understanding-mou",
        aliases: ["mou"],
        summary: "Preliminary bilateral intention documents clearly specifying binding vs non-binding clauses prior to final contract execution.",
      },
      {
        title: "Succession Certificate Assistance",
        slug: "succession-certificate-assistance",
        summary: "Civil Court petition under Indian Succession Act, 1925 for realizing deceased family member's debts and movable securities.",
      },
      {
        title: "Scope of Work (SOW) Agreement",
        slug: "scope-of-work-sow-agreement",
        aliases: ["sow-agreement"],
        summary: "Project milestones, deliverables, change-order protocols, and acceptance criteria mapped to enterprise master agreements.",
      },
      {
        title: "Share Purchase Agreement",
        slug: "share-purchase-agreement",
        summary: "Definitive transactional contract for transfer of shares, representations, warranties, and closing condition precedents.",
      },
      {
        title: "Relinquishment Deed",
        slug: "relinquishment-deed",
        summary: "Registered legal deed by which a co-owner or legal heir surrenders their share in ancestral immovable property to other heirs.",
      },
      {
        title: "Business Contract Drafting",
        slug: "business-contract-drafting",
        summary: "Tailored commercial agreements drafted from scratch with enforceable clauses under Indian Contract Act, 1872.",
      },
      {
        title: "Independent Contractor Agreement",
        slug: "independent-contractor-agreement",
        summary: "Freelancer and remote specialist contracts preventing employee misclassification risks and securing direct IP assignment.",
      },
      {
        title: "LLC Operating Agreement (foreign jurisdictions)",
        slug: "llc-operating-agreement-foreign-jurisdictions",
        summary: "Cross-border LLC operating agreements for US Delaware/Wyoming entities owned by Indian founders and corporate entities.",
      },
    ],
  },
  {
    id: "cat-03",
    number: "03",
    title: "Employment & Consumer Legal Notices",
    slug: "employment-consumer-legal-notices",
    shortDescription: "Formal legal notices for workplace disputes, wrongful dismissals, and consumer deficiency claims.",
    iconName: "HiOutlineExclamationCircle",
    services: [
      {
        title: "Legal Notice for Unpaid Salary",
        slug: "legal-notice-unpaid-salary",
        summary: "Formal statutory demand notice to employer for recovery of delayed salary, earned bonuses, and Full & Final (FnF) dues.",
      },
      {
        title: "Legal Notice for Wrongful Termination",
        slug: "legal-notice-wrongful-termination",
        summary: "Legal challenge against illegal dismissal violating employment contract, labor codes, POSH norms, or statutory severance.",
      },
      {
        title: "Legal Notice in Consumer Matters",
        slug: "legal-notice-consumer-matters",
        summary: "Statutory notice under Consumer Protection Act, 2019 for defective goods, deficient services, and refusal of refund.",
      },
    ],
  },
  {
    id: "cat-04",
    number: "04",
    title: "Real Estate & Property Matters",
    slug: "real-estate-property-matters",
    shortDescription: "Title verification, property transfer deeds, lease agreements, and tenancy dispute notices.",
    iconName: "HiOutlineHome",
    services: [
      {
        title: "Lease Agreement",
        slug: "lease-agreement",
        summary: "Long-term residential and commercial lease deeds covering stamp duty, registration, escalation clauses, and lock-in covenants.",
      },
      {
        title: "Eviction Notice",
        slug: "eviction-notice",
        summary: "Statutory notice to tenant under Transfer of Property Act, 1882 and state rent control laws terminating tenancy.",
      },
      {
        title: "Letter of Intent to Purchase Real Estate",
        slug: "letter-of-intent-purchase-real-estate",
        summary: "Pre-sale commercial terms memo detailing purchase consideration, due diligence periods, and earnest money conditions.",
      },
      {
        title: "Quitclaim Deed (where applicable)",
        slug: "quitclaim-deed-where-applicable",
        summary: "Deed releasing property claims without warranties, applicable in NRI property realignments and specific family settlements.",
      },
      {
        title: "Sale Deed Drafting",
        slug: "sale-deed-drafting",
        summary: "Enforceable conveyance deed drafting conveying clear title, encumbrance indemnities, and sub-registrar registration assistance.",
      },
      {
        title: "Gift Deed Drafting",
        slug: "gift-deed-drafting",
        summary: "Voluntary property transfer deed under Transfer of Property Act without monetary consideration, with mandatory registration.",
      },
      {
        title: "Property Power of Attorney",
        slug: "property-power-of-attorney",
        summary: "Special or General Power of Attorney drafting and registration for property management, rental execution, or legal representation.",
      },
      {
        title: "Rent Agreement and Lease Documentation",
        slug: "rent-agreement-lease-documentation",
        summary: "11-month leave & license agreements and registered leases compliant with state stamp laws and tenant verification norms.",
      },
      {
        title: "Landlord-Tenant Disputes",
        slug: "landlord-tenant-disputes",
        summary: "Advocate consultation and legal representation for unpaid rent recovery, unlawful subletting, and tenancy breaches.",
      },
      {
        title: "Eviction Matters",
        slug: "eviction-matters",
        summary: "Rent controller and civil court eviction suits for bona fide landlord requirement, default in rent, or structural damage.",
      },
      {
        title: "Property Documentation and Legal Review",
        slug: "property-documentation-legal-review",
        summary: "30-year title search, encumbrance certificate examination, municipal sanctions, and RERA compliance verification.",
      },
    ],
  },
  {
    id: "cat-05",
    number: "05",
    title: "Family & Personal Documents",
    slug: "family-personal-documents",
    shortDescription: "Estate planning, testament drafting, healthcare directives, and amicable matrimonial settlement deeds.",
    iconName: "HiOutlineHeart",
    services: [
      {
        title: "Last Will and Testament",
        slug: "last-will-and-testament",
        aliases: ["last-will-testament"],
        summary: "Legally sound testamentary succession instrument specifying asset bequeathal, executors, and exclusion of family disputes.",
      },
      {
        title: "Living Will / Advance Medical Directive",
        slug: "living-will-advance-medical-directive",
        summary: "Supreme Court-compliant healthcare directive declaring medical treatment choices in terminal condition or vegetative state.",
      },
      {
        title: "Divorce Settlement Agreement",
        slug: "divorce-settlement-agreement",
        summary: "Comprehensive memorandum of settlement for mutual consent divorce under Section 13B Hindu Marriage Act / Section 28 SMA.",
      },
      {
        title: "Child Care Authorization Form",
        slug: "child-care-authorization-form",
        summary: "Temporary legal custody and medical authorization consent letter empowering relatives or guardians during parent travel.",
      },
      {
        title: "Will Drafting and Registration Support",
        slug: "will-drafting-registration-support",
        summary: "End-to-end drafting, doctor fitness attestation, and Sub-Registrar office registration for indisputable validity.",
      },
      {
        title: "Succession and Estate Planning",
        slug: "succession-and-estate-planning",
        aliases: ["succession-estate-planning"],
        summary: "Family trust creation, cross-generation inheritance structures, and asset protection planning under Indian tax laws.",
      },
    ],
  },
  {
    id: "cat-06",
    number: "06",
    title: "Legal Notices & Responses",
    slug: "legal-notices-responses",
    shortDescription: "Advocate demand notices, cheque bounce Section 138 notices, caveat petitions, and legal notice replies.",
    iconName: "HiOutlineScale",
    services: [
      {
        title: "Legal Notice for Money Recovery",
        slug: "legal-notice-for-money-recovery",
        aliases: ["legal-notice-money-recovery"],
        summary: "Demand notice for unpaid loans, friendly debts, commercial invoices, or contractual advances under Order 37 CPC.",
      },
      {
        title: "Legal Notice for Recovery of Dues",
        slug: "legal-notice-for-recovery-of-dues",
        aliases: ["legal-notice-recovery-dues"],
        summary: "Formal advocate notice demanding settlement of outstanding operational and financial dues prior to civil litigation.",
      },
      {
        title: "Legal Notice under Consumer Protection Law",
        slug: "legal-notice-under-consumer-protection-law",
        summary: "Pre-complaint statutory notice to service providers or manufacturers demanding refund, replacement, and compensation.",
      },
      {
        title: "Cheque Bounce Legal Notice",
        slug: "cheque-bounce-legal-notice",
        isSampleFullPage: true,
        summary: "Mandatory statutory demand notice under Section 138 of the Negotiable Instruments Act, 1881 within 30 days of dishonour memo.",
      },
      {
        title: "Reply to IPR Notice",
        slug: "reply-to-ipr-notice",
        summary: "Defensive advocate rejoinder to trademark or copyright cease-and-desist notices refuting infringement claims.",
      },
      {
        title: "Caveat Petition",
        slug: "caveat-petition",
        summary: "Pre-emptive petition under Section 148A of the Code of Civil Procedure, 1908 preventing ex-parte interim orders.",
      },
      {
        title: "Tenant / Rental Notice",
        slug: "tenant-rental-notice",
        summary: "Notice for vacation of premises, rent revision, rectification of lease breach, or security deposit refund.",
      },
    ],
  },
  {
    id: "cat-07",
    number: "07",
    title: "Intellectual Property Rights (IPR)",
    slug: "intellectual-property-rights-ipr",
    shortDescription: "Trademark filing, copyright protection, patent filing assistance, and IP infringement remedies.",
    iconName: "HiOutlineShieldCheck",
    services: [
      {
        title: "Trademark Registration",
        slug: "trademark-registration",
        summary: "Brand name, logo, and slogan search, NICE classification, TM application filing, and examination reply with IP India.",
      },
      {
        title: "Copyright Registration",
        slug: "copyright-registration",
        summary: "Copyright protection for software source code, literary works, musical recordings, cinematography, and artistic designs.",
      },
      {
        title: "Patent Application / Registration Assistance",
        slug: "patent-application-registration-assistance",
        summary: "Prior art search, provisional/complete specification drafting, and patent attorney support under the Patents Act, 1970.",
      },
      {
        title: "IP Infringement Matters",
        slug: "ip-infringement-matters",
        summary: "Cease and desist notices, commercial court infringement suits, passing-off injunctions, and domain cybersquatting disputes.",
      },
      {
        title: "Design Registration",
        slug: "design-registration",
        summary: "Registration of novel aesthetic shape, pattern, and ornamentation of industrial products under Designs Act, 2000.",
      },
    ],
  },
  {
    id: "cat-08",
    number: "08",
    title: "Documentation & Compliance",
    slug: "documentation-compliance",
    shortDescription: "Affidavits, undertakings, notary verifications, corporate powers of attorney, and legal compliance reviews.",
    iconName: "HiOutlineClipboardCheck",
    services: [
      {
        title: "Affidavits",
        slug: "affidavits",
        summary: "Sworn legal statements for address proof, name discrepancy, date of birth verification, and court filing requirements.",
      },
      {
        title: "Declarations",
        slug: "declarations",
        summary: "Statutory declarations for visa processing, NRI remittances, university admissions, and regulatory authorities.",
      },
      {
        title: "Undertakings",
        slug: "undertakings",
        summary: "Binding formal promises to perform or refrain from acts, required in institutional admissions, loans, and licensing.",
      },
      {
        title: "Notary-Related Documentation",
        slug: "notary-related-documentation",
        summary: "Advocate notarial verification, stamp paper stamping, and attested document execution compliant with Notaries Act.",
      },
      {
        title: "Legal Document Review",
        slug: "legal-document-review",
        summary: "Rigorous redlining of contracts, leases, and agreements to spot hidden liabilities, one-sided indemnity, and risks.",
      },
      {
        title: "Business Agreements and Legal Documentation",
        slug: "business-agreements-and-legal-documentation",
        aliases: ["business-agreements-legal-documentation"],
        summary: "B2B commercial contracts, distribution agreements, NDAs, and transactional legal instruments drafted to protect interests.",
      },
      {
        title: "Power of Attorney Drafting",
        slug: "power-of-attorney-drafting",
        summary: "General Power of Attorney (GPA) and Special Power of Attorney (SPA) drafted for financial, litigation, or property agency.",
      },
      {
        title: "Contract Drafting, Review and Legal Analysis",
        slug: "contract-drafting-review-and-legal-analysis",
        aliases: ["contract-drafting-review-legal-analysis"],
        summary: "Deep legal analysis and risk mitigation audits on critical commercial commitments and enterprise supplier agreements.",
      },
      {
        title: "Compliance Checks and Legal Documentation Advisory",
        slug: "compliance-checks-and-legal-documentation-advisory",
        aliases: ["compliance-checks-legal-documentation-advisory"],
        summary: "Audit of statutory registers, labor compliance filings, regulatory licenses, and data privacy safeguards under DPDP Act.",
      },
    ],
  },
  {
    id: "cat-09",
    number: "09",
    title: "Consumer Complaints & Financial Disputes",
    slug: "consumer-complaints-financial-disputes",
    shortDescription: "Consumer forum cases, banking ombudsman complaints, MSME debt recovery, and insurance claim disputes.",
    iconName: "HiOutlineCreditCard",
    services: [
      {
        title: "Consumer Court Cases and Legal Consultation",
        slug: "consumer-court-cases-and-legal-consultation",
        aliases: ["consumer-court-cases-legal-consultation"],
        summary: "District, State, and National Consumer Commission (NCDRC) petitions claiming compensation for unfair trade practices.",
      },
      {
        title: "DRT, MSME and Recovery-Related Disputes",
        slug: "drt-msme-and-recovery-related-disputes",
        aliases: ["drt-msme-recovery-related-disputes"],
        summary: "Debt Recovery Tribunal representation, SARFAESI notices, and MSME Samadhaan delayed payment applications.",
      },
      {
        title: "Accident Claims and Traffic Challan Matters",
        slug: "accident-claims-and-traffic-challan-matters",
        aliases: ["accident-claims-traffic-challan-matters"],
        summary: "Motor Accident Claims Tribunal (MACT) compensation claims and contested virtual court e-challan legal representation.",
      },
      {
        title: "Loan Disputes and Banking Complaints",
        slug: "loan-disputes-and-banking-complaints",
        aliases: ["loan-disputes-banking-complaints"],
        summary: "Complaints to RBI Banking Ombudsman against unauthorized transactions, predatory recovery agents, and hidden charges.",
      },
      {
        title: "Refunds, Compensation and Consumer Claims",
        slug: "refunds-compensation-and-consumer-claims",
        aliases: ["refunds-compensation-consumer-claims"],
        summary: "Legal notices and filings against airlines, e-commerce portals, real estate builders, and edtech platforms for denied refunds.",
      },
      {
        title: "Defective Products and Deficiency in Services Cases",
        slug: "defective-products-and-deficiency-in-services-cases",
        aliases: ["defective-products-deficiency-services-cases"],
        summary: "Product liability and service deficiency litigation demanding full refunds, replacement, and punitive damages.",
      },
    ],
  },
  {
    id: "cat-10",
    number: "10",
    title: "Online Fraud & Cyber Legal Matters",
    slug: "online-fraud-cyber-legal-matters",
    shortDescription: "Cybercrime cell complaints, financial online fraud recovery, cyberstalking notices, and digital evidence handling.",
    iconName: "HiOutlineLockClosed",
    services: [
      {
        title: "Online Fraud, Scams and Financial Cybercrime Cases",
        slug: "online-fraud-scams-and-financial-cybercrime-cases",
        aliases: ["online-fraud-scams-financial-cybercrime-cases"],
        summary: "Immediate bank account freezing coordination, 1930 portal complaints, and NCRP filings for UPI, OTP, and phishing scams.",
      },
      {
        title: "Hacking, Data Theft and Privacy Breach Matters",
        slug: "hacking-data-theft-and-privacy-breach-matters",
        aliases: ["hacking-data-theft-privacy-breach-matters"],
        summary: "Section 43 & 66 Information Technology Act legal action against corporate data breach, ransomware, and website hacking.",
      },
      {
        title: "Cyberstalking and Online Harassment Complaints",
        slug: "cyberstalking-and-online-harassment-complaints",
        aliases: ["cyberstalking-online-harassment-complaints"],
        summary: "Complaints under Section 67 IT Act & Section 78 BNS against morphed images, blackmail, and persistent social media harassment.",
      },
      {
        title: "Identity Theft and Digital Fraud Recovery Support",
        slug: "identity-theft-and-digital-fraud-recovery-support",
        aliases: ["identity-theft-digital-fraud-recovery-support"],
        summary: "Remedies for impersonation, fake PAN/Aadhaar loan applications, and fraudulent sim-swap identity theft cases.",
      },
      {
        title: "Cyber Legal Notices and Complaint Drafting",
        slug: "cyber-legal-notices-and-complaint-drafting",
        aliases: ["cyber-legal-notices-complaint-drafting"],
        summary: "Takedown notices under Intermediary Guidelines (Rule 3 IT Rules) to Google, Meta, and hosting providers for illegal content.",
      },
      {
        title: "Cybercrime Litigation and Dispute Resolution",
        slug: "cybercrime-litigation-and-dispute-resolution",
        aliases: ["cybercrime-litigation-dispute-resolution"],
        summary: "Advocate representation before State IT Adjudicating Officers and Cyber Courts for compensation under Section 46 IT Act.",
      },
    ],
  },
  {
    id: "cat-11",
    number: "11",
    title: "Family Disputes & Matrimonial Matters",
    slug: "family-disputes-matrimonial-matters",
    shortDescription: "Mutual divorce, child custody petitions, domestic violence defense, maintenance, and inheritance division.",
    iconName: "HiOutlineUserGroup",
    services: [
      {
        title: "Legal Heir Certificate and Inheritance Disputes",
        slug: "legal-heir-certificate-and-inheritance-disputes",
        aliases: ["legal-heir-certificate-inheritance-disputes"],
        summary: "Partition suits, challenge to forged wills, and family settlement deeds resolving contested ancestral inheritance.",
      },
      {
        title: "Domestic Violence and Women Protection Cases",
        slug: "domestic-violence-and-women-protection-cases",
        aliases: ["domestic-violence-women-protection-cases"],
        summary: "Protection orders, residence orders, and interim monetary relief petitions under Protection of Women from Domestic Violence Act.",
      },
      {
        title: "Personal Law Matters (incl. Muslim Law & Family Rights)",
        slug: "personal-law-matters-including-muslim-law-and-family-rights",
        aliases: ["personal-law-matters-muslim-law-family-rights", "personal-law-matters-incl-muslim-law-family-rights"],
        summary: "Consultation and documentation under Muslim Personal Law (Shariat), Christian Marriage Act, and Special Marriage Act.",
      },
      {
        title: "Child Custody, Guardianship and Visitation Rights",
        slug: "child-custody-guardianship-and-visitation-rights",
        aliases: ["child-custody-guardianship-visitation-rights"],
        summary: "Petitions under Guardians and Wards Act, 1890 focusing on the welfare of the minor child, shared parenting, and visitation schedules.",
      },
      {
        title: "Maintenance, Alimony and Financial Support Matters",
        slug: "maintenance-alimony-and-financial-support-matters",
        aliases: ["maintenance-alimony-financial-support-matters"],
        summary: "Section 144 BNSS (formerly 125 CrPC) and Section 24/25 HMA claims for monthly interim maintenance and permanent alimony.",
      },
      {
        title: "Divorce, Mutual Separation and Matrimonial Disputes",
        slug: "divorce-mutual-separation-and-matrimonial-disputes",
        aliases: ["divorce-mutual-separation-matrimonial-disputes"],
        summary: "Mutual consent divorce petitions, cooling-off waiver applications, and contested matrimonial litigation representation.",
      },
    ],
  },
];

// Flat list of all 87 services with their parent category metadata
export const ALL_LEGAL_SERVICES = LEGAL_SERVICES_CATEGORIES.flatMap((cat) =>
  cat.services.map((svc) => ({
    ...svc,
    categoryTitle: cat.title,
    categorySlug: cat.slug,
    categoryNumber: cat.number,
  }))
);

export const findCategoryBySlug = (slug = "") => {
  if (!slug) return null;
  const normalized = slugify(slug);
  return (
    LEGAL_SERVICES_CATEGORIES.find(
      (cat) => cat.slug === normalized || slugify(cat.title) === normalized
    ) || null
  );
};

export const findServiceBySlug = (categorySlug = "", serviceSlug = "") => {
  if (!serviceSlug) return null;
  const normSvc = slugify(serviceSlug);
  const normCat = categorySlug ? slugify(categorySlug) : null;

  // Search within category if category slug provided
  if (normCat) {
    const category = findCategoryBySlug(normCat);
    if (category) {
      const match = category.services.find(
        (s) =>
          s.slug === normSvc ||
          slugify(s.title) === normSvc ||
          (s.aliases && s.aliases.includes(normSvc))
      );
      if (match) {
        return {
          ...match,
          categoryTitle: category.title,
          categorySlug: category.slug,
          categoryNumber: category.number,
        };
      }
    }
  }

  // Fallback to searching globally across all 87 services
  return (
    ALL_LEGAL_SERVICES.find(
      (s) =>
        s.slug === normSvc ||
        slugify(s.title) === normSvc ||
        (s.aliases && s.aliases.includes(normSvc))
    ) || null
  );
};

export const getRelatedServices = (categorySlug = "", currentServiceSlug = "", limit = 4) => {
  const category = findCategoryBySlug(categorySlug);
  if (!category) return [];
  const normCurrent = slugify(currentServiceSlug);
  return category.services
    .filter((s) => s.slug !== normCurrent && slugify(s.title) !== normCurrent)
    .slice(0, limit)
    .map((s) => ({
      ...s,
      categoryTitle: category.title,
      categorySlug: category.slug,
      categoryNumber: category.number,
    }));
};
