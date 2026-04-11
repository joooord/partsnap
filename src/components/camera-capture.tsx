"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { X, SwitchCamera } from "lucide-react";
import { resizeAndCompressImage } from "@/lib/image-utils";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const base64 = await resizeAndCompressImage(file);
        onCapture(base64);
      } catch {
        console.error("Failed to process image");
      }
    },
    [onCapture]
  );

  const handleCameraCapture = useCallback(() => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      const base64 = screenshot.split(",")[1];
      onCapture(base64);
      setShowCamera(false);
    }
  }, [onCapture]);

  if (showCamera) {
    return (
      <div className="relative w-full aspect-[3/4] bg-black overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.85}
          videoConstraints={{
            facingMode,
            width: { ideal: 1568 },
            height: { ideal: 2090 },
          }}
          className="w-full h-full object-cover"
          playsInline
        />

        {/* Crosshair */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-6 right-6 h-px bg-white/20" />
          <div className="absolute left-1/2 top-6 bottom-6 w-px bg-white/20" />
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-8">
          <button
            onClick={() => setShowCamera(false)}
            className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handleCameraCapture}
            className="w-16 h-16 border-2 border-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-white" />
          </button>

          <button
            onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
            className="w-12 h-12 flex items-center justify-center text-white/80 hover:text-white"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero */}
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] uppercase leading-none">
          Identify
          <br />
          Any Part
        </h2>
        <p className="text-sm text-muted-foreground mt-4 max-w-[280px] mx-auto leading-relaxed">
          Photograph a screw, bolt, nut, or fastener. We&apos;ll tell you exactly what it is.
        </p>
      </div>

      {/* Capture area */}
      <div className="w-full border border-black relative">
        <div className="aspect-[4/3] flex flex-col items-center justify-center gap-8 px-6">
          {/* Crosshair icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="black" strokeWidth="1">
            <circle cx="24" cy="24" r="16" />
            <line x1="24" y1="2" x2="24" y2="14" />
            <line x1="24" y1="34" x2="24" y2="46" />
            <line x1="2" y1="24" x2="14" y2="24" />
            <line x1="34" y1="24" x2="46" y2="24" />
          </svg>

          <div className="flex gap-0 w-full max-w-xs">
            <button
              className="flex-1 h-12 text-sm font-bold uppercase tracking-wider bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-40"
              onClick={() => setShowCamera(true)}
              disabled={disabled}
            >
              Camera
            </button>
            <button
              className="flex-1 h-12 text-sm font-bold uppercase tracking-wider border border-black border-l-0 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Upload
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Tip */}
      <p className="text-[11px] text-muted-foreground mt-6 tracking-wide text-center">
        Good lighting &middot; Plain background &middot; Coin for scale
      </p>
    </div>
  );
}
