import type { PartIdentification, AccuProduct } from "../types";

const ACCU_BASE = "https://www.accu.co.uk";

export function buildAccuSearchUrl(identification: PartIdentification): string {
  return `${ACCU_BASE}/en/search?q=${encodeURIComponent(buildAccuSearchQuery(identification))}`;
}

export async function searchAccu(
  identification: PartIdentification
): Promise<AccuProduct[]> {
  // Accu's site (including sitemap) is Cloudflare-protected and returns a JS
  // challenge for non-browser clients. We can't reliably scrape product
  // results server-side. Instead, we return a ranked set of pre-filtered
  // Accu search URLs - Accu's own search then handles the full catalogue.
  return buildSearchResultSet(identification);
}

/**
 * Build a primary Accu search query tuned for the identified category.
 * Each category prefers different tokens - e.g. magnets want "pot magnet 20mm
 * N35", hinges want "piano hinge stainless", fasteners want "M5 x 20 socket
 * cap A2 stainless DIN 912".
 */
export function buildPartSearchQuery(id: PartIdentification): string {
  return buildAccuSearchQuery(id);
}

function buildAccuSearchQuery(id: PartIdentification): string {
  const tokens: string[] = [];
  const attrs = id.attributes ?? {};

  const addAttr = (key: string) => {
    const v = attrs[key];
    if (v) tokens.push(String(v).trim());
  };

  switch (id.category) {
    case "fastener": {
      pushIfPresent(tokens, id.specs.threadSize);
      if (id.specs.length) tokens.push(id.specs.length.replace(/\s/g, ""));
      pushIfPresent(tokens, id.specs.headType);
      if (id.specs.driveType && !/hex socket/i.test(id.specs.driveType)) {
        tokens.push(id.specs.driveType);
      }
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "nut_washer": {
      pushIfPresent(tokens, id.specs.threadSize);
      tokens.push(id.partType);
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "magnet": {
      addAttr("shape");
      tokens.push("magnet");
      addAttr("outer diameter");
      addAttr("height");
      addAttr("grade");
      addAttr("coating");
      break;
    }
    case "knob_handle_lever": {
      tokens.push(id.partType);
      addAttr("head diameter");
      addAttr("stud");
      pushIfPresent(tokens, id.specs.threadSize);
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "hinge_latch": {
      tokens.push(id.partType);
      addAttr("leaf length");
      addAttr("leaf width");
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "spring": {
      tokens.push(id.partType);
      addAttr("outer diameter");
      addAttr("free length");
      addAttr("wire diameter");
      break;
    }
    case "circlip_clip": {
      tokens.push(id.partType);
      addAttr("bore diameter");
      addAttr("shaft diameter");
      pushIfPresent(tokens, id.specs.standard);
      break;
    }
    case "bearing_bushing": {
      tokens.push(id.partType);
      addAttr("bore");
      addAttr("outer diameter");
      addAttr("width");
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "o_ring_seal": {
      tokens.push("o-ring");
      addAttr("inner diameter");
      addAttr("cross-section");
      addAttr("material");
      break;
    }
    case "cable_gland_grommet": {
      tokens.push(id.partType);
      addAttr("thread");
      addAttr("cable range");
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "levelling_foot": {
      tokens.push("levelling foot");
      addAttr("base diameter");
      addAttr("stud");
      break;
    }
    case "shaft_collar": {
      tokens.push("shaft collar");
      addAttr("bore");
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "threaded_rod": {
      tokens.push("threaded rod");
      pushIfPresent(tokens, id.specs.threadSize);
      pushIfPresent(tokens, id.specs.length);
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
    case "pin_shaft":
    case "standoff_spacer":
    case "insert_rivet":
    case "tool_key":
    case "other":
    default: {
      tokens.push(id.partType);
      pushIfPresent(tokens, id.specs.threadSize);
      if (id.specs.length) tokens.push(id.specs.length.replace(/\s/g, ""));
      pushIfPresent(tokens, id.specs.headType);
      pushSimplifiedMaterial(tokens, id.specs.material);
      break;
    }
  }

  const dedup = Array.from(new Set(tokens.map((t) => t.trim()).filter(Boolean)));
  if (dedup.length === 0) {
    return id.searchTerms[0] ?? id.name;
  }
  return dedup.join(" ");
}

function pushIfPresent(out: string[], v: string | null | undefined) {
  if (v) out.push(v.trim());
}

function pushSimplifiedMaterial(out: string[], mat: string | null | undefined) {
  if (!mat) return;
  const m = mat.toLowerCase();
  if (m.includes("stainless")) out.push("stainless");
  else if (m.includes("brass")) out.push("brass");
  else if (m.includes("nylon")) out.push("nylon");
  else if (m.includes("titanium")) out.push("titanium");
  else if (m.includes("steel")) out.push("steel");
}

/**
 * Return a small set of Accu-search results: the primary pre-filtered search,
 * plus broader fallbacks from the AI's suggested search terms. Every item
 * links to a working accu.co.uk/en/search page.
 */
function buildSearchResultSet(id: PartIdentification): AccuProduct[] {
  const primary = buildAccuSearchQuery(id);
  const seen = new Set<string>([primary.toLowerCase()]);
  const extras: string[] = [];
  for (const term of id.searchTerms ?? []) {
    const key = term.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    extras.push(term);
    if (extras.length >= 2) break;
  }

  const results: AccuProduct[] = [];

  results.push({
    name: id.name,
    url: `${ACCU_BASE}/en/search?q=${encodeURIComponent(primary)}`,
    imageUrl: null,
    specs: attributesAsSpecs(id),
    priceTiers: [],
    stockStatus: "unknown",
    matchConfidence: rankConfidence(id, "primary"),
  });

  for (const term of extras) {
    results.push({
      name: `Broader search: "${term}"`,
      url: `${ACCU_BASE}/en/search?q=${encodeURIComponent(term)}`,
      imageUrl: null,
      specs: {},
      priceTiers: [],
      stockStatus: "unknown",
      matchConfidence: "approximate",
    });
  }

  return results;
}

function attributesAsSpecs(id: PartIdentification): Record<string, string> {
  const out: Record<string, string> = {};
  const specEntries: Array<[string, string | null]> = [
    ["Thread", id.specs.threadSize],
    ["Length", id.specs.length],
    ["Diameter", id.specs.diameter],
    ["Head", id.specs.headType],
    ["Drive", id.specs.driveType],
    ["Material", id.specs.material],
    ["Finish", id.specs.finish],
    ["Standard", id.specs.standard],
  ];
  for (const [k, v] of specEntries) if (v) out[k] = v;
  for (const [k, v] of Object.entries(id.attributes ?? {})) {
    if (v) out[k] = v;
  }
  return out;
}

function rankConfidence(
  id: PartIdentification,
  slot: "primary" | "extra"
): AccuProduct["matchConfidence"] {
  if (slot !== "primary") return "approximate";
  if (id.confidence === "high") return "close";
  if (id.confidence === "medium") return "approximate";
  return "approximate";
}
