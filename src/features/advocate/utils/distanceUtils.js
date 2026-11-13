/**
 * Pure client-side distance and travel time calculation utilities.
 * No external paid Google Maps APIs required.
 */

/**
 * Calculates straight-line (great-circle/crow-fly) distance in kilometers
 * between two latitude/longitude points using the Haversine formula.
 */
export function calculateAirDistanceKm(lat1, lon1, lat2, lon2) {
  const p1 = Number(lat1);
  const l1 = Number(lon1);
  const p2 = Number(lat2);
  const l2 = Number(lon2);

  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(p2 - p1);
  const dLon = toRad(l2 - l1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1)) *
      Math.cos(toRad(p2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estimateTravelMinutesFromRoadKm(roadKm) {
  const km = Number(roadKm);
  if (!Number.isFinite(km) || km <= 0) return 5;
  // ~30 km/h (~2 minutes per km), minimum 10 minutes
  return Math.max(10, Math.round(km * 2));
}

/**
 * Extracts office coordinates flexibly from any advocate object shape.
 * Returns { lat, lng } or null if missing/invalid.
 */
export function extractOfficeCoords(advocate) {
  if (!advocate || typeof advocate !== "object") return null;
  const office = advocate.office || {};

  const rawLat =
    advocate.officeLatitude ??
    office.latitude ??
    office.officeLatitude ??
    advocate.latitude ??
    advocate.lat ??
    office.lat ??
    null;

  const rawLng =
    advocate.officeLongitude ??
    office.longitude ??
    office.officeLongitude ??
    advocate.longitude ??
    advocate.lng ??
    advocate.lon ??
    office.lng ??
    office.lon ??
    null;

  if (rawLat === null || rawLat === undefined || rawLat === "") return null;
  if (rawLng === null || rawLng === undefined || rawLng === "") return null;

  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  return { lat, lng };
}

/**
 * Estimates road distance and travel time using Haversine × 1.3 (~30 km/h).
 */
export function estimateTravelDetails(userLat, userLng, officeLat, officeLng) {
  if (
    userLat == null ||
    userLng == null ||
    officeLat == null ||
    officeLng == null
  ) {
    return null;
  }

  const airKm = calculateAirDistanceKm(userLat, userLng, officeLat, officeLng);
  if (airKm <= 0) {
    return {
      airKm: 0,
      roadKm: 0.5,
      travelTimeMinutes: 5,
      isApprox: true,
      source: "haversine",
      routeCoordinates: null,
    };
  }

  // 1.3x multiplier for road route winding vs straight line
  const roadKm = Math.max(0.5, Math.round(airKm * 1.3 * 10) / 10);
  const travelTimeMinutes = estimateTravelMinutesFromRoadKm(roadKm);

  return {
    airKm: Math.round(airKm * 10) / 10,
    roadKm,
    travelTimeMinutes,
    isApprox: true,
    source: "haversine",
    routeCoordinates: null,
  };
}

/**
 * Geocodes a street/city address using free OpenStreetMap Nominatim API.
 * Returns { lat, lng, isEstimatedFromAddress: true } or null.
 */
export async function geocodeAddressWithNominatim(address, timeoutMs = 8000) {
  const query = String(address || "").trim();
  if (!query) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = Number(data[0]?.lat);
    const lng = Number(data[0]?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng, isEstimatedFromAddress: true };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches real driving distance, duration, and route polyline from free OSRM API.
 * Falls back to Haversine (~approx) if OSRM fails or times out (8s).
 */
export async function fetchOsrmRoute(
  fromLat,
  fromLng,
  toLat,
  toLng,
  timeoutMs = 8000,
) {
  const fLat = Number(fromLat);
  const fLng = Number(fromLng);
  const tLat = Number(toLat);
  const tLng = Number(toLng);

  if (
    !Number.isFinite(fLat) ||
    !Number.isFinite(fLng) ||
    !Number.isFinite(tLat) ||
    !Number.isFinite(tLng)
  ) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${tLng},${tLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      return estimateTravelDetails(fLat, fLng, tLat, tLng);
    }
    const data = await res.json();
    const route = Array.isArray(data?.routes) ? data.routes[0] : null;
    if (!route || typeof route.distance !== "number" || typeof route.duration !== "number") {
      return estimateTravelDetails(fLat, fLng, tLat, tLng);
    }

    const roadKm = Math.max(0.1, Math.round((route.distance / 1000) * 10) / 10);
    const travelTimeMinutes = Math.max(1, Math.round(route.duration / 60));
    const coords = Array.isArray(route.geometry?.coordinates)
      ? route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
      : null;

    return {
      airKm: Math.round(calculateAirDistanceKm(fLat, fLng, tLat, tLng) * 10) / 10,
      roadKm,
      travelTimeMinutes,
      isApprox: false,
      source: "osrm",
      routeCoordinates: coords,
    };
  } catch {
    return estimateTravelDetails(fLat, fLng, tLat, tLng);
  } finally {
    clearTimeout(timer);
  }
}

