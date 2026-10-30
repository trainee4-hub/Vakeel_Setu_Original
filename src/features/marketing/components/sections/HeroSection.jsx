import {
  FiSearch,
  FiArrowDown,
  FiUsers,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiStar,
  FiBriefcase,
  FiUserCheck,
} from "react-icons/fi";

import { HERO_STATS, PAGE_CONTAINER } from "../../data/dashboardData";
import heroBg from "../../../../assets/home/hero-bg.jpg";

/**
 * Converts the existing Material Symbol icon names coming from HERO_STATS
 * into React Icon components.
 *
 * This lets dashboardData.js remain unchanged.
 */
const STAT_ICON_MAP = {
  groups: FiUsers,
  group: FiUsers,
  people: FiUsers,
  person: FiUsers,

  verified: FiUserCheck,
  verified_user: FiShield,
  shield: FiShield,

  schedule: FiClock,
  history: FiClock,
  access_time: FiClock,

  check_circle: FiCheckCircle,
  task_alt: FiCheckCircle,

  workspace_premium: FiAward,
  military_tech: FiAward,

  star: FiStar,

  work: FiBriefcase,
  business_center: FiBriefcase,
};

const HeroSection = ({
  onFindLawyer,
  onHowItWorks,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#070b14] pb-20 pt-12 sm:pb-20 sm:pt-14 lg:pb-20 lg:pt-14">
      {/* ── Background: Clearly Visible Law Chamber & Library with Deep Navy/Slate Tint ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Law Chamber & Library Photo with balanced transparency and rich depth */}
        <img
          src={heroBg}
          alt=""
          role="presentation"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-50 sm:opacity-55 filter brightness-[0.78] contrast-[1.05] saturate-[0.88] transition-opacity duration-500"
        />

        {/* Deep Slate/Navy Directional Overlay (Rich depth, seamless top and bottom blend) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/80 via-[#070b14]/35 to-[#070b14]" />

        {/* Soft Radial Focus behind text for maximum readability and cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(7,11,20,0.15)_0%,rgba(7,11,20,0.5)_60%,rgba(7,11,20,0.92)_100%)]" />

        {/* Warm Amber Glow on the Right (Echoes the cozy desk lamp warmth) */}
        <div className="absolute right-[5%] top-[12%] h-[68%] w-[45%] rounded-full bg-amber-500/[0.12] blur-[100px]" />
        {/* Subtle Slate Depth on the Left */}
        <div className="absolute -left-[5%] top-[22%] h-[55%] w-[38%] rounded-full bg-slate-800/[0.25] blur-[110px]" />
      </div>

      <div
        className={`relative z-10 ${PAGE_CONTAINER} text-center`}
      >
        {/* Heading */}
        <h1
          className="
            animate-enter-delay-1
            text-3xl
            font-extrabold
            leading-tight
            tracking-tight
            text-white
            sm:text-4xl
            md:text-5xl
            lg:text-7xl
          "
        >
          Justice Accessible.
          <br />

          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
            Expertise Verified.
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            mx-auto
            mt-4
            max-w-2xl
            animate-enter-delay-2
            text-sm
            leading-6
            text-slate-400
            sm:text-base
            sm:leading-7
            lg:text-lg
          "
        >
          Connect seamlessly with India's top-tier legal professionals.
          From consultation to resolution, experience a digital courtroom
          designed for the modern user.
        </p>

        {/* Action Buttons */}
        <div
          className="
            mt-6
            flex
            animate-enter-delay-3
            flex-col
            items-center
            justify-center
            gap-3
            sm:mt-7
            sm:flex-row
            sm:gap-4
          "
        >
          {/* Find Lawyer */}
          <button
            type="button"
            onClick={onFindLawyer}
            className="
              group
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-amber-500
              px-7
              py-3.5
              text-base
              font-bold
              text-slate-900
              shadow-[0_0_20px_rgba(245,158,11,0.3)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-amber-400
              hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
              sm:w-auto
              sm:px-8
              sm:py-4
              sm:text-lg
            "
          >
            Find a Lawyer

            <FiSearch
              className="text-[20px] transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            />
          </button>

          {/* How It Works */}
          <button
            type="button"
            onClick={onHowItWorks}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-800/50
              px-7
              py-3.5
              text-base
              font-semibold
              text-white
              backdrop-blur-md
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-slate-600
              hover:bg-slate-700/80
              sm:w-auto
              sm:px-8
              sm:py-4
              sm:text-lg
            "
          >
            How It Works

            <FiArrowDown
              className="text-[20px]"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Stats */}
        <div
          className="
            mx-auto
            mt-10
            grid
            max-w-4xl
            animate-enter-delay-3
            grid-cols-1
            gap-4
            sm:mt-12
            md:grid-cols-3
            md:gap-5
          "
        >
          {HERO_STATS.map((stat) => {
            const StatIcon =
              STAT_ICON_MAP[stat.icon] || FiCheckCircle;

            return (
              <div
                key={stat.title}
                className="
                  group
                  flex
                  flex-col
                  items-center
                  rounded-3xl
                  border
                  border-white/5
                  bg-white/5
                  p-5
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-white/20
                  hover:bg-white/10
                  sm:p-6
                "
              >
                {/* Icon */}
                <div
                  className={`
                    ${stat.bgClass}
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    transition-transform
                    duration-500
                    group-hover:scale-110
                    sm:h-14
                    sm:w-14
                  `}
                >
                  <StatIcon
                    className={`${stat.iconClass} text-2xl`}
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3 className="mb-1 text-base font-bold text-white sm:text-lg">
                  {stat.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 sm:text-sm">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;