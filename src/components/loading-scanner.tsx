"use client";

import { useEffect, useState } from "react";
import { dataUrlFromBase64 } from "@/lib/image-utils";

interface LoadingScannerProps {
  imageData: string;
  stage: "identifying" | "searching-accu" | "searching-global" | "done";
}

const MESSAGES = [
  "Analysing image",
  "Detecting part type",
  "Measuring dimensions",
  "Identifying specifications",
];

export function LoadingScanner({ imageData, stage }: LoadingScannerProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (stage === "done") return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="w-full space-y-8">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-[-0.02em]">
          Identifying
        </h3>
      </div>

      {/* Image with scan effect */}
      <div className="relative w-full aspect-square bg-black overflow-hidden">
        <img
          src={dataUrlFromBase64(imageData)}
          alt="Captured part"
          className="w-full h-full object-cover opacity-80"
        />

        {/* Scan line — gold accent */}
        {stage !== "done" && (
          <div className="absolute inset-0">
            <div className="absolute inset-x-0 h-px bg-gold animate-scan" />
          </div>
        )}

        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 inset-x-0 h-px bg-white/10" />
          <div className="absolute left-1/2 inset-y-0 w-px bg-white/10" />
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          {MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-px bg-border relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-black transition-all duration-500"
            style={{
              width:
                stage === "identifying"
                  ? "33%"
                  : stage === "searching-accu"
                    ? "66%"
                    : stage === "done"
                      ? "100%"
                      : "90%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
