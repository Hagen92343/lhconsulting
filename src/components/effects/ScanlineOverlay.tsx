'use client';

export default function ScanlineOverlay() {
  return (
    <>
      <div className="scanline-overlay" />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '8px',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(0, 200, 255, 0.03) 40%, rgba(0, 200, 255, 0.06) 50%, rgba(0, 200, 255, 0.03) 60%, transparent 100%)',
            animation: 'scanline-sweep 8s linear infinite',
          }}
        />
      </div>
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          div[aria-hidden='true'] > div {
            animation: none !important;
            display: none;
          }
        }
        @keyframes scanline-sweep {
          0% {
            top: -10px;
          }
          100% {
            top: 100vh;
          }
        }
      `}</style>
    </>
  );
}
