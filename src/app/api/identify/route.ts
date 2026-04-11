import { identifyPart } from "@/lib/ai/identify-part";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return Response.json(
        { error: "Missing or invalid image data", code: "INVALID_IMAGE" },
        { status: 400 }
      );
    }

    const identification = await identifyPart(image);
    return Response.json(identification);
  } catch (error) {
    console.error("Identification error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json(
      { error: message, code: "AI_FAILED" },
      { status: 500 }
    );
  }
}
