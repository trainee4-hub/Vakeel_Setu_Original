import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiLoader,
  FiMapPin,
  FiTrash2,
} from "react-icons/fi";

const initials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "AD";

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

/**
 * Every value is optional on purpose — the backend may omit any of them,
 * and a missing field is simply not rendered rather than faked.
 */
export default function TeamMateCard({
  mate,
  removing,
  onView,
  onRemove,
}) {
  const name = mate?.fullName || mate?.name || "Advocate";

  const photo =
    mate?.profilePhotoUrl || mate?.profileImage || null;

  const practice =
    mate?.bestPracticeArea || mate?.lawType || null;

  const barId =
    mate?.barCouncilId || mate?.barId || null;

  const place = [mate?.city, mate?.state]
    .filter(Boolean)
    .join(", ");

  const active =
    String(mate?.status || "").toUpperCase() === "ACTIVE";

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-shadow hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start gap-3">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-xs font-extrabold text-amber-700">
            {initials(name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold text-slate-900">
            {name}
          </h3>

          {practice && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {practice}
            </p>
          )}
        </div>

        {active && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            <FiCheckCircle
              className="shrink-0 text-[11px]"
              aria-hidden="true"
            />
            Active
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {barId && (
          <p className="truncate text-[11px] font-semibold tracking-wide text-slate-500">
            {barId}
          </p>
        )}

        {place && (
          <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-400">
            <FiMapPin
              className="shrink-0 text-[12px]"
              aria-hidden="true"
            />

            {place}
          </p>
        )}

        {Number.isFinite(Number(mate?.experienceYears)) && (
          <p className="text-[11px] text-slate-400">
            {Number(mate.experienceYears)} years experience
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onView(mate)}
          className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={() => onRemove(mate)}
          disabled={removing}
          aria-label={`Remove ${name} from your team`}
          className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing ? (
            <FiLoader
              className="animate-spin text-[15px]"
              aria-hidden="true"
            />
          ) : (
            <FiTrash2
              className="text-[15px]"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </motion.article>
  );
}