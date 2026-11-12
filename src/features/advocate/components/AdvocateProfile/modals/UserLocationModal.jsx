import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiMapPin,
  FiNavigation,
  FiX,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { estimateTravelDetails } from "../../../utils/distanceUtils";

const DEFAULT_LAT = 28.6304;
const DEFAULT_LNG = 77.2177;

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.L) {
      resolve(window.L);
      return;
    }
    if (typeof document === "undefined") {
      reject(new Error("Document is undefined"));
      return;
    }

    const existingScript = document.getElementById("leaflet-cdn-script");
    if (existingScript) {
      if (window.L) {
        resolve(window.L);
      } else {
        existingScript.addEventListener("load", () => resolve(window.L));
        existingScript.addEventListener("error", reject);
      }
      return;
    }

    if (!document.getElementById("leaflet-cdn-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-cdn-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.id = "leaflet-cdn-script";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet loaded without global L"));
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export default function UserLocationModal({
  isOpen,
  onClose,
  officeLat,
  officeLng,
  officeLocation,
  onConfirmLocation,
  onSkip,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const officeMarkerRef = useRef(null);
  const LRef = useRef(null);

  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [travelDetails, setTravelDetails] = useState(null);

  // Guaranteed fallback office coordinates (Delhi NCR default if advocate coords missing)
  const targetOfficeLat =
    officeLat != null && !isNaN(Number(officeLat)) ? Number(officeLat) : DEFAULT_LAT;
  const targetOfficeLng =
    officeLng != null && !isNaN(Number(officeLng)) ? Number(officeLng) : DEFAULT_LNG;

  // Recalculate distance whenever userLat / userLng changes
  useEffect(() => {
    if (userLat != null && userLng != null) {
      const details = estimateTravelDetails(userLat, userLng, targetOfficeLat, targetOfficeLng);
      setTravelDetails(details);
    } else {
      setTravelDetails(null);
    }
  }, [userLat, userLng, targetOfficeLat, targetOfficeLng]);

  // Set user pin on map
  const setUserPosition = useCallback(
    (lat, lng, pan = true) => {
      setUserLat(lat);
      setUserLng(lng);
      setDetectError("");

      const L = LRef.current;
      const map = mapInstanceRef.current;
      if (!L || !map) return;

      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: `
          <div style="width: 36px; height: 46px; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));">
            <svg width="28" height="35" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 3C10.268 3 4 9.268 4 17c0 10.2 12.6 24.4 13.4 25.3a.8.8 0 0 0 1.2 0C19.4 41.4 32 27.2 32 17c0-7.732-6.268-14-14-14z" fill="#EA4335" stroke="#ffffff" stroke-width="1.8"/>
              <circle cx="18" cy="17" r="5.5" fill="#B31412"/>
            </svg>
          </div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 43], 
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: userIcon,
          draggable: true,
        }).addTo(map);

        marker.bindPopup("<strong style='font-size:12px;'>Your Location</strong>");

        marker.on("dragend", (e) => {
          const newPos = e.target.getLatLng();
          setUserLat(Number(newPos.lat.toFixed(6)));
          setUserLng(Number(newPos.lng.toFixed(6)));
        });

        userMarkerRef.current = marker;
      }

      if (pan) {
        // Fit bounds with office marker
        const bounds = L.latLngBounds([
          [lat, lng],
          [targetOfficeLat, targetOfficeLng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    },
    [targetOfficeLat, targetOfficeLng]
  );

  // Detect GPS
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    setDetectError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setUserPosition(lat, lng, true);
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          setDetectError("Location permission denied. Please tap on the map to set your location.");
        } else {
          setDetectError("Unable to retrieve location. Please tap on the map directly.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [setUserPosition]);

  // Initialize Map
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    loadLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;
        LRef.current = L;

        if (mapContainerRef.current._leaflet_id) {
          delete mapContainerRef.current._leaflet_id;
        }

        const centerLat = officeLat || DEFAULT_LAT;
        const centerLng = officeLng || DEFAULT_LNG;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: officeLat ? 13 : 11,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Add Office marker
        const officeIcon = L.divIcon({
          className: "custom-office-pin",
          html: `
            <div style="position: relative; width: 34px; height: 34px;">
              <div style="
                background: #f59e0b;
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <span style="transform: rotate(45deg); color: #020617; font-size: 17px; font-weight: 900;">🏛️</span>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const oMarker = L.marker([targetOfficeLat, targetOfficeLng], { icon: officeIcon }).addTo(map);
        oMarker.bindPopup(`<strong style="font-size:12px;">Advocate's Office</strong><br/><span style="font-size:11px; color:#64748b;">${officeLocation || "Consultation Chambers"}</span>`);
        officeMarkerRef.current = oMarker;

        // Allow user to click anywhere on map to drop user pin
        map.on("click", (e) => {
          const clickedLat = Number(e.latlng.lat.toFixed(6));
          const clickedLng = Number(e.latlng.lng.toFixed(6));
          setUserPosition(clickedLat, clickedLng, false);
        });

        // Auto trigger location detection once on open
        handleDetectLocation();
      })
      .catch((err) => {
        console.error("Leaflet load error", err);
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      userMarkerRef.current = null;
      officeMarkerRef.current = null;
    };
  }, [isOpen, officeLat, officeLng, officeLocation, setUserPosition, handleDetectLocation]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmLocation?.(travelDetails);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="
          relative
          w-full
          max-w-md
          rounded-[26px]
          border
          border-slate-200/90
          bg-white
          p-5
          sm:p-6
          shadow-2xl
          text-slate-900
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-600 shadow-sm">
              <FiNavigation className="text-lg" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950">
                Your Location for In-Person Meeting
              </h3>
              <p className="text-xs text-slate-500">
                Tap on map or use GPS to calculate travel time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3.5
              py-2
              text-xs
              font-bold
              text-slate-700
              hover:border-amber-300
              hover:bg-amber-50/60
              hover:text-amber-800
              transition
              disabled:opacity-60
            "
          >
            {detecting ? (
              <>
                <FiLoader className="animate-spin text-amber-600" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <FiMapPin className="text-amber-600" />
                <span>Use Current Location (GPS)</span>
              </>
            )}
          </button>

          <span className="text-[11px] font-semibold text-slate-400">
            Or tap directly on map
          </span>
        </div>

        {detectError && (
          <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            <FiAlertCircle className="mt-0.5 shrink-0 text-amber-600" />
            <span>{detectError}</span>
          </div>
        )}

        {/* Leaflet Map Box */}
        <div className="mt-3 relative h-56 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-inner">
          <div ref={mapContainerRef} className="h-full w-full z-10" />

          {/* Map legend */}
          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200/70">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Office
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> You
            </span>
          </div>
        </div>

        {/* Soft Warm Warning Banner */}
        <div
          id="in-person-travel-warning-box"
          className="mt-3.5 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-3.5 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-700">
              <FiAlertCircle className="text-base font-black" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="font-extrabold text-xs text-amber-950 sm:text-sm">
                  {travelDetails
                    ? `Advocate office is ~${travelDetails.roadKm} km away (~${
                        travelDetails.travelTimeMinutes >= 60
                          ? `${Math.floor(travelDetails.travelTimeMinutes / 60)} ${
                              Math.floor(travelDetails.travelTimeMinutes / 60) === 1 ? "hour" : "hours"
                            }${
                              travelDetails.travelTimeMinutes % 60 > 0
                                ? ` ${travelDetails.travelTimeMinutes % 60} ${
                                    travelDetails.travelTimeMinutes % 60 === 1 ? "minute" : "minutes"
                                  }`
                                : ""
                            }`
                          : `${travelDetails.travelTimeMinutes} minutes`
                      } travel)`
                    : "In-Person Meeting Travel Advisory"}
                </p>
               
              </div>

              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                This is a physical in-person meeting at the advocate's office. Please allow enough travel time when picking your slot.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleConfirm}
            className="
              w-full
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-amber-500
              hover:bg-amber-600
              active:scale-[0.99]
              px-5
              text-xs sm:text-sm
              font-bold
              text-white
              shadow-sm
              transition-all
              cursor-pointer
            "
          >
            <FiCheck className="text-base font-bold" />
            <span>{travelDetails ? "Confirm & View Slots" : "Proceed to Slots"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

