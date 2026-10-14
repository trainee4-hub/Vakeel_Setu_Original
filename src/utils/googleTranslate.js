import {
  GOOGLE_TRANSLATE_STORAGE_KEY,
} from "../app/components/GoogleTranslateHost";

export const getSavedLanguage = () => {
  try {
    return (
      localStorage.getItem(
        GOOGLE_TRANSLATE_STORAGE_KEY,
      ) || "en"
    );
  } catch {
    return "en";
  }
};

const setGoogleTranslateCookie = (languageCode) => {
  const value =
    languageCode === "en"
      ? "/en/en"
      : `/en/${languageCode}`;

  document.cookie = `googtrans=${value};path=/`;

  const hostname = window.location.hostname;

  if (
    hostname &&
    hostname !== "localhost" &&
    hostname.includes(".")
  ) {
    document.cookie =
      `googtrans=${value};path=/;domain=${hostname}`;
  }
};

export const applyGoogleTranslation = (
  languageCode,
) => {
  try {
    localStorage.setItem(
      GOOGLE_TRANSLATE_STORAGE_KEY,
      languageCode,
    );
  } catch {
    // Ignore localStorage restrictions.
  }

  setGoogleTranslateCookie(languageCode);

  const googleSelect =
    document.querySelector(".goog-te-combo");

  if (googleSelect) {
    googleSelect.value = languageCode;

    googleSelect.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    return true;
  }

  /*
   * Google Translate script abhi load nahi hua ho
   * to cookie save ho chuki hai.
   * Reload ke baad Google translation apply karega.
   */
  window.location.reload();

  return false;
};