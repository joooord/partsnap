import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import type { PartIdentification } from "../types";

const anthropic = new Anthropic();

export async function identifyPart(
  imageBase64: string
): Promise<PartIdentification> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "max" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  let jsonStr = textBlock.text.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const firstBrace = jsonStr.indexOf("{");
  const lastBrace = jsonStr.lastIndexOf("}");
  if (firstBrace > 0 || lastBrace < jsonStr.length - 1) {
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }
  }

  const parsed = JSON.parse(jsonStr) as Partial<PartIdentification> & {
    attributes?: unknown;
    category?: unknown;
  };

  // Defensive defaults so rendering never explodes if a field is missing
  const result: PartIdentification = {
    category: (typeof parsed.category === "string" ? parsed.category : "other") as PartIdentification["category"],
    partType: parsed.partType ?? "",
    name: parsed.name ?? "Unknown component",
    confidence: parsed.confidence ?? "low",
    specs: {
      threadSize: parsed.specs?.threadSize ?? null,
      threadPitch: parsed.specs?.threadPitch ?? null,
      length: parsed.specs?.length ?? null,
      diameter: parsed.specs?.diameter ?? null,
      headType: parsed.specs?.headType ?? null,
      driveType: parsed.specs?.driveType ?? null,
      material: parsed.specs?.material ?? null,
      finish: parsed.specs?.finish ?? null,
      standard: parsed.specs?.standard ?? null,
    },
    attributes: coerceAttributes(parsed.attributes),
    searchTerms: Array.isArray(parsed.searchTerms)
      ? parsed.searchTerms.filter((t): t is string => typeof t === "string")
      : [],
    reasoning: parsed.reasoning ?? "",
    joke: typeof parsed.joke === "string" && parsed.joke.trim() ? parsed.joke : null,
  };
  return result;
}

function coerceAttributes(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v == null) continue;
    out[String(k)] = String(v);
  }
  return out;
}
