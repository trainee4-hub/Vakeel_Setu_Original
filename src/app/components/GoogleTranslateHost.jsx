import { useEffect, useRef } from "react";

export const GOOGLE_TRANSLATE_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "gom", name: "Konkani", nativeName: "कोंकणी" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  {
    code: "mni-Mtei",
    name: "Manipuri",
    nativeName: "ꯃꯤꯇꯩꯂꯣꯟ",
  },
  { code: "lus", name: "Mizo", nativeName: "Mizo ṭawng" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
];

export const GOOGLE_TRANSLATE_STORAGE_KEY =
  "vakeel_setu_language";

const GOOGLE_SCRIPT_ID = "google-translate-script";

const GoogleTranslateHost = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (
        initializedRef.current ||
        !window.google?.translate?.TranslateElement
      ) {
        return;
      }

      const container = document.getElementById(
        "google_translate_element",
      );

      if (!container) return;

      initializedRef.current = true;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            GOOGLE_TRANSLATE_LANGUAGES.map(
              (item) => item.code,
            ).join(","),
          autoDisplay: false,
          multilanguagePage: true,
        },
        "google_translate_element",
      );
    };

    window.googleTranslateElementInit =
      initializeGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslate();
      return;
    }

    const existingScript =
      document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        initializeGoogleTranslate,
        { once: true },
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          initializeGoogleTranslate,
        );
      };
    }

    const script = document.createElement("script");

    script.id = GOOGLE_SCRIPT_ID;

    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

    script.async = true;

    document.body.appendChild(script);
  }, []);

  return (
    <div
      className="google-translate-host notranslate"
      translate="no"
      aria-hidden="true"
    >
      <div id="google_translate_element" />
    </div>
  );
};

export default GoogleTranslateHost;