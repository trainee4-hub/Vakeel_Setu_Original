/**
 * VAKEEL SETU - TERMS AND CONDITIONS DATA
 * Extracted from official legal documentation:
 * "Terms and conditions of Vakeel Setu legal tech platform.pdf"
 * Operated by: Techvunex Innovations
 * Registered Office: D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309
 */

export const termsIntroduction = {
  title: "Terms and Conditions",
  platformName: "Vakeel Setu",
  operator: "Techvunex Innovations",
  officeAddress: "D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309",
  officialEmail: "info@vakeelsetu.in",
  officialPhone: "+91 9718494494",
  officialWebsite: "vakeelsetu.in",
  effectiveDate: "Updated 2026",
  governingCountry: "India",
  leadParagraph: "The following terms and conditions constitute a legally binding agreement between you and Vakeel Setu operated by Techvunex Innovations having its registered office at D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309.",
  secondaryParagraph: "By using the website/application, and/or by registering with us, you acknowledge that you have read, understand, and agreed to be bound by these terms and conditions including our privacy policy, and that you agree to comply with applicable laws governed by the country (hereinafter referred to as \"India\").",
  disclaimerParagraph: "Please note that we offer the website 'AS IS' and without warranties. If you are registering an account or using the website on behalf of an individual or entity other than yourself, you represent that you are authorised by such individual or entity to accept these terms and conditions on such individual or entity's behalf."
};

export const termsCategories = [
  { id: "all", label: "All Clauses", count: 38 },
  { id: "scope", label: "Scope & Usage", count: 4, desc: "Definitions, user eligibility & platform usage" },
  { id: "accounts", label: "Accounts & Verification", count: 2, desc: "Registration, security & lawyer verification" },
  { id: "payments", label: "Fees & Refunds", count: 2, desc: "Subscription pricing, 24hr cancellation & refund policy" },
  { id: "ip-privacy", label: "IP & Privacy", count: 3, desc: "Intellectual property protection & data privacy" },
  { id: "disclaimers", label: "Conduct & Disclaimers", count: 4, desc: "Prohibited activities, AI disclaimers & BCI rules" },
  { id: "liability", label: "Responsibilities & Liability", count: 9, desc: "Client duties, warranties & limitation of liability" },
  { id: "disputes", label: "Disputes & Arbitration", count: 3, desc: "Suspension, Noida arbitration & governing law" },
  { id: "general", label: "Legal & Contact", count: 11, desc: "Grievances, force majeure, contacts & user consent" }
];

export const keyHighlights = [
  {
    icon: "shield",
    title: "Technology Platform",
    description: "Vakeel Setu connects users with independent licensed lawyers and provides assistive legal tools; it is not a law firm and does not solicit clients under the Advocates Act, 1961.",
    tag: "BCI Compliant"
  },
  {
    icon: "ai",
    title: "AI Assistive Drafting",
    description: "AI-generated summaries, document drafts, and insights are assistive aids that require independent review by users and legal professionals.",
    tag: "Assistive Only"
  },
  {
    icon: "clock",
    title: "24-Hour Cancellation",
    description: "Paid consultations can be cancelled up to 24 hours prior to the scheduled appointment with a transparent 10% payment processing deduction.",
    tag: "15-Day Refunds"
  },
  {
    icon: "lock",
    title: "Data & TRAI Compliance",
    description: "Strict privacy protocols with minimum data collection; explicit opt-in consent for essential communication compliant with TRAI regulations.",
    tag: "Data Protected"
  },
  {
    icon: "gavel",
    title: "Arbitration in Noida, UP",
    description: "Disputes are subject to a 30-day amicable negotiation, followed by sole-arbitrator arbitration seated in Noida, Uttar Pradesh, under the 1996 Act.",
    tag: "Seat: Noida, UP"
  },
  {
    icon: "userCheck",
    title: "Independent Advocates",
    description: "Advocates on the platform exercise independent professional judgment and are solely responsible for their legal representation.",
    tag: "Verified Advocates"
  }
];

export const termsSections = [
  {
    "id": "section-1",
    "number": 1,
    "title": "DEFINITIONS",
    "category": "scope",
    "plainSummary": "Defines the essential legal terms used across the platform, including Platform, User, Client, Lawyer, AI Services, Legal Document, and Case Data.",
    "elements": [
      {
        "type": "paragraph",
        "text": "For the purposes of these terms :"
      },
      {
        "type": "paragraph",
        "text": "“Platform” means the website, mobile application, software, tools, interfaces, dashboards, APIs and related services operated by the company."
      },
      {
        "type": "paragraph",
        "text": "“USER” means any individual or entity accessing or using the platform, including clients and lawyers."
      },
      {
        "type": "paragraph",
        "text": "“CLIENT” means a user seeking legal information, legal services, document              drafting, consultation or other services, through the platform."
      },
      {
        "type": "paragraph",
        "text": "“LAWYER” means an advocate or other professional who is legally permitted to provide legal services in the applicable jurisdiction and who registers or provides services through the platform."
      },
      {
        "type": "paragraph",
        "text": "“AI SERVICES” means artificial-intelligence-enabled features used for generating, summarising, analysing, reviewing, organising, or assisting with legal content and documents."
      },
      {
        "type": "paragraph",
        "text": "“LEGAL DOCUMENT” means agreements, notices, applications, petitions, contracts, legal letters, forms, templates, and other documents generated, uploaded, edited or stored through the platform."
      },
      {
        "type": "paragraph",
        "text": "“CASE DATA” means information, documents, communications, dates, tasks, notes, case details and other information uploaded or entered by a user in relation to a legal matter."
      }
    ],
    "rawText": "For the purposes of these terms :\n\n“Platform” means the website, mobile application, software, tools, interfaces, dashboards, APIs and related services operated by the company.\n\n“USER” means any individual or entity accessing or using the platform, including clients and lawyers.\n\n“CLIENT” means a user seeking legal information, legal services, document              drafting, consultation or other services, through the platform.\n\n“LAWYER” means an advocate or other professional who is legally permitted to provide legal services in the applicable jurisdiction and who registers or provides services through the platform.\n\n“AI SERVICES” means artificial-intelligence-enabled features used for generating, summarising, analysing, reviewing, organising, or assisting with legal content and documents.\n\n“LEGAL DOCUMENT” means agreements, notices, applications, petitions, contracts, legal letters, forms, templates, and other documents generated, uploaded, edited or stored through the platform.\n\n“CASE DATA” means information, documents, communications, dates, tasks, notes, case details and other information uploaded or entered by a user in relation to a legal matter."
  },
  {
    "id": "section-2",
    "number": 2,
    "title": "SCOPE OF SERVICES",
    "category": "scope",
    "plainSummary": "Clarifies that Vakeel Setu and associated professionals accept no liability for independent medical, legal, or financial outcomes and do not guarantee web/phone consultations as universally appropriate.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Vakeel Setu (the owners and the employee staff of the platform) and third-party professionals who offer services through the platform accept no responsibility for any medical, legal, or financial, events or outcomes related to services achieved through the use of the platform."
      },
      {
        "type": "paragraph",
        "text": "Vakeel Setu does not guarantee that a web-based consultation, over-phone / video consultation is the appropriate course of treatment / solution for your particular problem."
      }
    ],
    "rawText": "Vakeel Setu (the owners and the employee staff of the platform) and third-party professionals who offer services through the platform accept no responsibility for any medical, legal, or financial, events or outcomes related to services achieved through the use of the platform.\n\nVakeel Setu does not guarantee that a web-based consultation, over-phone / video consultation is the appropriate course of treatment / solution for your particular problem."
  },
  {
    "id": "section-3",
    "number": 3,
    "title": "ACCEPTANCE OF TERMS",
    "category": "scope",
    "plainSummary": "Creating an account, registering, or using features legally binds you to these terms and the Privacy Policy under Indian law.",
    "elements": [
      {
        "type": "paragraph",
        "text": "By creating an account or using any feature of the platform, you agree to these terms, the privacy policy and any additional terms applicable to specific services."
      },
      {
        "type": "paragraph",
        "text": "If you do not agree with these terms, you must not access or use the platform."
      }
    ],
    "rawText": "By creating an account or using any feature of the platform, you agree to these terms, the privacy policy and any additional terms applicable to specific services.\n\nIf you do not agree with these terms, you must not access or use the platform."
  },
  {
    "id": "section-4",
    "number": 4,
    "title": "PLATFORM USAGE TERMS",
    "category": "scope",
    "plainSummary": "Requires users to be at least 18 years old, safeguard passwords, act in good faith, and strictly prohibits data scraping, bypassing relationships, or malicious system attacks (with liquidated damages of ₹2,00,000 and ₹1,50,000/day).",
    "elements": [
      {
        "type": "paragraph",
        "text": "You represent and warrant that you are at least eighteen years of age and that you possess the legal right and the ability to enter into agreements pertaining to terms of use, to register on the Vakeel Setu services under your own name and to use the Vakeel Setu services in accordance with the terms of use and abide by the obligations hereunder."
      },
      {
        "type": "bullet",
        "text": "You are solely responsible for maintaining the confidentiality of your password and for all activities carried out under your Vakeel Setu account. You agree to prohibit anyone else from using your password or other security concerns."
      },
      {
        "type": "bullet",
        "text": "Your affirmative act of using this platform and/or registering for the platform or the services constitutes your electronic signature to these terms of use and your consent to enter into agreements with us electronically."
      },
      {
        "type": "bullet",
        "text": "The platform may only be used in good faith and may not be used to transmit or otherwise make available any information that is false or that you do not have a right to make available under any law. You will comply with all applicable laws"
      },
      {
        "type": "paragraph",
        "text": "and regulations and you will not use the platform for any unlawful, fraudulent or prohibited purpose."
      },
      {
        "type": "bullet",
        "text": "You may not misidentify yourself or impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity. The information provided by you must be accurate and complete, and you agree to promptly update the information to keep it true, accurate, current and complete. If you provide any information that is untrue, inaccurate, not current and incomplete, and/or we have reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, we have the right to suspend or terminate your participation in the platform and/or refuse any and all current or future use of the platform or its services (or any portion thereof)."
      },
      {
        "type": "bullet",
        "text": "You are not permitted to collect or store personal data about other users.you are not permitted to access the platform for the purpose of data mining or extracting content from the site beyond your personal end use."
      },
      {
        "type": "bullet",
        "text": "You are permitted to use the platform to find a lawyer to perform services for you related to your problem and to obtain general information about similar cases. You are not permitted to use the platform for any other reason other than a permissible use. Impermissible uses shall include, but are not limited to, using the platform to order to solicit, hire, engage, or otherwise work with the employees or affiliates of Vakeel Setu or the lawyers, to interfere or attempt to interfere in the relationship between Vakeel Setu and such employees, affiliates, lawyers, or for any other purpose other than described herein (each, an “impermissible use”). If you do engage in such conduct, the resulting damage in the amount of Rs.2,00,000 for each impermissible use, and further unquantified damages which will occur due to your act will be accessed and you shall be liable to pay the same. You further agree that this liquidated damages provision reasonably approximates actual costs, losses, and expenses which would be incurred by Vakeel Setu due to any such impermissible use. You also agree that nothing in this section is intended to limit Vakeel Setu's right to obtain injunctive and other relief as may be appropriate."
      },
      {
        "type": "bullet",
        "text": "You understand and agree that all information, statistical data, text, software, music, sound, photographs, graphics, video, messages, or other materials(content), whether publicly posted or privately transmitted by you and other users of our service, are the sole responsibility of the person from which"
      },
      {
        "type": "paragraph",
        "text": "such content originated. This means that you, and not us, are entirely responsible for all content that you upload, post, email, or otherwise transmit via the platform."
      },
      {
        "type": "bullet",
        "text": "You are prohibited from using any type of computer ‘worm’, ‘virus’ or any other device that is intended or is likely to disrupt, overload, or otherwise impair the working of any part of the platform. If you do engage in such conduct, the resulting damage will be hard to quantify as a fixed amount and thus you hereby agree to pay us liquidated damages in the amount of Rs.1,50,000 for each day that the platform is damaged until the platform is completely repaired and further unquantified damages which will occur due to your act will be accessed and you shall be liable to pay the same."
      }
    ],
    "rawText": "You represent and warrant that you are at least eighteen years of age and that you possess the legal right and the ability to enter into agreements pertaining to terms of use, to register on the Vakeel Setu services under your own name and to use the Vakeel Setu services in accordance with the terms of use and abide by the obligations hereunder.\n\n● You are solely responsible for maintaining the confidentiality of your password and for all activities carried out under your Vakeel Setu account. You agree to prohibit anyone else from using your password or other security concerns.\n\n● Your affirmative act of using this platform and/or registering for the platform or the services constitutes your electronic signature to these terms of use and your consent to enter into agreements with us electronically.\n\n● The platform may only be used in good faith and may not be used to transmit or otherwise make available any information that is false or that you do not have a right to make available under any law. You will comply with all applicable laws\n\nand regulations and you will not use the platform for any unlawful, fraudulent or prohibited purpose.\n\n● You may not misidentify yourself or impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity. The information provided by you must be accurate and complete, and you agree to promptly update the information to keep it true, accurate, current and complete. If you provide any information that is untrue, inaccurate, not current and incomplete, and/or we have reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, we have the right to suspend or terminate your participation in the platform and/or refuse any and all current or future use of the platform or its services (or any portion thereof).\n\n● You are not permitted to collect or store personal data about other users.you are not permitted to access the platform for the purpose of data mining or extracting content from the site beyond your personal end use.\n\n● You are permitted to use the platform to find a lawyer to perform services for you related to your problem and to obtain general information about similar cases. You are not permitted to use the platform for any other reason other than a permissible use. Impermissible uses shall include, but are not limited to, using the platform to order to solicit, hire, engage, or otherwise work with the employees or affiliates of Vakeel Setu or the lawyers, to interfere or attempt to interfere in the relationship between Vakeel Setu and such employees, affiliates, lawyers, or for any other purpose other than described herein (each, an “impermissible use”). If you do engage in such conduct, the resulting damage in the amount of Rs.2,00,000 for each impermissible use, and further unquantified damages which will occur due to your act will be accessed and you shall be liable to pay the same. You further agree that this liquidated damages provision reasonably approximates actual costs, losses, and expenses which would be incurred by Vakeel Setu due to any such impermissible use. You also agree that nothing in this section is intended to limit Vakeel Setu's right to obtain injunctive and other relief as may be appropriate.\n\n● You understand and agree that all information, statistical data, text, software, music, sound, photographs, graphics, video, messages, or other materials(content), whether publicly posted or privately transmitted by you and other users of our service, are the sole responsibility of the person from which\n\nsuch content originated. This means that you, and not us, are entirely responsible for all content that you upload, post, email, or otherwise transmit via the platform.\n\n● You are prohibited from using any type of computer ‘worm’, ‘virus’ or any other device that is intended or is likely to disrupt, overload, or otherwise impair the working of any part of the platform. If you do engage in such conduct, the resulting damage will be hard to quantify as a fixed amount and thus you hereby agree to pay us liquidated damages in the amount of Rs.1,50,000 for each day that the platform is damaged until the platform is completely repaired and further unquantified damages which will occur due to your act will be accessed and you shall be liable to pay the same."
  },
  {
    "id": "section-5",
    "number": 5,
    "title": "USER REGISTRATION AND ACCOUNT",
    "category": "accounts",
    "plainSummary": "Users must provide true, updated personal info and safeguard their credentials; compromised accounts may be suspended immediately.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Certain platform features may require registration. You shall provide accurate and updated information while creating your account. You are responsible for maintaining the confidentiality of your login credentials and for all activities undertaken through your account."
      },
      {
        "type": "paragraph",
        "text": "You shall immediately notify the company if you become aware of unauthorized access to your account. The company may suspend or restrict an account where it reasonably believes that the account has been compromised or is being used in violation of these terms."
      }
    ],
    "rawText": "Certain platform features may require registration. You shall provide accurate and updated information while creating your account. You are responsible for maintaining the confidentiality of your login credentials and for all activities undertaken through your account.\n\nYou shall immediately notify the company if you become aware of unauthorized access to your account. The company may suspend or restrict an account where it reasonably believes that the account has been compromised or is being used in violation of these terms."
  },
  {
    "id": "section-6",
    "number": 6,
    "title": "LAWYERS REGISTRATION AND VERIFICATION",
    "category": "accounts",
    "plainSummary": "Lawyers must provide accurate bar enrollment, credentials, and practice areas; platform conducts verification but advises clients that independent professional standards apply.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Lawyers shall be required to provide information including name, professional"
      },
      {
        "type": "paragraph",
        "text": "details, enrollment details, areas of practice, contact information and other information reasonably required for verification."
      },
      {
        "type": "paragraph",
        "text": "The company may conduct reasonable verification procedures but does not guarantee the completeness, accuracy or continuing validity of information supplied by the lawyer."
      },
      {
        "type": "paragraph",
        "text": "Each lawyer is solely responsible for credentials, complying with applicable laws and professional standards, and providing accurate information to clients."
      },
      {
        "type": "paragraph",
        "text": "A lawyer shall not represent themselves as qualified to practice in a jurisdiction where they are not legally entitled to do so."
      },
      {
        "type": "paragraph",
        "text": "The company may suspend or remove a lawyer's profile where it receives credible information concerning misconduct, invalid, credentials, fraudulent information or violation of applicable law or these terms."
      }
    ],
    "rawText": "Lawyers shall be required to provide information including name, professional\n\ndetails, enrollment details, areas of practice, contact information and other information reasonably required for verification.\n\nThe company may conduct reasonable verification procedures but does not guarantee the completeness, accuracy or continuing validity of information supplied by the lawyer.\n\nEach lawyer is solely responsible for credentials, complying with applicable laws and professional standards, and providing accurate information to clients.\n\nA lawyer shall not represent themselves as qualified to practice in a jurisdiction where they are not legally entitled to do so.\n\nThe company may suspend or remove a lawyer's profile where it receives credible information concerning misconduct, invalid, credentials, fraudulent information or violation of applicable law or these terms."
  },
  {
    "id": "section-8",
    "number": 8,
    "title": "SUBSCRIPTION FEES & REFUNDS",
    "category": "payments",
    "plainSummary": "Subscriptions and platform credit fees are transparently displayed; payments once made are generally non-refundable except under explicit policy.",
    "elements": [
      {
        "type": "bullet",
        "text": "Premium features shall require subscription or purchase of credits ."
      },
      {
        "type": "bullet",
        "text": "All pricing is transparently shown within the platform."
      },
      {
        "type": "bullet",
        "text": "Payments once made are non-refundable, except as provided under subscription and refund policy."
      },
      {
        "type": "bullet",
        "text": "The company may revise pricing anytime as per its discretion."
      }
    ],
    "rawText": "● Premium features shall require subscription or purchase of credits .\n\n● All pricing is transparently shown within the platform.\n\n● Payments once made are non-refundable, except as provided under subscription and refund policy.\n\n● The company may revise pricing anytime as per its discretion."
  },
  {
    "id": "section-9",
    "number": 9,
    "title": "PROTECTION OF IP RIGHTS",
    "category": "ip-privacy",
    "plainSummary": "All software, designs, brand marks, and tools belong strictly to Vakeel Setu (Techvunex Innovations); copying, decompiling, or reverse engineering is strictly prohibited.",
    "elements": [
      {
        "type": "paragraph",
        "text": "You agree that the services, which include all software and information, both electronic and printed media, contain trade secrets and other proprietary intellectual property and are the proprietary property of Vakeel Setu. They are protected by trademark laws and other proprietary rights and laws, and they may only be used or accessed as specifically provided for, in this agreement."
      },
      {
        "type": "paragraph",
        "text": "You agree that you will not store, copy, modify, rent, lease, loan, sell, distribute, transfer, transmit, display, reverse-engineer, reverse-assemble, or otherwise attempt to discover any programming code or any source code used in or with the services.you will not otherwise attempt to transfer any right in the services (which includes its software, design, and content), create derivative works based on it or in any manner commercially exploit the services in whole or in part. You agree that violations by you, any other person or entity,of these trade secrets and/or other intellectual property protections or the terms of this agreement will lead to prosecution under the Indian laws and bylaws. The final choice of whether the consumer is in violation of any of these policies is at the sole discretion of Vakeel Setu."
      },
      {
        "type": "paragraph",
        "text": "Only for the duration of being logged into the consumers valid Vakeel Setu account, the consumer is hereby granted a revocable, non-exclusive, non-transferable license to use the services for personal, non-commercial purpose; subject to terms and qualification of agreement of Vakeel Setu."
      },
      {
        "type": "paragraph",
        "text": "With the exception of your case records, Vakeel Setu retains all rights, titles and interests pertaining to Vakeel Setu, the Vakeel Setu services and any content,"
      },
      {
        "type": "paragraph",
        "text": "products, documentation, software or other materials on the Vakeel Setu Platform along with any trade secret, trademark, service mark, or other intellectual property or proprietary right in any of the foregoing."
      },
      {
        "type": "paragraph",
        "text": "Contact us if you believe information on our platform infringes your copyright. If you believe any materials accessible on or from Vakeel Setu infringe your copyright, you may request removal of those materials."
      },
      {
        "type": "paragraph",
        "text": "platform"
      },
      {
        "type": "paragraph",
        "text": "No part of the materials including graphics or logo, available in this may be copied, photocopied, reproduced, translated or reduced to any electronic medium or machine-readable form, in whole or in part, without specific permission."
      }
    ],
    "rawText": "You agree that the services, which include all software and information, both electronic and printed media, contain trade secrets and other proprietary intellectual property and are the proprietary property of Vakeel Setu. They are protected by trademark laws and other proprietary rights and laws, and they may only be used or accessed as specifically provided for, in this agreement.\n\nYou agree that you will not store, copy, modify, rent, lease, loan, sell, distribute, transfer, transmit, display, reverse-engineer, reverse-assemble, or otherwise attempt to discover any programming code or any source code used in or with the services.you will not otherwise attempt to transfer any right in the services (which includes its software, design, and content), create derivative works based on it or in any manner commercially exploit the services in whole or in part. You agree that violations by you, any other person or entity,of these trade secrets and/or other intellectual property protections or the terms of this agreement will lead to prosecution under the Indian laws and bylaws. The final choice of whether the consumer is in violation of any of these policies is at the sole discretion of Vakeel Setu.\n\nOnly for the duration of being logged into the consumers valid Vakeel Setu account, the consumer is hereby granted a revocable, non-exclusive, non-transferable license to use the services for personal, non-commercial purpose; subject to terms and qualification of agreement of Vakeel Setu.\n\nWith the exception of your case records, Vakeel Setu retains all rights, titles and interests pertaining to Vakeel Setu, the Vakeel Setu services and any content,\n\nproducts, documentation, software or other materials on the Vakeel Setu Platform along with any trade secret, trademark, service mark, or other intellectual property or proprietary right in any of the foregoing.\n\nContact us if you believe information on our platform infringes your copyright. If you believe any materials accessible on or from Vakeel Setu infringe your copyright, you may request removal of those materials.\n\nplatform\n\nNo part of the materials including graphics or logo, available in this may be copied, photocopied, reproduced, translated or reduced to any electronic medium or machine-readable form, in whole or in part, without specific permission."
  },
  {
    "id": "section-10",
    "number": 10,
    "title": "FEES, PAYMENT, CANCELLATION, AND REFUNDS POLICY",
    "category": "payments",
    "plainSummary": "Outlines payment workflows, transparent lawyer fee structures, 24-hour advance consultation cancellation window, 10% processing deduction, and 15-day refund turnaround.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Certain services may require payment. Applicable fees shall be displayed or otherwise communicated before completion of the relevant transaction, wherever reasonably practicable. Payment may be processed through third-party payment service providers. The company may charge platform fees, subscription fees or other charges as disclosed for the relevant service."
      },
      {
        "type": "paragraph",
        "text": "Advocate may determine their professional fees subject to applicable law and professional rules.any fees payable to an advocate for professional services shall be subject to the terms applicable to the advocate-client engagement."
      },
      {
        "type": "paragraph",
        "text": "Cancellation Policy In the event of cancellation of any paid consultation for which payment has been successfully made and a confirmation number has been generated, and the consultation has not been concluded due to any avoidable / unavoidable reason(s) we must be notified of the same in writing by an email at info@vakeelsetu."
      },
      {
        "type": "paragraph",
        "text": "Cancellation charges will be effective from the date we receive your email. Cancellation can be requested no later than 24 hours before final delivery time / appointment time. Our customer service team will contact you within 7 business days and in case where the lawyer has not delivered the booked consultation, we will return your money within 15 business days from the day the request for cancellation was received."
      },
      {
        "type": "paragraph",
        "text": "Please note that there will be a nominal deduction (10%) in the amount refunded, payable towards online payment processing. The refund will be processed directly in your bank / credit card account that was used to make the payment."
      },
      {
        "type": "paragraph",
        "text": "Refund policy in the event your request for consultation is accepted but post-payment due to unexpected and extenuating circumstances, your request for consultation is rejected or cancelled; you will be given an option of opting for another request for consultation or will be offered a complete refund, if you so desire. The refund will be credited to your account within 15 working days."
      },
      {
        "type": "paragraph",
        "text": "It is mandatory for the users to maintain unique transaction ID numbers, which would be provided at the time of placing a request. This number would be required to address any problems, if any."
      },
      {
        "type": "paragraph",
        "text": "In the majority of cases, there is no other situation under which Vakeel Setu will provide a refund, except for the condition expressly mentioned above under refund policy. In exceptional circumstances, the Vakeel Setu team will work with you to reach a mutually acceptable solution."
      },
      {
        "type": "paragraph",
        "text": "No refund in any case whatsoever can be claimed from Vakeel Setu for the amount paid to the lawyer directly by the user."
      }
    ],
    "rawText": "Certain services may require payment. Applicable fees shall be displayed or otherwise communicated before completion of the relevant transaction, wherever reasonably practicable. Payment may be processed through third-party payment service providers. The company may charge platform fees, subscription fees or other charges as disclosed for the relevant service.\n\nAdvocate may determine their professional fees subject to applicable law and professional rules.any fees payable to an advocate for professional services shall be subject to the terms applicable to the advocate-client engagement.\n\nCancellation Policy In the event of cancellation of any paid consultation for which payment has been successfully made and a confirmation number has been generated, and the consultation has not been concluded due to any avoidable / unavoidable reason(s) we must be notified of the same in writing by an email at info@vakeelsetu.\n\nCancellation charges will be effective from the date we receive your email. Cancellation can be requested no later than 24 hours before final delivery time / appointment time. Our customer service team will contact you within 7 business days and in case where the lawyer has not delivered the booked consultation, we will return your money within 15 business days from the day the request for cancellation was received.\n\nPlease note that there will be a nominal deduction (10%) in the amount refunded, payable towards online payment processing. The refund will be processed directly in your bank / credit card account that was used to make the payment.\n\nRefund policy in the event your request for consultation is accepted but post-payment due to unexpected and extenuating circumstances, your request for consultation is rejected or cancelled; you will be given an option of opting for another request for consultation or will be offered a complete refund, if you so desire. The refund will be credited to your account within 15 working days.\n\nIt is mandatory for the users to maintain unique transaction ID numbers, which would be provided at the time of placing a request. This number would be required to address any problems, if any.\n\nIn the majority of cases, there is no other situation under which Vakeel Setu will provide a refund, except for the condition expressly mentioned above under refund policy. In exceptional circumstances, the Vakeel Setu team will work with you to reach a mutually acceptable solution.\n\nNo refund in any case whatsoever can be claimed from Vakeel Setu for the amount paid to the lawyer directly by the user."
  },
  {
    "id": "section-11",
    "number": 11,
    "title": "THIRD-PARTY LINKS, RECOMMENDATIONS AND INFORMATION",
    "category": "ip-privacy",
    "plainSummary": "Third-party links and external tools are accessed at your own risk; Vakeel Setu does not endorse or assume liability for third-party services.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Our platform may contain links, recommendations and information to third-party materials that are not owned or controlled by Vakeel Setu. Vakeel Setu does not endorse or assume any responsibility for any such third party sites, information, materials, products or services."
      },
      {
        "type": "paragraph",
        "text": "If you access a third-party website or services, purchase a product or service, and/or engage a third-party from the services, you do so at your own risk, and you understand that this agreement does not apply to your use of such third-party sites, services or products. You expressly relieve Vakeel Setu from any and all liability arising from your use of any third-party website, service, product or content."
      }
    ],
    "rawText": "Our platform may contain links, recommendations and information to third-party materials that are not owned or controlled by Vakeel Setu. Vakeel Setu does not endorse or assume any responsibility for any such third party sites, information, materials, products or services.\n\nIf you access a third-party website or services, purchase a product or service, and/or engage a third-party from the services, you do so at your own risk, and you understand that this agreement does not apply to your use of such third-party sites, services or products. You expressly relieve Vakeel Setu from any and all liability arising from your use of any third-party website, service, product or content."
  },
  {
    "id": "section-12",
    "number": 12,
    "title": "PRIVACY AND DATA PROTECTION",
    "category": "ip-privacy",
    "plainSummary": "Prioritizes user privacy by collecting minimal data necessary for consultations, strictly safeguarding communications except where required by law or service delivery.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Vakeel Setu does its best to protect your privacy with respect to information not otherwise disclosed by you in any questions submitted to Vakeel Setu."
      },
      {
        "type": "paragraph",
        "text": "In connection with the submission of free questions and paid consultations, we only require, and we encourage you to only provide, the minimum amount of personal identifying information necessary to process a question / consultation. All of your personal information provided to Vakeel Setu including email addresses, is concealed from all other users of Vakeel Setu and is never published as part of the Vakeel Setu public database. Only the Vakeel Setu administrators have access, for purposes of platform administration only, to this information. Vakeel Setu will not disclose this information to third parties without your permission, except in the following circumstances:"
      },
      {
        "type": "bullet",
        "text": "To protect ourselves from liability, or"
      },
      {
        "type": "bullet",
        "text": "To respond to the legal process or to otherwise comply with the law."
      },
      {
        "type": "paragraph",
        "text": "With respect to certain information supplied by you, as explained further below, there will be a need for disclosure to lawyer / professionals when you have booked a paid consultation."
      },
      {
        "type": "paragraph",
        "text": "Whether other information submitted to Vakeel Setu by you, such as the contents of the question itself, will be publicly disclosed will vary between free questions and paid consultations."
      }
    ],
    "rawText": "Vakeel Setu does its best to protect your privacy with respect to information not otherwise disclosed by you in any questions submitted to Vakeel Setu.\n\nIn connection with the submission of free questions and paid consultations, we only require, and we encourage you to only provide, the minimum amount of personal identifying information necessary to process a question / consultation. All of your personal information provided to Vakeel Setu including email addresses, is concealed from all other users of Vakeel Setu and is never published as part of the Vakeel Setu public database. Only the Vakeel Setu administrators have access, for purposes of platform administration only, to this information. Vakeel Setu will not disclose this information to third parties without your permission, except in the following circumstances:\n\n● To protect ourselves from liability, or\n\n● To respond to the legal process or to otherwise comply with the law.\n\nWith respect to certain information supplied by you, as explained further below, there will be a need for disclosure to lawyer / professionals when you have booked a paid consultation.\n\nWhether other information submitted to Vakeel Setu by you, such as the contents of the question itself, will be publicly disclosed will vary between free questions and paid consultations."
  },
  {
    "id": "section-13",
    "number": 13,
    "title": "PROHIBITED ACTIVITIES",
    "category": "disclaimers",
    "plainSummary": "Strictly bans illegal usage, impersonation, falsifying credentials, uploading malware, unauthorized hacking, or automated scraping.",
    "elements": [
      {
        "type": "paragraph",
        "text": "User shall not :"
      },
      {
        "type": "bullet",
        "text": "Use the platform for unlawful purpose;"
      },
      {
        "type": "bullet",
        "text": "Impersonate another person;"
      },
      {
        "type": "bullet",
        "text": "Provided false professional credentials;"
      },
      {
        "type": "bullet",
        "text": "Upload malicious software;"
      },
      {
        "type": "bullet",
        "text": "Attempt to gain unauthorised access to the platform;"
      },
      {
        "type": "bullet",
        "text": "Interfere with platform security;"
      },
      {
        "type": "bullet",
        "text": "Misuse another user's confidential information;"
      },
      {
        "type": "bullet",
        "text": "Upload unlawful or infringing material;"
      },
      {
        "type": "bullet",
        "text": "Use automated system to scrape or copy the platform without permission;"
      },
      {
        "type": "bullet",
        "text": "Use the platform to facilitate fraud or deception; or"
      },
      {
        "type": "bullet",
        "text": "Otherwise violate applicable laws."
      }
    ],
    "rawText": "User shall not :\n\n● Use the platform for unlawful purpose;\n\n● Impersonate another person;\n\n● Provided false professional credentials;\n\n● Upload malicious software;\n\n● Attempt to gain unauthorised access to the platform;\n\n● Interfere with platform security;\n\n● Misuse another user's confidential information;\n\n● Upload unlawful or infringing material;\n\n● Use automated system to scrape or copy the platform without permission;\n\n● Use the platform to facilitate fraud or deception; or\n\n● Otherwise violate applicable laws."
  },
  {
    "id": "section-14",
    "number": 14,
    "title": "REVIEWS & RATING DISCLAIMER",
    "category": "disclaimers",
    "plainSummary": "Ratings and reviews reflect subjective client feedback for informational reference only and do not constitute an advertisement or guarantee under BCI regulations.",
    "elements": [
      {
        "type": "paragraph",
        "text": "User- generated content: all ratings, reviews, and feedback displayed on this platform are solely the personal experiences of individuals users (clients). This platform does not verify, endorse, or guarantee the accuracy or reliability of any user-generated."
      },
      {
        "type": "paragraph",
        "text": "Compliance with BCI rules (No advertisement): in accordance with the rules of bar council of India(BCI), advocates are prohibited from advertising or soliciting work. The feedback provided here is plurally informational and must not be construed, interpreted, or relied upon as a form of advertising, solicitation, or inducement by the advocate."
      },
      {
        "type": "paragraph",
        "text": "Information purposes only: the review section is intended strictly to assist users in making informed decisions based on peer experiences. The choice of a legal professional is the sole discretion of the user, and this platform does not recommend or promote any specific advocate."
      },
      {
        "type": "paragraph",
        "text": "No guarantee of outcome: past performance, testimonials, or positive feedback from previous clients do not guarantee, predict, or warrant a similar outcome in any future legal situations."
      }
    ],
    "rawText": "User- generated content: all ratings, reviews, and feedback displayed on this platform are solely the personal experiences of individuals users (clients). This platform does not verify, endorse, or guarantee the accuracy or reliability of any user-generated.\n\nCompliance with BCI rules (No advertisement): in accordance with the rules of bar council of India(BCI), advocates are prohibited from advertising or soliciting work. The feedback provided here is plurally informational and must not be construed, interpreted, or relied upon as a form of advertising, solicitation, or inducement by the advocate.\n\nInformation purposes only: the review section is intended strictly to assist users in making informed decisions based on peer experiences. The choice of a legal professional is the sole discretion of the user, and this platform does not recommend or promote any specific advocate.\n\nNo guarantee of outcome: past performance, testimonials, or positive feedback from previous clients do not guarantee, predict, or warrant a similar outcome in any future legal situations."
  },
  {
    "id": "section-15",
    "number": 15,
    "title": "NO LEGAL ADVICE & PROFESSIONAL CONDUCT DISCLAIMER",
    "category": "disclaimers",
    "plainSummary": "The platform does not provide legal representation or solicit clients under the Advocates Act, 1961; general content and tools are educational and reference only.",
    "elements": [
      {
        "type": "paragraph",
        "text": "The platform does not solicit clients or enable advertising prohibited under the Advocate Act, 1961. Use of the platform does not establish an advocate-client relationship.All information is general, educational, and for reference only."
      }
    ],
    "rawText": "The platform does not solicit clients or enable advertising prohibited under the Advocate Act, 1961. Use of the platform does not establish an advocate-client relationship.All information is general, educational, and for reference only."
  },
  {
    "id": "section-16",
    "number": 16,
    "title": "AI GENERATED OUTPUT DISCLAIMER",
    "category": "disclaimers",
    "plainSummary": "AI-generated drafts, summaries, and analyses are assistive tools; users and professionals must independently review and verify all content before relying on it.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Platform uses an AI system to generate legal drafts, research summaries, suggestions, analytical insights etc. while the company strives for accuracy; all output may contain inaccuracies, outdated information, errors, or inappropriate suggestions."
      },
      {
        "type": "paragraph",
        "text": "You must independently verify all content. The company disclaims all liability for reliance placed on AI-generated material. No automated output constitutes legal advice, opinion, or professional guidance."
      }
    ],
    "rawText": "Platform uses an AI system to generate legal drafts, research summaries, suggestions, analytical insights etc. while the company strives for accuracy; all output may contain inaccuracies, outdated information, errors, or inappropriate suggestions.\n\nYou must independently verify all content. The company disclaims all liability for reliance placed on AI-generated material. No automated output constitutes legal advice, opinion, or professional guidance."
  },
  {
    "id": "section-17",
    "number": 17,
    "title": "ACCURACY AND LIMITATION OF LIABILITY",
    "category": "liability",
    "plainSummary": "Platform is provided on an \"AS IS\" and \"AS AVAILABLE\" basis; Vakeel Setu does not warrant real-time statute updates or suitability for specific litigations.",
    "elements": [
      {
        "type": "paragraph",
        "text": "The platform is provided “as is” and “as available”. The company does not warrant:"
      },
      {
        "type": "bullet",
        "text": "accuracy of judgement, statutes, analytics, or draft"
      },
      {
        "type": "bullet",
        "text": "Completeness or reliability of information"
      },
      {
        "type": "bullet",
        "text": "Real-time updates"
      },
      {
        "type": "bullet",
        "text": "Suitability of content for any specific case"
      },
      {
        "type": "paragraph",
        "text": "In no event shall the company, its affiliates, developers, or partners be liable for:"
      },
      {
        "type": "bullet",
        "text": "Loss of data"
      },
      {
        "type": "bullet",
        "text": "Loss of business, revenue, or professional opportunity"
      },
      {
        "type": "bullet",
        "text": "Legal consequences arising from technical failures, downtime, or system errors"
      },
      {
        "type": "bullet",
        "text": "Use of the platform is entirely at your own risk."
      }
    ],
    "rawText": "The platform is provided “as is” and “as available”. The company does not warrant:\n\n●  accuracy of judgement, statutes, analytics, or draft\n\n● Completeness or reliability of information\n\n● Real-time updates\n\n● Suitability of content for any specific case\n\nIn no event shall the company, its affiliates, developers, or partners be liable for:\n\n● Loss of data\n\n● Loss of business, revenue, or professional opportunity\n\n● Legal consequences arising from technical failures, downtime, or system errors\n\n● Use of the platform is entirely at your own risk."
  },
  {
    "id": "section-18",
    "number": 18,
    "title": "INDEPENDENT PROFESSIONAL RESPONSIBILITY OF LAWYER",
    "category": "liability",
    "plainSummary": "Each registered lawyer is an independent professional who retains sole judgment and responsibility for their advice and advocate-client relationship.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Each lawyer is an independent legal professional and is responsible for the legal services, advice, opinions, documents and representations provided by them."
      },
      {
        "type": "paragraph",
        "text": "Nothing in these terms shall be construed as creating an employer-employee, partnership, agency, joint venture or other relationship between company and lawyer, except as expressly agreed in writing."
      },
      {
        "type": "paragraph",
        "text": "Lawyers shall independently exercise their professional judgment and shall comply with applicable professional conduct requirements."
      }
    ],
    "rawText": "Each lawyer is an independent legal professional and is responsible for the legal services, advice, opinions, documents and representations provided by them.\n\nNothing in these terms shall be construed as creating an employer-employee, partnership, agency, joint venture or other relationship between company and lawyer, except as expressly agreed in writing.\n\nLawyers shall independently exercise their professional judgment and shall comply with applicable professional conduct requirements."
  },
  {
    "id": "section-19",
    "number": 19,
    "title": "CLIENT RESPONSIBILITIES",
    "category": "liability",
    "plainSummary": "Clients must furnish truthful, accurate, and prompt facts/documents; inaccurate information will adversely impact the legal advice and outcome.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Client shall provide complete and accurate information to the lawyer and the platform."
      },
      {
        "type": "paragraph",
        "text": "Clients shall promptly provide documents, instructions and information reasonably required for the requested services."
      },
      {
        "type": "paragraph",
        "text": "The client acknowledges that incomplete, inaccurate or misleading information may adversely affect legal advice, document preparation or case management."
      }
    ],
    "rawText": "Client shall provide complete and accurate information to the lawyer and the platform.\n\nClients shall promptly provide documents, instructions and information reasonably required for the requested services.\n\nThe client acknowledges that incomplete, inaccurate or misleading information may adversely affect legal advice, document preparation or case management."
  },
  {
    "id": "section-20",
    "number": 20,
    "title": "NO GUARANTEE FOR LEGAL OUTCOME",
    "category": "liability",
    "plainSummary": "Vakeel Setu cannot and does not guarantee any specific case result, court verdict, or dispute outcome.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Company does not guarantee any particular result in a case, transaction, dispute, application, negotiation or legal proceeding. Any statement regarding a possible legal outcome, success rate, strategy or expected result made by a lawyer represents that lawyer's professional assessment and not a guarantee by the company."
      }
    ],
    "rawText": "Company does not guarantee any particular result in a case, transaction, dispute, application, negotiation or legal proceeding. Any statement regarding a possible legal outcome, success rate, strategy or expected result made by a lawyer represents that lawyer's professional assessment and not a guarantee by the company."
  },
  {
    "id": "section-21",
    "number": 21,
    "title": "COMMUNICATIONS BETWEEN USERS",
    "category": "liability",
    "plainSummary": "Users are responsible for their communications; platform may securely log interaction metadata for security, dispute resolution, and regulatory compliance.",
    "elements": [
      {
        "type": "paragraph",
        "text": "The platform may facilitate communication between lawyers and clients. Users are responsible for the content of their communication. The company may retain communication records where necessary for security, dispute resolution, compliance, subject to the privacy policy and applicable."
      }
    ],
    "rawText": "The platform may facilitate communication between lawyers and clients. Users are responsible for the content of their communication. The company may retain communication records where necessary for security, dispute resolution, compliance, subject to the privacy policy and applicable."
  },
  {
    "id": "section-22",
    "number": 22,
    "title": "PLATFORM AVAILABILITY",
    "category": "liability",
    "plainSummary": "While high uptime is targeted, uninterrupted 24/7 service cannot be guaranteed due to maintenance, system upgrades, or network outages.",
    "elements": [
      {
        "type": "paragraph",
        "text": "The company will endeavour to keep the platform operational but does not guarantee uninterrupted or error-free availability the platform may occasionally be unavailable because of maintenance, upgrades, technical failures, security incidents, network problems or circumstances beyond the company's reasonable control."
      }
    ],
    "rawText": "The company will endeavour to keep the platform operational but does not guarantee uninterrupted or error-free availability the platform may occasionally be unavailable because of maintenance, upgrades, technical failures, security incidents, network problems or circumstances beyond the company's reasonable control."
  },
  {
    "id": "section-23",
    "number": 23,
    "title": "DISCLAIMER OF WARRANTIES",
    "category": "liability",
    "plainSummary": "Disclaims all implied warranties of merchantability, satisfactory quality, or fitness for a particular legal purpose to the maximum extent permitted by Indian law.",
    "elements": [
      {
        "type": "paragraph",
        "text": "You expressly understand and agree that: your use of the platform is at your sole risk. All content and services on the platform is provided solely on an ‘as-is/as-available’ basis. To the extent permitted by applicable law, we expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to the implied warranties and conditions of merchantability, satisfactory quality, fitness for a particular purpose or use, as to the results you may achieve on account your use of the platform, as to the results you may achieve on account of any relationship you elect to create with lawyer / professional, and non-infringement. Neither Vakeel Setu nor any of its licensors or affiliates makes any representations or warranties regarding any lawyer / professional, including, without limitation, any lawyer / professional's ability to obtain a favorable result for you."
      },
      {
        "type": "paragraph",
        "text": "We do not guarantee the accuracy or completeness of any content or services and we do not guaranty in any services or goods associated with the platform will be error-free or uninterrupted, or that any service or good will continue to be available."
      },
      {
        "type": "paragraph",
        "text": "Any material downloaded or otherwise obtained through the use of the service is done at your own discretion and risk and that you will be solely responsible for any damage to your computer system or loss of data that results from the download of any such material."
      },
      {
        "type": "paragraph",
        "text": "No information, whether oral or written, obtained by you from us or through or from the platform shall create any warranty not expressly stated in this agreement."
      }
    ],
    "rawText": "You expressly understand and agree that: your use of the platform is at your sole risk. All content and services on the platform is provided solely on an ‘as-is/as-available’ basis. To the extent permitted by applicable law, we expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to the implied warranties and conditions of merchantability, satisfactory quality, fitness for a particular purpose or use, as to the results you may achieve on account your use of the platform, as to the results you may achieve on account of any relationship you elect to create with lawyer / professional, and non-infringement. Neither Vakeel Setu nor any of its licensors or affiliates makes any representations or warranties regarding any lawyer / professional, including, without limitation, any lawyer / professional's ability to obtain a favorable result for you.\n\nWe do not guarantee the accuracy or completeness of any content or services and we do not guaranty in any services or goods associated with the platform will be error-free or uninterrupted, or that any service or good will continue to be available.\n\nAny material downloaded or otherwise obtained through the use of the service is done at your own discretion and risk and that you will be solely responsible for any damage to your computer system or loss of data that results from the download of any such material.\n\nNo information, whether oral or written, obtained by you from us or through or from the platform shall create any warranty not expressly stated in this agreement."
  },
  {
    "id": "section-24",
    "number": 24,
    "title": "LIMITATION OF LIABILITY",
    "category": "liability",
    "plainSummary": "Limits company liability for indirect or punitive damages and caps monetary claims to the amount paid by the user for that specific service within the past 6 months.",
    "elements": [
      {
        "type": "paragraph",
        "text": "To the maximum extent permitted by applicable law, the company shall not be liable for indirect, incidental, consequential, special or punitive damages, loss of profits, loss arising from reliance on AI-generated content or third-party professional services."
      },
      {
        "type": "paragraph",
        "text": "Subject to applicable law, the aggregate liability of the company arising out of or relating to the platform shall not exceed the amount actually paid by the concerned user to the company for the specific service giving rise to the claim during the six months preceding the event giving rise to such claim."
      }
    ],
    "rawText": "To the maximum extent permitted by applicable law, the company shall not be liable for indirect, incidental, consequential, special or punitive damages, loss of profits, loss arising from reliance on AI-generated content or third-party professional services.\n\nSubject to applicable law, the aggregate liability of the company arising out of or relating to the platform shall not exceed the amount actually paid by the concerned user to the company for the specific service giving rise to the claim during the six months preceding the event giving rise to such claim."
  },
  {
    "id": "section-25",
    "number": 25,
    "title": "INDEMNIFICATION",
    "category": "liability",
    "plainSummary": "You agree to indemnify and hold Vakeel Setu harmless from claims, losses, or legal costs arising from your breach of these terms or misuse of the platform.",
    "elements": [
      {
        "type": "paragraph",
        "text": "You shall defend, indemnify, save and hold Vakeel Setu, its affiliates harmless from all demands, liabilities, claims and expenses, including lawyers fees, fees of third parties relating to or arising under this agreement, the services provided hereunder or your use of services, including without limitation, infringement by you or someone else using the service with your computer, of any intellectual property or other proprietary right of any person or entity, or form the violation of any of our operating rules or policy relating to the services provided."
      },
      {
        "type": "paragraph",
        "text": "When we are threatened with suit by a third party, we may seek written assurances from you concerning your promise to indemnify us; your failure to provide those assurances may be considered by us to be a breach of your agreement and may result in deactivation of your services with immediate effect."
      },
      {
        "type": "paragraph",
        "text": "Under no circumstances, including negligence, shall Vakeel Setu including its affiliates or anyone else involved in creating, producing or distributing Vakeel Setu services be liable for any direct, indirect, incidental, special or consequential damages that result from the use of or inability to use Vakeel Setu services, or that results from mistakes, omissions, interruptions, deletion of files, errors, defects, delays in operation, or transmission or any failure of performance, whether or not limited  to acts of god, communication failure, theft, destruction or unauthorised access to Vakeel Setu records, programs or services. This paragraph shall apply to all content and functionality of Vakeel Setu services."
      },
      {
        "type": "paragraph",
        "text": "In addition, to the maximum extent permitted by law, in no event shall Vakeel Setu nor any of its affiliates be liable for any special, punitive, indirect, incidental or consequential damages, including but not limited to personal injury, wrongful death, loss of use, loss of profits, interruption of service, or loss of data, whether in any action in warranty, contract, tort (including, but not limited to negligence or fundamental breach),"
      },
      {
        "type": "paragraph",
        "text": "or otherwise arising out of or in any way connected with the use of, or the inability to use, this website or any service offered through this website or any material or information contained in, accessed through, or products purchased on this website, even if an authorized representative of Vakeel Setu is advised of the likelihood or possibility of the same. To the extent certain jurisdictions restrict any of the above limitations of liability; such limitations shall not apply in such jurisdictions to the extent of such restrictions."
      }
    ],
    "rawText": "You shall defend, indemnify, save and hold Vakeel Setu, its affiliates harmless from all demands, liabilities, claims and expenses, including lawyers fees, fees of third parties relating to or arising under this agreement, the services provided hereunder or your use of services, including without limitation, infringement by you or someone else using the service with your computer, of any intellectual property or other proprietary right of any person or entity, or form the violation of any of our operating rules or policy relating to the services provided.\n\nWhen we are threatened with suit by a third party, we may seek written assurances from you concerning your promise to indemnify us; your failure to provide those assurances may be considered by us to be a breach of your agreement and may result in deactivation of your services with immediate effect.\n\nUnder no circumstances, including negligence, shall Vakeel Setu including its affiliates or anyone else involved in creating, producing or distributing Vakeel Setu services be liable for any direct, indirect, incidental, special or consequential damages that result from the use of or inability to use Vakeel Setu services, or that results from mistakes, omissions, interruptions, deletion of files, errors, defects, delays in operation, or transmission or any failure of performance, whether or not limited  to acts of god, communication failure, theft, destruction or unauthorised access to Vakeel Setu records, programs or services. This paragraph shall apply to all content and functionality of Vakeel Setu services.\n\nIn addition, to the maximum extent permitted by law, in no event shall Vakeel Setu nor any of its affiliates be liable for any special, punitive, indirect, incidental or consequential damages, including but not limited to personal injury, wrongful death, loss of use, loss of profits, interruption of service, or loss of data, whether in any action in warranty, contract, tort (including, but not limited to negligence or fundamental breach),\n\nor otherwise arising out of or in any way connected with the use of, or the inability to use, this website or any service offered through this website or any material or information contained in, accessed through, or products purchased on this website, even if an authorized representative of Vakeel Setu is advised of the likelihood or possibility of the same. To the extent certain jurisdictions restrict any of the above limitations of liability; such limitations shall not apply in such jurisdictions to the extent of such restrictions."
  },
  {
    "id": "section-26",
    "number": 26,
    "title": "SUSPENSION AND TERMINATION",
    "category": "disputes",
    "plainSummary": "The company may suspend or terminate accounts for violations, fraud, or credential invalidity; outlines user termination procedures and post-closure data handling.",
    "elements": [
      {
        "type": "subheading",
        "text": "Suspension by company"
      },
      {
        "type": "paragraph",
        "text": "The company may, at its sole discretion and to the extent permitted by applicable law, temporarily suspend, restrict, or disable a user's access to the platform or any part thereof, with or without prior notice, where the company reasonably believes that:"
      },
      {
        "type": "paragraph",
        "text": "I. The user has violated or likely to violate these terms or any applicable policy;"
      },
      {
        "type": "paragraph",
        "text": "II. The user has provided false, inaccurate, misleading, incomplete, or fraudulent information;"
      },
      {
        "type": "paragraph",
        "text": "III. The user has engaged in unlawful, fraudulent, abusive, or unauthorized activities;"
      },
      {
        "type": "paragraph",
        "text": "IV. The user has misused the platform, another user’s account, confidential information, document, or data;"
      },
      {
        "type": "paragraph",
        "text": "V. The user's conduct may adversely affect the security, integrity, reputation, or operation of platform or may cause harm to another user;"
      },
      {
        "type": "paragraph",
        "text": "VI. A lawyer's professional credentials, enrollment, licence, or eligibility to provide legal services are found to be invalid, suspended, expired, or subject to a credible professional or legal concern;"
      },
      {
        "type": "paragraph",
        "text": "VII. The user has failed to make any payment that is due and payable;"
      },
      {
        "type": "paragraph",
        "text": "VIII. Suspension is necessary to comply with applicable law, a court order , governmental direction, or a request from a competent authority; or"
      },
      {
        "type": "paragraph",
        "text": "IX. The company reasonably considers such suspension necessary for security and protection of the platform or its users."
      },
      {
        "type": "subheading",
        "text": "Immediate suspension"
      },
      {
        "type": "paragraph",
        "text": "Where the company reasonably believes that continued access may result in fraud, security risk, unlawful activity, misuse of confidential information, harm to the platform, the company may suspend access immediately without prior notice."
      },
      {
        "type": "subheading",
        "text": "Termination by the user"
      },
      {
        "type": "paragraph",
        "text": "A user may terminate their account at any time by following the account closure procedure available on the platform or by contacting through the designated contact details."
      },
      {
        "type": "paragraph",
        "text": "Termination by the user shall not release the user from any payment obligations or other obligation that accrued before termination."
      },
      {
        "type": "subheading",
        "text": "Effect of Suspension or Termination"
      },
      {
        "type": "paragraph",
        "text": "Upon suspension or termination: the User's right to access and use the affected Platform features may immediately cease; the Company may restrict access to the User's account and Platform features; the User shall remain responsible for all amounts payable to the Company or arising from services obtained before termination; termination shall not affect any rights, remedies, obligations, or liabilities that accrued before termination; and provisions which by their nature are intended to survive termination, including confidentiality, intellectual property, limitation of liability, indemnification, dispute resolution, and governing law, shall continue to remain in effect."
      },
      {
        "type": "subheading",
        "text": "Case Data and Documents after Termination"
      },
      {
        "type": "paragraph",
        "text": "Subject to applicable law and the Company's Privacy Policy, the Company may retain, delete, archive, or otherwise process User Content, Legal Documents, Case Data, communications, and other information following suspension or termination."
      },
      {
        "type": "paragraph",
        "text": "Where reasonably practicable, the Company may provide the User with an opportunity to access or download their Case Data and documents before permanent deletion, subject to applicable retention requirements, security considerations, and technical limitations."
      }
    ],
    "rawText": "● Suspension by company :-\n\nThe company may, at its sole discretion and to the extent permitted by applicable law, temporarily suspend, restrict, or disable a user's access to the platform or any part thereof, with or without prior notice, where the company reasonably believes that:\n\nI. The user has violated or likely to violate these terms or any applicable policy;\n\nII. The user has provided false, inaccurate, misleading, incomplete, or fraudulent information;\n\nIII. The user has engaged in unlawful, fraudulent, abusive, or unauthorized activities;\n\nIV. The user has misused the platform, another user’s account, confidential information, document, or data;\n\nV. The user's conduct may adversely affect the security, integrity, reputation, or operation of platform or may cause harm to another user;\n\nVI. A lawyer's professional credentials, enrollment, licence, or eligibility to provide legal services are found to be invalid, suspended, expired, or subject to a credible professional or legal concern;\n\nVII. The user has failed to make any payment that is due and payable;\n\nVIII. Suspension is necessary to comply with applicable law, a court order , governmental direction, or a request from a competent authority; or\n\nIX. The company reasonably considers such suspension necessary for security and protection of the platform or its users.\n\n● Immediate suspension :-\n\nWhere the company reasonably believes that continued access may result in fraud, security risk, unlawful activity, misuse of confidential information, harm to the platform, the company may suspend access immediately without prior notice.\n\n● Termination by the user :-\n\nA user may terminate their account at any time by following the account closure procedure available on the platform or by contacting through the designated contact details.\n\nTermination by the user shall not release the user from any payment obligations or other obligation that accrued before termination.\n\n● Effect of Suspension or Termination :-\n\nUpon suspension or termination: the User's right to access and use the affected Platform features may immediately cease; the Company may restrict access to the User's account and Platform features; the User shall remain responsible for all amounts payable to the Company or arising from services obtained before termination; termination shall not affect any rights, remedies, obligations, or liabilities that accrued before termination; and provisions which by their nature are intended to survive termination, including confidentiality, intellectual property, limitation of liability, indemnification, dispute resolution, and governing law, shall continue to remain in effect.\n\n● Case Data and Documents after Termination :-\n\nSubject to applicable law and the Company's Privacy Policy, the Company may retain, delete, archive, or otherwise process User Content, Legal Documents, Case Data, communications, and other information following suspension or termination.\n\nWhere reasonably practicable, the Company may provide the User with an opportunity to access or download their Case Data and documents before permanent deletion, subject to applicable retention requirements, security considerations, and technical limitations."
  },
  {
    "id": "section-27",
    "number": 27,
    "title": "DISPUTE RESOLUTION",
    "category": "disputes",
    "plainSummary": "Mandates a 30-day amicable good-faith resolution first; unresolved disputes are submitted to a sole arbitrator in Noida, UP, under the Arbitration and Conciliation Act, 1996.",
    "elements": [
      {
        "type": "subheading",
        "text": "Amicable Resolution"
      },
      {
        "type": "paragraph",
        "text": "In the event of any dispute, controversy, claim or difference arising out of or in connection with these Terms, the Platform, or the services provided through the Platform, the concerned User shall first notify the Company in writing, providing reasonable details of the dispute. The Company and the User shall make reasonable efforts to resolve such dispute amicably and in good faith within [30] days from the date of receipt of such notice."
      },
      {
        "type": "subheading",
        "text": "Arbitration"
      },
      {
        "type": "paragraph",
        "text": "If the dispute is not resolved amicably within the period specified above, and to the extent such dispute is legally capable of being referred to arbitration, the dispute shall be referred to and finally resolved by arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time."
      },
      {
        "type": "paragraph",
        "text": "The arbitration shall be conducted by a sole arbitrator mutually appointed by the parties. If the parties fail to mutually agree upon the appointment of the arbitrator within the prescribed period, the arbitrator shall be appointed in accordance with applicable law."
      },
      {
        "type": "paragraph",
        "text": "The seat and venue of arbitration shall be [Noida, Uttar Pradesh, India], unless otherwise agreed in writing by the parties. The language of the arbitration proceedings shall be English."
      },
      {
        "type": "subheading",
        "text": "Interim and Urgent Relief"
      },
      {
        "type": "paragraph",
        "text": "Nothing in this Clause shall prevent either party from seeking interim, injunctive or other urgent relief from a court of competent jurisdiction where such relief is necessary to protect its rights, confidential information, intellectual property, data, security or other legitimate interests, subject to applicable law."
      },
      {
        "type": "subheading",
        "text": "Finality of Arbitration"
      },
      {
        "type": "paragraph",
        "text": "Subject to applicable law, the arbitral award shall be final and binding upon the parties and may be enforced in accordance with applicable law."
      }
    ],
    "rawText": "●  Amicable Resolution:-\n\nIn the event of any dispute, controversy, claim or difference arising out of or in connection with these Terms, the Platform, or the services provided through the Platform, the concerned User shall first notify the Company in writing, providing reasonable details of the dispute. The Company and the User shall make reasonable efforts to resolve such dispute amicably and in good faith within [30] days from the date of receipt of such notice.\n\n●  Arbitration:-\n\nIf the dispute is not resolved amicably within the period specified above, and to the extent such dispute is legally capable of being referred to arbitration, the dispute shall be referred to and finally resolved by arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time.\n\nThe arbitration shall be conducted by a sole arbitrator mutually appointed by the parties. If the parties fail to mutually agree upon the appointment of the arbitrator within the prescribed period, the arbitrator shall be appointed in accordance with applicable law.\n\nThe seat and venue of arbitration shall be [Noida, Uttar Pradesh, India], unless otherwise agreed in writing by the parties. The language of the arbitration proceedings shall be English.\n\n● Interim and Urgent Relief:-\n\nNothing in this Clause shall prevent either party from seeking interim, injunctive or other urgent relief from a court of competent jurisdiction where such relief is necessary to protect its rights, confidential information, intellectual property, data, security or other legitimate interests, subject to applicable law.\n\n● Finality of Arbitration:-\n\nSubject to applicable law, the arbitral award shall be final and binding upon the parties and may be enforced in accordance with applicable law."
  },
  {
    "id": "section-28",
    "number": 28,
    "title": "GOVERNING LAW AND JURISDICTION",
    "category": "disputes",
    "plainSummary": "Governed by the laws of India; exclusive court jurisdiction rests in Noida, Uttar Pradesh, India.",
    "elements": [
      {
        "type": "paragraph",
        "text": "This Agreement constitutes the entire understanding of the parties, and is agreed to be entered into within the jurisdiction of Noida, Uttar Pradesh, India and shall be governed by and shall be construed in accordance with the laws of the Republic of India, without giving effect to any choice of law rules or principles."
      },
      {
        "type": "paragraph",
        "text": "Any dispute with Vakeel Setu shall exclusively be subject to the jurisdiction of the appropriate Courts situated at Noida, Uttar Pradesh,India. No party shall object to removal or prosecution of any litigation to a court within the jurisdiction of Noida, Uttar Pradesh, India."
      },
      {
        "type": "paragraph",
        "text": "Any cause of action or claim you may have with respect to LawRato.com must be commenced within one (1) year after it arises, except to the extent such litigation is not enforceable."
      }
    ],
    "rawText": "This Agreement constitutes the entire understanding of the parties, and is agreed to be entered into within the jurisdiction of Noida, Uttar Pradesh, India and shall be governed by and shall be construed in accordance with the laws of the Republic of India, without giving effect to any choice of law rules or principles.\n\nAny dispute with Vakeel Setu shall exclusively be subject to the jurisdiction of the appropriate Courts situated at Noida, Uttar Pradesh,India. No party shall object to removal or prosecution of any litigation to a court within the jurisdiction of Noida, Uttar Pradesh, India.\n\nAny cause of action or claim you may have with respect to LawRato.com must be commenced within one (1) year after it arises, except to the extent such litigation is not enforceable."
  },
  {
    "id": "section-29",
    "number": 29,
    "title": "GRIEVANCE REDRESSAL",
    "category": "general",
    "plainSummary": "Outlines the official Grievance Redressal mechanism with designated email (info@vakeelsetu.in) and office address in Noida.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Users may submit complaints, concerns or grievances through:"
      },
      {
        "type": "paragraph",
        "text": "Email: info@vakeelsetu.in"
      },
      {
        "type": "paragraph",
        "text": "Address: D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309"
      },
      {
        "type": "paragraph",
        "text": "Contact: +91 9718494494"
      },
      {
        "type": "paragraph",
        "text": "The Company shall endeavour to address grievances in accordance with applicable law and its internal grievance procedures."
      }
    ],
    "rawText": "Users may submit complaints, concerns or grievances through:\n\nEmail: info@vakeelsetu.in\n\nAddress: D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309\n\nContact: +91 9718494494\n\nThe Company shall endeavour to address grievances in accordance with applicable law and its internal grievance procedures."
  },
  {
    "id": "section-30",
    "number": 30,
    "title": "NOTICE",
    "category": "general",
    "plainSummary": "Formal notices must be directed to registered office or designated emails; platform notices may be served via dashboard or email.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Notices to the Company shall be sent to the registered office or designated email address specified on the Platform."
      },
      {
        "type": "paragraph",
        "text": "The Company may provide notices to Users through email, Platform notifications, account dashboards or other reasonable electronic means."
      }
    ],
    "rawText": "Notices to the Company shall be sent to the registered office or designated email address specified on the Platform.\n\nThe Company may provide notices to Users through email, Platform notifications, account dashboards or other reasonable electronic means."
  },
  {
    "id": "section-31",
    "number": 31,
    "title": "FORCE MAJEURE",
    "category": "general",
    "plainSummary": "Excuses platform delays or performance failures caused by natural disasters, strikes, cyber incidents, war, or events beyond reasonable control.",
    "elements": [
      {
        "type": "paragraph",
        "text": "The Company shall not be liable for failure or delay caused by events beyond its reasonable control, including natural disasters, governmental actions, war, civil"
      },
      {
        "type": "paragraph",
        "text": "disturbances, telecommunications failures, cyber incidents, widespread technical failures, strikes, epidemics or failures of third-party infrastructure."
      }
    ],
    "rawText": "The Company shall not be liable for failure or delay caused by events beyond its reasonable control, including natural disasters, governmental actions, war, civil\n\ndisturbances, telecommunications failures, cyber incidents, widespread technical failures, strikes, epidemics or failures of third-party infrastructure."
  },
  {
    "id": "section-32",
    "number": 32,
    "title": "SEVERABILITY",
    "category": "general",
    "plainSummary": "If any individual clause is declared unenforceable, remaining clauses continue in full legal force and effect.",
    "elements": [
      {
        "type": "paragraph",
        "text": "If any provision of these Terms is held invalid, illegal or unenforceable, such provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall continue in full force and effect."
      }
    ],
    "rawText": "If any provision of these Terms is held invalid, illegal or unenforceable, such provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall continue in full force and effect."
  },
  {
    "id": "section-33",
    "number": 33,
    "title": "WAIVER",
    "category": "general",
    "plainSummary": "Failure to strictly enforce any clause does not forfeit or waive the right to enforce it subsequently.",
    "elements": [
      {
        "type": "paragraph",
        "text": "Failure by the Company to enforce any provision of these Terms shall not constitute a waiver of its right to enforce that provision in the future."
      }
    ],
    "rawText": "Failure by the Company to enforce any provision of these Terms shall not constitute a waiver of its right to enforce that provision in the future."
  },
  {
    "id": "section-34",
    "number": 34,
    "title": "ASSIGNMENT",
    "category": "general",
    "plainSummary": "The company may assign or transfer its rights and obligations in mergers or acquisitions; users cannot transfer account rights without prior written consent.",
    "elements": [
      {
        "type": "paragraph",
        "text": "We may assign this contract at any time to any parent, subsidiary, or any affiliated company, or as part of the sale to, merger with, or other transfer of our company to another entity. We will post a notice on the platform regarding any change of ownership so that you have the opportunity to discontinue your use of the Website or cancel your"
      },
      {
        "type": "paragraph",
        "text": "registration if you do not wish to continue to use the platform and the Services under the new ownership. You may not assign, transfer or sublicense these Terms & Conditions to anyone else and any attempt to do so in violation of this section shall be null and void."
      }
    ],
    "rawText": "We may assign this contract at any time to any parent, subsidiary, or any affiliated company, or as part of the sale to, merger with, or other transfer of our company to another entity. We will post a notice on the platform regarding any change of ownership so that you have the opportunity to discontinue your use of the Website or cancel your\n\nregistration if you do not wish to continue to use the platform and the Services under the new ownership. You may not assign, transfer or sublicense these Terms & Conditions to anyone else and any attempt to do so in violation of this section shall be null and void."
  },
  {
    "id": "section-35",
    "number": 35,
    "title": "ENTIRE AGREEMENT",
    "category": "general",
    "plainSummary": "These terms and the Privacy Policy constitute the entire legally binding agreement between you and Vakeel Setu, superseding prior understandings.",
    "elements": [
      {
        "type": "paragraph",
        "text": "These Terms & Conditions, together with the privacy policy, which shall be deemed to be a part hereof and incorporated herein by reference represent the complete agreement between you and Vakeel Setu concerning the subject matter hereof, and it replaces all prior oral or written communications (if any) concerning such subject matter."
      },
      {
        "type": "paragraph",
        "text": "The Terms & Conditions shall commence upon the date you use the platform in any form. This Terms & Conditions and the licenses granted hereunder shall be terminated without notice in the event you (or any authorized person using your account) fail to comply with the Terms and Conditions of this Terms & Conditions or the rules for use of the Vakeel Setu service promulgated by Vakeel Setu from time to time. We may also cancel or suspend your registration for any other reason, including inactivity for an extended period, but will attempt to notify you in advance of such cancellation or suspension. Upon any termination, you will destroy all copies of Vakeel Setu materials in your possession and cease any access to or use of the platform. Upon this suspension or termination we may delete information, files, and other previously available content to you including but not limited to information provided by you. Vakeel Setu shall not be liable to you or any third party for any termination of your access to the platform and/or the Services."
      },
      {
        "type": "paragraph",
        "text": "The provisions of this Terms & Conditions are severable, and in the event any provision hereof is determined to be invalid or unenforceable, such invalidity or unenforceability shall not affect the validity or enforceability of the remaining provisions, but such a provision shall be reformed, if reasonably possible, only to the extent necessary to make it enforceable."
      },
      {
        "type": "paragraph",
        "text": "The failure of Vakeel Setu to exercise or enforce any right or provision of these Terms & Conditions shall not constitute a waiver of such right or provision. The failure of either party to exercise in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder."
      },
      {
        "type": "paragraph",
        "text": "Your affirmative act of using this platform and/or registering for the platform or the Services constitutes your electronic signature to these Terms & Conditions, Privacy Policy that shall be deemed to be a part hereof and incorporated herein by reference and your consent to enter into agreements with us electronically"
      }
    ],
    "rawText": "These Terms & Conditions, together with the privacy policy, which shall be deemed to be a part hereof and incorporated herein by reference represent the complete agreement between you and Vakeel Setu concerning the subject matter hereof, and it replaces all prior oral or written communications (if any) concerning such subject matter.\n\nThe Terms & Conditions shall commence upon the date you use the platform in any form. This Terms & Conditions and the licenses granted hereunder shall be terminated without notice in the event you (or any authorized person using your account) fail to comply with the Terms and Conditions of this Terms & Conditions or the rules for use of the Vakeel Setu service promulgated by Vakeel Setu from time to time. We may also cancel or suspend your registration for any other reason, including inactivity for an extended period, but will attempt to notify you in advance of such cancellation or suspension. Upon any termination, you will destroy all copies of Vakeel Setu materials in your possession and cease any access to or use of the platform. Upon this suspension or termination we may delete information, files, and other previously available content to you including but not limited to information provided by you. Vakeel Setu shall not be liable to you or any third party for any termination of your access to the platform and/or the Services.\n\nThe provisions of this Terms & Conditions are severable, and in the event any provision hereof is determined to be invalid or unenforceable, such invalidity or unenforceability shall not affect the validity or enforceability of the remaining provisions, but such a provision shall be reformed, if reasonably possible, only to the extent necessary to make it enforceable.\n\nThe failure of Vakeel Setu to exercise or enforce any right or provision of these Terms & Conditions shall not constitute a waiver of such right or provision. The failure of either party to exercise in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder.\n\nYour affirmative act of using this platform and/or registering for the platform or the Services constitutes your electronic signature to these Terms & Conditions, Privacy Policy that shall be deemed to be a part hereof and incorporated herein by reference and your consent to enter into agreements with us electronically"
  },
  {
    "id": "section-36",
    "number": 36,
    "title": "AMENDMENTS",
    "category": "general",
    "plainSummary": "Terms may be updated periodically with the latest version published online; continued usage signifies acceptance of amendments.",
    "elements": [
      {
        "type": "paragraph",
        "text": "We may revise these Terms from time to time, and will always post the most current version on our platform. By continuing to use or access the Services after the revisions come into effect, you agree to be bound by the revised Terms. We encourage users to periodically review the Terms to ensure that you understand them in their entirety."
      },
      {
        "type": "paragraph",
        "text": "If you have any questions or concerns, please visit our Help Page or Contact Us at any time."
      }
    ],
    "rawText": "We may revise these Terms from time to time, and will always post the most current version on our platform. By continuing to use or access the Services after the revisions come into effect, you agree to be bound by the revised Terms. We encourage users to periodically review the Terms to ensure that you understand them in their entirety.\n\nIf you have any questions or concerns, please visit our Help Page or Contact Us at any time."
  },
  {
    "id": "section-37",
    "number": 37,
    "title": "COMMUNICATION CLAUSE",
    "category": "general",
    "plainSummary": "Official formal communications must only be sent to info@vakeelsetu.in; social media or messaging apps are not accepted for legal service of notices.",
    "elements": [
      {
        "type": "paragraph",
        "text": "All official communication must be directed to:"
      },
      {
        "type": "paragraph",
        "text": "info@vakeelsetu.in"
      },
      {
        "type": "paragraph",
        "text": "The Company does not accept service of notices via social media, personal messages, or unofficial channels."
      }
    ],
    "rawText": "All official communication must be directed to:\n\ninfo@vakeelsetu.in\n\nThe Company does not accept service of notices via social media, personal messages, or unofficial channels."
  },
  {
    "id": "section-38",
    "number": 38,
    "title": "CONTACT INFORMATION",
    "category": "general",
    "plainSummary": "Official company contact details: Techvunex Innovations, D-60, Sector 63, Noida, UP, Phone: +91 9718494494, Email: info@vakeelsetu.in.",
    "elements": [
      {
        "type": "paragraph",
        "text": "For questions regarding these Terms, Users may contact:"
      },
      {
        "type": "paragraph",
        "text": "Vakeel Setu"
      },
      {
        "type": "paragraph",
        "text": "Operated by: Techvunex Innovations"
      },
      {
        "type": "paragraph",
        "text": "Registered Office: D-60, D Block, Sector 63, Noida, Uttar Pradesh."
      },
      {
        "type": "paragraph",
        "text": "Email: info@vakeelsetu.in"
      },
      {
        "type": "paragraph",
        "text": "Phone: +91 9718494494"
      },
      {
        "type": "paragraph",
        "text": "Website: Vakeelsetu.in"
      }
    ],
    "rawText": "For questions regarding these Terms, Users may contact:\n\nVakeel Setu\n\nOperated by: Techvunex Innovations\n\nRegistered Office: D-60, D Block, Sector 63, Noida, Uttar Pradesh.\n\nEmail: info@vakeelsetu.in\n\nPhone: +91 9718494494\n\nWebsite: Vakeelsetu.in"
  },
  {
    "id": "section-39",
    "number": 39,
    "title": "ACKNOWLEDGMENT",
    "category": "general",
    "plainSummary": "User explicitly acknowledges understanding risks/benefits of online consultations, privacy protections, and provides explicit consent under TRAI regulations.",
    "elements": [
      {
        "type": "paragraph",
        "text": "I, the User/client"
      },
      {
        "type": "paragraph",
        "text": "Understand the risks and benefits of the online consultation"
      },
      {
        "type": "paragraph",
        "text": "Acknowledge and agree to assume the risk of the above-mentioned limitations pursuant to the use of Vakeel Setu. I further understand and agree that no warranty or guarantee has been made to me concerning any consultation on a particular problem, result, solution of my query / problem."
      },
      {
        "type": "paragraph",
        "text": "I understand that the laws that protect privacy and the confidentiality of personal and / or Professional Services' information also apply to Vakeel Setu, and that my information will be only used as defined by the Vakeel Setu’s Terms & Conditions and Privacy Statement."
      },
      {
        "type": "paragraph",
        "text": "I understand that the consultation through Vakeel Setu may involve electronic communication of my personal information to other Lawyers who may be located in other areas, including out of state."
      },
      {
        "type": "paragraph",
        "text": "Notwithstanding User's registration with National Do Not Call Registry (In Fully or Partly blocked category under National Customer Preference Register set up under Telecom Regulatory Authority of India), User hereby expresses his interest and accord its willful consent to receive communication (including commercial communication) in relation to company name. User further confirms that any communication, as mentioned herein above, shall not be construed as Unsolicited Commercial Communication under the TRAI guidelines and User has specifically opted to receive communication in this regard on the telephone number provided by the User."
      },
      {
        "type": "paragraph",
        "text": "If you do not agree to our Terms & Conditions or our Privacy Policy we kindly request you REFRAIN USING this platform."
      }
    ],
    "rawText": "I, the User/client\n\nUnderstand the risks and benefits of the online consultation\n\nAcknowledge and agree to assume the risk of the above-mentioned limitations pursuant to the use of Vakeel Setu. I further understand and agree that no warranty or guarantee has been made to me concerning any consultation on a particular problem, result, solution of my query / problem.\n\nI understand that the laws that protect privacy and the confidentiality of personal and / or Professional Services' information also apply to Vakeel Setu, and that my information will be only used as defined by the Vakeel Setu’s Terms & Conditions and Privacy Statement.\n\nI understand that the consultation through Vakeel Setu may involve electronic communication of my personal information to other Lawyers who may be located in other areas, including out of state.\n\nNotwithstanding User's registration with National Do Not Call Registry (In Fully or Partly blocked category under National Customer Preference Register set up under Telecom Regulatory Authority of India), User hereby expresses his interest and accord its willful consent to receive communication (including commercial communication) in relation to company name. User further confirms that any communication, as mentioned herein above, shall not be construed as Unsolicited Commercial Communication under the TRAI guidelines and User has specifically opted to receive communication in this regard on the telephone number provided by the User.\n\nIf you do not agree to our Terms & Conditions or our Privacy Policy we kindly request you REFRAIN USING this platform."
  }
];
