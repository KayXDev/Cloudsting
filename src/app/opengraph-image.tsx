import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "edge";
export const alt = "Cloudsting Minecraft hosting";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at top left, rgba(26,215,111,0.28), transparent 36%), linear-gradient(135deg, #08110b 0%, #0d1811 50%, #13251a 100%)",
          color: "#f4f8f5",
          fontFamily: "sans-serif",
          padding: 56,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(102,255,176,0.18)",
            borderRadius: 28,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(180deg, #39eb8d, #149f50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#051109",
                fontWeight: 900,
                fontSize: 28,
              }}
            >
              CS
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#8ef0b8" }}>Cloudsting</div>
              <div style={{ fontSize: 18, color: "#b8c7be" }}>Minecraft hosting platform</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860 }}>
            <div style={{ fontSize: 68, lineHeight: 1.02, fontWeight: 900 }}>
              Instant Minecraft hosting built to scale.
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.35, color: "#d1ddd5" }}>
              NVMe storage, DDoS protection, fast deployment, and account-managed infrastructure for serious communities.
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {[
              "Launch under 60s",
              "NVMe SSD",
              "DDoS protected",
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 22,
                  color: "#f4f8f5",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}