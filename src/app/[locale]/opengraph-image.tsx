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
const CYBER_PURPLE = "#7b2fff";
const CYBER_MUTED = "#7a8b94";

// Hand-positioned neural-network nodes occupying the right 42% of the canvas.
// Coordinates are SVG units (viewBox 500×630). Edges reference node indices.
const NODES: Array<{ x: number; y: number; r: number; bright?: boolean }> = [
  { x: 100, y: 110, r: 8 },
  { x: 80, y: 250, r: 10, bright: true },
  { x: 120, y: 380, r: 7 },
  { x: 90, y: 520, r: 9 },
  { x: 240, y: 70, r: 6 },
  { x: 230, y: 200, r: 12, bright: true },
  { x: 260, y: 330, r: 9 },
  { x: 240, y: 460, r: 8 },
  { x: 210, y: 580, r: 7 },
  { x: 380, y: 130, r: 9 },
  { x: 400, y: 290, r: 14, bright: true },
  { x: 380, y: 420, r: 10 },
  { x: 360, y: 540, r: 7 },
];

const EDGES: Array<[number, number]> = [
  [0, 5], [1, 5], [1, 6], [2, 5], [2, 6], [3, 6], [3, 7], [3, 8],
  [4, 5], [4, 9], [5, 9], [5, 10], [6, 10], [6, 11], [7, 10], [7, 11],
  [8, 11], [8, 12], [9, 10], [10, 11], [11, 12], [0, 4], [4, 9],
];

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
          flexDirection: "row",
          backgroundColor: CYBER_BLACK,
          backgroundImage: `radial-gradient(circle at 80% 50%, rgba(123,47,255,0.18) 0%, rgba(0,200,255,0.08) 35%, ${CYBER_BLACK} 75%), linear-gradient(rgba(0,200,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          padding: "72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top-left + bottom-left corner brackets — keep the cyber framing */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            width: 56,
            height: 56,
            borderLeft: `2px solid ${CYBER_CYAN}`,
            borderTop: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
            width: 56,
            height: 56,
            borderLeft: `2px solid ${CYBER_CYAN}`,
            borderBottom: `2px solid ${CYBER_CYAN}`,
            display: "flex",
          }}
        />

        {/* LEFT COLUMN — text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 58%",
            justifyContent: "space-between",
            paddingRight: 32,
          }}
        >
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                  opacity: 0.75,
                }}
              >
                Consulting
              </span>
            </div>
          </div>

          {/* Headline block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <span
              style={{
                fontSize: 16,
                color: CYBER_CYAN,
                letterSpacing: 6,
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              {locale === "de" ? "// KI-Beratung" : "// AI Consulting"}
            </span>
            <span
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: -1.5,
              }}
            >
              {t("headline")}
            </span>
            <span
              style={{
                fontSize: 30,
                color: CYBER_MUTED,
                fontWeight: 400,
              }}
            >
              {t("subline")}
            </span>
          </div>

          {/* Bottom: separator + description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                height: 1,
                width: 280,
                background: `linear-gradient(90deg, ${CYBER_CYAN} 0%, ${CYBER_CYAN}00 100%)`,
              }}
            />
            <span
              style={{
                fontSize: 16,
                color: CYBER_MUTED,
                letterSpacing: 1.5,
                lineHeight: 1.4,
                maxWidth: 580,
              }}
            >
              {tMeta("description")}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN — neural network illustration */}
        <div
          style={{
            display: "flex",
            flex: "0 0 42%",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="500"
            height="630"
            viewBox="0 0 500 630"
            style={{ position: "absolute", top: -72, right: -72 }}
          >
            {/* Edges first so nodes paint on top */}
            {EDGES.map(([a, b], i) => {
              const A = NODES[a];
              const B = NODES[b];
              return (
                <line
                  key={`e${i}`}
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke={CYBER_CYAN}
                  strokeWidth="1"
                  strokeOpacity="0.35"
                />
              );
            })}
            {/* Glow halos for bright nodes */}
            {NODES.map((n, i) =>
              n.bright ? (
                <circle
                  key={`g${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 3}
                  fill={CYBER_CYAN}
                  fillOpacity="0.08"
                />
              ) : null
            )}
            {/* Node cores */}
            {NODES.map((n, i) => (
              <circle
                key={`n${i}`}
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={n.bright ? CYBER_CYAN : "#0a0a0a"}
                stroke={n.bright ? "#ffffff" : CYBER_CYAN}
                strokeWidth={n.bright ? "1.5" : "1.2"}
                fillOpacity={n.bright ? "0.9" : "1"}
              />
            ))}
            {/* Inner glints on bright nodes */}
            {NODES.map((n, i) =>
              n.bright ? (
                <circle
                  key={`i${i}`}
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 0.35}
                  fill="#ffffff"
                  fillOpacity="0.85"
                />
              ) : null
            )}
            {/* Decorative purple accent ring around the largest node */}
            <circle
              cx="400"
              cy="290"
              r="40"
              fill="none"
              stroke={CYBER_PURPLE}
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="3 4"
            />
            <circle
              cx="400"
              cy="290"
              r="62"
              fill="none"
              stroke={CYBER_CYAN}
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </svg>

          {/* Right-edge corner brackets, pinned to the canvas edge */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 56,
              height: 56,
              borderRight: `2px solid ${CYBER_CYAN}`,
              borderTop: `2px solid ${CYBER_CYAN}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: -40,
              width: 56,
              height: 56,
              borderRight: `2px solid ${CYBER_CYAN}`,
              borderBottom: `2px solid ${CYBER_CYAN}`,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
