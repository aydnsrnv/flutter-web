import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

type PageParams = { id: string };

export default async function Image({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  const { id } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data } = await supabase
    .from("resumes")
    .select("full_name, desired_position, avatar")
    .eq("id", id)
    .maybeSingle();

  const fullName =
    data?.full_name && String(data.full_name).trim()
      ? String(data.full_name).trim()
      : "CV";
  const desiredPosition =
    data?.desired_position && String(data.desired_position).trim()
      ? String(data.desired_position).trim()
      : "jobly.az";
  const avatarUrl =
    data?.avatar && String(data.avatar).trim()
      ? String(data.avatar).trim()
      : null;

  const title =
    desiredPosition && desiredPosition !== "jobly.az"
      ? `${fullName} — ${desiredPosition}`
      : fullName;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFFFFF",
          padding: "32px",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            borderRadius: "28px",
            border: "2px solid #E5E7EB",
            background: "#FFFFFF",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 360,
              minWidth: 360,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(36,91,235,0.08) 0%, rgba(36,91,235,0.18) 100%)",
              padding: "36px",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                width={240}
                height={240}
                style={{
                  width: 240,
                  height: 240,
                  objectFit: "cover",
                  borderRadius: 32,
                }}
              />
            ) : (
              <div
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#245BEB",
                  color: "#FFFFFF",
                  fontSize: 76,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "56px 52px",
              color: "#111827",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 54,
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                maxWidth: "100%",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 30,
                lineHeight: 1.2,
                color: "#6B7280",
                fontWeight: 500,
              }}
            >
              jobly.az
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
