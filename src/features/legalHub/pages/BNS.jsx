import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import LegalSectionExplorer from "../components/LegalSectionExplorer";
import { bnsSectionsApi } from "../services/legalSectionsApi";

/* ============================================================
   BNS — Bharatiya Nyaya Sanhita, 2023

   All sections come from the backend:
     GET /api/bns?page=&limit=
     GET /api/bns/search?q=&page=&limit=
     GET /api/bns/:id

   The "Notable provisions" tiles are search shortcuts only —
   clicking one runs a real search for that section number.
============================================================ */

const NOTABLE_PROVISIONS = [
  { section: "111", title: "Organised Crime", icon: "groups" },
  { section: "112", title: "Petty Organised Crime", icon: "group_work" },
  { section: "113", title: "Terrorist Act", icon: "security" },
  { section: "304", title: "Snatching", icon: "front_hand" },
];

const BNS = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const searchSection = (sectionNo) => {
    const params = new URLSearchParams(searchParams);
    params.set("q", sectionNo);
    params.delete("page");
    setSearchParams(params);
    document.getElementById("legal-sections")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white px-4 pb-10 pt-6 sm:pb-12 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-amber-600">
                <span className="material-symbols-outlined" aria-hidden="true">
                  policy
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.15em]">Legal Hub</span>
              </div>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Bharatiya Nyaya
                <span className="text-amber-600"> Sanhita.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Search and explore provisions of the Bharatiya Nyaya Sanhita, 2023.
              </p>

              <div className="mt-5 inline-flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="material-symbols-outlined mt-0.5 text-emerald-600" aria-hidden="true">
                  verified
                </span>
                <p className="text-sm leading-6 text-emerald-900">
                  BNS is the current central criminal code framework that came into force on 1 July 2024.
                </p>
              </div>
            </div>

            <Link
              to="/legal-hub/ipc"
              className="group inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            >
              View IPC Reference
              <span
                className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH + SECTIONS + DETAIL (real API)
      ====================================================== */}

      <LegalSectionExplorer
        api={bnsSectionsApi}
        codeLabel="BNS"
        searchPlaceholder="Search BNS section, offence or keyword..."
      />

      {/* =====================================================
          NOTABLE PROVISIONS (search shortcuts)
      ====================================================== */}

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-7xl rounded-[28px] bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">Modern Criminal Law</span>
              <h2 className="mt-2 text-2xl font-bold">Notable BNS provisions</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                BNS includes provisions addressing areas such as organised crime, petty organised crime, snatching and
                specified offences concerning national security.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              {NOTABLE_PROVISIONS.map((item) => (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => searchSection(item.section)}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Section {item.section}</p>
                    <p className="mt-0.5 text-sm font-bold">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">
              verified_user
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Legal information notice</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                These sections are provided for legal education and easier navigation only. Always consult the
                official statutory text and a qualified legal professional for interpretation or advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BNS;