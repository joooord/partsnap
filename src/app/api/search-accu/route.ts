import { searchAccu } from "@/lib/search/accu-search";
import type { PartIdentification } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const identification: PartIdentification = await request.json();
    const results = await searchAccu(identification);
    return Response.json(results);
  } catch (error) {
    console.error("Accu search error:", error);
    return Response.json(
      { error: "Accu search failed", code: "SEARCH_FAILED" },
      { status: 500 }
    );
  }
}
