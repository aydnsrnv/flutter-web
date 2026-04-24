import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export default function favicon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "#245BEB",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "20%",
          color: "#fff",
          fontWeight: 900,
        }}
      >
        J
      </div>
    ),
    {
      width: 32,
      height: 32,
    },
  );
}
