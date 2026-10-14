import React from "react";

const FilterSection = React.memo(function FilterSection({ title, children }) {
  return (
    <div className="mb-8 last:mb-0">
      <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h4>
      {children}
    </div>
  );
});

export default FilterSection;
