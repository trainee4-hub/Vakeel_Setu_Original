import React from "react";
import { FiCheck, FiFileText, FiFolder } from "react-icons/fi";

const DocumentsRequiredGrid = ({ documents = [] }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="space-y-6">
      {documents.map((group, gIdx) => (
        <div key={gIdx} className="space-y-3">
          {/* Category Subheader */}
          <div className="flex items-center gap-2 pb-1">
            <FiFolder className="text-amber-600 text-sm" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {group.category}
            </h3>
            <span className="ml-auto text-[10px] font-bold text-slate-400">
              {group.items?.length || 0} Required
            </span>
          </div>

          {/* Trending Responsive Grid of Document Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {group.items?.map((doc, dIdx) => (
              <div
                key={dIdx}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/90 hover:shadow-lg hover:shadow-amber-500/5 h-full"
              >

                <div className="flex items-start gap-3">
                  {/* Gold Gradient Circular Check Badge */}
                  <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-sm shadow-amber-500/30">
                    <FiCheck className="text-sm stroke-[3]" />
                  </div>

                  {/* Document Name & Hint */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                      {doc.name}
                    </h4>
                    {doc.detail && (
                      <p className="mt-1 text-[11px] text-slate-500 leading-relaxed font-normal">
                        {doc.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Verified Tag */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100/80 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <FiFileText className="text-slate-400" />
                    <span>Mandatory Proof</span>
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Checklist Item
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsRequiredGrid;
