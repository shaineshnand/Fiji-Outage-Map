/**
 * Geocoding = turning "Nasinu" into latitude/longitude.
 * Browser calls /api/geocode (Nominatim blocks direct browser requests).
 */

const FIJI_VIEWBOX = "176.0,-20.5,180.0,-16.0";

export async function geocodeLocationFromNominatim(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "fj",
    viewbox: FIJI_VIEWBOX,
    bounded: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "User-Agent": "FijiOutageMap/1.0 (community project)" } }
  );

  if (!res.ok) return null;

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) return null;

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    displayName: results[0].display_name.split(",")[0],
  };
}

/** Client-safe geocode via our API route */
export async function geocodeLocation(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`/api/geocode?${params}`);

  if (!res.ok) return null;

  const data = (await res.json()) as {
    ok: boolean;
    result?: { lat: number; lng: number; displayName: string };
  };

  return data.ok && data.result ? data.result : null;
}

/** Known Fiji place names — useful for crawler text parsing */
export const FIJI_PLACES = [
  "Suva",
  "Nasinu",
  "Nadi",
  "Lautoka",
  "Labasa",
  "Ba",
  "Sigatoka",
  "Savusavu",
  "Rakiraki",
  "Levuka",
  "Pacific Harbour",
  "Tavua",
  "Korovou",
  "Navua",
  "Nausori",
];

export function detectLocationFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const place of FIJI_PLACES) {
    if (lower.includes(place.toLowerCase())) return place;
  }
  return null;
}
