import { useEffect, useState } from "react";

import {
  GOOGLE_TRANSLATE_STORAGE_KEY,
} from "../app/components/GoogleTranslateHost";

const getLanguage = () => {
  try {
    const savedLanguage =
      localStorage.getItem(
        GOOGLE_TRANSLATE_STORAGE_KEY
      );

    if (savedLanguage) {
      return savedLanguage;
    }

    const googleCookie =
      document.cookie
        .split("; ")
        .find((row) =>
          row.startsWith("googtrans=")
        );

    if (googleCookie) {
      const value = decodeURIComponent(
        googleCookie.split("=")[1]
      );

      const language =
        value.split("/").filter(Boolean).pop();

      if (language) {
        return language;
      }
    }
  } catch {
    // ignore
  }

  return "en";
};

const useAppLanguage = () => {
  const [language, setLanguage] =
    useState(() => getLanguage());

  useEffect(() => {
    const updateLanguage = (event) => {
      const nextLanguage =
        event?.detail?.language ||
        getLanguage();

      setLanguage(nextLanguage);
    };

    const handleStorage = (event) => {
      if (
        event.key ===
        GOOGLE_TRANSLATE_STORAGE_KEY
      ) {
        setLanguage(
          event.newValue || "en"
        );
      }
    };

    window.addEventListener(
      "vakeel-language-change",
      updateLanguage
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    /*
     * Google Translate can change its select independently,
     * so listen to the actual Google select too.
     */
    const connectGoogleSelect = () => {
      const select =
        document.querySelector(
          ".goog-te-combo"
        );

      if (!select) {
        return false;
      }

      const handleGoogleChange = () => {
        const code =
          select.value || "en";

        try {
          localStorage.setItem(
            GOOGLE_TRANSLATE_STORAGE_KEY,
            code
          );
        } catch {
          // ignore
        }

        setLanguage(code);
      };

      select.addEventListener(
        "change",
        handleGoogleChange
      );

      return () => {
        select.removeEventListener(
          "change",
          handleGoogleChange
        );
      };
    };

    let removeGoogleListener =
      connectGoogleSelect();

    let interval;

    if (!removeGoogleListener) {
      interval = window.setInterval(() => {
        const cleanup =
          connectGoogleSelect();

        if (cleanup) {
          removeGoogleListener = cleanup;

          window.clearInterval(
            interval
          );
        }
      }, 500);
    }

    return () => {
      window.removeEventListener(
        "vakeel-language-change",
        updateLanguage
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      if (interval) {
        window.clearInterval(interval);
      }

      if (
        typeof removeGoogleListener ===
        "function"
      ) {
        removeGoogleListener();
      }
    };
  }, []);

  return language;
};

export default useAppLanguage;