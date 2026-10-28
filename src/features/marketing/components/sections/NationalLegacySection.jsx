import { useState } from "react";
import { Award, Check, ChevronDown, Scale, Sparkles, Calendar } from "lucide-react";

import RevealOnScroll from "../common/RevealOnScroll";
import { PAGE_CONTAINER } from "../../data/dashboardData";

import gandhiImg from "@/assets/home/figures/mahatma-gandhi.jpg";
import patelImg from "@/assets/home/figures/sardar-patel.jpg";
import ambedkarImg from "@/assets/home/figures/dr-br-ambedkar.jpg";
import modiImg from "@/assets/home/figures/pm-narendra-modi.jpg";

const LEGACY_FIGURES = [
  {
    id: "mahatma-gandhi",
    name: "Mahatma Gandhi ji",
    badge: "Barrister-at-Law & Father of the Nation",
    period: "1869 – 1948",
    image: gandhiImg,
    imageAlt: "Historical portrait of Mahatma Gandhi",
    quickFacts: [
      { label: "Born", value: "2 October 1869" },
      { label: "Birthplace", value: "Porbandar, Gujarat" },
      { label: "Died", value: "30 January 1948 (Aged 78)" },
      { label: "Father", value: "Karamchand Uttamchand Gandhi" },
      { label: "Mother", value: "Putlibai Gandhi" },
    ],
    introHeadline: "Pioneer of Moral Jurisprudence & Mass Non-Violent Resistance",
    intro:
      "London-trained barrister who mobilized non-violent civil resistance and moral jurisprudence to lead India's national independence movement.",
    contributions: [
      {
        title: "Bar at Inner Temple & South Africa Civil Rights",
        detail:
          "Called to the Bar at the Inner Temple in London (1891), practicing in Bombay and South Africa, where he spent over two decades litigating civil rights and racial equality cases for disenfranchised Indian and African communities.",
      },
      {
        title: "Satyagraha as Constitutional Jurisprudence",
        detail:
          "Pioneered Satyagraha (truth-force and non-violent defiance) as a principled legal and constitutional doctrine to challenge discriminatory colonial statutes such as the Asiatic Registration Act.",
      },
      {
        title: "Advocacy Ethics & Dispute Mediation",
        detail:
          "Promoted legal ethics grounded in mediation and dispute resolution, famously advocating that the primary duty of an advocate is to bring separated parties together rather than prolong court battles.",
      },
      {
        title: "Historic Mass Campaigns for Self-Rule",
        detail:
          "Led defining mass campaigns—including the Champaran Satyagraha (1917), Salt March (1930), and Quit India Movement (1942)—establishing peaceful non-cooperation as a tool for constitutional sovereignty.",
      },
    ],
    interestingFacts: [
      "Over his 20+ years of legal practice in South Africa, he settled hundreds of commercial and civil cases through out-of-court arbitration, famously noting: 'I realized that the true function of a lawyer was to unite parties driven asunder.'",
      "He was enrolled as an Advocate of the Bombay High Court in 1891 and subsequently admitted to the Supreme Court of the Transvaal in Johannesburg in 1903.",
      "Nominated five times for the Nobel Peace Prize between 1937 and 1948; decades later in 1989 and 2006, the Nobel Committee publicly expressed regret for having never conferred the peace prize upon him.",
    ],
  },
  {
    id: "sardar-patel",
    name: "Sardar Vallabhbhai Patel ji",
    badge: "Barrister-at-Law & First Deputy PM",
    period: "1875 – 1950",
    image: patelImg,
    imageAlt: "Historical portrait of Sardar Vallabhbhai Patel",
    quickFacts: [
      { label: "Born", value: "31 October 1875" },
      { label: "Birthplace", value: "Nadiad, Gujarat" },
      { label: "Died", value: "15 December 1950 (Aged 75)" },
      { label: "Father", value: "Jhaverbhai Patel" },
      { label: "Mother", value: "Ladba Patel" },
    ],
    introHeadline: "Architect of National Integration & Modern Civil Administration",
    intro:
      "Middle Temple barrister and India's first Deputy Prime Minister who unified over 560 princely states into a single sovereign constitutional republic.",
    contributions: [
      {
        title: "Middle Temple Barrister & Criminal Defense",
        detail:
          "Qualified as a barrister at Middle Temple, London in 1913, establishing a distinguished criminal defense practice in Ahmedabad recognized for procedural precision and incisive cross-examination.",
      },
      {
        title: "Agrarian Legal Agitations",
        detail:
          "Led landmark agrarian legal agitations including the Kheda Satyagraha (1918) and Bardoli Satyagraha (1928), securing judicial tax reductions and shielding cultivators from unlawful property seizures.",
      },
      {
        title: "Constitutional Integration of 565 Princely States",
        detail:
          "Served as independent India's first Deputy Prime Minister and first Minister of Home Affairs, orchestrating the peaceful constitutional integration of 565 princely states into the Indian Union via the Instrument of Accession.",
      },
      {
        title: "Founder of All India Services (IAS/IPS)",
        detail:
          "Created the institutional structure of the modern All India Services (IAS and IPS) under Article 312 of the Constitution, constitutionally enshrining permanent civil services to safeguard governance and the rule of law.",
      },
    ],
    interestingFacts: [
      "Passed the rigorous Middle Temple bar examinations in London in just 36 months, finishing top of his class with a £50 prize despite having had no formal university degree prior to studying law.",
      "In 1909, while cross-examining a key witness in a murder trial in Anand, he received a telegram informing him that his wife had passed away. He read it, slipped it into his pocket, completed the cross-examination to secure an acquittal, and only disclosed the news after court adjourned.",
      "Persuaded and secured signed Instruments of Accession from 565 autonomous princely states in under two years, integrating over 28% of the subcontinent's population into a unified constitutional republic without a civil war.",
    ],
  },
  {
    id: "dr-br-ambedkar",
    name: "Dr. B. R. Ambedkar",
    badge: "Chief Architect of the Constitution & First Law Minister",
    period: "1891 – 1956",
    image: ambedkarImg,
    imageAlt: "Historical portrait of Dr. B. R. Ambedkar",
    quickFacts: [
      { label: "Born", value: "14 April 1891" },
      { label: "Birthplace", value: "Mhow, Central India Agency (MP)" },
      { label: "Died", value: "6 December 1956 (Aged 65)" },
      { label: "Father", value: "Ramji Maloji Sakpal" },
      { label: "Mother", value: "Bhimabai Sakpal" },
    ],
    introHeadline: "Principal Architect of the Constitution & Champion of Equal Rights",
    intro:
      "Eminent jurist and constitutional scholar who led the drafting of the Constitution of India and codified legal guarantees of human equality.",
    contributions: [
      {
        title: "Gray's Inn Barrister & High Court Practice",
        detail:
          "Called to the Bar at Gray's Inn, London (1923), alongside doctorates from Columbia University and the London School of Economics, practicing extensively before the Bombay High Court.",
      },
      {
        title: "Drafting the Constitution of India",
        detail:
          "Chaired the Drafting Committee of the Constituent Assembly (1947–1950), authoring the Constitution of India and establishing fundamental rights, universal adult suffrage, and an independent judiciary.",
      },
      {
        title: "Article 32 & Constitutional Remedies",
        detail:
          "Enshrined Article 32, designating the right to constitutional remedies as the 'heart and soul of the Constitution,' ensuring fundamental rights remain legally enforceable for every citizen.",
      },
      {
        title: "First Law Minister & Hindu Code Reform",
        detail:
          "Served as independent India's first Minister of Law and Justice; drafted and championed the Hindu Code Bills to reform personal civil laws, securing statutory property inheritance and divorce rights for women across India.",
      },
    ],
    interestingFacts: [
      "Maintained a renowned personal library of over 50,000 books at his residence 'Rajgriha' in Bombay, and reportedly read and researched 18–20 hours a day during the constitutional drafting period.",
      "Was the first Indian to pursue a doctorate in Economics abroad, earning doctorates from Columbia University (Ph.D., 1917) and the London School of Economics (D.Sc., 1923), alongside his Gray's Inn barrister qualification.",
      "The foundational framework and guidelines for the Reserve Bank of India (RBI) were established in 1935 following the principles presented in his 1923 doctoral thesis, 'The Problem of the Rupee: Its Origin and Its Solution'.",
    ],
  },
  {
    id: "pm-narendra-modi",
    name: "Prime Minister Narendra Modi",
    badge: "14th Prime Minister of the Republic of India",
    period: "In Office: 2014 – Present",
    image: modiImg,
    imageAlt: "Official portrait of Prime Minister Narendra Modi",
    quickFacts: [
      { label: "Born", value: "17 September 1950" },
      { label: "Birthplace", value: "Vadnagar, Gujarat" },
      { label: "Public Office", value: "Prime Minister (2014 – Present)" },
      { label: "Father", value: "Damodardas Mulchand Modi" },
      { label: "Mother", value: "Heeraben Modi" },
    ],
    introHeadline: "Statutory Law Modernization & Nationwide Judicial Digitization",
    intro:
      "Fourteenth Prime Minister of India, presiding over comprehensive statutory modernizations and national legal digitization initiatives.",
    contributions: [
      {
        title: "Codification of New Criminal Statutes",
        detail:
          "Enacted the replacement of colonial-era penal codes with updated statutory legislation—the Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam.",
      },
      {
        title: "Repeal of 1,500+ Archaic Acts",
        detail:
          "Oversaw the legislative repeal of more than 1,500 obsolete, archaic Acts through systematic Repealing and Amending legislation to reduce regulatory compliance complexity.",
      },
      {
        title: "Phase III e-Courts Mission Mode Project",
        detail:
          "Advanced nationwide legal technology infrastructure through the ongoing rollout of Phase III of the e-Courts Mission Mode Project (sanctioned ₹7,210 crore) and expanded virtual court hearings.",
      },
      {
        title: "Expanding Citizen Access to Legal Aid",
        detail:
          "Institutionalized nationwide pre-litigation advice and pro bono legal aid networks—including Tele-Law and Nyaya Bandhu—under the Ministry of Law and Justice.",
      },
    ],
    interestingFacts: [
      "He is the first Prime Minister of the Republic of India to be born in post-independence India (born 17 September 1950, shortly after the Constitution of India came into effect).",
      "Prior to assuming the prime ministership in May 2014, he served as the Chief Minister of Gujarat from October 2001 to May 2014, making him the longest-serving head of government in that state.",
      "The repeal of more than 1,500 redundant colonial and pre-independence Central statutes under his administration represents the largest systematic statutory cleanup in modern Indian legislative history.",
    ],
  },
];

const NationalLegacySection = () => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="national-legacy"
      aria-labelledby="national-legacy-heading"
      className="relative overflow-hidden bg-slate-900 py-16 sm:py-20 lg:py-28"
    >
      {/* Background ambient lighting matching HeroSection */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-[10%] top-[8%] h-[55%] w-[55%] rounded-full bg-amber-500/5 blur-[130px]" />
        <div className="absolute -right-[10%] top-[45%] h-[55%] w-[50%] rounded-full bg-blue-600/5 blur-[140px]" />
        <div className="absolute left-[25%] bottom-[5%] h-[40%] w-[45%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className={`relative z-10 ${PAGE_CONTAINER}`}>
        {/* Section Header */}
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <Award className="size-3.5 shrink-0" aria-hidden="true" />
              National Legacy & Jurisprudence
            </div>

            <h2
              id="national-legacy-heading"
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Architects of{" "}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Justice & the Nation
              </span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Honouring the foundational figures and constitutional stewards who
              shaped Indian law, civil liberties, and the enduring rule of law.
            </p>
          </div>
        </RevealOnScroll>

        {/* Figures Rows */}
        <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24 lg:mt-24 lg:space-y-28">
          {LEGACY_FIGURES.map((figure, index) => {
            const isPhotoLeftOnDesktop = index % 2 === 0;
            const isExpanded = Boolean(expandedIds[figure.id]);
            const primaryContributions = figure.contributions.slice(0, 2);
            const secondaryContributions = figure.contributions.slice(2);

            return (
              <RevealOnScroll key={figure.id} delay={index * 50}>
                <article
                  className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16"
                  aria-labelledby={`figure-title-${figure.id}`}
                >
                  {/* Photo Column:
                      On mobile (< lg): order-1 puts photo on top.
                      On desktop (>= lg): alternates order-1 / order-2 with sticky positioning so photo stays visible alongside content.
                  */}
                  <div
                    className={`order-1 flex flex-col lg:col-span-5 ${
                      isPhotoLeftOnDesktop ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="group relative mx-auto flex w-full max-w-[380px] flex-col sm:max-w-[420px] lg:max-w-none lg:sticky lg:top-28">
                      {/* Subtle ambient border glow */}
                      <div
                        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-800/40 to-slate-900/60 opacity-60 blur-md transition duration-700 group-hover:opacity-100"
                        aria-hidden="true"
                      />

                      {/* Framed photo container */}
                      <div className="relative flex w-full flex-col rounded-2xl p-1 bg-gradient-to-b from-amber-500/30 via-slate-700/40 to-slate-800/80 shadow-2xl shadow-slate-950/80 sm:rounded-3xl">
                        <div className="relative h-[290px] w-full overflow-hidden rounded-[14px] bg-slate-950 sm:h-[350px] sm:rounded-[22px] lg:h-[460px] xl:h-[500px]">
                          <img
                            src={figure.image}
                            alt={figure.imageAlt}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition duration-700 ease-out group-hover:scale-[1.02]"
                          />

                          {/* Dark edge gradient overlay blending into section background */}
                          <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30"
                            aria-hidden="true"
                          />

                          {/* Soft inner amber/slate ring */}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-[14px] sm:rounded-[22px] ring-1 ring-inset ring-amber-500/20"
                            aria-hidden="true"
                          />

                          {/* Bottom metadata pill: Name & Period */}
                          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Column:
                      On mobile (< lg): order-2 places text below photo.
                      On desktop (>= lg): alternates order-2 / order-1.
                  */}
                  <div
                    className={`order-2 flex flex-col justify-start lg:col-span-7 ${
                      isPhotoLeftOnDesktop ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="flex flex-col space-y-5 sm:space-y-6">
                      {/* Top Header: Badge, Name & Lifespan */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            <Award className="size-3 text-amber-400" aria-hidden="true" />
                            {figure.badge}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                            <Calendar className="size-3 text-amber-400/80" aria-hidden="true" />
                            {figure.period}
                          </span>
                        </div>

                        <h3
                          id={`figure-title-${figure.id}`}
                          className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight"
                        >
                          {figure.name}
                        </h3>
                      </div>

                      {/* Quick Facts Strip (Compact, Scannable Grid) */}
                      <div>
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Biographical Facts
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {figure.quickFacts.map((fact) => (
                            <div
                              key={fact.label}
                              className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5 backdrop-blur-xs transition duration-300 hover:border-amber-500/30"
                            >
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {fact.label}
                              </span>
                              <span className="mt-0.5 block text-xs font-medium text-slate-200 sm:text-[13px] leading-snug">
                                {fact.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlighted Intro Callout with Attractive Heading */}
                      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-lg shadow-black/30">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
                            <Sparkles className="size-3" aria-hidden="true" />
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            Historical Role & Defining Impact
                          </span>
                        </div>

                        <h4 className="text-base font-bold tracking-tight text-white sm:text-lg">
                          {figure.introHeadline}
                        </h4>

                        <p className="mt-1.5 text-sm font-medium leading-relaxed text-amber-100/95 sm:text-[15px]">
                          {figure.intro}
                        </p>
                      </div>

                      {/* Contributions to Law & Justice */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                            <Scale className="size-3.5 text-amber-400" aria-hidden="true" />
                            <span>Contributions to Law & Justice</span>
                          </h4>
                         
                        </div>

                        {/* Primary visible contributions (always visible) */}
                        <ul
                          className="space-y-3"
                          aria-label={`Core contributions of ${figure.name}`}
                        >
                          {primaryContributions.map((point, pointIndex) => (
                            <li
                              key={pointIndex}
                              className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                            >
                              <span
                                className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400"
                                aria-hidden="true"
                              >
                                <Check className="size-2.5" />
                              </span>
                              <div className="flex-1">
                                <span className="font-semibold text-slate-100">
                                  {point.title}:{" "}
                                </span>
                                <span className="text-slate-300">{point.detail}</span>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Expandable Section: Secondary Contributions + Interesting Facts */}
                        <div
                          id={`figure-detail-${figure.id}`}
                          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 mt-3"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                          aria-hidden={!isExpanded}
                        >
                          <div className="overflow-hidden">
                            <div className="space-y-4 pt-2">
                              {/* Secondary Contributions */}
                              <ul
                                className="space-y-3"
                                aria-label={`Additional legal contributions of ${figure.name}`}
                              >
                                {secondaryContributions.map((point, pointIndex) => (
                                  <li
                                    key={pointIndex}
                                    className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                                  >
                                    <span
                                      className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400"
                                      aria-hidden="true"
                                    >
                                      <Check className="size-2.5" />
                                    </span>
                                    <div className="flex-1">
                                      <span className="font-semibold text-slate-100">
                                        {point.title}:{" "}
                                      </span>
                                      <span className="text-slate-300">
                                        {point.detail}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>

                              {/* Genuinely Interesting Facts Block (Visually Distinct) */}
                              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-slate-900/90 to-slate-950 p-4 sm:p-5 shadow-lg shadow-black/20">
                                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                                  <Sparkles
                                    className="size-4 shrink-0 text-amber-400"
                                    aria-hidden="true"
                                  />
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                    Historical Notes & Interesting Facts
                                  </h5>
                                </div>
                                <ul
                                  className="mt-3.5 space-y-3"
                                  aria-label={`Interesting historical facts about ${figure.name}`}
                                >
                                  {figure.interestingFacts.map((fact, factIdx) => (
                                    <li
                                      key={factIdx}
                                      className="flex items-start gap-3 text-xs leading-relaxed text-slate-300 sm:text-sm"
                                    >
                                      <span
                                        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-[10px] font-bold text-amber-300"
                                        aria-hidden="true"
                                      >
                                        {factIdx + 1}
                                      </span>
                                      <span className="flex-1">{fact}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* "See more" / "Show less" Accessible Toggle Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(figure.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`figure-detail-${figure.id}`}
                            id={`figure-toggle-${figure.id}`}
                            className="group inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-amber-300 transition duration-300 hover:border-amber-400/60 hover:bg-amber-500/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 sm:text-sm"
                          >
                            <span>
                              {isExpanded
                                ? "Show less"
                                : "See fuller profile & interesting facts"}
                            </span>
                            <ChevronDown
                              className={`size-3.5 transition-transform duration-300 sm:size-4 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Section Footnote Attribution */}
        <div className="mt-16 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500 sm:mt-24">
          Historical portraits sourced from Wikimedia Commons under public domain and the Government Open Data License (GODL-India).
        </div>
      </div>
    </section>
  );
};

export default NationalLegacySection;
