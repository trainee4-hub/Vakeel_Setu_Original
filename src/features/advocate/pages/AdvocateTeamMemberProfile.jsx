import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Scale,
  Shield,
} from "lucide-react";

import { apiRequest } from "@shared/services/apiClient";

export default function AdvocateTeamMemberProfile() {
  const { id } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemberProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest(`/advocates/${encodeURIComponent(id)}`);
      const data = res?.advocate || res?.data || res;
      if (data && (data.id || data.name || data.fullName)) {
        setMember(data);
      } else {
        throw new Error(res?.message || "Team member profile not found.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load team member profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberProfile();
  }, [fetchMemberProfile]);

  const name = member?.name || member?.fullName || "Advocate";
  const barId =
    member?.barCouncilNumber ||
    member?.barCouncilId ||
    member?.barNumber ||
    "—";
  const experience = member?.experience
    ? `${member.experience} Years`
    : member?.yearsOfExperience
    ? `${member.yearsOfExperience} Years`
    : null;

  const specializations = Array.isArray(member?.specialization)
    ? member.specialization
    : Array.isArray(member?.specializations)
    ? member.specializations
    : typeof member?.specialization === "string"
    ? member.specialization.split(",").map((s) => s.trim())
    : [];

  const languages = Array.isArray(member?.languages)
    ? member.languages
    : typeof member?.languages === "string"
    ? member.languages.split(",").map((s) => s.trim())
    : [];

  const phone = member?.phone || member?.phoneNumber || "";
  const email = member?.email || "";
  const avatar = member?.avatarUrl || member?.profilePhotoUrl || "";
  const about = member?.about || member?.bio || "";
  const location = [member?.city, member?.state].filter(Boolean).join(", ");

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "AD";

  if (loading) {
    return (
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        <div className="w-full space-y-5 sm:space-y-6">
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200/80" />
          <div className="rounded-[26px] border border-slate-200 bg-white p-8">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 animate-pulse rounded-2xl bg-slate-200/80" />
              <div className="space-y-3">
                <div className="h-7 w-60 animate-pulse rounded-lg bg-slate-200/80" />
                <div className="h-4 w-40 animate-pulse rounded-lg bg-slate-200/80" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        {/* ===============================================================
            BACK TO TEAM LINK
        =============================================================== */}
        <div className="flex items-center justify-between">
          <Link
            to="/advocate/team"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to My Team
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <Shield size={12} />
            Team Member Profile
          </span>
        </div>

        {/* ===============================================================
            ERROR BANNER
        =============================================================== */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-red-900">
                Failed to load profile
              </p>
              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchMemberProfile}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:underline"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ===============================================================
            MEMBER PROFILE CARD
        =============================================================== */}
        {member && (
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* HERO CARD */}
            <div className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-full w-80 bg-gradient-to-l from-amber-50/70 to-transparent" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 font-serif text-2xl font-bold text-amber-700 shadow-sm">
                      {initials}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        {name}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        <CheckCircle2 size={12} /> Verified Colleague
                      </span>
                    </div>

                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Scale size={14} className="text-amber-600" />
                      Bar Council ID:{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {barId}
                      </span>
                    </p>

                    {location && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin size={13} />
                        {location}
                      </p>
                    )}
                  </div>
                </div>

                {/* DIRECT ACTIONS */}
                <div className="flex flex-wrap gap-2.5">
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-400"
                    >
                      <Phone size={15} />
                      Call Member
                    </a>
                  )}

                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <Mail size={15} />
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* STAT STRIP */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Briefcase size={14} className="text-amber-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Experience
                    </span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {experience || "Practicing Advocate"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Award size={14} className="text-blue-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Specialisations
                    </span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {specializations.length
                      ? `${specializations.length} Areas`
                      : "General Practice"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Direct Contact
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-mono font-bold text-slate-800 truncate">
                    {phone || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe size={14} className="text-violet-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      Languages
                    </span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {languages.length ? languages.join(", ") : "English, Hindi"}
                  </p>
                </div>
              </div>
            </div>

            {/* SPECIALISATIONS & DETAILS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* PRACTICE AREAS */}
              <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-7">
                <h2 className="text-base font-extrabold text-slate-950">
                  Practice Areas & Specialisations
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Primary areas of legal representation and advisory handled by this advocate.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {specializations.length ? (
                    specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3.5 py-1.5 text-xs font-bold text-amber-800"
                      >
                        <Scale size={12} className="text-amber-600" />
                        {spec}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      General Legal Practice
                    </p>
                  )}
                </div>

                {about && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      About the Advocate
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-line">
                      {about}
                    </p>
                  </div>
                )}
              </div>

              {/* VERIFICATION & DETAILS */}
              <div className="rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-5 space-y-4">
                <h2 className="text-base font-extrabold text-slate-950">
                  Team Member Details
                </h2>

                <div className="space-y-3 pt-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Full Legal Name
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{name}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Bar Council ID
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-slate-900">{barId}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Official Email
                    </p>
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:underline truncate max-w-full"
                      >
                        <Mail size={12} />
                        {email}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">—</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Direct Phone
                    </p>
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:underline"
                      >
                        <Phone size={12} />
                        {phone}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">—</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="flex gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">
                        Associated Colleague
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                        This advocate is an active team colleague in your workspace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </div>
    </main>
  );
}
