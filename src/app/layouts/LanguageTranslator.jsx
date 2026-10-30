import React, { useEffect, useRef, useState } from "react";

const LANGUAGES = [
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
  { code: "mni-Mtei", name: "Manipuri", nativeName: "ꯃꯤꯇꯩꯂꯣꯟ" },
  { code: "lus", name: "Mizo", nativeName: "Mizo ṭawng" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
];

const STORAGE_KEY = "vakeel_setu_language";
const GOOGLE_SCRIPT_ID = "google-translate-script";

const getSavedLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "en";
  } catch {
    return "en";
  }
};

const setGoogleTranslateCookie = (language) => {
  const value =
    language === "en" ? "/en/en" : `/en/${language}`;

  document.cookie = `googtrans=${value};path=/`;

  if (window.location.hostname.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
  }
};

const LanguageTranslator = ({ mobile = false }) => {
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState(getSavedLanguage);

  const selected =
    LANGUAGES.find(
      (language) => language.code === selectedLanguage,
    ) || LANGUAGES[0];

  /* -----------------------------------------------------------------------
     INITIALIZE GOOGLE TRANSLATE
  ----------------------------------------------------------------------- */

  useEffect(() => {
    const initializeGoogleTranslate = () => {
      if (
        !window.google?.translate?.TranslateElement ||
        document.getElementById("google_translate_element")
          ?.children.length
      ) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map(
            (language) => language.code,
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

    if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const script = document.createElement("script");

      script.id = GOOGLE_SCRIPT_ID;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      document.body.appendChild(script);
    }

    return () => {
      // Do not remove Google's script because the translator
      // is shared for the lifetime of the SPA.
    };
  }, []);

  /* -----------------------------------------------------------------------
     CLOSE ON OUTSIDE CLICK
  ----------------------------------------------------------------------- */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* -----------------------------------------------------------------------
     CHANGE LANGUAGE
  ----------------------------------------------------------------------- */

  const changeLanguage = (language) => {
    const code = language.code;

    setSelectedLanguage(code);
    setOpen(false);
    setSearch("");

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore storage restrictions.
    }

    setGoogleTranslateCookie(code);

    const googleSelect = document.querySelector(
      ".goog-te-combo",
    );

    if (googleSelect) {
      googleSelect.value = code;
      googleSelect.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );

      return;
    }

    /*
     * Google widget may still be loading.
     * Reload once so googtrans cookie can be applied.
     */
    window.location.reload();
  };

  const filteredLanguages = LANGUAGES.filter(
    (language) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return (
        language.name.toLowerCase().includes(query) ||
        language.nativeName.toLowerCase().includes(query)
      );
    },
  );

  /* -----------------------------------------------------------------------
     MOBILE
  ----------------------------------------------------------------------- */

  if (mobile) {
    return (
      <div
        ref={wrapperRef}
        className="notranslate relative"
        translate="no"
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-amber-600">
              language
            </span>

            <span>
              Language
            </span>
          </span>

          <span className="flex items-center gap-2">
            <span className="max-w-[110px] truncate text-xs font-bold text-amber-600">
              {selected.nativeName}
            </span>

            <span
              className={`material-symbols-outlined text-lg transition-transform ${
                open ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </span>
        </button>

        {open && (
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  search
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search language..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-1.5">
              {filteredLanguages.map((language) => {
                const active =
                  selectedLanguage === language.code;

                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() =>
                      changeLanguage(language)
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-amber-50 text-amber-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">
                        {language.nativeName}
                      </span>

                      {language.name !==
                        language.nativeName && (
                        <span className="block text-[11px] text-slate-400">
                          {language.name}
                        </span>
                      )}
                    </span>

                    {active && (
                      <span className="material-symbols-outlined text-lg text-amber-600">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* -----------------------------------------------------------------------
     DESKTOP
  ----------------------------------------------------------------------- */

  return (
    <div
      ref={wrapperRef}
      className="notranslate relative hidden lg:block"
      translate="no"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all duration-200 ${
          open
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
        }`}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-xl">
          language
        </span>

        <span className="max-w-[76px] truncate text-xs font-bold">
          {selected.nativeName}
        </span>

        <span
          className={`material-symbols-outlined text-base transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[300] mt-3 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <span className="material-symbols-outlined">
                  translate
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Choose Language
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Translate Vakeel Setu into your preferred
                  language.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                search
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search languages..."
                autoFocus
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {filteredLanguages.map((language) => {
              const active =
                selectedLanguage === language.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() =>
                    changeLanguage(language)
                  }
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                    active
                      ? "bg-amber-50 text-amber-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {language.nativeName}
                    </p>

                    {language.name !==
                      language.nativeName && (
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {language.name}
                      </p>
                    )}
                  </div>

                  {active && (
                    <span className="material-symbols-outlined text-lg text-amber-600">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300">
                  search_off
                </span>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  No language found
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <p className="text-[10px] leading-4 text-slate-400">
              Translation is provided automatically and may
              not preserve the exact meaning of legal terms.
            </p>
          </div>
        </div>
      )}

      {/* Google's actual selector stays hidden.
          Our custom UI controls it. */}
      <div
        id="google_translate_element"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      />
    </div>
  );
};

export default LanguageTranslator;