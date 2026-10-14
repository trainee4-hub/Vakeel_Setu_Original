/* =========================================================================
   BARE ACTS — supported acts.

   The backend currently serves only these two lawType values. Adding an act
   later is one entry here; nothing else needs to change.
   ========================================================================= */

export const BARE_ACTS = [
  {
    lawType: "BNSS",
    shortName: "BNSS",
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    description:
      "The criminal procedure code governing investigation, arrest, trial and appeals.",
    icon: "gavel",
  },
  {
    lawType: "BSA",
    shortName: "BSA",
    title: "Bharatiya Sakshya Adhiniyam, 2023",
    description:
      "The law of evidence covering admissibility, witnesses, documents and proof.",
    icon: "fact_check",
  },
];

export const SUPPORTED_LAW_TYPES = BARE_ACTS.map((act) => act.lawType);

/** Case-insensitive so /bare-acts/bnss resolves the same as /BNSS. */
export const findBareAct = (lawType) => {
  const value = String(lawType || "").trim().toUpperCase();
  return BARE_ACTS.find((act) => act.lawType === value) || null;
};