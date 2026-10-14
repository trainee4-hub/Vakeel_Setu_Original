export const LAW_CATEGORIES = [
  {
    label: "Criminal Defence",
    value: "Criminal Law",
    icon: "gavel",
    tone: "amber",
  },
  {
    label: "Corporate",
    value: "Corporate Law",
    icon: "business_center",
    tone: "emerald",
  },
  {
    label: "Family",
    value: "Family Law",
    icon: "family_restroom",
    tone: "amber",
  },
  {
    label: "Personal Injury",
    value: "Personal Injury Law",
    icon: "healing",
    tone: "emerald",
  },
  {
    label: "Employment",
    value: "Labor Law",
    icon: "work",
    tone: "amber",
  },
  {
    label: "IP Rights",
    value: "Intellectual Property",
    icon: "lightbulb",
    tone: "amber",
  },
  {
    label: "Real Estate",
    value: "Real Estate Law",
    icon: "apartment",
    tone: "emerald",
  },
  {
    label: "Tax",
    value: "Tax Law",
    icon: "receipt_long",
    tone: "amber",
  },
  {
    label: "Immigration",
    value: "Immigration Law",
    icon: "flight",
    tone: "emerald",
  },
  {
    label: "Civil Litigation",
    value: "Civil Law",
    icon: "gavel",
    tone: "emerald",
  },
  {
    label: "Bankruptcy",
    value: "Bankruptcy Law",
    icon: "report",
    tone: "amber",
  },
];

// For places where only label + value are required
export const CATEGORY_OPTIONS = LAW_CATEGORIES.map(({ label, value }) => ({
  label,
  value,
}));

// For dashboard/category cards
export const DASHBOARD_CATEGORIES = LAW_CATEGORIES;