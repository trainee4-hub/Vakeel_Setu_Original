// Researched content for "Birth Certificate" — VakeelSetu Legal Services
// Source: advocate-provided PDF + statutory research (Registration of Births and Deaths Act, 1969,
//         as amended by the Registration of Births and Deaths (Amendment) Act, 2023).
// NOTE: Legal content — ADVOCATE REVIEW REQUIRED before publishing. Items marked [VERIFY] are
//       State/UT-specific and must be confirmed locally. Sections that do not apply to this
//       service (e.g. legalRemedies, rightsAndAdvocate) are intentionally omitted so the page
//       hides those components.

export const birthCertificateData = {
  serviceSlug: "birth-certificate",
  categorySlug: "government-registration-certificates",
  categoryTitle: "Government Registration & Certificates",
  title: "Birth Certificate",
  h1: "Birth Certificate Registration, Correction & Advocate Assistance",
  seoTitle: "Birth Certificate Registration under RBD Act, 1969 | VakeelSetu",
  metaTitle: "Birth Certificate Registration & Correction under RBD Act, 1969",
  metaDescription:
    "Register, obtain or correct a Birth Certificate under the Registration of Births and Deaths Act, 1969 (as amended 2023). Guidance on required documents, delayed registration (Section 13) and name correction (Section 15) with Bar Council-enrolled advocates.",
  shortIntro:
    "A Birth Certificate is a permanent statutory record issued by the Registrar of Births and Deaths under the Registration of Births and Deaths Act, 1969 (amended 2023). It serves as conclusive government proof of age, parentage, and place of birth, mandatory for school admissions, Aadhaar and passport enrollment, driving licenses, and government welfare benefits across India.",

  trustChips: [
    { label: "Bar Council-Enrolled Advocates", icon: "shield" },
    { label: "Statutory Civil Record", icon: "clock" },
    { label: "Confidential", icon: "lock" },
    { label: "Phone & Video Consultation", icon: "phone" },
  ],

  toc: [
    { id: "intro", title: "1. Introduction & Overview" },
    { id: "applicable-laws", title: "2. Applicable Laws & Sections" },
    { id: "documents-required", title: "3. Documents Required" },
    { id: "legal-procedure", title: "4. Step-by-Step Procedure" },
    { id: "why-vakeelsetu", title: "5. Why Choose VakeelSetu" },
    { id: "faqs", title: "6. Frequently Asked Questions" },
  ],

  // 1. Introduction & Overview
  introduction: {
    summary:
      "A Birth Certificate is an official record issued by the competent Registrar of Births and Deaths or other authorised registration authority, recording the birth of a child. It serves as legal evidence of the date and place of birth, the child's name (where entered), and other particulars recorded in the birth register. It is commonly required for school admission, obtaining identity and travel documents, accessing government services, and other administrative or legal purposes. Birth registration is a statutory process in India and is distinct from a hospital discharge summary or medical record of delivery.\n\nRegistration of births in India is governed by the Registration of Births and Deaths Act, 1969, as amended by the Registration of Births and Deaths (Amendment) Act, 2023, supplemented by the applicable State or Union Territory Rules. The Act provides for compulsory registration of births, requires information about a birth to be given to the prescribed Registrar within the statutory time, and provides for issuance of a certificate after registration. The 2023 amendment also provides for a national-level database and enables the birth certificate to be used as proof of date and place of birth for specified purposes, subject to the statutory provisions.",
    highlights: [
      "Birth registration is compulsory under the Registration of Births and Deaths Act, 1969.",
      "Information about a birth must be given to the prescribed Registrar within the statutory time (commonly 21 days; verify State/UT Rules).",
      "A certificate is issued after registration under Section 12; certified extracts are available under Section 17.",
      "Births not reported in time may still be registered through delayed registration under Section 13, subject to State/UT Rules.",
    ],
  },

  // 2. Applicable Laws & Sections
  applicableLaws: [
    {
      act: "Registration of Births and Deaths Act, 1969",
      section: "Section 8",
      title: "Persons Required to Register Births",
      summary:
        "Identifies who must report a birth to the Registrar, including the officer in charge of a hospital or institution for institutional births and the head of the household or specified person for births occurring elsewhere.",
      tag: "Reporting Duty",
    },
    {
      act: "Registration of Births and Deaths Act, 1969",
      section: "Section 12",
      title: "Issuance of Certificate After Registration",
      summary:
        "Provides for giving a certificate or extract to the informant after a birth has been registered.",
      tag: "Certificate Issuance",
    },
    {
      act: "Registration of Births and Deaths Act, 1969",
      section: "Section 13",
      title: "Delayed Registration of Births",
      summary:
        "Allows registration of a birth not reported within the prescribed period, subject to the documents, fees and approvals required under the applicable Rules.",
      tag: "Delayed Registration",
    },
    {
      act: "Registration of Births and Deaths Act, 1969",
      section: "Section 15",
      title: "Correction or Cancellation of Entry",
      summary:
        "Permits correction of an erroneous entry, or inclusion of a child's name, subject to documentary proof and the Registrar's prescribed procedure.",
      tag: "Correction of Records",
    },
    {
      act: "Registration of Births and Deaths Act, 1969",
      section: "Section 17",
      title: "Search & Certified Extracts",
      summary:
        "Deals with the search of birth and death registers and the issue of certified extracts.",
      tag: "Record Access",
    },
    {
      act: "Registration of Births and Deaths (Amendment) Act, 2023",
      section: "Amendment Act, 2023",
      title: "National Database & Use as Date/Place-of-Birth Proof",
      summary:
        "Provides for a national-level database and enables the birth certificate to be used as proof of date and place of birth for specified purposes, subject to statutory provisions and commencement.",
      tag: "2023 Amendment",
    },
  ],

  // 3. Documents Required (grouped checklist)
  documentsRequired: [
    {
      category: "Proof of Birth",
      items: [
        {
          name: "Hospital / Institution Birth Report or Discharge Summary",
          detail:
            "Document from the hospital or institution where the birth occurred; for institutional births the institution generally reports the birth to the Registrar.",
        },
        {
          name: "Proof of Place of Birth",
          detail:
            "Record establishing where the birth took place, as accepted by the Registrar — particularly for births outside an institution.",
        },
      ],
    },
    {
      category: "Parents' Identity & Address Proof",
      items: [
        {
          name: "Parents' Identity Documents",
          detail:
            "Government-issued photo ID of the parents (e.g. Aadhaar, PAN, Voter ID or Passport), as required by the Registrar.",
        },
        {
          name: "Parents' Address Proof",
          detail:
            "Proof of residence of the parents as accepted under the applicable State/UT Rules.",
        },
        {
          name: "Parents' Marriage Certificate",
          detail:
            "Required in some States/UTs for entering parentage details. [VERIFY with local Rules]",
        },
      ],
    },
    {
      category: "Additional (Delayed Registration / Correction)",
      items: [
        {
          name: "Prescribed Application / Affidavit",
          detail:
            "The prescribed application and, for delayed registration, an affidavit or declaration as required by the Registrar or competent authority.",
        },
        {
          name: "Supporting Evidence of Date & Place of Birth",
          detail:
            "Hospital records, school records or other evidence accepted by the Registrar for delayed registration under Section 13.",
        },
        {
          name: "Documents for Name Inclusion / Correction",
          detail:
            "Proof supporting inclusion of the child's name or correction of an entry under Section 15. [VERIFY with local Rules]",
        },
      ],
    },
  ],

  // 4. Step-by-Step Procedure
  legalProcedure: [
    {
      step: 1,
      tag: "REPORT BIRTH",
      title: "Report the Birth to the Registrar",
      description:
        "The birth is reported to the Registrar having jurisdiction over the place of birth; for institutional births the hospital or institution generally reports it.",
      milestone: "Birth reported",
    },
    {
      step: 2,
      tag: "FORM & DOCS",
      title: "Submit Form & Supporting Documents",
      description:
        "The prescribed birth-reporting form is submitted with the required supporting documents under the applicable State/UT Rules.",
      milestone: "Application submitted",
    },
    {
      step: 3,
      tag: "VERIFICATION",
      title: "Verification by the Registrar",
      description:
        "The Registrar verifies the particulars and documents in accordance with the Act and the applicable Rules.",
      milestone: "Particulars verified",
    },
    {
      step: 4,
      tag: "REGISTRATION",
      title: "Registration & Issuance of Certificate",
      description:
        "After registration, a birth certificate is issued under Section 12; certified extracts may be obtained under Section 17.",
      milestone: "Certificate issued",
    },
    {
      step: 5,
      tag: "DELAYED / CORRECTION",
      title: "Delayed Registration or Correction (If Needed)",
      description:
        "If the birth was not reported in time, delayed registration is pursued under Section 13; errors or a missing name are addressed under Section 15, subject to the Registrar's procedure.",
      milestone: "Delay or correction resolved",
    },
  ],

  // Common issues (applies to this service)
  commonChallenges: [
    {
      title: "Birth Not Reported Within the Prescribed Period",
      description:
        "Where a birth is not reported in time, ordinary registration may not be available and delayed registration is required.",
      remedy:
        "Delayed registration under Section 13, with the documents, fees and approvals required by the applicable State/UT Rules.",
    },
    {
      title: "Child's Name Not Entered",
      description:
        "A birth may be registered without the child's name being entered at the time of registration.",
      remedy:
        "Application to include the name under Section 15 and the applicable Rules.",
    },
    {
      title: "Error in the Birth Register Entry",
      description:
        "An entry may contain an error in the name, date or place details.",
      remedy:
        "Correction under Section 15, subject to documentary proof and the Registrar's scrutiny.",
    },
    {
      title: "Birth Outside a Hospital / Institution",
      description:
        "For births occurring outside institutions, reporting responsibility and proof of place of birth can be unclear.",
      remedy:
        "The head of the household or specified person reports the birth; the Registrar may require supporting evidence of the place of birth.",
    },
  ],

  // NOTE: legalRemedies and rightsAndAdvocate are intentionally omitted for this service
  //       (not a litigation/dispute matter) so those components hide.

  // 7. Why Choose VakeelSetu
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

  // 8. FAQs
  faqs: [
    {
      question: "Within how many days must a birth be registered in India?",
      answer:
        "Information about a birth is required to be given to the prescribed Registrar within the statutory time. In practice this is commonly 21 days from the date of birth, but the exact period and procedure are governed by the applicable State or Union Territory Rules, which should be verified locally.",
    },
    {
      question: "What if the birth was not registered within the prescribed period?",
      answer:
        "A birth that is not reported in time may still be registered through the delayed-registration procedure under Section 13 of the Act. The documents, fees and approvals required depend on the length of the delay and the applicable State/UT Rules; applicants should approach the Registrar having jurisdiction over the place of birth.",
    },
    {
      question: "How can a child's name be added or an error corrected in the birth certificate?",
      answer:
        "If a child's name was not entered, or if an entry contains an error, an application may be made to the concerned Registrar under Section 15 and the applicable Rules. The Registrar may require documentary proof and must follow the prescribed procedure; correction is not automatic.",
    },
    {
      question: "Is a birth certificate proof of citizenship?",
      answer:
        "No. A birth certificate records the particulars entered in the register and is widely accepted as evidence of date and place of birth, but it does not by itself determine citizenship, parentage disputes or any legal status beyond the particulars it records; such matters are governed by their respective laws.",
    },
    {
      question: "Who issues the birth certificate?",
      answer:
        "Births are registered by the Registrar having jurisdiction over the place where the birth occurred — which may be a municipal body, municipal corporation, panchayat or other authority notified by the State/UT. The certificate is issued by that authority after registration.",
    },
  ],

  // 9. Consultation CTA
  consultationCta: {
    headline: "Need Help with Birth Certificate Registration or Correction?",
    subheadline:
      "Bar Council-enrolled advocates can guide you on the prescribed forms, supporting documents and the delayed-registration or correction procedure under the Registration of Births and Deaths Act, 1969.",
    primaryButtonText: "Consult an Advocate",
    secondaryButtonText: "Explore Verified Lawyers",
    points: [
      "Guidance on required documents",
      "Help with delayed registration (Section 13)",
      "Assistance with name inclusion or correction (Section 15)",
      "Phone & video consultation",
    ],
  },

  // 10. Research sources & references
  researchSources: [
    {
      title: "Registration of Births and Deaths Act, 1969 (Act No. 18 of 1969)",
      source: "India Code, Ministry of Law and Justice, Government of India",
      link: "https://www.indiacode.nic.in",
      citation: "Sections 8, 12, 13, 15, 17",
    },
    {
      title: "Registration of Births and Deaths (Amendment) Act, 2023 (Act No. 20 of 2023)",
      source: "The Gazette of India, Ministry of Law and Justice",
      link: "https://www.indiacode.nic.in",
      citation: "National database; use as date-and-place-of-birth proof",
    },
    {
      title: "Office of the Registrar General & Census Commissioner, India — Civil Registration System",
      source: "Government of India",
      link: "https://crsorgi.gov.in",
      citation: "Birth registration procedure and forms [VERIFY current guidance]",
    },
    {
      title: "Applicable State / Union Territory Registration of Births and Deaths Rules",
      source: "Respective State / UT Government",
      citation: "State-specific forms, fees, timelines and delayed-registration procedure [VERIFY locally]",
    },
  ],

  disclaimer:
    "Disclaimer: The information provided above is for general educational and informational purposes only and does not constitute legal advice or create an advocate-client relationship. Birth registration procedures, forms, fees and timelines are governed by the Registration of Births and Deaths Act, 1969 (as amended) and vary by State or Union Territory. You should verify the current requirements with the local Registrar and consult a verified advocate enrolled with the Bar Council of India for your specific matter.",
};