import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiMapPin,
  FiNavigation,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
  FiSave,
} from "react-icons/fi";
import { patchAdvocateProfile } from "../../services/advocateApi";

/** Default fallback coordinates (Connaught Place, New Delhi) */
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

    // Check if script is already injected
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

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-cdn-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-cdn-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
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

export default function OfficeLocationPicker({
  initialLatitude,
  initialLongitude,
  onChange,
  onLocationSaved,
  error,
  showSaveButton = true,
  readOnly = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [lat, setLat] = useState(() =>
    initialLatitude !== null && initialLatitude !== undefined && !Number.isNaN(Number(initialLatitude))
      ? Number(Number(initialLatitude).toFixed(6))
      : null,
  );

  const [lng, setLng] = useState(() =>
    initialLongitude !== null && initialLongitude !== undefined && !Number.isNaN(Number(initialLongitude))
      ? Number(Number(initialLongitude).toFixed(6))
      : null,
  );

  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Sync initial coordinates if provided/updated from backend profile reload
  useEffect(() => {
    const validLat =
      initialLatitude !== null &&
      initialLatitude !== undefined &&
      !Number.isNaN(Number(initialLatitude));
    const validLng =
      initialLongitude !== null &&
      initialLongitude !== undefined &&
      !Number.isNaN(Number(initialLongitude));

    if (validLat && validLng) {
      const parsedLat = Number(Number(initialLatitude).toFixed(6));
      const parsedLng = Number(Number(initialLongitude).toFixed(6));
      if (lat === null || parsedLat !== lat || lng === null || parsedLng !== lng) {
        setLat(parsedLat);
        setLng(parsedLng);
      }
    }
  }, [initialLatitude, initialLongitude, lat, lng]);

  const updateCoordinates = useCallback(
    (newLat, newLng) => {
      if (
        typeof newLat !== "number" ||
        typeof newLng !== "number" ||
        Number.isNaN(newLat) ||
        Number.isNaN(newLng)
      ) {
        return;
      }

      const formattedLat = Number(Number(newLat).toFixed(6));
      const formattedLng = Number(Number(newLng).toFixed(6));

      setLat(formattedLat);
      setLng(formattedLng);
      setSaveSuccess(false);
      setSaveError("");

      if (onChange) {
        onChange({
          officeLatitude: formattedLat,
          officeLongitude: formattedLng,
          latitude: formattedLat,
          longitude: formattedLng,
        });
      }
    },
    [onChange],
  );

  // Initialize Leaflet Map once
  useEffect(() => {
    let isCancelled = false;

    loadLeaflet()
      .then((L) => {
        if (isCancelled || !mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        if (mapContainerRef.current._leaflet_id) {
          delete mapContainerRef.current._leaflet_id;
        }

        const centerLat = typeof lat === "number" && !Number.isNaN(lat) ? lat : DEFAULT_LAT;
        const centerLng = typeof lng === "number" && !Number.isNaN(lng) ? lng : DEFAULT_LNG;
        const initialZoom = typeof lat === "number" && !Number.isNaN(lat) ? 15 : 12;

        // Custom amber marker icon
        const amberIcon = L.divIcon({
          className: "custom-office-pin-wrapper",
          html: `
            <div style="position: relative; width: 34px; height: 34px;">
              <div style="
                background: #f59e0b;
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                border: 2.5px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 9px;
                  height: 9px;
                  background: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                "></div>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: initialZoom,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([centerLat, centerLng], {
          draggable: !readOnly,
          icon: amberIcon,
        }).addTo(map);

        if (!readOnly) {
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            if (pos && typeof pos.lat === "number" && typeof pos.lng === "number") {
              updateCoordinates(pos.lat, pos.lng);
            }
          });

          map.on("click", (e) => {
            if (e?.latlng && typeof e.latlng.lat === "number" && typeof e.latlng.lng === "number") {
              marker.setLatLng(e.latlng);
              updateCoordinates(e.latlng.lat, e.latlng.lng);
            }
          });
        } else {
          map.on("click", () => {
            if (typeof lat === "number" && typeof lng === "number") {
              window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank", "noopener,noreferrer");
            }
          });
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setMapLoaded(true);

        // Workaround for container size calculation
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      })
      .catch((err) => {
        console.warn("Could not load dynamic map from CDN:", err);
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, updateCoordinates]);

  // Re-center Leaflet Map marker when coordinates change
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      markerRef.current &&
      typeof lat === "number" &&
      !Number.isNaN(lat) &&
      typeof lng === "number" &&
      !Number.isNaN(lng)
    ) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng]);
    }
  }, [lat, lng]);

  // Use my current location handler
  const handleUseCurrentLocation = () => {
    setGeoNotice("");
    setSaveError("");

    if (typeof window === "undefined" || !navigator?.geolocation) {
      setGeoNotice("Geolocation is not supported by your browser. Allow location or drop a pin on the map manually.");
      return;
    }

    setIsLocating(true);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const rawLat = pos?.coords?.latitude;
          const rawLng = pos?.coords?.longitude;

          if (
            typeof rawLat !== "number" ||
            typeof rawLng !== "number" ||
            Number.isNaN(rawLat) ||
            Number.isNaN(rawLng)
          ) {
            setGeoNotice("Could not determine accurate coordinates. Please drop a pin on the map manually.");
            return;
          }

          const newLat = Number(rawLat.toFixed(6));
          const newLng = Number(rawLng.toFixed(6));

          updateCoordinates(newLat, newLng);

          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
            mapInstanceRef.current.setView([newLat, newLng], 16);
            mapInstanceRef.current.invalidateSize();
          }
          setGeoNotice("Current location captured. You can adjust the pin on the map if you are not at your office now.");
        },
        (err) => {
          setIsLocating(false);
          console.warn("Geolocation request failed:", err);
          let message = "Allow location or drop a pin on the map manually.";
          if (err?.code === 1) {
            message = "Location permission denied. Please allow location access or drop a pin on the map manually.";
          } else if (err?.code === 2) {
            message = "Location position unavailable. Drop a pin on the map manually.";
          } else if (err?.code === 3) {
            message = "Location request timed out. Please drop a pin on the map manually.";
          }
          setGeoNotice(message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (err) {
      setIsLocating(false);
      console.warn("Geolocation call failed synchronously:", err);
      setGeoNotice("Location service unavailable. Please drop a pin on the map manually.");
    }
  };

  // Manual input coordinate change
  const _handleManualCoordChange = (field, value) => {
    setSaveSuccess(false);
    setSaveError("");
    const parsed = value === "" ? "" : Number(value);

    let nextLat = field === "lat" ? parsed : lat;
    let nextLng = field === "lng" ? parsed : lng;

    if (field === "lat") setLat(parsed === "" ? null : parsed);
    if (field === "lng") setLng(parsed === "" ? null : parsed);

    if (
      nextLat !== null &&
      nextLng !== null &&
      nextLat !== "" &&
      nextLng !== "" &&
      !Number.isNaN(Number(nextLat)) &&
      !Number.isNaN(Number(nextLng))
    ) {
      const fixedLat = Number(Number(nextLat).toFixed(6));
      const fixedLng = Number(Number(nextLng).toFixed(6));

      if (fixedLat >= -90 && fixedLat <= 90 && fixedLng >= -180 && fixedLng <= 180) {
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([fixedLat, fixedLng]);
          mapInstanceRef.current.panTo([fixedLat, fixedLng]);
        }
        if (onChange) {
          onChange({
            officeLatitude: fixedLat,
            officeLongitude: fixedLng,
          });
        }
      }
    }
  };

  // Save location to backend via PATCH /api/advocate/profile
  const handleSaveLocation = async () => {
    if (lat === null || lng === null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
      setSaveError("Please select a location on the map or use current location.");
      return;
    }

    const fixedLat = Number(Number(lat).toFixed(6));
    const fixedLng = Number(Number(lng).toFixed(6));

    if (fixedLat < -90 || fixedLat > 90) {
      setSaveError("Latitude must be between -90 and 90 degrees.");
      return;
    }

    if (fixedLng < -180 || fixedLng > 180) {
      setSaveError("Longitude must be between -180 and 180 degrees.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const updatedAdvocate = await patchAdvocateProfile({
        officeLatitude: fixedLat,
        officeLongitude: fixedLng,
      });

      setSaveSuccess(true);
      if (onLocationSaved) {
        onLocationSaved({
          officeLatitude: fixedLat,
          officeLongitude: fixedLng,
          advocate: updatedAdvocate,
        });
      }
    } catch (err) {
      console.error("Failed to save office location:", err);
      setSaveError(
        err?.data?.message ||
          err?.message ||
          "Failed to save office location. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasCoords = typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng);
  const isSavedPin = initialLatitude !== null && initialLongitude !== null;

  return (
    <div className={`space-y-4 ${readOnly ? "" : "pt-2"}`}>
      {/* HEADER & CURRENT LOCATION BUTTON */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FiMapPin className="text-amber-500 text-sm" />
              Current Location
            </span>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isLocating ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-amber-600/40 border-t-amber-600" />
                Locating...
              </>
            ) : (
              <>
                <FiNavigation className="text-amber-600 text-sm" />
                Locate My Current Location
              </>
            )}
          </button>
        </div>
      )}

      {/* GEOLOCATION NOTICE / HELPER */}
      {geoNotice && (
        <div
          role="status"
          className="rounded-xl border border-green-300 bg-green-50/60 p-3 text-xs text-green-800 flex items-start gap-2"
        >
          <FiAlertCircle className="text-sm text-green-600 shrink-0 mt-0.5" />
          <span>{geoNotice}</span>
        </div>
      )}

      {/* MAP CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-72 z-0"
          style={{ minHeight: "260px" }}
        />

        {/* Coords Badge Overlay */}
        {/* {hasCoords && (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>
        )} */}

        {/* View on Google Maps External Link */}
        {hasCoords && (
          <a
            href={`https://www.google.com/maps?q=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-[400] inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md border border-slate-200/90 hover:bg-amber-50 hover:text-amber-700 transition"
          >
            <FiMapPin className="text-amber-500" />
            <span>Google Maps</span>
            <FiExternalLink className="text-xs text-slate-400" />
          </a>
        )}

        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-500 gap-2">
            <span className="size-6 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
            <span className="text-xs">Loading office map...</span>
          </div>
        )}
      </div>

      {/* MANUAL COORDINATES INPUTS & OPTIONAL SAVE BUTTON */}
      {!readOnly && showSaveButton && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
          <div>
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={!hasCoords || isSaving}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving pin...
                </>
              ) : saveSuccess ? (
                <>
                  <FiCheck className="text-sm" />
                  Location saved!
                </>
              ) : (
                <>
                  <FiSave className="text-sm" />
                  {isSavedPin ? "Get office location" : "Save office location"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Errors & Status */}
      {saveError && (
        <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
          <FiAlertCircle className="text-sm shrink-0" />
          {saveError}
        </p>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
          <FiAlertCircle className="text-sm shrink-0" />
          {error}
        </p>
      )}

      {saveSuccess && (
        <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
          <FiCheck className="text-sm shrink-0" />
          Office location coordinates saved ({lat?.toFixed(6)}, {lng?.toFixed(6)}).
        </p>
      )}
    </div>
  );
}
