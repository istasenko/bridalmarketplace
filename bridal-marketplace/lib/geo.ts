/**
 * Haversine distance between two points in miles.
 */
export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** NYC metro zip codes within ~50 miles of Manhattan. Distance filter uses this map. */
const ZIP_COORDS: Record<string, [number, number]> = {
  // Manhattan (expanded for common zips)
  "10001": [40.75, -73.99],
  "10002": [40.72, -73.99],
  "10003": [40.73, -73.99],
  "10009": [40.73, -73.98],
  "10010": [40.74, -73.98],
  "10011": [40.74, -74.01],
  "10012": [40.73, -74],
  "10013": [40.72, -74.01],
  "10014": [40.74, -74.01],
  "10016": [40.75, -73.98],
  "10017": [40.75, -73.97],
  "10018": [40.76, -73.99],
  "10019": [40.77, -73.99],
  "10020": [40.76, -73.98],
  "10021": [40.77, -73.96],
  "10022": [40.76, -73.97],
  "10023": [40.77, -73.99],
  "10024": [40.79, -73.97],
  "10025": [40.8, -73.97],
  "10036": [40.76, -73.99],
  // Brooklyn
  "11201": [40.69, -73.99],
  "11205": [40.69, -73.97],
  "11206": [40.7, -73.94],
  "11211": [40.71, -73.96],
  "11215": [40.67, -73.99],
  "11217": [40.68, -73.98],
  "11222": [40.73, -73.95],
  "11238": [40.69, -73.96],
  // Queens
  "11101": [40.74, -73.96],
  "11106": [40.76, -73.93],
  "11354": [40.77, -73.83],
  "11355": [40.76, -73.82],
  "11372": [40.75, -73.88],
  "11375": [40.72, -73.88],
  "11432": [40.72, -73.79],
  // Bronx
  "10451": [40.82, -73.92],
  "10452": [40.84, -73.92],
  "10458": [40.86, -73.88],
  // Staten Island
  "10301": [40.63, -74.09],
  "10305": [40.6, -74.07],
  // NJ
  "07030": [40.74, -74.03],
  "07102": [40.74, -74.17],
  "07103": [40.75, -74.2],
  "07302": [40.72, -74.04],
  "07306": [40.73, -74.06],
  "08901": [40.49, -74.45],
  "07501": [40.92, -74.17],
  // Westchester / north
  "10601": [41.03, -73.76],
  "10701": [40.93, -73.9],
  "10801": [40.89, -73.78],
  // Long Island
  "11550": [40.71, -73.62],
  "11743": [40.87, -73.43],
  "11701": [40.76, -73.33],
  // Connecticut
  "06901": [41.05, -73.54],
  "06880": [41.12, -73.42],
};

export function zipToCoords(zip: string): [number, number] | null {
  const normalized = zip.replace(/\s/g, "").slice(0, 5);
  return ZIP_COORDS[normalized] ?? null;
}
