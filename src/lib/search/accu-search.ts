import type { PartIdentification, AccuProduct } from "../types";

export async function searchAccu(
  identification: PartIdentification
): Promise<AccuProduct[]> {
  const query = buildAccuSearchQuery(identification);

  // Use fetch to hit Accu's search and parse the results
  // For MVP, we'll construct a search URL and fetch the HTML
  const searchUrl = `https://www.accu.co.uk/search?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Accu search failed: ${response.status}`);
    }

    const html = await response.text();
    return parseAccuResults(html, searchUrl);
  } catch (error) {
    console.error("Accu search error:", error);
    return generateFallbackAccuResults(identification);
  }
}

function buildAccuSearchQuery(id: PartIdentification): string {
  const parts: string[] = [];
  if (id.specs.threadSize) parts.push(id.specs.threadSize);
  if (id.specs.length) parts.push(id.specs.length);
  if (id.specs.headType) parts.push(id.specs.headType);
  if (id.specs.material) parts.push(id.specs.material);

  if (parts.length === 0) {
    return id.searchTerms[0] || id.name;
  }
  return parts.join(" ");
}

function parseAccuResults(html: string, searchUrl: string): AccuProduct[] {
  const products: AccuProduct[] = [];

  // Parse product titles and links from the search results HTML
  // Accu renders products in a grid with product names and prices
  const productPattern =
    /<a[^>]*href="(\/[^"]*)"[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
  const titlePattern =
    /<(?:h[2-4]|span|div)[^>]*class="[^"]*(?:product[_-]?name|product[_-]?title|title)[^"]*"[^>]*>([\s\S]*?)<\/(?:h[2-4]|span|div)>/gi;
  const pricePattern =
    /(?:£|GBP)\s*([\d,.]+)/g;

  // Simple extraction: find product-like links with titles
  const linkPattern =
    /<a[^>]*href="(https?:\/\/www\.accu\.co\.uk\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  const seen = new Set<string>();

  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    const content = match[2].replace(/<[^>]*>/g, "").trim();

    // Skip non-product links
    if (
      !content ||
      content.length < 10 ||
      content.length > 200 ||
      seen.has(url) ||
      url.includes("/search") ||
      url.includes("/login") ||
      url.includes("/cart") ||
      url.includes("/account")
    ) {
      continue;
    }

    // Look for product-like content (contains specs keywords)
    const isProduct =
      /(?:M\d|screw|bolt|nut|washer|pin|standoff|rivet|DIN|ISO)/i.test(
        content
      );
    if (!isProduct) continue;

    seen.add(url);

    // Try to find price near this product
    const prices: { qty: number; unitPrice: number }[] = [];
    const priceMatch = pricePattern.exec(html.slice(match.index, match.index + 500));
    if (priceMatch) {
      prices.push({ qty: 1, unitPrice: parseFloat(priceMatch[1].replace(",", "")) });
    }
    pricePattern.lastIndex = 0;

    products.push({
      name: content,
      url: url,
      imageUrl: null,
      specs: {},
      priceTiers: prices,
      stockStatus: "unknown",
      matchConfidence: "approximate",
    });

    if (products.length >= 5) break;
  }

  return products;
}

function generateFallbackAccuResults(
  identification: PartIdentification
): AccuProduct[] {
  // Generate direct search links to Accu
  return identification.searchTerms.slice(0, 3).map((term) => ({
    name: `Search Accu for: "${term}"`,
    url: `https://www.accu.co.uk/search?query=${encodeURIComponent(term)}`,
    imageUrl: null,
    specs: {},
    priceTiers: [],
    stockStatus: "unknown" as const,
    matchConfidence: "approximate" as const,
  }));
}
