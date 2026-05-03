import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const alt = "L&H Consulting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const CYBER_BLACK = "#0a0a0a";
const CYBER_CYAN = "#00c8ff";
const CYBER_MUTED = "#7a8b94";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CYBER_BLACK,
          backgroundImage: `linear-gradient(rgba(0,200,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          padding: "72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cyan corner accents */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            width: 60,
            height: 60,
            borderLeft: `2px solid ${CYBER_CYAN}`,
            borderTop: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            width: 60,
            height: 60,
            borderRight: `2px solid ${CYBER_CYAN}`,
            borderTop: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
            width: 60,
            height: 60,
            borderLeft: `2px solid ${CYBER_CYAN}`,
            borderBottom: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            width: 60,
            height: 60,
            borderRight: `2px solid ${CYBER_CYAN}`,
            borderBottom: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />

        {/* Top: brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Hexagon logo */}
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 2L44 14V34L24 46L4 34V14L24 2Z"
              stroke={CYBER_CYAN}
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M16 14V34H22"
              stroke={CYBER_CYAN}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 14V34M26 24H34M34 14V34"
              stroke={CYBER_CYAN}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: 6,
              }}
            >
              L&H
            </span>
            <span
              style={{
                fontSize: 12,
                color: CYBER_CYAN,
                letterSpacing: 4,
                textTransform: "uppercase",
                opacity: 0.7,
              }}
            >
              Consulting
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Headline + subline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1000,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: CYBER_CYAN,
              letterSpacing: 6,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            {locale === "de" ? "// KI-Beratung" : "// AI Consulting"}
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            {t("headline")}
          </span>
          <span
            style={{
              fontSize: 36,
              color: CYBER_MUTED,
              fontWeight: 400,
            }}
          >
            {t("subline")}
          </span>
        </div>

        {/* Bottom: separator + meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              height: 1,
              width: "100%",
              background: `linear-gradient(90deg, ${CYBER_CYAN}00 0%, ${CYBER_CYAN}80 50%, ${CYBER_CYAN}00 100%)`,
            }}
          />
          <span
            style={{
              fontSize: 18,
              color: CYBER_MUTED,
              letterSpacing: 2,
            }}
          >
            {tMeta("description")}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
