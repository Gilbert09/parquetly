import { ImageResponse } from "next/og";

export const alt =
  "Parquetly - free online Parquet viewer that runs in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Parquetly
        </div>
        <div style={{ fontSize: 42, marginTop: 24, color: "#93c5fd" }}>
          Free online Parquet viewer
        </div>
        <div style={{ fontSize: 28, marginTop: 32, color: "#94a3b8" }}>
          Schema · Row groups · SQL with DuckDB · Never uploaded
        </div>
      </div>
    ),
    size
  );
}
