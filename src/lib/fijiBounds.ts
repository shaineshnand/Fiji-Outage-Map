/**
 * Fiji geographic limits (no Leaflet import — safe for server + client).
 */

export const FIJI_CENTER: [number, number] = [-17.8, 178.0];

export const FIJI_LAT_MIN = -20.8;
export const FIJI_LAT_MAX = -12.2;
export const FIJI_LNG_MIN = 176.0;
export const FIJI_LNG_MAX = 180.0;

export const FIJI_MAP_OPTIONS = {
  minZoom: 7,
  maxZoom: 14,
  maxBoundsViscosity: 1.0,
} as const;

export function isInsideFiji(lat: number, lng: number): boolean {
  return (
    lat >= FIJI_LAT_MIN &&
    lat <= FIJI_LAT_MAX &&
    lng >= FIJI_LNG_MIN &&
    lng <= FIJI_LNG_MAX
  );
}

/** Leaflet bounds tuple for MapContainer — client only */
export function getFijiLatLngBounds(): [[number, number], [number, number]] {
  return [
    [FIJI_LAT_MIN, FIJI_LNG_MIN],
    [FIJI_LAT_MAX, FIJI_LNG_MAX],
  ];
}
