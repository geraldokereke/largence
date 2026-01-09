import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Largence - Legal Intelligence for Enterprises";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #252525 0%, #1a1a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(78, 205, 196, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: 80,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Largence
          </div>

          <div
            style={{
              fontSize: 36,
              color: "#4ECDC4",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Legal Intelligence for Enterprises
          </div>

          <div
            style={{
              fontSize: 24,
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: 800,
              marginTop: 12,
            }}
          >
            Automate contract drafting, ensure regulatory compliance, and
            streamline governance
          </div>
        </div>

        {/* Accent shape */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, transparent 70%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
