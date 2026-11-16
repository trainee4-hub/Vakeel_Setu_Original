import React, { useState } from "react";
import {
  Award,
  FileText,
  CreditCard,
  Printer,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Scale,
  QrCode,
  Sparkles,
} from "lucide-react";

export default function CredentialsDocumentModal({
  advocate,
  initialTab = "CERTIFICATE",
  onClose,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const advocateName =
    advocate?.fullName ||
    advocate?.name ||
    [advocate?.firstName, advocate?.lastName].filter(Boolean).join(" ") ||
    "Advocate";

  const barCouncilId =
    advocate?.barCouncilId ||
    advocate?.barCouncilNumber ||
    "D/1234/2020";

  const state = advocate?.state || "Delhi";
  const city = advocate?.city || "New Delhi";
  const practiceArea =
    advocate?.bestPracticeArea ||
    (Array.isArray(advocate?.specializations) && advocate.specializations[0]) ||
    "Civil & Criminal Law";

  const photo = advocate?.profilePhotoUrl || advocate?.photoUrl || "";

  const memberId = `VS-${String(
    advocate?.id || advocate?._id || "ADV"
  ).slice(-6).toUpperCase()}`;

  const issueDate = advocate?.createdAt
    ? new Date(advocate.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const certNumber = `VKS-ACCRED-${String(
    advocate?.id || advocate?._id || "2026"
  ).slice(-8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none">
        {/* =========================================================
            MODAL HEADER & TABS (Hidden on Print)
        ========================================================= */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-950">
                  Official Advocate Credentials
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official documents issued under VakeelSetu Bar Association Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Hidden on Print) */}
        <div className="flex shrink-0 border-b border-slate-200/80 bg-white px-4 sm:px-6 print:hidden">
          <div className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("CERTIFICATE")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "CERTIFICATE"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-300 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-600" />
              <span>Empanelment Certificate</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("AGREEMENT")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "AGREEMENT"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-300 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Partnership Agreement</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ID_CARD")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "ID_CARD"
                  ? "bg-amber-500/15 text-amber-900 border border-amber-300 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-amber-600" />
              <span>Digital Advocate ID</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            DOCUMENT BODY (Scrollable on screen, Full on Print)
        ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:overflow-visible print:p-0">
          {/* TAB 1: EMPANELMENT CERTIFICATE */}
          {activeTab === "CERTIFICATE" && (
            <div className="mx-auto max-w-2xl rounded-2xl border-8 border-double border-amber-600/40 bg-gradient-to-br from-amber-50/20 via-white to-amber-50/30 p-6 sm:p-10 shadow-sm print:border-8 print:border-double print:border-amber-700 print:shadow-none">
              {/* Certificate Inner Border */}
              <div className="relative rounded-xl border border-amber-300/60 p-6 sm:p-8 text-center">
                {/* Background Watermark Emblem */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
                  <Scale className="h-64 w-64 text-amber-950" />
                </div>

                {/* Header */}
                <div className="relative">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                    <Scale className="h-7 w-7" />
                  </div>
                  <h4 className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-amber-700">
                    VakeelSetu Legal Network of India
                  </h4>
                  <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Certificate of Empanelment
                  </h1>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Accreditation & Practice Recognition
                  </p>
                  <div className="mx-auto mt-3 h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                </div>

                {/* Body Content */}
                <div className="relative mt-8 space-y-4 text-sm leading-relaxed text-slate-700">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    This is proudly conferred to
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-slate-950 sm:text-3xl underline decoration-amber-400 decoration-2 underline-offset-8">
                    Adv. {advocateName}
                  </h2>
                  <p className="mx-auto max-w-lg text-xs leading-6 text-slate-600 sm:text-sm">
                    Enrolled with the{" "}
                    <span className="font-bold text-slate-900">
                      Bar Council of {state}
                    </span>{" "}
                    under Statutory Enrollment No.{" "}
                    <span className="font-mono font-bold text-slate-950">
                      {barCouncilId}
                    </span>
                    . Following strict background verification of credentials and standing,
                    the aforementioned legal practitioner is hereby empanelled on the
                    VakeelSetu national portal for legal consultation and dispute resolution.
                  </p>
                </div>

                {/* Practice Area Badge */}
                <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/80 px-4 py-1 text-xs font-bold text-amber-900">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  <span>Recognized Focus: {practiceArea}</span>
                </div>

                {/* Verification Metadata & Signatures */}
                <div className="relative mt-10 grid grid-cols-2 items-end border-t border-slate-200/80 pt-6 text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Certificate ID:
                    </p>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {certNumber}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Issued On:
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {issueDate}
                    </p>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    {/* Seal & Signature stamp */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-600/70 bg-amber-50 text-[10px] font-extrabold uppercase text-amber-800 shadow-inner">
                      <div className="text-center leading-tight">
                        <span className="block text-[8px] font-black tracking-tighter">
                          SEAL OF
                        </span>
                        <span>VERIFIED</span>
                        <span className="block text-[8px]">ADVOCATE</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-900">
                      Authorized Signatory
                    </p>
                    <p className="text-[10px] text-slate-500">
                      VakeelSetu Empanelment Board
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNERSHIP AGREEMENT */}
          {activeTab === "AGREEMENT" && (
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm print:border-none print:shadow-none">
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                    VakeelSetu Platform Agreement
                  </h4>
                  <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                    Advocate Service & Empanelment Agreement
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Electronic Record under the Information Technology Act, 2000
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-700">
                    AGREEMENT
                  </span>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Date: {issueDate}
                  </p>
                </div>
              </div>

              {/* Agreement Parties */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs leading-relaxed text-slate-700">
                <p>
                  <strong className="text-slate-900">PARTIES:</strong> This Agreement is
                  entered into between{" "}
                  <strong>VakeelSetu Legal Technologies Pvt. Ltd.</strong> and{" "}
                  <strong className="text-slate-950">Adv. {advocateName}</strong> (Bar
                  Council Enrolment:{" "}
                  <span className="font-mono font-semibold">{barCouncilId}</span>, practicing at{" "}
                  <span>{city}, {state}</span>).
                </p>
              </div>

              {/* Agreement Clauses */}
              <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-950">
                    1. Engagement & Professional Independence
                  </h4>
                  <p className="mt-1 text-slate-600">
                    The Advocate is empanelled as an independent legal professional. The
                    Advocate retains absolute autonomy over legal counsel, advisory, and
                    litigation representation in accordance with the Bar Council of India
                    Rules and the Advocates Act, 1961.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-950">
                    2. Client Confidentiality & Privilege
                  </h4>
                  <p className="mt-1 text-slate-600">
                    All communications, consultation records, shared documentation, and case
                    materials are governed by attorney-client privilege under Section 126 of
                    the Bharatiya Sakshya Adhiniyam, 2023. The Platform shall not record or
                    disclose privileged legal consultations.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-950">
                    3. Fee Structure & Transparent Payouts
                  </h4>
                  <p className="mt-1 text-slate-600">
                    The Advocate determines their own consultation charges (Voice, Video,
                    In-Person). Consultation fees collected through verified escrow gateways
                    are disbursed to the Advocate’s designated bank account within the agreed
                    settlement cycle, subject to applicable platform charges and GST.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-950">
                    4. Professional Conduct & Adherence
                  </h4>
                  <p className="mt-1 text-slate-600">
                    The Advocate agrees to honour scheduled appointments, provide punctual
                    service, and uphold the dignity and ethics of the legal profession.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    For VakeelSetu Legal Network
                  </p>
                  <div className="mt-3 h-10 border-b border-dashed border-slate-300 text-xs font-bold text-slate-800">
                    Authorized Signatory
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Digitally Sealed & Executed
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    For Empanelled Advocate
                  </p>
                  <div className="mt-3 h-10 border-b border-dashed border-slate-300 text-xs font-bold text-slate-950">
                    Adv. {advocateName}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Digitally Accepted at Onboarding ({issueDate})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL ADVOCATE ID CARD */}
          {activeTab === "ID_CARD" && (
            <div className="mx-auto max-w-xl space-y-6">
              {/* FRONT SIDE */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl print:border-slate-300 print:bg-slate-900 print:text-white">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />

                {/* ID Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        VakeelSetu
                      </h4>
                      <p className="text-[9px] uppercase tracking-widest text-amber-400">
                        Advocate Digital ID
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    <ShieldCheck className="h-3 w-3 text-amber-400" />
                    Verified Partner
                  </span>
                </div>

                {/* ID Body */}
                <div className="mt-5 flex items-start gap-4">
                  {photo ? (
                    <img
                      src={photo}
                      alt={advocateName}
                      className="h-20 w-20 shrink-0 rounded-2xl border-2 border-amber-400/40 object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/40 bg-amber-500/15 text-2xl font-black text-amber-300">
                      {advocateName.slice(0, 1)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-white">
                      Adv. {advocateName}
                    </h3>
                    <p className="text-xs font-bold text-amber-400">
                      {practiceArea}
                    </p>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Bar Council ID:</span>
                        <span className="font-mono font-bold text-white">
                          {barCouncilId}
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Jurisdiction:</span>
                        <span className="font-semibold text-white">
                          {city}, {state}
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-slate-400">Member ID:</span>
                        <span className="font-mono font-semibold text-amber-300">
                          {memberId}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-400">
                  <span>Issued: {issueDate}</span>
                  <span className="font-mono text-amber-400">
                    www.vakeelsetu.com
                  </span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border-slate-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Digital Profile & Verification
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Scan QR code to access live authenticated public profile
                    </p>
                  </div>
                  {/* Generated QR Code placeholder with emblem */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 shadow-inner">
                    <QrCode className="h-10 w-10 text-slate-900" />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-[10px] leading-relaxed text-slate-500">
                  <p>
                    <strong>NOTICE:</strong> This card certifies that the cardholder is a
                    verified advocate on VakeelSetu. In case of lost card or credential
                    verification, contact helpline at support@vakeelsetu.com or visit the
                    official directory.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

