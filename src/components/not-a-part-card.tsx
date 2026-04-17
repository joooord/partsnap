"use client";

import type { PartIdentification } from "@/lib/types";

interface Props {
  identification: PartIdentification;
  imageData: string;
  onReset: () => void;
}

export function NotAPartCard({ identification, imageData, onReset }: Props) {
  const joke =
    identification.joke?.trim() ||
    "That's a fine photograph. Sadly, Accu don't stock it. Try a screw next time.";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
          Not a part
        </p>
        <h3 className="text-2xl font-black uppercase tracking-[-0.02em] leading-tight">
          {identification.name || "Nice photo"}
        </h3>
        {identification.partType && identification.partType !== identification.name && (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mt-1">
            {identification.partType}
          </p>
        )}
      </div>

      <div className="w-full aspect-[16/9] overflow-hidden bg-black">
        <img
          src={`data:image/jpeg;base64,${imageData}`}
          alt="Captured"
          className="w-full h-full object-cover"
        />
      </div>

      <figure className="border-l-4 border-gold pl-5 py-2">
        <blockquote className="text-lg font-semibold leading-snug text-black">
          &ldquo;{joke}&rdquo;
        </blockquote>
        <figcaption className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Partsnap, mildly disappointed
        </figcaption>
      </figure>

      <div className="border-t border-black pt-5">
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Point the camera at a fastener, magnet, knob, hinge, bearing, seal, spring, insert, standoff, levelling foot, cable gland, or anything else Accu sells. We&apos;ll take it from there.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black text-white px-6 py-3 hover:bg-gold hover:text-black transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
