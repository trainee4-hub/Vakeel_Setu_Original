import React, { useState } from "react";
import {
  Award,
  FileText,
  CreditCard,
  Download,
  Eye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import CredentialsDocumentModal from "../modals/CredentialsDocumentModal";

export default function AdvocateCredentialsCard({ advocate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("CERTIFICATE");

  const openDocument = (docType) => {
    setSelectedDoc(docType);
    setModalOpen(true);
  };

  const DOCUMENTS = [
    {
      id: "CERTIFICATE",
      title: "Empanelment Certificate",
      category: "Accreditation",
      description: "Official Bar Council verified certificate",
      badge: "PDF",
      badgeColor: "border-amber-200 bg-amber-50 text-amber-800",
      icon: Award,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      id: "AGREEMENT",
      title: "Partnership Agreement",
      category: "Legal Contract",
      description: "Digitally signed platform service agreement",
      badge: "PDF",
      badgeColor: "border-blue-200 bg-blue-50 text-blue-800",
      icon: FileText,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      id: "ID_CARD",
      title: "Digital Advocate ID",
      category: "Identity Badge",
      description: "Official ID card with dynamic profile QR",
      badge: "WALLET ID",
      badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: CreditCard,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <>
      <section className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-950">
                  Official Documents
                </h3>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-slate-500">
                Verified certificates & partner records
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Document Items List */}
        <div className="mt-4 space-y-2.5">
          {DOCUMENTS.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                onClick={() => openDocument(doc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDocument(doc.id);
                  }
                }}
                className="group relative flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover:scale-105 ${doc.iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        {doc.title}
                      </h4>
                      <span
                        className={`rounded-md border px-1.5 py-0.2 text-[9px] font-black uppercase tracking-tight ${doc.badgeColor}`}
                      >
                        {doc.badge}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all group-hover:border-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950">
                    <Download className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Authenticity Trust Badge */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500 border border-slate-100">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Bar Council Verified Records
          </span>
          <span className="font-mono font-semibold text-slate-400">
            VKS-SECURE
          </span>
        </div>
      </section>

      {/* Full Preview & Download Modal */}
      {modalOpen && (
        <CredentialsDocumentModal
          advocate={advocate}
          initialTab={selectedDoc}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

