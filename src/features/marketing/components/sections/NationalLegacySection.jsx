import { FiAward, FiCheck } from "react-icons/fi";

import RevealOnScroll from "../common/RevealOnScroll";
import { PAGE_CONTAINER } from "../../data/dashboardData";

import gandhiImg from "@/assets/home/figures/mahatma-gandhi.jpg";
import patelImg from "@/assets/home/figures/sardar-patel.jpg";
import ambedkarImg from "@/assets/home/figures/dr-br-ambedkar.jpg";
import modiImg from "@/assets/home/figures/pm-narendra-modi.jpg";

const LEGACY_FIGURES = [
  {
    id: "mahatma-gandhi",
    name: "Mahatma Gandhi",
    badge: "Barrister-at-Law & Freedom Leader",
    period: "1869 – 1948",
    image: gandhiImg,
    imageAlt: "Historical portrait of Mahatma Gandhi",
    intro:
      "London-trained barrister who mobilized non-violent civil resistance and moral jurisprudence to lead India's national independence movement.",
    points: [
      "Called to the Bar at the Inner Temple in London (1891), practicing in Bombay and South Africa, where he spent over two decades litigating civil rights and racial equality cases for disenfranchised communities.",
      "Pioneered Satyagraha (truth-force and non-violent defiance) as a principled legal and constitutional doctrine to challenge discriminatory colonial statutes.",
      "Promoted legal ethics grounded in mediation and dispute resolution, famously advocating that the primary duty of an advocate is to bring separated parties together.",
      "Led defining mass campaigns—including the Non-Cooperation Movement, Salt Satyagraha, and Quit India Movement—that shaped India's path to constitutional sovereignty.",
    ],
  },
  {
    id: "sardar-patel",
    name: "Sardar Vallabhbhai Patel",
    badge: "Barrister-at-Law & First Deputy PM",
    period: "1875 – 1950",
    image: patelImg,
    imageAlt: "Historical portrait of Sardar Vallabhbhai Patel",
    intro:
      "Middle Temple barrister and India's first Deputy Prime Minister who unified over 560 princely states into a single sovereign constitutional republic.",
    points: [
      "Qualified as a barrister at Middle Temple, London in 1913, establishing a distinguished criminal defense practice in Ahmedabad recognized for procedural precision and incisive cross-examination.",
      "Led landmark agrarian legal agitations including the Kheda Satyagraha (1918) and Bardoli Satyagraha (1928), securing judicial tax reductions and shielding cultivators from unlawful property seizures.",
      "Served as independent India's first Deputy Prime Minister and first Minister of Home Affairs, orchestrating the peaceful constitutional integration of 565 princely states into the Indian Union.",
      "Created the institutional structure of the modern All India Services (IAS and IPS), constitutionally enshrining permanent civil services to safeguard governance and the rule of law.",
    ],
  },
  {
    id: "dr-br-ambedkar",
    name: "Dr. B. R. Ambedkar",
    badge: "Chief Architect of the Constitution & First Law Minister",
    period: "1891 – 1956",
    image: ambedkarImg,
    imageAlt: "Historical portrait of Dr. B. R. Ambedkar",
    intro:
      "Eminent jurist and constitutional scholar who led the drafting of the Constitution of India and codified legal guarantees of human equality.",
    points: [
      "Called to the Bar at Gray's Inn, London (1923), alongside doctorates from Columbia University and the London School of Economics, practicing extensively before the Bombay High Court.",
      "Chaired the Drafting Committee of the Constituent Assembly (1947–1950), authoring the Constitution of India and establishing fundamental rights, constitutional remedies under Article 32, and an independent judiciary.",
      "Served as independent India's first Minister of Law and Justice, enacting statutory protections against caste discrimination and untouchability.",
      "Drafted and championed the Hindu Code Bills to reform personal civil laws, securing statutory property inheritance and divorce rights for women across India.",
    ],
  },
  {
    id: "pm-narendra-modi",
    name: "Prime Minister Narendra Modi",
    badge: "14th Prime Minister of the Republic of India",
    period: "In Office: 2014 – Present",
    image: modiImg,
    imageAlt: "Official portrait of Prime Minister Narendra Modi",
    intro:
      "Fourteenth Prime Minister of India, presiding over comprehensive statutory modernizations and national legal digitization initiatives.",
    points: [
      "Has served as the 14th Prime Minister of the Republic of India since May 2014, having previously served as Chief Minister of Gujarat from 2001 to 2014.",
      "Enacted the replacement of colonial-era penal codes with updated statutory legislation—the Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam.",
      "Oversaw the legislative repeal of more than 1,500 obsolete, archaic Acts through systematic Repealing and Amending legislation to reduce regulatory compliance complexity.",
      "Advanced nationwide legal technology infrastructure through the ongoing rollout of Phase III of the e-Courts Mission Mode Project and expanded virtual court hearings.",
    ],
  },
];

const NationalLegacySection = () => {
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
              <FiAward className="text-sm shrink-0" aria-hidden="true" />
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
        <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-24 lg:mt-24 lg:space-y-32">
          {LEGACY_FIGURES.map((figure, index) => {
            const isPhotoLeftOnDesktop = index % 2 === 0;

            return (
              <RevealOnScroll key={figure.id} delay={index * 50}>
                <article
                  className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14 xl:gap-16"
                  aria-labelledby={`figure-title-${figure.id}`}
                >
                  {/* Photo Column:
                      On mobile width (< lg), order-1 places the photo on top for every row.
                      On desktop (>= lg), alternates:
                        - Photo left (index 0, 2): lg:order-1
                        - Photo right (index 1, 3): lg:order-2
                  */}
                  <div
                    className={`order-1 lg:col-span-5 ${
                      isPhotoLeftOnDesktop ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="group relative mx-auto w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none">
                      {/* Subtle ambient border glow */}
                      <div
                        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-800/40 to-slate-900/60 opacity-60 blur-md transition duration-700 group-hover:opacity-100"
                        aria-hidden="true"
                      />

                      {/* Framed photo container */}
                      <div className="relative rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-amber-500/30 via-slate-700/40 to-slate-800/80 shadow-2xl shadow-slate-950/80">
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] sm:rounded-[22px] bg-slate-950">
                          <img
                            src={figure.image}
                            alt={figure.imageAlt}
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.02]"
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

                          {/* Bottom metadata pill */}
                          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between sm:bottom-4 sm:left-4 sm:right-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/85 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                              <span
                                className="size-1.5 rounded-full bg-amber-400"
                                aria-hidden="true"
                              />
                              {figure.period}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Column:
                      On mobile width (< lg), order-2 places the text below the photo for every row.
                      On desktop (>= lg), alternates:
                        - Text right (index 0, 2): lg:order-2
                        - Text left (index 1, 3): lg:order-1
                  */}
                  <div
                    className={`order-2 lg:col-span-7 ${
                      isPhotoLeftOnDesktop ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div className="flex flex-col">
                      {/* Figure Name Heading */}
                      <h3
                        id={`figure-title-${figure.id}`}
                        className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
                      >
                        {figure.name}
                      </h3>

                      {/* Highlighted Intro Line (one sentence, amber accent) */}
                      <p className="mt-3 text-base font-medium leading-relaxed text-amber-400 sm:text-lg">
                        {figure.intro}
                      </p>

                      {/* 3-4 Contribution Bullets */}
                      <ul
                        className="mt-6 space-y-3.5 sm:space-y-4"
                        aria-label={`Key contributions of ${figure.name}`}
                      >
                        {figure.points.map((point, pointIndex) => (
                          <li
                            key={pointIndex}
                            className="flex items-start gap-3 text-sm leading-relaxed text-slate-300 sm:text-base"
                          >
                            <span
                              className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400"
                              aria-hidden="true"
                            >
                              <FiCheck className="text-[10px]" />
                            </span>
                            <span className="flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Section Footnote Attribution */}
        <div className="mt-16 sm:mt-24 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
          Historical portraits sourced from Wikimedia Commons under public domain and the Government Open Data License (GODL-India).
        </div>
      </div>
    </section>
  );
};

export default NationalLegacySection;
