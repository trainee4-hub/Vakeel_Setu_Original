import React from "react";

const FilterSection = React.memo(function FilterSection({ title, children, className = "" }) {
  return (
    <div className={`mb-5 last:mb-0 ${className}`}>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h4>
      {children}
    </div>
  );
});

export default FilterSection;
