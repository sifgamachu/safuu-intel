import { ImageResponse } from 'next/og';
export const runtime = 'nodejs';
export const alt = 'SAFUU — Private reporting. Human review. A fair public record.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#101f20',
        color: '#f4f0e5',
        width: '100%',
        height: '100%',
        padding: '70px 90px',
        fontFamily: 'serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 25, color: '#e5bb72', letterSpacing: 8 }}>
        SAFUU · ETHIOPIA
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 78,
          lineHeight: 1.15,
          marginTop: 55,
        }}
      >
        <span>Your voice.</span>
        <span style={{ color: '#e5bb72' }}>Our shared accountability.</span>
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 'auto',
          paddingTop: 30,
          borderTop: '1px solid #344746',
          fontFamily: 'sans-serif',
          fontSize: 21,
          justifyContent: 'space-between',
        }}
      >
        <span>Private reporting · Human review</span>
        <span>safuu.net</span>
      </div>
    </div>,
    size,
  );
}
