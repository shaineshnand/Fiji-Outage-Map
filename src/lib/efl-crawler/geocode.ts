const FIJI_VIEWBOX = "176.0,-20.5,180.0,-16.0";
const USER_AGENT = "FijiOutageMap-Crawler/1.0 (community outage map)";

const VITI_LEVU_VIEWBOX = "177.0,-18.5,178.5,-17.0";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let lastGeocodeAt = 0;

const DIVISION_ANCHORS: Record<string, { lat: number; lng: number; label: string }> =
  {
    Ba: { lat: -17.5343, lng: 177.677, label: "Ba" },
    Nadi: { lat: -17.7765, lng: 177.4356, label: "Nadi" },
    Lautoka: { lat: -17.6161, lng: 177.4665, label: "Lautoka" },
    Suva: { lat: -18.1416, lng: 178.4419, label: "Suva" },
    Sigatoka: { lat: -18.1416, lng: 177.5069, label: "Sigatoka" },
    Navua: { lat: -18.2394, lng: 178.048, label: "Navua" },
    Rakiraki: { lat: -17.363, lng: 178.203, label: "Rakiraki" },
    Tavua: { lat: -17.4434, lng: 177.8654, label: "Tavua" },
    Nausori: { lat: -18.0246, lng: 178.545, label: "Nausori" },
    Nasinu: { lat: -18.0833, lng: 178.45, label: "Nasinu" },
  };

const KNOWN_PLACES: Record<string, { lat: number; lng: number }> = {
  qerelevu: { lat: -17.548, lng: 177.662 },
  koronubu: { lat: -17.52, lng: 177.64 },
  navala: { lat: -17.625, lng: 177.72 },
  momi: { lat: -17.915, lng: 177.285 },
  sabeto: { lat: -17.792, lng: 177.43 },
  vitogo: { lat: -17.62, lng: 177.45 },
  navutu: { lat: -17.61, lng: 177.44 },
  saweni: { lat: -17.78, lng: 177.42 },
  benai: { lat: -17.54, lng: 177.65 },
  busabusa: { lat: -17.51, lng: 177.63 },
  sarava: { lat: -17.5, lng: 177.64 },
  vaqia: { lat: -17.53, lng: 177.66 },
  veisaru: { lat: -17.56, lng: 177.68 },
  labasa: { lat: -16.433, lng: 179.366 },
  savusavu: { lat: -16.78, lng: 179.333 },
  ovalau: { lat: -17.684, lng: 178.789 },
};

const VITI_LEVU_DIVISIONS = new Set([
  "Ba",
  "Nadi",
  "Lautoka",
  "Suva",
  "Sigatoka",
  "Navua",
  "Rakiraki",
  "Tavua",
  "Nausori",
  "Nasinu",
]);

function extractDivision(region: string): string | null {
  const parts = region.split(",").map((p) => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    for (const div of VITI_LEVU_DIVISIONS) {
      if (parts[i].toLowerCase() === div.toLowerCase()) return div;
    }
    if (parts[i].toLowerCase().endsWith(" ba") || parts[i] === "Ba") return "Ba";
  }
  if (region.toLowerCase().includes(", ba")) return "Ba";
  return null;
}

function findKnownPlace(text: string): { lat: number; lng: number; name: string } | null {
  const lower = text.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_PLACES)) {
    if (lower.includes(key)) {
      return { ...coords, name: key.charAt(0).toUpperCase() + key.slice(1) };
    }
  }
  return null;
}

function isLikelyVitiLevuMainland(lat: number, lng: number): boolean {
  return lat >= -18.6 && lat <= -17.0 && lng >= 177.0 && lng <= 178.55;
}

function isBadBaMatch(lat: number, lng: number, division: string | null): boolean {
  if (division !== "Ba") return false;
  if (lng > 178.15 && lat > -17.45) return true;
  if (!isLikelyVitiLevuMainland(lat, lng)) return true;
  return false;
}

export async function geocodeFiji(
  query: string,
  options?: { preferMainland?: boolean }
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const q = query.trim();
  if (!q) return null;

  const elapsed = Date.now() - lastGeocodeAt;
  if (elapsed < 1100) await sleep(1100 - elapsed);

  const params = new URLSearchParams({
    q: q.includes("Fiji") ? q : `${q}, Fiji`,
    format: "json",
    limit: "5",
    countrycodes: "fj",
    viewbox: options?.preferMainland ? VITI_LEVU_VIEWBOX : FIJI_VIEWBOX,
    bounded: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "User-Agent": USER_AGENT } }
  );

  lastGeocodeAt = Date.now();

  if (!res.ok) return null;

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) return null;

  for (const r of results) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (options?.preferMainland && !isLikelyVitiLevuMainland(lat, lng)) continue;
    return {
      lat,
      lng,
      displayName: r.display_name.split(",")[0],
    };
  }

  const first = results[0];
  return {
    lat: parseFloat(first.lat),
    lng: parseFloat(first.lon),
    displayName: first.display_name.split(",")[0],
  };
}

export function buildGeocodeQueries(region: string, area: string): string[] {
  const queries: string[] = [];
  const regionClean = region.replace(/\s+/g, " ").trim();
  const parts = regionClean.split(",").map((p) => p.trim()).filter(Boolean);

  if (regionClean) {
    queries.push(`${regionClean}, Viti Levu, Fiji`);
    queries.push(`${regionClean}, Fiji`);
  }

  if (parts.length >= 2) {
    const place = parts[parts.length - 2];
    const div = parts[parts.length - 1];
    queries.push(`${place}, ${div}, Viti Levu, Fiji`);
    if (div.toLowerCase() !== "ba") {
      queries.push(`${div}, Viti Levu, Fiji`);
    } else {
      queries.push(`${place}, Ba Province, Viti Levu, Fiji`);
      queries.push(`Ba Town, Ba, Viti Levu, Fiji`);
    }
  }

  const firstArea = area.split(",")[0]?.trim();
  if (firstArea && firstArea.length > 2) {
    queries.push(`${firstArea}, Viti Levu, Fiji`);
  }

  return [...new Set(queries)];
}

export async function geocodeFijiWithFallback(
  region: string,
  area: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const division = extractDivision(region);
  const combined = `${region} ${area}`;

  const known = findKnownPlace(combined);
  if (known) {
    return {
      lat: known.lat,
      lng: known.lng,
      displayName: region.split(",")[0]?.trim() || known.name,
    };
  }

  const preferMainland = division !== null && VITI_LEVU_DIVISIONS.has(division);

  for (const q of buildGeocodeQueries(region, area)) {
    const result = await geocodeFiji(q, { preferMainland });
    if (!result) continue;
    if (isBadBaMatch(result.lat, result.lng, division)) continue;
    return result;
  }

  if (division && DIVISION_ANCHORS[division]) {
    const anchor = DIVISION_ANCHORS[division];
    return {
      lat: anchor.lat,
      lng: anchor.lng,
      displayName: region.split(",")[0]?.trim() || anchor.label,
    };
  }

  return null;
}
