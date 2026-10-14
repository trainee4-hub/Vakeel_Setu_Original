import { AnimatePresence, motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

export default function RemoveTeamMateModal({
  mate,
  removing,
  error,
  onCancel,
  onConfirm,
}) {
  const name = mate?.fullName || mate?.name || "this advocate";

  return (
    <AnimatePresence>
      {mate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Remove team mate"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => !removing && onCancel()}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative w-full max-w-[440px] rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-2xl"
          >
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
              Remove Team Mate?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-bold text-slate-700">
                {name}
              </span>{" "}
              from your legal team?
            </p>

            {error && (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={removing}
                className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={removing}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removing && (
                  <FiLoader
                    className="shrink-0 animate-spin text-[15px]"
                    aria-hidden="true"
                  />
                )}

                Remove Team Mate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}