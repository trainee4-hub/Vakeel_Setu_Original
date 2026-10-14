import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBalanceScale,
  FaShieldAlt,
} from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

import LegalSectionExplorer from "../components/LegalSectionExplorer";
import { ipcSectionsApi } from "../services/legalSectionsApi";

/* ============================================================
   IPC — Indian Penal Code, 1860 (legacy reference)

   All sections come from the backend:
     GET /api/ipc?page=&limit=
     GET /api/ipc/search?q=&page=&limit=
     GET /api/ipc/:id
============================================================ */

const IPC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

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
                <FaBalanceScale
                  className="text-[22px]"
                  aria-hidden="true"
                />

                <span className="text-sm font-bold uppercase tracking-[0.15em]">
                  Legal Hub
                </span>
              </div>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Indian Penal
                <span className="text-amber-600"> Code.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Explore provisions of the Indian Penal Code, 1860
                for historical, legacy and legal reference
                purposes.
              </p>
            </div>

            <Link
              to="/legal-hub/bns"
              className="group inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Explore BNS

              <FiArrowRight
                className="text-lg transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH + SECTIONS + DETAIL (real API)
      ====================================================== */}

      <LegalSectionExplorer
        api={ipcSectionsApi}
        codeLabel="IPC"
        searchPlaceholder="Search IPC section, offence or keyword..."
      />

      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <FaShieldAlt
              className="mt-0.5 shrink-0 text-[20px] text-slate-400"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-bold text-slate-800">
                Legal information notice
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                These sections are provided for general legal
                education and navigation only. Consult the official
                statutory text and a qualified legal professional
                for interpretation or advice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IPC;