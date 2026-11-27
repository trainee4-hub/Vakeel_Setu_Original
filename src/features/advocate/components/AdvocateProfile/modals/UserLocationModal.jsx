import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiMapPin,
  FiNavigation,
  FiX,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import {
  fetchOsrmRoute,
  geocodeAddressWithNominatim,
} from "../../../utils/distanceUtils";

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

const KNOWN_CITY_COORDS = {
  jaipur: { lat: 26.9124, lng: 75.7873 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  patna: { lat: 25.6093, lng: 85.1376 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  indore: { lat: 22.7196, lng: 75.8577 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
  surat: { lat: 21.1702, lng: 72.8311 },
  noida: { lat: 28.5355, lng: 77.391 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
};

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
  const routeLineRef = useRef(null);
  const LRef = useRef(null);

  const [geocodedOffice, setGeocodedOffice] = useState(null);
  const [resolvingOffice, setResolvingOffice] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [detectError, setDetectError] = useState("");
  const [routeResult, setRouteResult] = useState(null);

  const directOffice = useMemo(() => {
    const hasDirect =
      officeLat !== null &&
      officeLat !== undefined &&
      officeLng !== null &&
      officeLng !== undefined &&
      Number.isFinite(Number(officeLat)) &&
      Number.isFinite(Number(officeLng));
    return hasDirect
      ? { lat: Number(officeLat), lng: Number(officeLng), isEstimatedFromAddress: false }
      : null;
  }, [officeLat, officeLng]);

  const resolvedOffice = useMemo(() => {
    if (directOffice) return directOffice;
    if (geocodedOffice) return geocodedOffice;
    const str = String(officeLocation || "").toLowerCase();
    for (const [city, coords] of Object.entries(KNOWN_CITY_COORDS)) {
      if (str.includes(city)) {
        return { ...coords, isEstimatedFromAddress: true };
      }
    }
    return { lat: 28.6139, lng: 77.209, isEstimatedFromAddress: true };
  }, [directOffice, geocodedOffice, officeLocation]);

  const travelDetails =
    isOpen && userLat != null && userLng != null && resolvedOffice
      ? routeResult
      : null;

  // Geocode office address via Nominatim only when direct coords are missing
  useEffect(() => {
    if (!isOpen || directOffice) return undefined;
    let cancelled = false;

    if (String(officeLocation || "").trim()) {
      Promise.resolve().then(() => {
        if (!cancelled) setResolvingOffice(true);
      });
      geocodeAddressWithNominatim(officeLocation).then((coords) => {
        if (cancelled) return;
        setResolvingOffice(false);
        if (coords) {
          setGeocodedOffice(coords);
        } else {
          setGeocodedOffice(null);
        }
      });
    } else {
      setResolvingOffice(false);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, directOffice, officeLocation]);

  // Fetch OSRM route (with 8s timeout + Haversine ~approx fallback) whenever user or office point updates
  useEffect(() => {
    if (!isOpen || userLat == null || userLng == null || !resolvedOffice) {
      return undefined;
    }

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setCalculatingRoute(true);
    });

    fetchOsrmRoute(userLat, userLng, resolvedOffice.lat, resolvedOffice.lng).then(
      (details) => {
        if (cancelled) return;
        setCalculatingRoute(false);
        setRouteResult(
          details
            ? {
                ...details,
                isEstimatedFromAddress: Boolean(resolvedOffice.isEstimatedFromAddress),
              }
            : null,
        );

        const L = LRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        if (routeLineRef.current) {
          routeLineRef.current.remove();
          routeLineRef.current = null;
        }

        if (Array.isArray(details?.routeCoordinates) && details.routeCoordinates.length > 1) {
          const line = L.polyline(details.routeCoordinates, {
            color: "#f59e0b",
            weight: 4,
            opacity: 0.9,
          }).addTo(map);
          routeLineRef.current = line;
          map.fitBounds(line.getBounds(), { padding: [45, 45], maxZoom: 15 });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [isOpen, userLat, userLng, resolvedOffice]);

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

      if (pan && resolvedOffice) {
        // Fit bounds with office marker
        const bounds = L.latLngBounds([
          [lat, lng],
          [resolvedOffice.lat, resolvedOffice.lng],
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    },
    [resolvedOffice]
  );

  // Detect GPS
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDetectError("We couldn't get your location — you can still continue booking.");
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
      () => {
        setDetecting(false);
        setDetectError("We couldn't get your location — you can still continue booking.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [setUserPosition]);

  // Initialize Map once office coordinates are resolved
  useEffect(() => {
    if (!isOpen || !resolvedOffice) return;

    let isCancelled = false;

    loadLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;
        LRef.current = L;

        if (mapContainerRef.current._leaflet_id) {
          delete mapContainerRef.current._leaflet_id;
        }

        const map = L.map(mapContainerRef.current, {
          center: [resolvedOffice.lat, resolvedOffice.lng],
          zoom: 13,
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

        const oMarker = L.marker([resolvedOffice.lat, resolvedOffice.lng], { icon: officeIcon }).addTo(map);
        oMarker.bindPopup(`<strong style="font-size:12px;">Advocate's Office</strong><br/><span style="font-size:11px; color:#64748b;">${officeLocation || "Consultation Chambers"}</span>`);
        officeMarkerRef.current = oMarker;

        // Force leaflet to calculate correct dimensions once modal DOM has mounted
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);

        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 400);

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
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      userMarkerRef.current = null;
      officeMarkerRef.current = null;
    };
  }, [isOpen, resolvedOffice, officeLocation, setUserPosition, handleDetectLocation]);

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
                  {resolvingOffice
                    ? "Locating advocate's office..."
                    : calculatingRoute
                      ? "Calculating driving route & travel time..."
                      : travelDetails
                        ? `Advocate's office is ${travelDetails.isApprox ? "~" : ""}${travelDetails.roadKm} km away · ${travelDetails.isApprox ? "~approx " : "about "}${
                            travelDetails.travelTimeMinutes >= 60
                              ? `${Math.floor(travelDetails.travelTimeMinutes / 60)} ${
                                  Math.floor(travelDetails.travelTimeMinutes / 60) === 1 ? "hour" : "hours"
                                }${
                                  travelDetails.travelTimeMinutes % 60 > 0
                                    ? ` ${travelDetails.travelTimeMinutes % 60} min`
                                    : ""
                                }`
                              : `${travelDetails.travelTimeMinutes} min`
                          } by road from your location.`
                        : "In-Person Meeting Travel Advisory"}
                </p>
                {resolvedOffice?.isEstimatedFromAddress && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Estimated from address
                  </span>
                )}
               
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

