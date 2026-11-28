import React, { useEffect } from "react";
import PrivacyPolicyContent from "../components/PrivacyPolicyContent";

const PrivacyPolicyPage = () => {
  // Block copy/print/save keyboard shortcuts on page
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (
        isCmdOrCtrl &&
        ["c", "C", "p", "P", "s", "S", "a", "A", "u", "U"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-100 py-8 sm:py-12 px-4 sm:px-6 select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none"
      }}
    >
      <div className="mx-auto max-w-4xl bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-14">
        <PrivacyPolicyContent />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
