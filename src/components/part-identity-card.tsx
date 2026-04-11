"use client";

import type { PartIdentification } from "@/lib/types";

const CONFIDENCE_COLORS = {
  high: "text-green-700",
  medium: "text-amber-600",
  low: "text-red-600",
};

interface Props {
  identification: PartIdentification;
  imageData: string;
}

export function PartIdentityCard({ identification, imageData }: Props) {
  const specs = identification.specs;

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
          {identification.partType}
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

      {/* Specs */}
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
              <span className="text-sm font-bold">
                {value}
              </span>
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
      </div>
    </div>
  );
}
