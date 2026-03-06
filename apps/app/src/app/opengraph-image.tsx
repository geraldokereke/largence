import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Largence - Legal Intelligence Platform";
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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Logo and Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            L
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "700",
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Largence
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "36px",
              fontWeight: "600",
              color: "#e2e8f0",
              textAlign: "center",
            }}
          >
            Legal Intelligence for Enterprises
          </span>
          <span
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            Enhance contract drafting, regulatory compliance procedures, and
            streamline governance for International teams and enterprises.
          </span>
        </div>

        {/* Features Pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {["AI Drafting", "Compliance", "Templates", "E-Signatures"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: "12px 24px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  color: "#a5b4fc",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              color: "#64748b",
            }}
          >
            largence.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
