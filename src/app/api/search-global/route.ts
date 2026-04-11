import { searchGlobalPrices } from "@/lib/search/global-search";
import type { PartIdentification } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const identification: PartIdentification = await request.json();
    const results = await searchGlobalPrices(identification);
    return Response.json(results);
  } catch (error) {
    console.error("Global search error:", error);
    return Response.json(
      { error: "Global search failed", code: "SEARCH_FAILED" },
      { status: 500 }
    );
  }
}
