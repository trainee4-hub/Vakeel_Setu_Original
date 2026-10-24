import React from "react";

import {
  FiBriefcase,
  FiExternalLink,
  FiPhone,
  FiMail,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiArrowUpRight,
} from "react-icons/fi";

import {
  FaParking,
  FaWheelchair,
} from "react-icons/fa";

/**
 * Office details + Google Maps embed. Every row is conditional on real data;
 * the whole card is skipped when the advocate has none of it.
 */
export default function OfficeInformation({
  advocateName,
  officeLocation,
  officeMapEmbedUrl,
  officeMapsUrl,
  officePhone,
  officeEmail,
  officeTimings,
  officeParking,
  officeAccessibility,
}) {
  const hasAnything =
    officeLocation ||
    officeEmail ||
    officePhone ||
    officeTimings ||
    officeParking ||
    officeAccessibility;

  if (!hasAnything) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FiBriefcase className="text-amber-500 text-lg" />
          Office Location and Address
        </h3>
      </div>

      {/* GOOGLE MAP */}
      {officeLocation && officeMapEmbedUrl && (
        <div className="px-4 sm:px-5">
          <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <iframe
              title={`Office location of ${advocateName}`}
              src={officeMapEmbedUrl}
              className="absolute -top-[65px] inset-x-0 w-full h-[calc(100%+65px)] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {officeMapsUrl && (
              <a
                href={officeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  absolute
                  top-3
                  right-3
                  z-10
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-xl
                  bg-white/95
                  backdrop-blur-md
                  px-3
                  py-2
                
                  text-xs
                  font-semibold
                  text-slate-700
                  shadow-md
                  border
                  border-slate-200/90
                  hover:bg-amber-50
                  hover:text-blue-600
                  hover:border-blue-200
                  hover:shadow-lg
                  transition-all
                  duration-200
                "
              >
                <FiMapPin className="text-amber-500 text-[1rem] shrink-0" />
                <span className="text-[0.80rem]">Maps</span>
                <FiExternalLink className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* OFFICE DETAILS */}
      <div className="px-6 py-5">
        <div className="space-y-4">
          {/* Location */}
          {officeLocation && (
            <div className="flex items-start gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiMapPin className="text-amber-500 text-lg" />
              </div>

              <div className="min-w-0">
                {/* <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Office Address
                </p> */}

                <p className="text-sm text-slate-600 leading-relaxed">
                  {officeLocation}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {officePhone && (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                <FiPhone className="text-slate-400 text-lg" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Phone
                </p>

                <a
                  href={`tel:${officePhone}`}
                  className="text-sm text-slate-600 hover:text-amber-600 transition-colors"
                >
                  {officePhone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {officeEmail && (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                <FiMail className="text-slate-400 text-lg" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Email
                </p>

                <a
                  href={`mailto:${officeEmail}`}
                  className="text-sm text-slate-600 hover:text-amber-600 transition-colors truncate block"
                >
                  {officeEmail}
                </a>
              </div>
            </div>
          )}

          {/* Timings */}
          {officeTimings && (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                <FiClock className="text-slate-400 text-lg" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Office Hours
                </p>

                <p className="text-sm text-slate-600">
                  {officeTimings}
                </p>
              </div>
            </div>
          )}

          {/* Parking */}
          {officeParking && (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                <FaParking className="text-slate-400 text-lg" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Parking
                </p>

                <p className="text-sm text-slate-600">
                  {officeParking}
                </p>
              </div>
            </div>
          )}

          {/* Accessibility */}
          {officeAccessibility && (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                <FaWheelchair className="text-slate-400 text-lg" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                  Accessibility
                </p>

                <p className="text-sm text-slate-600">
                  {officeAccessibility}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DIRECTIONS */}
        {officeMapsUrl && (
          <a
            href={officeMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-5
              w-full
              h-11
              rounded-xl
              bg-slate-900
              hover:bg-slate-800
              text-white
              font-bold
              text-sm
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-200
              hover:shadow-lg
            "
          >
            <FiNavigation className="text-lg" />
            Get Directions
            <FiArrowUpRight className="text-base" />
          </a>
        )}
      </div>
    </div>
  );
}