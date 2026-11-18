export const rentAgreementLeaseDocumentationData = {
  serviceSlug: "rent-agreement-lease-documentation",
  categorySlug: "real-estate-property-matters",
  categoryTitle: "Real Estate & Property Matters",
  title: "Rent Agreement and Lease Documentation",
  h1: "Rent Agreement & Lease Deed Documentation Legal Framework",
  seoTitle: "Rent Agreement & Lease Documentation in India | Legal Framework Guide",
  metaTitle: "Rent Agreement & Lease Documentation Legal Requirements in India",
  metaDescription:
    "Statutory framework, lease vs license distinctions, mandatory registration, stamp duty, and essential clauses for rental agreements and lease deeds in India.",
  shortIntro:
    "Rent Agreement and Lease Documentation comprises the drafting, stamp duty adjudication, and formal execution of Leave and License agreements (up to 11 months) and registered long-term leases under the Transfer of Property Act, 1882 and Indian Easements Act, 1882. It protects property rights, establishes legally enforceable rent and deposit terms, and mandates registration before the Sub-Registrar for tenancies exceeding 11 months.",

  introduction: {
    summary:
      "Rent agreements and lease deeds are legal instruments that define the terms on which an owner or lawful occupier of immovable property grants possession and use of the premises to another person for residential, commercial or industrial purposes. In Indian property practice, documents range from short-term leave-and-licence agreements to formal, registered long-term leases. The legal character of the arrangement—whether a lease creating an interest in land or a licence conferring personal permission to occupy—has significant implications for security of tenure, transferability, registration and remedies.",
    highlights: [
      "Distinguishes between a lease (creating an interest in immovable property) and a licence (granting personal permission to occupy).",
      "Addresses rent escalation, security deposit, maintenance, subletting, forfeiture, and handover protocols.",
      "Requires mandatory registration under Section 17(1)(d) of the Registration Act, 1908 for leases exceeding eleven months.",
      "Subject to state-specific stamp duty schedules and state tenancy or rent control enactments.",
    ],
  },

  applicableLaws: [
    {
      act: "Transfer of Property Act, 1882",
      section: "Sections 105, 106, 107, 108 & 111",
      description:
        "Section 105 defines lease, lessor, lessee, and rent. Section 106 governs duration in absence of written contract. Section 107 prescribes execution methods. Section 108 sets out statutory rights and liabilities, and Section 111 specifies determination of leases.",
    },
    {
      act: "Indian Easements Act, 1882",
      section: "Section 52",
      description:
        "Defines a licence as a right to do something upon immovable property that would otherwise be unlawful, without conferring an easement or interest in property.",
    },
    {
      act: "Registration Act, 1908",
      section: "Sections 17(1)(d) & 49",
      description:
        "Mandates compulsory registration for leases of immovable property from year to year, for any term exceeding one year, or reserving a yearly rent. Unregistered leases cannot affect property or be received as evidence under Section 49, subject to limited collateral purpose exceptions.",
    },
    {
      act: "Indian Stamp Act, 1899 & State Stamp Acts",
      section: "State Stamp Schedules",
      description:
        "Prescribes ad valorem or fixed stamp duty based on lease duration, total rent payable, and refundable deposit amounts. Certain states (e.g., Maharashtra) also mandate registration of leave and licence agreements regardless of term.",
    },
    {
      act: "State Rent Control and Tenancy Legislation",
      section: "Applicable State Tenancy Enactments",
      description:
        "Various state tenancy laws and modern rent acts provide statutory frameworks governing eviction grounds, rent revisions, dispute adjudication, and rent authority registrations.",
    },
    {
      act: "Indian Contract Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023",
      section: "Contract Enforceability & Document Proof",
      description:
        "Governs contractual terms, liquidated damages, security forfeiture, and evidentiary proof of signed and attested lease documentation.",
    },
  ],

  documentsRequired: [
    {
      category: "Owner / Landlord Property Proof",
      items: [
        {
          name: "Title Deed / Ownership Conveyance Deed",
          detail: "Registered sale deed, partition deed, or allotment letter proving landlord's ownership of the premises.",
        },
        {
          name: "Latest Municipal Tax / Khata Extract",
          detail: "Recent property tax receipt or assessment extract confirming premises boundaries and assessment number.",
        },
        {
          name: "Electricity Bill of Premises",
          detail: "Recent metered electric utility bill under 60 days old establishing active service at the property.",
        },
      ],
    },
    {
      category: "Tenant / Licensee Identification",
      items: [
        {
          name: "Aadhaar / Voter ID / Passport",
          detail: "Self-attested government identity and permanent address proof of the tenant or licensee.",
        },
        {
          name: "Permanent Account Number (PAN)",
          detail: "PAN card copy of both parties (mandatory for annual rent exceeding statutory tax limits).",
        },
        {
          name: "Passport Sized Photographs",
          detail: "Recent colored passport-size photographs of both licensor and licensee.",
        },
      ],
    },
    {
      category: "Police Verification & Registration Records",
      items: [
        {
          name: "Tenant Police Verification Form",
          detail: "Duly filled police verification proforma submitted to local jurisdiction police station.",
        },
        {
          name: "e-Stamp Paper / e-Registration Credentials",
          detail: "Non-judicial e-stamp paper or state e-filing portal biometric token (for states like Maharashtra).",
        },
      ],
    },
  ],

  legalProcedure: [
    {
      step: 1,
      tag: "CLAUSE STRUCTURING",
      title: "Negotiation of Commercial & Tenancy Terms",
      description:
        "Landlord and tenant agree upon rent, monthly maintenance, security deposit, lock-in period, notice period (e.g. 1 month), and utility sharing covenants.",
      milestone: "Clauses Agreed",
    },
    {
      step: 2,
      tag: "LEGAL DRAFTING",
      title: "Drafting Leave & License / Lease Agreement",
      description:
        "Advocate drafts customized agreement establishing clear licensor-licensee or lessor-lessee relationship, defining eviction grounds and dispute resolution.",
      milestone: "Draft Finalized",
    },
    {
      step: 3,
      tag: "STAMPING",
      title: "Procurement of Non-Judicial e-Stamp",
      description:
        "Purchasing state-prescribed stamp paper or paying ad valorem stamp duty calculated based on rent and deposit amounts.",
      milestone: "Stamp Duty Paid",
    },
    {
      step: 4,
      tag: "EXECUTION & NOTARIZATION",
      title: "Signing & Notary / Sub-Registrar Registration",
      description:
        "Signing by both parties and two witnesses before an authorized Notary Public (for 11-month tenancies) or before the Sub-Registrar (for registered leases).",
      milestone: "Document Registered",
    },
    {
      step: 5,
      tag: "POLICE VERIFICATION",
      title: "Submission of Tenant Police Verification",
      description:
        "Filing tenant police verification proforma along with tenant ID and photograph at the local jurisdictional police station.",
      milestone: "Police Verification Logged",
    },
  ],

  faqs: [
    {
      question: "Is police verification mandatory for tenants in India?",
      answer:
        "Yes. In almost all major cities and urban jurisdictions, local police commissionerates issue mandatory directives under Section 144 CrPC / State Police Acts requiring landlords to submit tenant verification particulars to the local police station to prevent unlawful occupancy.",
    },
    {
      question: "Can a rent agreement be renewed automatically after 11 months?",
      answer:
        "An agreement does not renew automatically unless an express renewal clause is included. The legally prudent approach is to execute a fresh agreement with revised rental terms and fresh stamp duty to avoid ambiguity or dispute regarding tenancy status.",
    },
    {
      question: "What is the standard notice period for vacating under a rent agreement?",
      answer:
        "Standard residential agreements typically prescribe a 30-day (1 month) written notice by either party. During the lock-in period, premature termination may be prohibited unless specifically permitted for cause.",
    },
    {
      question: "Does a registered rent agreement provide better legal protection than a notarized one?",
      answer:
        "Yes. A registered agreement possesses statutory evidentiary presumption under the Registration Act, 1908 and is primary evidence admissible in court. Notarized agreements, while common for 11 months, carry lower evidentiary weight and cannot affect property rights for tenancies over 11 months.",
    },
    {
      question: "What are the legal limits on security deposits under the Model Tenancy Act?",
      answer:
        "Under the Model Tenancy Act (adopted by several states), the security deposit for residential premises is capped at a maximum of two months' rent, and for non-residential/commercial premises, it is capped at a maximum of six months' rent.",
    },
  ],

  disclaimer:
    "Educational overview only; not a substitute for advice on a particular lease or jurisdiction.",

  researchSources: [
    "Transfer of Property Act, 1882 (India Code)",
    "Indian Easements Act, 1882 (India Code)",
    "Registration Act, 1908 (India Code)",
    "Indian Stamp Act, 1899 & State Stamp Schedules",
    "State Rent Control and Tenancy Acts",
  ],

  trustChips: [
    "Bar Council-Enrolled Advocates",
    "Confidential",
    "Transparent Legal Process",
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

  consultationCta: {
    badge: "Advocate Consultation",
    title: "Speak with an Advocate Regarding Rent & Lease Documentation",
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
};

