import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type PageParams = { id: string };

export default async function Image({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  const { id } = await Promise.resolve(params);
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("title, company_name, company_logo, city")
    .eq("id", id)
    .maybeSingle();

  const title =
    data && typeof data.title === "string" && data.title.trim().length > 0
      ? data.title.trim()
      : "Vakansiya";
  const companyName =
    data && typeof data.company_name === "string" && data.company_name.trim().length > 0
      ? data.company_name.trim()
      : "";
  const companyLogo =
    data && typeof data.company_logo === "string" && data.company_logo.trim().length > 0
      ? data.company_logo.trim()
      : null;
  const city =
    data && typeof data.city === "string" && data.city.trim().length > 0
      ? data.city.trim()
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 45%, #FFFFFF 100%)",
          padding: "48px",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "stretch",
            background: "#FFFFFF",
            border: "1px solid rgba(36, 91, 235, 0.12)",
            borderRadius: "34px",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "360px",
              minWidth: "360px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(36,91,235,0.10) 0%, rgba(36,91,235,0.04) 100%)",
              padding: "40px",
              borderRight: "1px solid var(--jobly-main-10)",
            }}
          >
            <div
              style={{
                width: "250px",
                height: "250px",
                borderRadius: "36px",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 30px rgba(36,91,235,0.10)",
                overflow: "hidden",
              }}
            >
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName || "Company"}
                  width={190}
                  height={190}
                  style={{
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "190px",
                    height: "190px",
                    background: "var(--jobly-main)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "72px",
                    fontWeight: "800",
                  }}
                >
                  {(companyName || "J").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "56px 60px",
              color: "#0F172A",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "58px",
                lineHeight: 1.12,
                fontWeight: 800,
                color: "#111827",
                maxWidth: "680px",
                wordBreak: "break-word",
              }}
            >
              {title}
            </div>

            {companyName || city ? (
              <div
                style={{
                  display: "flex",
                  marginTop: "16px",
                  fontSize: "28px",
                  lineHeight: 1.2,
                  fontWeight: 500,
                  color: "#6B7280",
                }}
              >
                {companyName}{city && ` • ${city}`}
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                marginTop: "24px",
                fontSize: "34px",
                lineHeight: 1.2,
                fontWeight: 500,
                color: "#6B7280",
              }}
            >
              jobly.az
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
