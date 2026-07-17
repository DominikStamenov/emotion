import { ImageResponse } from "next/og";

export const alt = "eMotion — Digital Agency";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#08080a",
        color: "#f7f5fb",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "62px 72px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(255,23,68,.68), rgba(237,0,116,.2) 38%, transparent 68%)",
          borderRadius: "50%",
          display: "flex",
          height: 720,
          position: "absolute",
          right: -180,
          top: -240,
          width: 720,
        }}
      />
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 28,
          fontWeight: 700,
          gap: 14,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(135deg, #ed0074, #ff1744, #ff6a00)",
            borderRadius: "50%",
            color: "#08080a",
            display: "flex",
            height: 52,
            justifyContent: "center",
            width: 52,
          }}
        >
          e
        </div>
        eMotion
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: "rgba(247,245,251,.5)",
            display: "flex",
            fontSize: 16,
            letterSpacing: 3,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          Digital agency · emotion.com
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 86,
            fontWeight: 620,
            letterSpacing: -6,
            lineHeight: 0.94,
            maxWidth: 940,
          }}
        >
          We create digital experiences that move.
        </div>
      </div>
    </div>,
    size,
  );
}
