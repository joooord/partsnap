"use client";

import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PartIdentification, AccuProduct } from "@/lib/types";

const CONFIDENCE_COLORS = {
  high: "text-green-700",
  medium: "text-amber-600",
  low: "text-red-600",
};

const CATEGORY_LABEL: Record<string, string> = {
  fastener: "Fastener",
  nut_washer: "Nut / Washer",
  pin_shaft: "Pin / Shaft",
  standoff_spacer: "Standoff / Spacer",
  insert_rivet: "Insert / Rivet",
  knob_handle_lever: "Knob / Handle / Lever",
  hinge_latch: "Hinge / Latch",
  spring: "Spring",
  circlip_clip: "Circlip / Clip",
  magnet: "Magnet",
  bearing_bushing: "Bearing / Bushing",
  o_ring_seal: "O-Ring / Seal",
  cable_gland_grommet: "Cable Gland / Grommet",
  levelling_foot: "Levelling Foot",
  shaft_collar: "Shaft Collar",
  threaded_rod: "Threaded Rod",
  tool_key: "Tool / Key",
  other: "Component",
};

interface Props {
  identification: PartIdentification;
  imageData: string;
  topAccuMatch: AccuProduct | null;
  accuSearchUrl: string;
  accuLoading: boolean;
}

export function PartIdentityCard({
  identification,
  imageData,
  topAccuMatch,
  accuSearchUrl,
  accuLoading,
}: Props) {
  const specs = identification.specs;
  const attributes = identification.attributes ?? {};

  const specEntries = [
    { label: "Thread", value: specs.threadSize },
    { label: "Pitch", value: specs.threadPitch },
    { label: "Length", value: specs.length },
    { label: "Diameter", value: specs.diameter },
    { label: "Head", value: specs.headType },
    { label: "Drive", value: specs.driveType },
    { label: "Material", value: specs.material },
    { label: "Finish", value: specs.finish },
    { label: "Standard", value: specs.standard },
  ].filter((s) => s.value);

  const attributeEntries = Object.entries(attributes).filter(([, v]) => v);

  const accuDisplayUrl = topAccuMatch?.url ?? accuSearchUrl;
  const accuLabel = topAccuMatch ? "View on Accu" : "Search on Accu";
  const accuHelper = topAccuMatch
    ? topAccuMatch.matchConfidence === "exact"
      ? "Exact match found"
      : topAccuMatch.matchConfidence === "close"
        ? "Close match found"
        : "Pre-filtered search on Accu"
    : "Pre-filtered search on Accu";

  const categoryLabel =
    CATEGORY_LABEL[identification.category] ?? identification.partType;

  return (
    <div className="space-y-8">
      {/* Name + confidence */}
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xl font-black uppercase tracking-tight">
            {identification.name}
          </h3>
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.15em] shrink-0 ${CONFIDENCE_COLORS[identification.confidence]}`}
          >
            {identification.confidence}
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold mt-1">
          {categoryLabel}
          {identification.partType && identification.partType !== categoryLabel && (
            <span className="text-muted-foreground"> &middot; {identification.partType}</span>
          )}
        </p>
      </div>

      {/* Photo */}
      <div className="w-full aspect-[16/9] overflow-hidden bg-black">
        <img
          src={`data:image/jpeg;base64,${imageData}`}
          alt="Captured part"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Accu CTA - primary buy link */}
      <div className="border-t border-b border-black py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Buy this part
        </p>

        {accuLoading && !topAccuMatch ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : (
          <>
            {topAccuMatch && (
              <p className="text-sm font-bold leading-snug mb-1 line-clamp-2">
                {topAccuMatch.name}
              </p>
            )}
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
              {accuHelper}
            </p>
            <a
              href={accuDisplayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black text-white px-6 py-3 hover:bg-gold hover:text-black transition-colors"
            >
              {accuLabel}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>

      {/* Fastener-style specs */}
      {specEntries.length > 0 && (
        <div className="border-t border-black">
          {specEntries.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-3 ${
                i < specEntries.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {label}
              </span>
              <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category-specific attributes (knob dimensions, magnet grade, hinge leaves, etc.) */}
      {attributeEntries.length > 0 && (
        <div className="border-t border-black">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground py-3 border-b border-border">
            Attributes
          </p>
          {attributeEntries.map(([label, value], i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-3 gap-4 ${
                i < attributeEntries.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                {label}
              </span>
              <span className="text-sm font-bold text-right">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI reasoning */}
      <div className="border-t border-black pt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Analysis
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {identification.reasoning}
        </p>

        {identification.confidence === "low" && (
          <div className="mt-4 text-[11px] text-amber-700 leading-relaxed border border-amber-200 bg-amber-50 px-3 py-2">
            Confidence is low. Try another photo with <strong>better lighting</strong>, a <strong>plain background</strong>, and a <strong>coin or ruler for scale</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
