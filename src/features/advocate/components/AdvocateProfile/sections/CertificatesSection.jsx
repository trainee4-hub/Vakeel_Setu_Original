import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdWorkspacePremium } from "react-icons/md";

/** Only renders when the backend actually provides advocate.certificates. */
export default function CertificatesSection({ certificates }) {
  if (certificates.length === 0) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg border-2xl border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
        <MdWorkspacePremium className="shrink-0 text-xl text-amber-500" />
        Certificates
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert, idx) => (
          <div
            key={idx}
            className="rounded border-2xl border-slate-200 overflow-hidden group"
          >
            <div className="h-28 bg-slate-50 flex items-center justify-center">
              {cert.thumbnailUrl || cert.url ? (
                <img
                  src={cert.thumbnailUrl || cert.url}
                  alt={cert.title || "Certificate"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiOutlineDocumentText className="text-4xl text-slate-300" />
              )}
            </div>

            <div className="p-3">
              <p className="font-bold text-slate-900 text-sm truncate">
                {cert.title || "Certificate"}
              </p>

              {cert.issuingOrganization && (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {cert.issuingOrganization}
                </p>
              )}

              {cert.year && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-slate-400">
                  {cert.year}
                </span>
              )}

              <div className="flex gap-2 mt-2.5">
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-bold py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    View
                  </a>
                )}

                {cert.downloadUrl && (
                  <a
                    href={cert.downloadUrl}
                    className="flex-1 text-center text-xs font-bold py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}