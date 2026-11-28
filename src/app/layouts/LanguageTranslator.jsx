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

const clearGoogtransCookies = () => {
  const hostParts = window.location.hostname.split(".");
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
    window.location.hostname +
    ";";
  document.cookie =
    "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." +
    window.location.hostname +
    ";";
  while (hostParts.length > 1) {
    const dom = hostParts.join(".");
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dom};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${dom};`;
    hostParts.shift();
  }
};

const setGoogleTranslateCookie = (language) => {
  if (language === "en") {
    clearGoogtransCookies();
    return;
  }

  const value = `/en/${language}`;
  document.cookie = `googtrans=${value};path=/`;

  if (window.location.hostname.includes(".")) {
    document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
  }
};

const LanguageTranslator = ({
  mobile = false,
  compact = false,
  dark = false,
  fullWidth = false,
  direction = "down",
}) => {
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
      const container = document.getElementById("google_translate_element");
      if (
        !window.google?.translate?.TranslateElement ||
        !container ||
        container.children.length > 0
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

    try {
      window.dispatchEvent(
        new CustomEvent("vakeel-language-change", {
          detail: { language: code },
        })
      );
    } catch {
      // Ignore
    }

    if (code === "en") {
      clearGoogtransCookies();

      // 1. Try Google Translate internal restore objects if exposed on window
      try {
        if (window.google?.translate) {
          Object.keys(window).forEach((key) => {
            if (key.startsWith("googleTranslate") || key.includes("Translate")) {
              const obj = window[key];
              if (obj && typeof obj === "object") {
                Object.keys(obj).forEach((k) => {
                  if (typeof obj[k]?.restore === "function") {
                    try {
                      obj[k].restore();
                    } catch (_) {}
                  }
                });
              }
            }
          });
        }
      } catch (_) {}

      // 2. Trigger Google Translate's native restore button inside iframe
      const clickRestoreInIframe = () => {
        const iframes = document.querySelectorAll(
          "iframe.goog-te-banner-frame, iframe.VIpgJd-ZVi9od-ORHb-OEVmcd, iframe"
        );
        for (const iframe of iframes) {
          try {
            const bannerDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (bannerDoc) {
              const allElements = bannerDoc.querySelectorAll("button, a, input[type='button']");
              for (const el of allElements) {
                const id = (el.id || "").toLowerCase();
                const text = (el.textContent || el.innerText || el.value || "").toLowerCase();
                const cls = (el.className || "").toString().toLowerCase();

                // Never click close button
                if (cls.includes("close") || id.includes("close")) continue;

                if (
                  id.includes("restore") ||
                  text.includes("original") ||
                  text.includes("restore") ||
                  cls.includes("restore")
                ) {
                  el.click();
                  return true;
                }
              }
            }
          } catch (_) {}
        }
        return false;
      };

      if (!clickRestoreInIframe()) {
        setTimeout(clickRestoreInIframe, 40);
        setTimeout(clickRestoreInIframe, 120);
        setTimeout(clickRestoreInIframe, 250);
      }

      // 3. Fallback: Check after 350ms if DOM is still in translated state. If yes, trigger a clean reload
      setTimeout(() => {
        const isStillTranslated =
          document.body.classList.contains("translated-ltr") ||
          document.body.classList.contains("translated-rtl") ||
          !!document.querySelector("font[style*='vertical-align']");

        if (isStillTranslated) {
          clearGoogtransCookies();
          window.location.reload();
        }
      }, 350);

      return;
    }

    const applyToCombo = () => {
      const googleSelect = document.querySelector(".goog-te-combo");
      if (googleSelect) {
        googleSelect.value = code;
        if (typeof googleSelect.onchange === "function") {
          googleSelect.onchange();
        }
        googleSelect.dispatchEvent(
          new Event("change", {
            bubbles: true,
          }),
        );
        return true;
      }
      return false;
    };

    if (applyToCombo()) {
      return;
    }

    // Google widget may still be initializing: poll for it without page reload
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (applyToCombo() || attempts >= 25) {
        clearInterval(interval);
      }
    }, 120);
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
            {/* <span className="material-symbols-outlined text-xl text-amber-600">
              language
            </span> */}

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
     DESKTOP / COMPACT
  ----------------------------------------------------------------------- */

  return (
    <div
      ref={wrapperRef}
      className={`notranslate relative ${fullWidth ? "w-full" : compact ? "inline-block" : "hidden lg:block"}`}
      translate="no"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex ${compact ? "h-9 px-3 text-xs" : "h-10 px-3.5 text-xs"} ${fullWidth ? "w-full justify-between" : ""} items-center gap-2 rounded-xl border transition-all duration-200 cursor-pointer ${
          open
            ? dark
              ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-xs"
              : "border-amber-400 bg-amber-50 text-amber-700 shadow-xs"
            : dark
              ? "border-white/10 bg-white/[0.05] text-slate-300 hover:border-amber-400/40 hover:bg-white/[0.08] hover:text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
        }`}
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={`material-symbols-outlined ${compact ? "text-lg" : "text-xl"} ${dark ? "text-amber-400" : ""}`}>
            language
          </span>

          <span className={`truncate font-bold ${fullWidth ? "max-w-[140px]" : "max-w-[80px]"}`}>
            {selected.nativeName}
          </span>
        </span>

        <span
          className={`material-symbols-outlined text-base transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${dark ? "text-slate-400" : ""}`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          className={`absolute ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2.5"} ${fullWidth ? "left-0" : "right-0"} z-[300] w-[280px] sm:w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20`}
        >
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
    </div>
  );
};

export default LanguageTranslator;