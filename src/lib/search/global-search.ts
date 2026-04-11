import type { PartIdentification, GlobalPrice } from "../types";

export async function searchGlobalPrices(
  identification: PartIdentification
): Promise<GlobalPrice[]> {
  const query = buildSearchQuery(identification);
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    // Fallback: return direct search links
    return generateSearchLinks(identification);
  }

  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("num", "10");
    url.searchParams.set("gl", "gb");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const data = await response.json();
    return parseShoppingResults(data);
  } catch (error) {
    console.error("Global search error:", error);
    return generateSearchLinks(identification);
  }
}

function buildSearchQuery(id: PartIdentification): string {
  const parts: string[] = [];
  if (id.specs.threadSize) parts.push(id.specs.threadSize);
  if (id.specs.length) parts.push(id.specs.length);
  if (id.specs.headType) parts.push(id.specs.headType.replace("socket cap", "socket cap head"));
  if (id.partType !== "other") parts.push(id.partType);
  if (id.specs.material) parts.push(id.specs.material);
  if (id.specs.standard) parts.push(id.specs.standard);

  return parts.length > 0 ? parts.join(" ") : id.searchTerms[0] || id.name;
}

interface ShoppingResult {
  title?: string;
  link?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  currency?: string;
}

function parseShoppingResults(data: { shopping_results?: ShoppingResult[] }): GlobalPrice[] {
  if (!data.shopping_results) return [];

  return data.shopping_results
    .filter((r: ShoppingResult) => r.title && r.link)
    .map((r: ShoppingResult) => ({
      supplier: r.source || "Unknown",
      productName: r.title || "",
      productUrl: r.link || "",
      unitPrice: r.extracted_price || 0,
      currency: r.currency || "GBP",
      imageUrl: r.thumbnail || null,
      source: "google_shopping",
    }))
    .sort((a: GlobalPrice, b: GlobalPrice) => a.unitPrice - b.unitPrice)
    .slice(0, 10);
}

function generateSearchLinks(
  identification: PartIdentification
): GlobalPrice[] {
  const query = buildSearchQuery(identification);
  const encodedQuery = encodeURIComponent(query);

  const suppliers = [
    {
      name: "Google Shopping",
      url: `https://www.google.co.uk/search?tbm=shop&q=${encodedQuery}`,
    },
    {
      name: "RS Components",
      url: `https://uk.rs-online.com/web/c/?searchTerm=${encodedQuery}`,
    },
    {
      name: "Amazon UK",
      url: `https://www.amazon.co.uk/s?k=${encodedQuery}`,
    },
    {
      name: "eBay UK",
      url: `https://www.ebay.co.uk/sch/i.html?_nkw=${encodedQuery}`,
    },
    {
      name: "Bolt Depot",
      url: `https://www.boltdepot.com/search.aspx?q=${encodedQuery}`,
    },
  ];

  return suppliers.map((s) => ({
    supplier: s.name,
    productName: `Search for: ${identification.name}`,
    productUrl: s.url,
    unitPrice: 0,
    currency: "GBP",
    imageUrl: null,
    source: "direct_link",
  }));
}
