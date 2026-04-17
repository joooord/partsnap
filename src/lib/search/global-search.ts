import type { PartIdentification, GlobalPrice } from "../types";
import { buildPartSearchQuery } from "./accu-search";

export async function searchGlobalPrices(
  identification: PartIdentification
): Promise<GlobalPrice[]> {
  const query = buildPartSearchQuery(identification);
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    return generateSearchLinks(identification, query);
  }

  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_shopping");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("num", "10");
    url.searchParams.set("gl", "gb");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.status}`);
    }

    const data = await response.json();
    const results = parseShoppingResults(data);
    if (results.length > 0) return results;
  } catch (error) {
    console.error("Global search error:", error);
  }

  return generateSearchLinks(identification, query);
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

function parseShoppingResults(data: {
  shopping_results?: ShoppingResult[];
}): GlobalPrice[] {
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
  identification: PartIdentification,
  query: string
): GlobalPrice[] {
  const encodedQuery = encodeURIComponent(query);
  const isFastener =
    identification.category === "fastener" ||
    identification.category === "nut_washer" ||
    identification.category === "threaded_rod";

  // Curated UK-first supplier list, relevant to Accu's catalogue
  const suppliers: { name: string; url: string }[] = [
    {
      name: "Accu",
      url: `https://www.accu.co.uk/en/search?q=${encodedQuery}`,
    },
    {
      name: "RS Components",
      url: `https://uk.rs-online.com/web/c/?searchTerm=${encodedQuery}`,
    },
    {
      name: "Farnell UK",
      url: `https://uk.farnell.com/search?st=${encodedQuery}`,
    },
    {
      name: "Zoro UK",
      url: `https://www.zoro.co.uk/search?q=${encodedQuery}`,
    },
    {
      name: "Screwfix",
      url: `https://www.screwfix.com/search?search=${encodedQuery}`,
    },
    {
      name: "Toolstation",
      url: `https://www.toolstation.com/search?q=${encodedQuery}`,
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
      name: "Google Shopping",
      url: `https://www.google.co.uk/search?tbm=shop&q=${encodedQuery}`,
    },
  ];

  if (isFastener) {
    suppliers.push({
      name: "Bolt Depot",
      url: `https://www.boltdepot.com/search.aspx?q=${encodedQuery}`,
    });
  }

  return suppliers.map((s) => ({
    supplier: s.name,
    productName: `Search ${s.name}: ${identification.name}`,
    productUrl: s.url,
    unitPrice: 0,
    currency: "GBP",
    imageUrl: null,
    source: "direct_link",
  }));
}
