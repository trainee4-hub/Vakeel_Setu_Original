import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollToTop ensures that genuine new navigations land at the top of the page.
 * - Keyed on `pathname` change.
 * - Preserves natural browser back/forward behavior (navigationType === "POP").
 * - Does not override in-page hash/anchor navigations (#section).
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // If navigation is Back/Forward (POP), let the browser manage scroll restoration naturally
    if (navigationType === "POP") {
      return;
    }

    // If an in-page anchor (#hash) is present, allow smooth jump to the targeted element
    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    // On standard new navigation (PUSH or REPLACE with pathname change), scroll instantly to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;
