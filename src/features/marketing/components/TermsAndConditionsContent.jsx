import React from "react";

/* =========================================================================
   SHARED TERMS UI
============================================================================ */

const TermsSection = ({
  number,
  title,
  children,
}) => (
  <section className="border-b border-slate-100 pb-6 last:border-b-0">
    <div className="flex items-start gap-3">
      <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 px-2 text-[10px] font-black text-amber-700">
        {number}
      </span>

      <h3 className="pt-1 text-[15px] font-black uppercase tracking-tight text-slate-950">
        {title}
      </h3>
    </div>

    <div className="mt-3 text-[13px] leading-6 text-slate-600 sm:text-sm sm:leading-7">
      {children}
    </div>
  </section>
);

const TermsList = ({ children }) => (
  <ul className="mt-3 space-y-2.5">
    {React.Children.map(children, (child, index) => (
      <li
        key={index}
        className="flex items-start gap-2.5"
      >
        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

        <div className="min-w-0 flex-1">
          {child}
        </div>
      </li>
    ))}
  </ul>
);

const NumberedTermsList = ({ children }) => (
  <ol className="mt-3 space-y-2.5">
    {React.Children.map(children, (child, index) => (
      <li
        key={index}
        className="flex items-start gap-3"
      >
        <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-black text-slate-500">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          {child}
        </div>
      </li>
    ))}
  </ol>
);

const SubHeading = ({ children }) => (
  <h4 className="mt-5 text-sm font-black text-slate-900">
    {children}
  </h4>
);

/* =========================================================================
   TERMS AND CONDITIONS CONTENT
============================================================================ */

const TermsAndConditionsContent = () => {
  return (
    <article className="mx-auto max-w-3xl">
      {/* ===============================================================
          INTRODUCTION
      ================================================================ */}

      <div className="mb-7">
        <p className="text-sm leading-7 text-slate-700">
          The following Terms and Conditions constitute a legally binding
          agreement between you and <strong>Vakeel Setu</strong>, operated by{" "}
          <strong>Techvunex Innovations</strong>, having its registered office
          at D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-700">
          By using the website/application and/or by registering with us, you
          acknowledge that you have read, understood and agreed to be bound by
          these Terms and Conditions, including our Privacy Policy, and agree
          to comply with applicable laws of India.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-700">
          We provide the Platform on an "AS IS" basis and without warranties.
          If you register an account or use the Platform on behalf of an
          individual or entity other than yourself, you represent that you are
          authorised by such individual or entity to accept these Terms and
          Conditions on their behalf.
        </p>
      </div>

      <div className="space-y-6">
        {/* =============================================================
            1. DEFINITIONS
        ============================================================== */}

        <TermsSection
          number="1"
          title="Definitions"
        >
          <p>
            For the purposes of these Terms:
          </p>

          <TermsList>
            <span>
              <strong>“Platform”</strong> means the website, mobile application,
              software, tools, interfaces, dashboards, APIs and related
              services operated by the Company.
            </span>

            <span>
              <strong>“User”</strong> means any individual or entity accessing
              or using the Platform, including clients and lawyers.
            </span>

            <span>
              <strong>“Client”</strong> means a User seeking legal information,
              legal services, document drafting, consultation or other services
              through the Platform.
            </span>

            <span>
              <strong>“Lawyer”</strong> means an advocate or other professional
              who is legally permitted to provide legal services in the
              applicable jurisdiction and who registers or provides services
              through the Platform.
            </span>

            <span>
              <strong>“AI Services”</strong> means
              artificial-intelligence-enabled features used for generating,
              summarising, analysing, reviewing, organising or assisting with
              legal content and documents.
            </span>

            <span>
              <strong>“Legal Document”</strong> means agreements, notices,
              applications, petitions, contracts, legal letters, forms,
              templates and other documents generated, uploaded, edited or
              stored through the Platform.
            </span>

            <span>
              <strong>“Case Data”</strong> means information, documents,
              communications, dates, tasks, notes, case details and other
              information uploaded or entered by a User in relation to a legal
              matter.
            </span>
          </TermsList>
        </TermsSection>

        {/* =============================================================
            2. SCOPE OF SERVICES
        ============================================================== */}

        <TermsSection
          number="2"
          title="Scope of Services"
        >
          <p>
            Vakeel Setu, its owners and employee staff, and third-party
            professionals who offer services through the Platform accept no
            responsibility for any medical, legal or financial events or
            outcomes related to services achieved through the use of the
            Platform.
          </p>

          <p className="mt-3">
            Vakeel Setu does not guarantee that a web-based consultation,
            over-phone consultation or video consultation is the appropriate
            course of treatment or solution for your particular problem.
          </p>
        </TermsSection>

        {/* =============================================================
            3. ACCEPTANCE
        ============================================================== */}

        <TermsSection
          number="3"
          title="Acceptance of Terms"
        >
          <p>
            By creating an account or using any feature of the Platform, you
            agree to these Terms, the Privacy Policy and any additional terms
            applicable to specific services.
          </p>

          <p className="mt-3">
            If you do not agree with these Terms, you must not access or use
            the Platform.
          </p>
        </TermsSection>

        {/* =============================================================
            4. PLATFORM USAGE
        ============================================================== */}

        <TermsSection
          number="4"
          title="Platform Usage Terms"
        >
          <p>
            You represent and warrant that you are at least eighteen years of
            age and that you possess the legal right and ability to enter into
            agreements pertaining to these Terms of Use, to register for Vakeel
            Setu services under your own name and to use the services in
            accordance with these Terms.
          </p>

          <TermsList>
            <span>
              You are solely responsible for maintaining the confidentiality of
              your password and for all activities carried out under your
              Vakeel Setu account. You agree to prohibit anyone else from using
              your password or other security credentials.
            </span>

            <span>
              Your affirmative act of using this Platform and/or registering
              for the Platform or its services constitutes your electronic
              signature to these Terms and your consent to enter into
              agreements with us electronically.
            </span>

            <span>
              The Platform may only be used in good faith and may not be used
              to transmit or otherwise make available any information that is
              false or that you do not have a right to make available under
              law. You shall comply with all applicable laws and regulations
              and shall not use the Platform for any unlawful, fraudulent or
              prohibited purpose.
            </span>

            <span>
              You may not misidentify yourself, impersonate any person or
              entity, or falsely state or otherwise misrepresent your
              affiliation with a person or entity. Information provided by you
              must be accurate and complete and you agree to promptly update it
              to keep it true, accurate, current and complete. Where information
              is untrue, inaccurate, outdated or incomplete, or where we have
              reasonable grounds to suspect the same, we may suspend or
              terminate your participation in the Platform or refuse current or
              future use of the Platform or its services.
            </span>

            <span>
              You are not permitted to collect or store personal data about
              other Users. You are also not permitted to access the Platform
              for data mining or extracting content beyond your personal end
              use.
            </span>

            <span>
              You are permitted to use the Platform to find a lawyer to perform
              services relating to your problem and to obtain general
              information about similar cases. You are not permitted to use the
              Platform for an impermissible purpose, including soliciting,
              hiring, engaging or otherwise working directly with employees,
              affiliates or lawyers in a manner intended to interfere with the
              relationship between Vakeel Setu and such persons.
            </span>

            <span>
              If you engage in an impermissible use described above, damages in
              the amount of ₹2,00,000 for each impermissible use, together with
              further damages that may arise from such conduct, may be assessed
              subject to applicable law. Nothing in this provision limits
              Vakeel Setu's right to seek injunctive or other appropriate
              relief.
            </span>

            <span>
              You understand and agree that all information, statistical data,
              text, software, music, sound, photographs, graphics, video,
              messages or other materials, whether publicly posted or privately
              transmitted by Users, are the responsibility of the person from
              whom such content originated. You are responsible for content
              that you upload, post, email or otherwise transmit through the
              Platform.
            </span>

            <span>
              You are prohibited from using any computer worm, virus or other
              device intended or likely to disrupt, overload or otherwise
              impair any part of the Platform. Where such conduct causes
              damage, you may be liable, subject to applicable law, for
              liquidated damages of ₹1,50,000 for each day during which the
              Platform remains damaged, together with other legally recoverable
              losses.
            </span>
          </TermsList>
        </TermsSection>

        {/* =============================================================
            5. USER REGISTRATION
        ============================================================== */}

        <TermsSection
          number="5"
          title="User Registration and Account"
        >
          <p>
            Certain Platform features may require registration. You shall
            provide accurate and updated information while creating your
            account.
          </p>

          <p className="mt-3">
            You are responsible for maintaining the confidentiality of your
            login credentials and for all activities undertaken through your
            account. You shall immediately notify the Company if you become
            aware of unauthorised access to your account.
          </p>

          <p className="mt-3">
            The Company may suspend or restrict an account where it reasonably
            believes that the account has been compromised or is being used in
            violation of these Terms.
          </p>
        </TermsSection>

        {/* =============================================================
            6. LAWYER REGISTRATION
        ============================================================== */}

        <TermsSection
          number="6"
          title="Lawyers Registration and Verification"
        >
          <p>
            Lawyers shall be required to provide information including name,
            professional details, enrolment details, areas of practice, contact
            information and other information reasonably required for
            verification.
          </p>

          <p className="mt-3">
            The Company may conduct reasonable verification procedures but
            does not guarantee the completeness, accuracy or continuing
            validity of information supplied by a Lawyer.
          </p>

          <p className="mt-3">
            Each Lawyer is solely responsible for their credentials, compliance
            with applicable laws and professional standards, and for providing
            accurate information to Clients.
          </p>

          <p className="mt-3">
            A Lawyer shall not represent themselves as qualified to practise in
            a jurisdiction where they are not legally entitled to do so.
          </p>

          <p className="mt-3">
            The Company may suspend or remove a Lawyer's profile where it
            receives credible information concerning misconduct, invalid
            credentials, fraudulent information or violation of applicable law
            or these Terms.
          </p>
        </TermsSection>

        {/* =============================================================
            NOTE: SECTION 7 WAS NOT PRESENT IN PROVIDED TERMS
        ============================================================== */}

        {/* =============================================================
            8. SUBSCRIPTION
        ============================================================== */}

        <TermsSection
          number="8"
          title="Subscription Fees & Refunds"
        >
          <TermsList>
            <span>
              Premium features may require a subscription or purchase of
              credits.
            </span>

            <span>
              Applicable pricing shall be displayed within the Platform.
            </span>

            <span>
              Payments once made are non-refundable except as provided under
              the applicable subscription and refund policy.
            </span>

            <span>
              The Company may revise pricing from time to time at its
              discretion, subject to applicable law.
            </span>
          </TermsList>
        </TermsSection>

        {/* =============================================================
            9. IP RIGHTS
        ============================================================== */}

        <TermsSection
          number="9"
          title="Protection of Intellectual Property Rights"
        >
          <p>
            You agree that the services, including software and information in
            electronic or printed media, may contain trade secrets and other
            proprietary intellectual property belonging to Vakeel Setu or its
            licensors. Such material is protected by applicable intellectual
            property laws and may only be used or accessed as specifically
            permitted under these Terms.
          </p>

          <p className="mt-3">
            You shall not store, copy, modify, rent, lease, loan, sell,
            distribute, transfer, transmit, display, reverse-engineer,
            reverse-assemble or otherwise attempt to discover programming code
            or source code used in or with the services, except to the extent
            expressly permitted by applicable law.
          </p>

          <p className="mt-3">
            You shall not attempt to transfer any right in the services,
            including their software, design and content, create derivative
            works based on them or commercially exploit the services in whole
            or in part without authorisation.
          </p>

          <p className="mt-3">
            Violations of intellectual property rights or these Terms may
            result in action under applicable Indian laws.
          </p>

          <p className="mt-3">
            For the duration of a valid Vakeel Setu account, the User is
            granted a revocable, non-exclusive and non-transferable licence to
            use the services for personal, non-commercial purposes, subject to
            these Terms.
          </p>

          <p className="mt-3">
            Except for User-owned Case Data and other content in which Users
            retain rights under applicable law, Vakeel Setu retains all rights,
            titles and interests in the Platform, services, documentation,
            software, designs, trademarks, service marks and other proprietary
            materials.
          </p>

          <p className="mt-3">
            If you believe material available through the Platform infringes
            your copyright, you may contact us to request appropriate review or
            removal.
          </p>

          <p className="mt-3">
            No part of the Platform materials, including graphics or logos, may
            be copied, photocopied, reproduced, translated or reduced to an
            electronic medium or machine-readable form, in whole or in part,
            without appropriate permission, except where permitted by law.
          </p>
        </TermsSection>

        {/* =============================================================
            10. FEES / CANCELLATION / REFUNDS
        ============================================================== */}

        <TermsSection
          number="10"
          title="Fees, Payment, Cancellation and Refunds Policy"
        >
          <p>
            Certain services may require payment. Applicable fees shall be
            displayed or otherwise communicated before completion of the
            relevant transaction wherever reasonably practicable.
          </p>

          <p className="mt-3">
            Payments may be processed through third-party payment service
            providers. The Company may charge Platform fees, subscription fees
            or other charges as disclosed for the relevant service.
          </p>

          <p className="mt-3">
            Advocates may determine their professional fees subject to
            applicable law and professional rules. Fees payable directly to an
            Advocate for professional services shall be subject to the terms
            applicable to the Advocate-Client engagement.
          </p>

          <SubHeading>
            Cancellation Policy
          </SubHeading>

          <p className="mt-2">
            In the event of cancellation of a paid consultation for which
            payment has been successfully made and a confirmation number has
            been generated, and the consultation has not been concluded due to
            avoidable or unavoidable reasons, the User must notify Vakeel Setu
            in writing through the designated support email address.
          </p>

          <p className="mt-3">
            Cancellation charges, where applicable, will be effective from the
            date on which the cancellation request is received. Cancellation
            should be requested no later than 24 hours before the final
            delivery time or appointment time.
          </p>

          <p className="mt-3">
            The customer service team will endeavour to contact the User within
            7 business days. Where the Lawyer has not delivered the booked
            consultation and the cancellation qualifies for a refund, the
            amount will ordinarily be returned within 15 business days from
            receipt of the cancellation request.
          </p>

          <p className="mt-3">
            A nominal deduction of 10% may be made towards online payment
            processing where applicable. Refunds shall ordinarily be processed
            to the bank account, card or payment method used for the original
            payment.
          </p>

          <SubHeading>
            Refund Policy
          </SubHeading>

          <p className="mt-2">
            If a consultation request is accepted but, after payment, is
            rejected or cancelled due to unexpected or extenuating
            circumstances, the User may be given the option to select another
            consultation or request a refund, as applicable.
          </p>

          <p className="mt-3">
            Eligible refunds shall ordinarily be credited within 15 working
            days.
          </p>

          <p className="mt-3">
            Users should retain the unique transaction ID generated when a
            request is placed, as it may be required to address transaction or
            payment-related issues.
          </p>

          <p className="mt-3">
            Except for circumstances expressly provided under the applicable
            refund policy, refunds are generally not available. In exceptional
            circumstances, the Vakeel Setu team may work with the User to
            identify an appropriate resolution.
          </p>

          <p className="mt-3 font-semibold text-slate-700">
            No refund may be claimed from Vakeel Setu for amounts paid directly
            by a User to a Lawyer.
          </p>
        </TermsSection>

        {/* =============================================================
            11. THIRD PARTY
        ============================================================== */}

        <TermsSection
          number="11"
          title="Third-Party Links, Recommendations and Information"
        >
          <p>
            The Platform may contain links, recommendations and information
            relating to third-party materials that are not owned or controlled
            by Vakeel Setu.
          </p>

          <p className="mt-3">
            Vakeel Setu does not endorse or assume responsibility for
            third-party websites, information, materials, products or services.
          </p>

          <p className="mt-3">
            If you access a third-party website or service, purchase a product
            or service, or engage a third party through information available
            on the Platform, you do so at your own risk. These Terms do not
            govern your independent use of third-party sites, products or
            services.
          </p>
        </TermsSection>

        {/* =============================================================
            12. PRIVACY
        ============================================================== */}

        <TermsSection
          number="12"
          title="Privacy and Data Protection"
        >
          <p>
            Vakeel Setu endeavours to protect your privacy with respect to
            information provided through the Platform. In connection with free
            questions and paid consultations, Users are encouraged to provide
            only the minimum amount of personally identifying information
            reasonably necessary to process the relevant request.
          </p>

          <p className="mt-3">
            Personal information provided to Vakeel Setu, including email
            addresses, shall be processed in accordance with the Privacy Policy
            and applicable law.
          </p>

          <p className="mt-3">
            Access to personal information may be provided to authorised
            personnel where reasonably necessary for Platform administration,
            security, support and service delivery.
          </p>

          <p className="mt-3">
            Information may also be disclosed where necessary:
          </p>

          <TermsList>
            <span>
              To protect the Company, Platform, Users or other persons from
              liability, fraud, abuse or security risks.
            </span>

            <span>
              To respond to lawful legal process or otherwise comply with
              applicable law.
            </span>

            <span>
              To Lawyers or other professionals where reasonably necessary to
              provide a consultation or other service requested by the User.
            </span>
          </TermsList>
        </TermsSection>

        {/* =============================================================
            13. PROHIBITED ACTIVITIES
        ============================================================== */}

        <TermsSection
          number="13"
          title="Prohibited Activities"
        >
          <p>
            Users shall not:
          </p>

          <TermsList>
            <span>
              Use the Platform for any unlawful purpose.
            </span>

            <span>
              Impersonate another person or entity.
            </span>

            <span>
              Provide false professional credentials or misleading
              information.
            </span>

            <span>
              Upload viruses, malware or other malicious software.
            </span>

            <span>
              Attempt to gain unauthorised access to the Platform or another
              User's account.
            </span>

            <span>
              Interfere with Platform security or technical infrastructure.
            </span>

            <span>
              Misuse another User's confidential or personal information.
            </span>

            <span>
              Upload unlawful, infringing or unauthorised material.
            </span>

            <span>
              Use automated systems to scrape, copy or extract Platform content
              without permission.
            </span>

            <span>
              Use the Platform to facilitate fraud, deception or other
              prohibited conduct.
            </span>

            <span>
              Otherwise violate applicable laws or regulations.
            </span>
          </TermsList>
        </TermsSection>

        {/* =============================================================
            14. REVIEWS
        ============================================================== */}

        <TermsSection
          number="14"
          title="Reviews & Rating Disclaimer"
        >
          <SubHeading>
            User-Generated Content
          </SubHeading>

          <p className="mt-2">
            Ratings, reviews and feedback displayed on the Platform represent
            the personal experiences or opinions of individual Users. Vakeel
            Setu does not guarantee the accuracy, completeness or reliability
            of User-generated reviews.
          </p>

          <SubHeading>
            Compliance with Professional Rules
          </SubHeading>

          <p className="mt-2">
            Advocates are subject to applicable professional conduct rules,
            including restrictions relating to advertising and solicitation.
            Reviews and feedback displayed on the Platform are intended for
            informational purposes and should not be construed as an
            advertisement, solicitation or guarantee by an Advocate.
          </p>

          <SubHeading>
            Information Purposes Only
          </SubHeading>

          <p className="mt-2">
            The review section is intended to assist Users in evaluating peer
            experiences. Selection of a legal professional remains the sole
            discretion and responsibility of the User. The Platform does not
            guarantee or promote any particular Advocate solely on the basis of
            reviews or ratings.
          </p>

          <SubHeading>
            No Guarantee of Outcome
          </SubHeading>

          <p className="mt-2">
            Past performance, testimonials, reviews or positive feedback do not
            guarantee, predict or warrant a similar outcome in any future legal
            matter.
          </p>
        </TermsSection>

        {/* =============================================================
            15. NO LEGAL ADVICE
        ============================================================== */}

        <TermsSection
          number="15"
          title="No Legal Advice & Professional Conduct Disclaimer"
        >
          <p>
            The Platform does not itself provide legal representation and does
            not intend to facilitate advertising or solicitation prohibited by
            applicable professional rules.
          </p>

          <p className="mt-3">
            Merely accessing or using the Platform does not, by itself,
            establish an Advocate-Client relationship. General information
            available on the Platform is educational and informational in
            nature and should not be treated as personalised legal advice.
          </p>
        </TermsSection>

        {/* =============================================================
            16. AI
        ============================================================== */}

        <TermsSection
          number="16"
          title="AI Generated Output Disclaimer"
        >
          <p>
            The Platform may use artificial intelligence systems to assist in
            generating legal drafts, research summaries, suggestions,
            analytical insights and other content.
          </p>

          <p className="mt-3">
            While the Company may endeavour to improve the quality of such
            systems, AI-generated output may contain inaccuracies, outdated
            information, errors, omissions or inappropriate suggestions.
          </p>

          <p className="mt-3 font-semibold text-slate-700">
            Users must independently review and verify AI-generated content
            before relying on or using it.
          </p>

          <p className="mt-3">
            Automated output does not constitute legal advice, a legal opinion
            or professional guidance, and the Company disclaims liability for
            reliance placed solely on AI-generated material to the extent
            permitted by applicable law.
          </p>
        </TermsSection>

        {/* =============================================================
            17. ACCURACY
        ============================================================== */}

        <TermsSection
          number="17"
          title="Accuracy and Limitation of Liability"
        >
          <p>
            The Platform is provided on an “as is” and “as available” basis.
            The Company does not warrant:
          </p>

          <TermsList>
            <span>
              The accuracy of judgments, statutes, analytics or drafts.
            </span>

            <span>
              The completeness or reliability of information.
            </span>

            <span>
              Real-time updating of all legal or Platform information.
            </span>

            <span>
              The suitability of content for a specific case or legal matter.
            </span>
          </TermsList>

          <p className="mt-4">
            To the extent permitted by applicable law, the Company, its
            affiliates, developers and partners shall not be liable for losses
            arising solely from:
          </p>

          <TermsList>
            <span>
              Loss of data.
            </span>

            <span>
              Loss of business, revenue or professional opportunity.
            </span>

            <span>
              Technical failures, downtime or system errors.
            </span>

            <span>
              Reliance on information without appropriate independent
              verification.
            </span>
          </TermsList>

          <p className="mt-3">
            Use of the Platform is at the User's own risk, subject always to
            rights and remedies that cannot lawfully be excluded.
          </p>
        </TermsSection>

        {/* =============================================================
            18. LAWYER RESPONSIBILITY
        ============================================================== */}

        <TermsSection
          number="18"
          title="Independent Professional Responsibility of Lawyer"
        >
          <p>
            Each Lawyer is an independent legal professional and is responsible
            for the legal services, advice, opinions, documents and
            representations provided by them.
          </p>

          <p className="mt-3">
            Nothing in these Terms shall be construed as creating an
            employer-employee relationship, partnership, agency, joint venture
            or other similar relationship between the Company and a Lawyer,
            except where expressly agreed in writing.
          </p>

          <p className="mt-3">
            Lawyers shall independently exercise their professional judgment
            and comply with applicable professional conduct requirements.
          </p>
        </TermsSection>

        {/* =============================================================
            19. CLIENT RESPONSIBILITIES
        ============================================================== */}

        <TermsSection
          number="19"
          title="Client Responsibilities"
        >
          <p>
            Clients shall provide complete and accurate information to the
            Lawyer and the Platform.
          </p>

          <p className="mt-3">
            Clients shall promptly provide documents, instructions and
            information reasonably required for the requested services.
          </p>

          <p className="mt-3">
            The Client acknowledges that incomplete, inaccurate or misleading
            information may adversely affect legal advice, document preparation
            or case management.
          </p>
        </TermsSection>

        {/* =============================================================
            20. NO GUARANTEE
        ============================================================== */}

        <TermsSection
          number="20"
          title="No Guarantee for Legal Outcome"
        >
          <p>
            The Company does not guarantee any particular result in a case,
            transaction, dispute, application, negotiation or legal
            proceeding.
          </p>

          <p className="mt-3">
            Any statement regarding a possible legal outcome, success rate,
            strategy or expected result made by a Lawyer represents that
            Lawyer's professional assessment and does not constitute a
            guarantee by the Company.
          </p>
        </TermsSection>

        {/* =============================================================
            21. COMMUNICATIONS
        ============================================================== */}

        <TermsSection
          number="21"
          title="Communications Between Users"
        >
          <p>
            The Platform may facilitate communication between Lawyers and
            Clients. Users are responsible for the content of their
            communications.
          </p>

          <p className="mt-3">
            The Company may retain communication records where reasonably
            necessary for security, dispute resolution, service delivery and
            legal compliance, subject to the Privacy Policy and applicable
            law.
          </p>
        </TermsSection>

        {/* =============================================================
            22. AVAILABILITY
        ============================================================== */}

        <TermsSection
          number="22"
          title="Platform Availability"
        >
          <p>
            The Company will endeavour to keep the Platform operational but
            does not guarantee uninterrupted or error-free availability.
          </p>

          <p className="mt-3">
            The Platform may occasionally be unavailable because of
            maintenance, upgrades, technical failures, security incidents,
            network problems or circumstances beyond the Company's reasonable
            control.
          </p>
        </TermsSection>

        {/* =============================================================
            23. WARRANTIES
        ============================================================== */}

        <TermsSection
          number="23"
          title="Disclaimer of Warranties"
        >
          <p>
            You expressly understand and agree that use of the Platform is at
            your sole risk. All content and services on the Platform are
            provided on an “as is” and “as available” basis.
          </p>

          <p className="mt-3">
            To the extent permitted by applicable law, Vakeel Setu disclaims
            warranties of any kind, whether express or implied, including
            warranties relating to merchantability, satisfactory quality,
            fitness for a particular purpose and non-infringement.
          </p>

          <p className="mt-3">
            Neither Vakeel Setu nor its licensors or affiliates guarantees that
            any Lawyer or professional will obtain a favourable result for a
            User.
          </p>

          <p className="mt-3">
            We do not guarantee the accuracy or completeness of all content or
            services or that services associated with the Platform will always
            be uninterrupted, error-free or continuously available.
          </p>

          <p className="mt-3">
            Material downloaded or otherwise obtained through use of the
            Platform is accessed at the User's discretion and risk. Users are
            responsible for maintaining appropriate device, data and security
            protections.
          </p>

          <p className="mt-3">
            No oral or written information obtained from the Company or through
            the Platform shall create a warranty that is not expressly stated
            in these Terms.
          </p>
        </TermsSection>

        {/* =============================================================
            24. LIMITATION
        ============================================================== */}

        <TermsSection
          number="24"
          title="Limitation of Liability"
        >
          <p>
            To the maximum extent permitted by applicable law, the Company
            shall not be liable for indirect, incidental, consequential,
            special or punitive damages, loss of profits, or losses arising
            from reliance on AI-generated content or independent third-party
            professional services.
          </p>

          <p className="mt-3">
            Subject to applicable law, the aggregate liability of the Company
            arising out of or relating to the Platform shall not exceed the
            amount actually paid by the concerned User to the Company for the
            specific service giving rise to the claim during the six months
            preceding the event giving rise to such claim.
          </p>
        </TermsSection>

        {/* =============================================================
            25. INDEMNIFICATION
        ============================================================== */}

        <TermsSection
          number="25"
          title="Indemnification"
        >
          <p>
            To the extent permitted by applicable law, you agree to defend,
            indemnify and hold harmless Vakeel Setu and its affiliates from
            demands, liabilities, claims, losses and reasonable expenses,
            including legal fees, arising from your breach of these Terms,
            misuse of the services, violation of applicable law or infringement
            of another person's intellectual property or proprietary rights.
          </p>

          <p className="mt-3">
            Where a third-party claim arises in connection with your conduct,
            Vakeel Setu may request reasonable cooperation and written
            assurances relating to your indemnification obligations.
          </p>

          <p className="mt-3">
            To the maximum extent permitted by law, Vakeel Setu and its
            affiliates shall not be liable for indirect, incidental, special,
            punitive or consequential damages resulting from use of or
            inability to use the Platform, including damages arising from
            interruptions, errors, defects, delays, unauthorised access or
            failures beyond reasonable control.
          </p>

          <p className="mt-3">
            Any limitation or exclusion in these Terms applies only to the
            extent permitted by the law applicable to the relevant User and
            claim.
          </p>
        </TermsSection>

        {/* =============================================================
            26. SUSPENSION
        ============================================================== */}

        <TermsSection
          number="26"
          title="Suspension and Termination"
        >
          <SubHeading>
            Suspension by Company
          </SubHeading>

          <p className="mt-2">
            The Company may, at its discretion and to the extent permitted by
            applicable law, temporarily suspend, restrict or disable a User's
            access to the Platform or any part thereof, with or without prior
            notice, where the Company reasonably believes that:
          </p>

          <NumberedTermsList>
            <span>
              The User has violated or is likely to violate these Terms or an
              applicable policy.
            </span>

            <span>
              The User has provided false, inaccurate, misleading, incomplete
              or fraudulent information.
            </span>

            <span>
              The User has engaged in unlawful, fraudulent, abusive or
              unauthorised activities.
            </span>

            <span>
              The User has misused the Platform, another User's account,
              confidential information, documents or data.
            </span>

            <span>
              The User's conduct may adversely affect the security, integrity,
              reputation or operation of the Platform or may cause harm to
              another User.
            </span>

            <span>
              A Lawyer's professional credentials, enrolment, licence or
              eligibility to provide legal services are found to be invalid,
              suspended, expired or subject to a credible professional or legal
              concern.
            </span>

            <span>
              The User has failed to make a payment that is due and payable.
            </span>

            <span>
              Suspension is necessary to comply with applicable law, a court
              order, governmental direction or a request from a competent
              authority.
            </span>

            <span>
              The Company reasonably considers suspension necessary for the
              security and protection of the Platform or its Users.
            </span>
          </NumberedTermsList>

          <SubHeading>
            Immediate Suspension
          </SubHeading>

          <p className="mt-2">
            Where the Company reasonably believes that continued access may
            result in fraud, security risk, unlawful activity, misuse of
            confidential information or harm to the Platform, it may suspend
            access immediately without prior notice, subject to applicable law.
          </p>

          <SubHeading>
            Termination by the User
          </SubHeading>

          <p className="mt-2">
            A User may terminate their account by following the account closure
            procedure available on the Platform or by contacting the Company
            through the designated contact details. Termination shall not
            release the User from payment or other obligations accrued before
            termination.
          </p>

          <SubHeading>
            Effect of Suspension or Termination
          </SubHeading>

          <TermsList>
            <span>
              The User's right to access affected Platform features may
              immediately cease.
            </span>

            <span>
              The Company may restrict access to the User's account and
              Platform features.
            </span>

            <span>
              The User remains responsible for amounts payable for services
              obtained before termination.
            </span>

            <span>
              Termination does not affect rights, remedies, obligations or
              liabilities accrued before termination.
            </span>

            <span>
              Provisions intended by their nature to survive termination,
              including confidentiality, intellectual property, limitation of
              liability, indemnification, dispute resolution and governing law,
              shall continue to apply.
            </span>
          </TermsList>

          <SubHeading>
            Case Data and Documents after Termination
          </SubHeading>

          <p className="mt-2">
            Subject to applicable law and the Company's Privacy Policy, the
            Company may retain, delete, archive or otherwise process User
            Content, Legal Documents, Case Data, communications and other
            information following suspension or termination.
          </p>

          <p className="mt-3">
            Where reasonably practicable, the Company may provide the User an
            opportunity to access or download Case Data and documents before
            permanent deletion, subject to retention requirements, security
            considerations and technical limitations.
          </p>
        </TermsSection>

        {/* =============================================================
            27. DISPUTE RESOLUTION
        ============================================================== */}

        <TermsSection
          number="27"
          title="Dispute Resolution"
        >
          <SubHeading>
            Amicable Resolution
          </SubHeading>

          <p className="mt-2">
            In the event of any dispute, controversy, claim or difference
            arising out of or in connection with these Terms, the Platform or
            services provided through the Platform, the concerned User shall
            first notify the Company in writing and provide reasonable details
            of the dispute.
          </p>

          <p className="mt-3">
            The Company and the User shall make reasonable efforts to resolve
            the dispute amicably and in good faith within 30 days from receipt
            of such notice.
          </p>

          <SubHeading>
            Arbitration
          </SubHeading>

          <p className="mt-2">
            If a dispute is not resolved amicably within the period above, and
            to the extent that such dispute is legally capable of being
            referred to arbitration, it shall be referred to and finally
            resolved by arbitration in accordance with the Arbitration and
            Conciliation Act, 1996, as amended from time to time.
          </p>

          <p className="mt-3">
            The arbitration shall be conducted by a sole arbitrator mutually
            appointed by the parties. If the parties fail to agree upon the
            appointment, the arbitrator shall be appointed in accordance with
            applicable law.
          </p>

          <p className="mt-3">
            The seat and venue of arbitration shall be Noida, Uttar Pradesh,
            India, unless otherwise agreed in writing by the parties. The
            language of the arbitration proceedings shall be English.
          </p>

          <SubHeading>
            Interim and Urgent Relief
          </SubHeading>

          <p className="mt-2">
            Nothing in this clause prevents either party from seeking interim,
            injunctive or other urgent relief from a court of competent
            jurisdiction where necessary to protect rights, confidential
            information, intellectual property, data, security or other
            legitimate interests, subject to applicable law.
          </p>

          <SubHeading>
            Finality of Arbitration
          </SubHeading>

          <p className="mt-2">
            Subject to applicable law, the arbitral award shall be final and
            binding upon the parties and may be enforced in accordance with
            applicable law.
          </p>
        </TermsSection>

        {/* =============================================================
            28. GOVERNING LAW
        ============================================================== */}

        <TermsSection
          number="28"
          title="Governing Law and Jurisdiction"
        >
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of India.
          </p>

          <p className="mt-3">
            Subject to the dispute resolution and arbitration provisions above,
            courts of competent jurisdiction at Noida, Uttar Pradesh, India
            shall have jurisdiction over disputes arising from or relating to
            these Terms or the Platform, subject to applicable law.
          </p>

          <p className="mt-3">
            Any contractual limitation period stated in these Terms shall apply
            only to the extent legally enforceable and shall not restrict any
            statutory right or limitation period that cannot lawfully be
            excluded or shortened.
          </p>
        </TermsSection>

        {/* =============================================================
            29. GRIEVANCE
        ============================================================== */}

        <TermsSection
          number="29"
          title="Grievance Redressal"
        >
          <p>
            Users may submit complaints, concerns or grievances through the
            grievance contact details made available by the Company.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2">
              <p>
                <strong>Grievance Officer:</strong> To be updated
              </p>

              <p>
                <strong>Email:</strong> info@vakeelsetu.in
              </p>

              <p>
                <strong>Address:</strong> D-60, D Block, Sector 63, Noida,
                Uttar Pradesh, 201309
              </p>

              <p>
                <strong>Contact:</strong> +91 9718494494
              </p>
            </div>
          </div>

          <p className="mt-3">
            The Company shall endeavour to address grievances in accordance
            with applicable law and its internal grievance procedures.
          </p>
        </TermsSection>

        {/* =============================================================
            30. NOTICE
        ============================================================== */}

        <TermsSection
          number="30"
          title="Notice"
        >
          <p>
            Notices to the Company shall be sent to its registered office or
            designated email address specified on the Platform.
          </p>

          <p className="mt-3">
            The Company may provide notices to Users through email, Platform
            notifications, account dashboards or other reasonable electronic
            means.
          </p>
        </TermsSection>

        {/* =============================================================
            31. FORCE MAJEURE
        ============================================================== */}

        <TermsSection
          number="31"
          title="Force Majeure"
        >
          <p>
            The Company shall not be liable for failure or delay caused by
            events beyond its reasonable control, including natural disasters,
            governmental actions, war, civil disturbances, telecommunications
            failures, cyber incidents, widespread technical failures, strikes,
            epidemics or failures of third-party infrastructure.
          </p>
        </TermsSection>

        {/* =============================================================
            32. SEVERABILITY
        ============================================================== */}

        <TermsSection
          number="32"
          title="Severability"
        >
          <p>
            If any provision of these Terms is held invalid, illegal or
            unenforceable, such provision shall be modified or severed to the
            minimum extent necessary, and the remaining provisions shall
            continue in full force and effect.
          </p>
        </TermsSection>

        {/* =============================================================
            33. WAIVER
        ============================================================== */}

        <TermsSection
          number="33"
          title="Waiver"
        >
          <p>
            Failure by the Company to enforce any provision of these Terms
            shall not constitute a waiver of its right to enforce that
            provision in the future.
          </p>
        </TermsSection>

        {/* =============================================================
            34. ASSIGNMENT
        ============================================================== */}

        <TermsSection
          number="34"
          title="Assignment"
        >
          <p>
            The Company may assign these Terms to a parent, subsidiary,
            affiliated company or as part of a sale, merger, restructuring or
            other transfer of the Company's business, subject to applicable
            law.
          </p>

          <p className="mt-3">
            Where appropriate, notice of a material change of ownership may be
            provided through the Platform so that Users may decide whether to
            continue using the services.
          </p>

          <p className="mt-3">
            You may not assign, transfer or sublicense your rights or
            obligations under these Terms without appropriate written
            permission from the Company, except where applicable law provides
            otherwise.
          </p>
        </TermsSection>

        {/* =============================================================
            35. ENTIRE AGREEMENT
        ============================================================== */}

        <TermsSection
          number="35"
          title="Entire Agreement"
        >
          <p>
            These Terms and Conditions, together with the Privacy Policy and
            any additional policies or service-specific terms expressly
            incorporated by reference, represent the agreement between you and
            Vakeel Setu concerning your use of the Platform and supersede prior
            communications concerning the same subject matter.
          </p>

          <p className="mt-3">
            These Terms commence when you access or use the Platform.
          </p>

          <p className="mt-3">
            Access may be suspended or terminated where you or an authorised
            person using your account fails to comply with these Terms or
            applicable Platform rules.
          </p>

          <p className="mt-3">
            The Company may also suspend or cancel registration for other
            legitimate reasons, including extended inactivity, security
            concerns or discontinuation of services, subject to applicable law
            and reasonable notice where appropriate.
          </p>

          <p className="mt-3">
            Following termination, you must cease unauthorised access to or use
            of Platform materials. The Company may process or delete
            information in accordance with its Privacy Policy, retention
            obligations and applicable law.
          </p>

          <p className="mt-3">
            If any provision is determined to be invalid or unenforceable, the
            remaining provisions shall continue to apply, and the affected
            provision may be reformed to the minimum extent reasonably
            necessary to make it enforceable.
          </p>

          <p className="mt-3">
            Failure by either party to exercise a right under these Terms shall
            not automatically constitute a waiver of that right.
          </p>

          <p className="mt-3">
            Your affirmative act of using or registering for the Platform may
            constitute your electronic acceptance of these Terms and the
            Privacy Policy, subject to applicable law.
          </p>
        </TermsSection>

        {/* =============================================================
            36. AMENDMENTS
        ============================================================== */}

        <TermsSection
          number="36"
          title="Amendments"
        >
          <p>
            We may revise these Terms from time to time and will make the
            current version available through the Platform.
          </p>

          <p className="mt-3">
            Where required by applicable law, material changes may be notified
            to Users through appropriate means.
          </p>

          <p className="mt-3">
            By continuing to use or access the services after revised Terms
            become effective, you agree to be bound by those revised Terms to
            the extent permitted by applicable law.
          </p>

          <p className="mt-3">
            Users are encouraged to periodically review these Terms. Questions
            or concerns may be submitted through the Help or Contact channels
            available on the Platform.
          </p>
        </TermsSection>

        {/* =============================================================
            37. COMMUNICATION CLAUSE
        ============================================================== */}

        <TermsSection
          number="37"
          title="Communication Clause"
        >
          <p>
            Official communications intended for the Company should be directed
            through the contact details published on the Platform.
          </p>

          <p className="mt-3">
            Unless expressly acknowledged by the Company, social media
            messages, personal messages or other unofficial communication
            channels should not be treated as formal service of legal notices.
          </p>
        </TermsSection>

        {/* =============================================================
            38. CONTACT INFORMATION
        ============================================================== */}

        <TermsSection
          number="38"
          title="Contact Information"
        >
          <p>
            For questions regarding these Terms, Users may contact:
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2">
              <p>
                <strong>Vakeel Setu</strong>
              </p>

              <p>
                Operated by:{" "}
                <strong>Techvunex Innovations</strong>
              </p>

              <p>
                Registered Office: D-60, D Block, Sector 63, Noida, Uttar
                Pradesh, 201309
              </p>

              <p>
                Email:{" "}
                <strong>info@vakeelsetu.in</strong>
              </p>

              <p>
                Phone:{" "}
                <strong>+91 9718494494</strong>
              </p>

              <p>
                Website:{" "}
                <strong>Vakeelsetu.in</strong>
              </p>
            </div>
          </div>
        </TermsSection>

        {/* =============================================================
            39. ACKNOWLEDGMENT
        ============================================================== */}

        <TermsSection
          number="39"
          title="Acknowledgment"
        >
          <p>
            By using the Platform, the User/Client acknowledges that they
            understand the risks and benefits associated with online
            consultations and accepts the limitations associated with use of
            Vakeel Setu.
          </p>

          <p className="mt-3">
            The User understands that no warranty or guarantee has been made
            concerning any consultation, legal problem, result or solution to a
            query or matter.
          </p>

          <p className="mt-3">
            The User understands that laws and contractual obligations
            concerning privacy and confidentiality apply to information
            processed through the Platform and that such information shall be
            handled in accordance with Vakeel Setu's Terms, Privacy Policy and
            applicable law.
          </p>

          <p className="mt-3">
            The User understands that consultation through Vakeel Setu may
            involve electronic communication of personal or case-related
            information to Lawyers or professionals who may be located in
            another city, state or jurisdiction where appropriate for the
            requested service.
          </p>

          <p className="mt-3">
            Where the User expressly opts in to receive communications from the
            Company, the User consents to receiving relevant service,
            transactional or permitted commercial communications through the
            contact details provided by the User, subject to applicable
            telecommunications, privacy and consent requirements.
          </p>

          <p className="mt-3">
            Users may withdraw consent for optional promotional communications
            using the unsubscribe, preference or other opt-out mechanisms made
            available by the Company, without affecting communications that are
            necessary for account security, transactions or service delivery.
          </p>

          <p className="mt-3 font-bold text-slate-800">
            If you do not agree to these Terms and Conditions or the Privacy
            Policy, please refrain from using the Platform.
          </p>
        </TermsSection>
      </div>

      {/* ===============================================================
          FINAL CONTACT CARD
      ================================================================ */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
          Contact Information
        </p>

        <h3 className="mt-2 text-base font-black text-slate-950">
          Vakeel Setu
        </h3>

        <div className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
          <p>
            Operated by:{" "}
            <strong>Techvunex Innovations</strong>
          </p>

          <p>
            Registered Office: D-60, D Block, Sector 63, Noida, Uttar Pradesh,
            201309
          </p>

          <p>
            Email:{" "}
            <strong>info@vakeelsetu.in</strong>
          </p>

          <p>
            Phone:{" "}
            <strong>+91 9718494494</strong>
          </p>

          <p>
            Website:{" "}
            <strong>Vakeelsetu.in</strong>
          </p>
        </div>
      </div>
    </article>
  );
};

export default TermsAndConditionsContent;