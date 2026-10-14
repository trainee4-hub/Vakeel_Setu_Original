import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useDashboardScrollTarget = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo !== "how-it-works") {
      return undefined;
    }

    let firstFrame = null;
    let secondFrame = null;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.getElementById("how-it-works")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });

    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );

    return () => {
      if (firstFrame) {
        window.cancelAnimationFrame(firstFrame);
      }

      if (secondFrame) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [location.state]);

  return null;
};

export default useDashboardScrollTarget;
