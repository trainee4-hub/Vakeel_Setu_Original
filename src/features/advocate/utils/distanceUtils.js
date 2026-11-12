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

/**
 * Estimates road distance and realistic city travel time.
 * - Road detour factor: ~1.3x of straight-line distance
 * - Travel time factor: ~5 minutes per road km in standard city traffic
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
    };
  }

  // 1.3x multiplier for road route winding vs straight line
  const roadKm = Math.max(0.5, Math.round(airKm * 1.3 * 10) / 10);

  // 5 minutes per km in city conditions (with a minimum of 10 minutes)
  const travelTimeMinutes = Math.max(10, Math.round(roadKm * 5));

  return {
    airKm: Math.round(airKm * 10) / 10,
    roadKm,
    travelTimeMinutes,
  };
}

