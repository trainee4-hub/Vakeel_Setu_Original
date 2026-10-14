export function resolveApiBaseUrl() {
  const raw = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).trim();

  const withoutTrailingSlash = raw.replace(/\/+$/, "");

  return /\/api$/i.test(withoutTrailingSlash)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const DEFAULT_FILTERS = {
  searchQuery: "",
  practiceArea: "",
  topCourtPractised: "",
  bestPracticeArea: "",
  courtPractice: "",
  state: "",
  city: "",
  experienceYears: "",
  rating: "",
  sort: "",
  pincode: "",
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const SORT_OPTIONS = [
  { label: "Recommended", value: "" },
  { label: "Rating: High to Low", value: "rating" },
  { label: "Experience: High to Low", value: "experience" },
  { label: "Most Cases Handled", value: "casesHandled" },
];

export const RATING_OPTIONS = [
  { label: "Any", value: "" },
  { label: "4.5+", value: "4.5" },
  { label: "4+", value: "4" },
  { label: "3.5+", value: "3.5" },
  { label: "3+", value: "3" },
];

export const experienceOptions = [
  { label: "Any", min: null, max: null },
  { label: "Junior 0–2 yrs", min: 0, max: 3 },
  { label: "Mid 3–5 yrs", min: 3, max: 6 },
  { label: "Senior 6–9 yrs", min: 6, max: 10 },
  { label: "Expert 10+ yrs", min: 10, max: null },
];

export const FILTER_INPUT_CLASS = `
  w-full
  h-11
  px-3.5
  rounded-xl
  border
  border-slate-200
  bg-slate-50
  text-[13px]
  font-semibold
  text-slate-700
  placeholder:text-slate-400
  outline-none
  transition-all
  duration-200
  hover:border-slate-300
  focus:border-amber-400
  focus:bg-white
  focus:ring-4
  focus:ring-amber-500/10
`;

export function isValidPincode(value) {
  return /^\d{6}$/.test(String(value || "").trim());
}

export function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeArray(value) {
  return Array.isArray(value) ? value.map(normalizeText) : [];
}

export function matchesExact(advocateValue, filterValue) {
  const target = normalizeText(filterValue);
  if (!target) return true;
  return normalizeText(advocateValue) === target;
}

export function matchesArrayItem(advocateArray, filterValue) {
  const target = normalizeText(filterValue);
  if (!target) return true;
  return normalizeArray(advocateArray).includes(target);
}

export function matchesSearch(advocate, rawQuery) {
  const query = normalizeText(rawQuery);
  if (!query) return true;

  const haystack = [
    advocate?.fullName,
    advocate?.topCourtPractised,
    advocate?.city,
    advocate?.state,
    ...(Array.isArray(advocate?.practiceAreas) ? advocate.practiceAreas : []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

  return haystack.includes(query);
}

export function getNumericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getPracticeAreaFromSearch(search, initialSpecialty = "") {
  const params = new URLSearchParams(search);

  return (
    params.get("practiceArea") ||
    params.get("category") ||
    initialSpecialty ||
    ""
  );
}
