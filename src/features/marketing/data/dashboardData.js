import {
  FaGavel,
  FaBriefcase,
  FaUsers,
  FaMedkit,
  FaLightbulb,
  FaBuilding,
  FaPlane,
  FaExclamationTriangle,
  FaHistory,
  FaLock,
  FaCheckCircle,
  FaUserLock,
} from "react-icons/fa";

import {
  MdWork,
  MdReceiptLong,
  MdEditNote,
  MdPsychology,
} from "react-icons/md";

export const PAGE_CONTAINER = "max-w-7xl mx-auto px-6";

export const DASHBOARD_CATEGORIES = [
  {
    label: "Criminal Defence",
    value: "Criminal Law",
    icon: FaGavel,
    tone: "amber",
  },
  {
    label: "Corporate (Business)",
    value: "Corporate Law",
    icon: FaBriefcase,
    tone: "emerald",
  },
  {
    label: "Family",
    value: "Family Law",
    icon: FaUsers,
    tone: "amber",
  },
  {
    label: "Personal Injury",
    value: "Personal Injury Law",
    icon: FaMedkit,
    tone: "emerald",
  },
  {
    label: "Employment & Labor",
    value: "Labor Law",
    icon: MdWork,
    tone: "amber",
  },
  {
    label: "Intellectual Property",
    value: "Intellectual Property",
    icon: FaLightbulb,
    tone: "amber",
  },
  {
    label: "Real Estate",
    value: "Real Estate Law",
    icon: FaBuilding,
    tone: "emerald",
  },
  {
    label: "Tax Lawyer",
    value: "Tax Law",
    icon: MdReceiptLong,
    tone: "amber",
  },
  {
    label: "Immigration",
    value: "Immigration Law",
    icon: FaPlane,
    tone: "emerald",
  },
  {
    label: "Bankruptcy",
    value: "Bankruptcy Law",
    icon: FaExclamationTriangle,
    tone: "amber",
  },
  {
    label: "Civil Litigation",
    value: "Civil Law",
    icon: FaGavel,
    tone: "emerald",
  },
];

export const DASHBOARD_FAQS = [
  {
    question: "Is my consultation private?",
    answer:
      "Absolutely. All consultations are end-to-end encrypted and covered by attorney-client privilege protocols.",
  },
  {
    question: "How do I choose the right lawyer?",
    answer:
      "Use our AI-powered match system or browse by category. You can filter by experience, rating, and language.",
  },
  {
    question: "What are the fees?",
    answer:
      "Fees are transparently listed on each advocate's profile. We offer both fixed-fee packages and hourly consultation rates.",
  },
  {
    question: "Can I switch advocates mid-case?",
    answer:
      "Yes, you can end a consultation anytime and start a new one with a different advocate. There's no lock-in period.",
  },
  {
    question: "Do you support video consultations?",
    answer:
      "Currently we support message-based and offline (in-person) consultations. Video consultations are on our roadmap.",
  },
  {
    question: "What if I'm not satisfied with the advice?",
    answer:
      "You can report the consultation through Help & Support, and our team will review the case and assist with a resolution.",
  },
];

export const HERO_STATS = [
  {
    icon: FaHistory,
    title: "24/7 Access",
    desc: "Instant Consultations",
    iconClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  {
    icon: FaLock,
    title: "100% Secure",
    desc: "End-to-End Encrypted",
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    icon: FaCheckCircle,
    title: "Verified Experts",
    desc: "Bar Council Certified",
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Define Your Need",
    text: "Describe your situation through our secure interface.",
    icon: MdEditNote,
  },
  {
    number: "02",
    title: "Smart Match",
    text: "Find advocates with the right expertise for your case.",
    icon: MdPsychology,
  },
  {
    number: "03",
    title: "Secure Connect",
    text: "Consult through secure video, chat or messaging.",
    icon: FaUserLock,
  },
];

export const TESTIMONIALS = [
  {
    text: "The platform matched me with a property lawyer within 10 minutes. Saved me from a major legal trap.",
    author: "Arjun Varma",
    role: "Real Estate Client",
  },
  {
    text: "As an advocate, the case management tools are world-class. It has completely streamlined my practice.",
    author: "Adv. Meera Nair",
    role: "Partner, Nair & Associates",
  },
  {
    text: "The AI summary feature for legal documents is a game changer. I understood the contract instantly.",
    author: "Sameer Kapoor",
    role: "Startup Founder",
  },
];