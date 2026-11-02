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

import OfficeLocationPicker from "@/features/advocate/components/office/OfficeLocationPicker";

/**
 * Office details + interactive map. Every row is conditional on real data;
 * the whole card is skipped when the advocate has none of it.
 */
export default function OfficeInformation({
  officeLocation,
  officePhotoUrl,
  officeLatitude,
  officeLongitude,
  officeMapEmbedUrl,
  officeMapsUrl,
  officePhone,
  officeEmail,
  officeTimings,
  officeParking,
  officeAccessibility,
}) {
  const hasCoords =
    typeof officeLatitude === "number" &&
    !Number.isNaN(officeLatitude) &&
    typeof officeLongitude === "number" &&
    !Number.isNaN(officeLongitude);

  const hasAnything =
    officePhotoUrl ||
    officeLocation ||
    hasCoords ||
    officeMapEmbedUrl ||
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


      {/* OFFICE MAP (Reusing existing OfficeLocationPicker map UI) */}
      {hasCoords && (
        <div className="px-4 sm:px-5 mb-3">
          <OfficeLocationPicker
            initialLatitude={officeLatitude}
            initialLongitude={officeLongitude}
            readOnly={true}
            showSaveButton={false}
          />
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