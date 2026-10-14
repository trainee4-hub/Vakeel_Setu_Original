export const BOOK_LABELS = {
  en: "Book",

  hi: "बुक",
  bn: "বুক",
  gu: "બુક",
  kn: "ಬುಕ್",
  ml: "ബുക്ക്",
  mr: "बुक",
  pa: "ਬੁੱਕ",
  ta: "புக்",
  te: "బుక్",
  ur: "بک",
  or: "ବୁକ୍",
  as: "বুক",
  bho: "बुक",
  doi: "बुक",
  gom: "बुक",
  mai: "बुक",
  "mni-Mtei": "ꯕꯨꯛ",
  lus: "Book",
  ne: "बुक",
  sa: "बुक",
  sd: "بڪ",
};

export const getBookLabel = (
  language
) => {
  return (
    BOOK_LABELS[language] ||
    BOOK_LABELS.en
  );
};