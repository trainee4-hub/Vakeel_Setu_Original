import {
  FaBalanceScale,
  FaFileAlt,
  FaGavel,
  FaHandshake,
  FaUniversity,
} from "react-icons/fa";

import {
  IoBookOutline,
  IoLibraryOutline,
} from "react-icons/io5";

import { HiOutlineDocumentText } from "react-icons/hi";

/* =========================================================================
   LAW LIBRARY — resource directory.

   Only Bare Acts has a backend today. Every other entry carries the same
   shape (count / path / enabled) so connecting one later is a data change,
   not a redesign.
   ========================================================================= */

export const LIBRARY_RESOURCES = [
  {
    key: "bare-acts",
    title: "Bare Acts & Statutes",
    description:
      "Browse Indian Acts, statutes and their legal provisions.",
    metricLabel: "Legislation",
    icon: FaGavel,
    enabled: true,
    path: "/legal-hub/law-library/acts",
  },
  {
    key: "judgments",
    title: "Supreme Court Judgments",
    description:
      "Explore Supreme Court judgments and important judicial decisions.",
    metricLabel: "Case Law",
    icon: FaBalanceScale,
    enabled: false,
    path: null,
  },
  {
    key: "agreements",
    title: "Agreements & Contracts",
    description:
      "Access legal agreement and contract templates for common requirements.",
    metricLabel: "Templates",
    icon: FaHandshake,
    enabled: false,
    path: null,
  },
  {
    key: "areas-of-law",
    title: "Areas of Law",
    description:
      "Explore major areas of Indian law and their legal context.",
    metricLabel: "Practice Areas",
    icon: FaUniversity,
    enabled: false,
    path: null,
  },
  {
    key: "rules",
    title: "Rules & Regulations",
    description:
      "Browse rules, regulations and subordinate legal provisions.",
    metricLabel: "Rules",
    icon: HiOutlineDocumentText,
    enabled: false,
    path: null,
  },
  {
    key: "forms",
    title: "Government & Legal Forms",
    description:
      "Find commonly used government and legal forms.",
    metricLabel: "Legal Forms",
    icon: FaFileAlt,
    enabled: false,
    path: null,
  },
  {
    key: "reports",
    title: "Law Commission Reports",
    description:
      "Explore reports and legal reform material from the Law Commission.",
    metricLabel: "Reports",
    icon: IoLibraryOutline,
    enabled: false,
    path: null,
  },
  {
    key: "dictionary",
    title: "Law Dictionary",
    description:
      "Understand legal terminology through clear definitions.",
    metricLabel: "Legal Terms",
    icon: IoBookOutline,
    enabled: false,
    path: null,
  },
];