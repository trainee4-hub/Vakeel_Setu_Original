export const saleDeedDraftingData = {
  serviceSlug: "sale-deed-drafting",
  categorySlug: "real-estate-property-matters",
  categoryTitle: "Real Estate & Property Matters",
  title: "Sale Deed Drafting",
  h1: "Sale Deed Drafting & Property Conveyance Legal Framework",
  seoTitle: "Sale Deed Drafting in India | Property Conveyance & Registration Guide",
  metaTitle: "Sale Deed Drafting & Property Registration Legal Requirements",
  metaDescription:
    "Legal framework, statutory covenants, circle rates, stamp duty, and mandatory registration requirements for immovable property sale deeds under Indian law.",
  shortIntro:
    "Sale Deed Drafting is the preparation and formal execution of the definitive conveyance deed under Section 54 of the Transfer of Property Act, 1882, transferring absolute ownership, title, and possession of immovable property from a seller to a buyer for monetary consideration. Mandatory registration under Section 17 of the Registration Act, 1908 before the Sub-Registrar establishes indisputable, marketable title.",

  introduction: {
    summary:
      "A sale deed is a primary legal instrument through which ownership and title of an immovable property (such as land, a house, an apartment or commercial premises) are permanently transferred by a seller (vendor) to a buyer (vendee) in exchange for a specified price or consideration paid or promised. In Indian property practice, the sale deed serves as conclusive evidence of conveyance once duly executed, stamped and registered under the applicable statutory regime.",
    highlights: [
      "Operates as the primary conveyance deed transferring absolute ownership and title in immovable property.",
      "Requires explicit recitals verifying vendor's root of title and covenants of freedom from encumbrances.",
      "Mandatory registration under Section 17(1)(b) of the Registration Act, 1908 for transfer to be legally effective.",
      "Subject to state ad valorem stamp duty calculated on market value or government circle rates.",
    ],
  },

  applicableLaws: [
    {
      act: "Transfer of Property Act, 1882",
      section: "Sections 54 & 55",
      description:
        "Section 54 defines sale and mandates that transfer of tangible immovable property of value Rs 100 or upward can be made only by registered instrument. Section 55 specifies statutory rights and liabilities of buyer and seller, including implied covenants for title.",
    },
    {
      act: "Registration Act, 1908",
      section: "Sections 17(1)(b) & 49",
      description:
        "Requires compulsory registration of instruments that create, declare, assign, or extinguish title in immovable property. Under Section 49, an unregistered sale deed does not affect property or confer title.",
    },
    {
      act: "Indian Stamp Act, 1899 & State Stamp Acts",
      section: "State Stamp Schedules",
      description:
        "Prescribes payment of stamp duty based on consideration or guideline/circle rate before registration. Unstamped or insufficiently stamped instruments face impounding and penalties under stamp law.",
    },
    {
      act: "Real Estate (Regulation and Development) Act, 2016 (RERA)",
      section: "Sections 11, 13, 17, 18 & 19",
      description:
        "Governs real estate project sales, mandating execution and registration of registered conveyance deeds in favour of allottees within specified statutory timelines.",
    },
    {
      act: "Indian Contract Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023",
      section: "Contractual Validity & Evidentiary Proof",
      description:
        "Governs contractual capacity, lawful consideration, free consent, and rules concerning proof of attested execution and document admissibility.",
    },
  ],

  documentsRequired: [
    {
      category: "Title Deeds & Chain of Ownership",
      items: [
        {
          name: "Mother Deed / Link Ownership Documents",
          detail: "Prior registered sale deeds, gift deeds, or conveyance instruments tracing clear title for the past 30 years.",
        },
        {
          name: "Encumbrance Certificate (EC)",
          detail: "Form 15/16 Encumbrance Certificate for 13 to 30 years from the Sub-Registrar proving property is free from liens or mortgages.",
        },
        {
          name: "Latest Khata / Municipal Mutation Extract",
          detail: "A-Khata, Patta, 7/12 extract, or Jamabandi reflecting the seller as the registered revenue titleholder.",
        },
      ],
    },
    {
      category: "Statutory Approvals & Clearances",
      items: [
        {
          name: "Sanctioned Building Plan & OC / CC",
          detail: "Approved architectural plan, Commencement Certificate, and Occupancy Certificate (for apartments and built premises).",
        },
        {
          name: "Property Tax Paid Receipts",
          detail: "Latest municipal property tax receipts clearing all municipal assessment dues up to the date of conveyance.",
        },
        {
          name: "Society / Builder NOC",
          detail: "No Objection Certificate from RWA or housing society confirming zero maintenance dues and transfer clearance.",
        },
      ],
    },
    {
      category: "Parties Identity & Stamp Duty",
      items: [
        {
          name: "PAN & Aadhaar Cards of Buyer & Seller",
          detail: "Mandatory government identity proofs of both vendor and vendee for TDS compliance under Section 194-IA.",
        },
        {
          name: "Non-Judicial e-Stamp Paper",
          detail: "State ad valorem stamp duty challan paid on consideration value or circle rate, whichever is higher.",
        },
        {
          name: "Two Independent Adult Witnesses",
          detail: "Original identity and address proofs of two independent witnesses attending Sub-Registrar registration.",
        },
      ],
    },
  ],

  legalProcedure: [
    {
      step: 1,
      tag: "TITLE SEARCH",
      title: "Title Due Diligence & Search Report",
      description:
        "Advocate inspects revenue and sub-registrar registers for 30 years to verify marketable title, check for mortgages, pending litigations, and encumbrances.",
      milestone: "Title Search Complete",
    },
    {
      step: 2,
      tag: "AGREEMENT TO SELL",
      title: "Drafting & Execution of Agreement to Sell",
      description:
        "Bilateral agreement fixing total sale consideration, earnest money (advance), payment schedule, time for completion, and penalty covenants.",
      milestone: "ATS Executed",
    },
    {
      step: 3,
      tag: "TDS COMPLIANCE",
      title: "Payment & Deduction of TDS (Section 194-IA)",
      description:
        "If property consideration exceeds ₹50 Lakhs, buyer deducts 1% TDS and deposits via Form 26QB, providing Form 16B certificate to the seller.",
      milestone: "TDS Deposited",
    },
    {
      step: 4,
      tag: "CONVEYANCE DRAFTING",
      title: "Drafting the Final Sale Deed",
      description:
        "Drafting complete conveyance clauses: property schedule, boundaries, consideration receipt, indemnity against defect in title, and delivery of vacant possession.",
      milestone: "Sale Deed Finalized",
    },
    {
      step: 5,
      tag: "SUB-REGISTRAR EXECUTION",
      title: "Registration at Sub-Registrar Office (Section 17)",
      description:
        "Both parties and two witnesses appear before the Sub-Registrar of Assurances for biometric fingerprinting, digital photo capture, fee payment, and deed registration.",
      milestone: "Sale Deed Registered",
    },
  ],

  faqs: [
    {
      question: "What is the legal difference between an Agreement to Sell and a Sale Deed?",
      answer:
        "Under Section 54 of the Transfer of Property Act, 1882, an Agreement to Sell is merely an agreement to transfer property on agreed terms in the future; it does not create any interest or title in the property. A Sale Deed is the actual conveyance instrument that transfers ownership and title permanently upon registration.",
    },
    {
      question: "Is registration of a Sale Deed mandatory under Indian law?",
      answer:
        "Yes. Under Section 54 of the Transfer of Property Act and Section 17 of the Registration Act, 1908, any transfer of tangible immovable property valued at ₹100 or upward must be executed through a registered sale deed. An unregistered sale deed has no legal effect and cannot convey title.",
    },
    {
      question: "How is stamp duty calculated for a Sale Deed?",
      answer:
        "Stamp duty is an ad valorem tax determined by the State Government, calculated on either the actual agreed sale consideration or the official government circle rate / guideline value (whichever is higher), typically ranging between 4% and 7% plus local registration charges.",
    },
    {
      question: "What is the requirement of TDS on property sale under Section 194-IA?",
      answer:
        "Under Section 194-IA of the Income-tax Act, 1961, if the sale consideration or stamp duty value of an immovable property is ₹50 Lakhs or more, the buyer must deduct 1% TDS from the payment to a resident seller and deposit it via Form 26QB on the government tax portal.",
    },
    {
      question: "What is mutation of property and is it done automatically after sale deed registration?",
      answer:
        "Registration conveys title between parties, but Mutation (Dakhil-Kharij) updates the local municipal or revenue land records to transfer the property tax billing liability to the buyer's name. In many states, online registration triggers automated mutation; in others, the buyer must submit an application with the registered sale deed.",
    },
  ],

  disclaimer:
    "Educational overview only; not a substitute for advice on a particular title or property transaction.",

  researchSources: [
    "Transfer of Property Act, 1882 (India Code)",
    "Registration Act, 1908 (India Code)",
    "Indian Stamp Act, 1899 & State Stamp Schedules",
    "Real Estate (Regulation and Development) Act, 2016 (India Code)",
    "Indian Contract Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023",
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
    title: "Speak with an Advocate Regarding Sale Deed Drafting",
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

