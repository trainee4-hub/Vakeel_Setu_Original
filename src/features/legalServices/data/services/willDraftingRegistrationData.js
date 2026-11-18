export const willDraftingRegistrationData = {
  serviceSlug: "will-drafting-registration-support",
  categorySlug: "family-personal-documents",
  categoryTitle: "Family & Personal Documents",
  title: "Will Drafting and Registration Support",
  h1: "Will Drafting and Registration Legal Framework",
  seoTitle: "Will Drafting & Registration Support in India | Legal Framework Guide",
  metaTitle: "Will Drafting and Registration Support Under Indian Law",
  metaDescription:
    "Legal framework, testamentary capacity under Section 59, execution rules under Section 63, optional registration, and probate under Indian Succession Act.",
  shortIntro:
    "Statutory legal framework and advocacy assistance for drafting, executing, and registering testamentary wills in India under the Indian Succession Act, 1925 and the Registration Act, 1908. Covers testamentary capacity certifications under Section 59, strict two-witness attestation protocols under Section 63, optional Book 4 Sub-Registrar registration, and probate proceedings to establish indisputable succession title.",

  trustChips: [
    { label: "Bar Council-Enrolled Advocates", icon: "shield" },
    { label: "Book 4 Registration Advisory", icon: "file" },
    { label: "Confidential", icon: "lock" },
    { label: "Phone & Video Consultation", icon: "phone" },
  ],

  introduction: {
    summary:
      "Will drafting is the process of preparing a written declaration through which a person (the testator) states how their property and other legally transferable interests should be distributed after death. A will generally takes effect only upon the testator’s death and may be altered or revoked during their lifetime, provided they have legal capacity. Proper drafting helps identify beneficiaries, appoint an executor, reduce ambiguity and lower the risk of family disputes.",
    highlights: [
      "Takes effect only upon the death of the testator and remains revocable during their lifetime.",
      "Governed primarily by the Indian Succession Act, 1925, subject to personal law restrictions (such as Muslim law).",
      "Requires execution by the testator and mandatory attestation by at least two independent adult witnesses under Section 63.",
      "Registration under the Registration Act, 1908 is generally optional under Section 18, providing evidentiary support.",
    ],
  },

  applicableLaws: [
    {
      act: "Indian Succession Act, 1925",
      section: "Sections 59 & 63",
      title: "Testamentary Capacity & Two-Witness Attestation",
      summary:
        "Section 59 requires sound mind and age of majority for testamentary capacity. Section 63 establishes mandatory execution formalities requiring the testator to sign or affix their mark and at least two attesting witnesses to sign in the testator's presence.",
      tag: "Principal Succession Statute",
    },
    {
      act: "Registration Act, 1908",
      section: "Sections 18(e), 40, 41 & Part IX",
      title: "Optional Registration & Deposit of Wills",
      summary:
        "Section 18 classifies will registration as optional. Sections 40-41 govern registration procedures in Book 4 during lifetime or post-demise, and Part IX provides statutory mechanisms for depositing sealed wills with the Registrar for safe custody.",
      tag: "Registration Framework",
    },
    {
      act: "Bharatiya Sakshya Adhiniyam, 2023",
      section: "Sections 67 & 68 (Proof of Attested Documents)",
      title: "Evidentiary Proof of Execution & Attestation",
      summary:
        "Prescribes statutory rules for proving contested testamentary instruments in court, mandating the calling and examination of at least one attesting witness alive and subject to court process to establish valid execution.",
      tag: "Evidentiary Standards",
    },
    {
      act: "Personal Law Succession Rules",
      section: "Hindu Succession Act, 1956 & Muslim Personal Law",
      title: "Personal Law Testamentary Powers & Restrictions",
      summary:
        "Section 30 of the Hindu Succession Act permits testamentary disposition of coparcenary interest. Under Muslim personal law (Wasiyat), testamentary powers are limited to one-third of the net estate, requiring consent of legal heirs for any excess.",
      tag: "Personal Law Enactments",
    },
  ],

  legalProcedure: [
    {
      step: 1,
      tag: "TESTAMENTARY ASSET INVENTORY",
      title: "Capacity Verification, Prior Wills Revocation & Asset Listing",
      description:
        "Ascertaining testamentary capacity under Section 59, obtaining a registered medical practitioner's fitness certificate, recording voluntary intent, declaring revocation of prior wills, and cataloguing self-acquired immovable and movable assets.",
      milestone: "Testator Assessment & Asset Schedule Complete",
    },
    {
      step: 2,
      tag: "DRAFTING & LEGAL SCRUTINY",
      title: "Will Formulation, Executor Designation & Residuary Bequests",
      description:
        "Drafting clear and unambiguous devise clauses, appointing capable primary and substitute executors, nominating guardians for minor beneficiaries, structuring life interest or conditional bequests, and inserting comprehensive residuary clauses.",
      milestone: "Will Draft Reviewed & Approved",
    },
    {
      step: 3,
      tag: "EXECUTION & WITNESS ATTESTATION",
      title: "Execution and Attestation by Two Independent Witnesses",
      description:
        "The testator signs or affixes their mark on each page in the physical presence of two independent adult attesting witnesses (who are not beneficiaries under Section 67), who then sign attestation clauses in the testator's presence.",
      milestone: "Will Executed & Attested under Section 63",
    },
    {
      step: 4,
      tag: "SUB-REGISTRAR REGISTRATION",
      title: "Sub-Registrar Appearance, Book 4 Entry & Safe Custody",
      description:
        "Presenting the executed will before the jurisdictional Sub-Registrar under Sections 40-41 of the Registration Act, 1908. Testator and two witnesses provide biometric verification and photos, leading to entry into Book 4 (Miscellaneous Register) or optional sealed deposit under Part IX.",
      milestone: "Will Registered in Book 4 / Safely Deposited",
    },
  ],

  documentsRequired: [
    {
      category: "Testator Identification & Mental Capacity",
      items: [
        {
          name: "Testator Government Photo ID & PAN",
          detail: "Aadhaar card, Passport, Voter ID, and PAN verifying legal identity, majority, and permanent residential address.",
        },
        {
          name: "Medical Fitness Certificate by Registered Physician",
          detail: "Doctor's certificate issued on or immediately prior to execution, certifying sound testamentary mind, memory, and cognitive capacity.",
        },
      ],
    },
    {
      category: "Schedule of Devised Properties & Assets",
      items: [
        {
          name: "Immovable Property Title Documents & Khata Receipts",
          detail: "Registered sale deeds, conveyance deeds, RTC/Patta extracts, and municipal tax paid receipts for self-acquired properties.",
        },
        {
          name: "Movable Financial Assets & Investment Folios",
          detail: "Bank account passbooks, fixed deposit receipts, demat account statements, mutual fund statements, and vehicle registration certificates.",
        },
        {
          name: "Business & Company Shareholding Proofs",
          detail: "Share certificates, partnership deeds, or corporate filings evidencing proprietary commercial ownership.",
        },
      ],
    },
    {
      category: "Beneficiaries & Executors Identification",
      items: [
        {
          name: "Beneficiaries Identity & Residential Particulars",
          detail: "Full legal names, parentage, residential addresses, and relationship documentation for all primary and contingent legatees.",
        },
        {
          name: "Nominated Executor & Guardian KYC",
          detail: "KYC documents and written consent of nominated personal representatives to administer the estate and guardians for minor heirs.",
        },
      ],
    },
    {
      category: "Witnesses & Sub-Registrar Registration Documents",
      items: [
        {
          name: "Two Attesting Witnesses KYC & Photographs",
          detail: "Aadhaar cards, photo IDs, and passport photos of two independent adult witnesses who are not beneficiaries under the will.",
        },
        {
          name: "Sub-Registrar Registration Fee Challan & Appointment",
          detail: "Official challan payment receipt for state registration fees and appointment confirmation slip for physical Sub-Registrar presentation.",
        },
      ],
    },
  ],

  faqs: [
    {
      question: "Is registration of a will mandatory under the Registration Act, 1908?",
      answer: "No. Under Section 18(e) of the Registration Act, 1908, the registration of a will is optional. An unregistered will executed on plain paper is completely valid in law if signed by the testator with disposing mind and attested by at least two independent witnesses under Section 63 of the Indian Succession Act, 1925. However, registration before the Sub-Registrar creates a permanent public record in Book 4, rendering it much harder to challenge on grounds of forgery, coercion, or undue influence.",
    },
    {
      question: "What is the procedure for registering a will before the Sub-Registrar?",
      answer: "The testator and the two attesting witnesses must personally appear before the Sub-Registrar within whose sub-district the testator resides or property is situated. The Sub-Registrar verifies the identities, captures biometric thumbprints and photographs, confirms the voluntary nature of execution, and enters the document into Book 4 ('Miscellaneous Register'). Alternatively, a sealed cover containing the will can be deposited for safe custody under Section 42 of the Registration Act.",
    },
    {
      question: "Can a registered will be revoked or altered by an unregistered will or codicil?",
      answer: "Yes. In Indian law, testamentary freedom allows a testator to alter or revoke any prior will at any time before death. A subsequent unregistered will or codicil, if validly executed and attested under Section 63 of the Indian Succession Act, legally supersedes and revokes an earlier registered will. However, registering the subsequent will or codicil is strongly advisable to avoid probate disputes and evidentiary suspicion regarding revocation.",
    },
    {
      question: "Can a Sub-Registrar visit the testator's residence for will registration?",
      answer: "Yes. Under Section 31 of the Registration Act, 1908, in special causes such as severe illness, infirmity, or old age, the Sub-Registrar can attend at the testator's private residence or hospital to accept the will for registration, subject to payment of the prescribed commissioner / home visit fee and submission of a medical fitness certificate.",
    },
    {
      question: "What is the distinction between Probate and Letters of Administration?",
      answer: "A 'Probate' is a court decree certifying the genuineness of a will, granted exclusively to the executor named in the will by a competent court under Section 222 of the Indian Succession Act, 1925. 'Letters of Administration' (with the will annexed) are granted under Section 232 when the testator fails to appoint an executor, or the appointed executor refuses, dies, or is incapable of acting, empowering a beneficiary or legal heir to administer the deceased's estate.",
    },
  ],

  disclaimer:
    "Educational overview only; not a substitute for advice on a particular estate or jurisdiction.",

  researchSources: [
    "Indian Succession Act, 1925 (India Code)",
    "Registration Act, 1908 (India Code)",
    "Bharatiya Sakshya Adhiniyam, 2023 (India Code)",
    "Personal Law Rules on Succession (Ministry of Law and Justice)",
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
    title: "Speak with an Advocate Regarding Will Drafting & Registration",
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

