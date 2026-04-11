import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PartSnap / AI-Powered Part Identification";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000000",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Crosshair decoration top-right */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 512 512"
            fill="none"
          >
            <circle
              cx="256"
              cy="256"
              r="120"
              stroke="white"
              strokeWidth="24"
              fill="none"
            />
            <line x1="256" y1="80" x2="256" y2="180" stroke="white" strokeWidth="24" />
            <line x1="256" y1="332" x2="256" y2="432" stroke="white" strokeWidth="24" />
            <line x1="80" y1="256" x2="180" y2="256" stroke="white" strokeWidth="24" />
            <line x1="332" y1="256" x2="432" y2="256" stroke="white" strokeWidth="24" />
            <circle cx="256" cy="256" r="16" fill="#9B7B2C" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            textTransform: "uppercase" as const,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>PART</span>
          <span>SNAP</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#9B7B2C",
            letterSpacing: "0.3em",
            textTransform: "uppercase" as const,
            marginTop: "32px",
            display: "flex",
          }}
        >
          SNAP / IDENTIFY / BUY
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "#999999",
            marginTop: "24px",
            lineHeight: 1.4,
            maxWidth: "600px",
            display: "flex",
          }}
        >
          Photograph any fastener. AI identifies it instantly. Find the best price.
        </div>

        {/* Bottom line accent */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            right: "80px",
            height: "2px",
            backgroundColor: "#222222",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "2px",
              backgroundColor: "#9B7B2C",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
