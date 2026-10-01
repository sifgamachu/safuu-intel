import { ImageResponse } from 'next/og';
export const runtime = 'nodejs';
export const alt = 'SAFUU — Corruption ends when people refuse to be silent.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#030507',
        color: '#f0ece0',
        width: '100%',
        height: '100%',
        padding: '70px 90px',
        fontFamily: 'serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 25, color: '#c9a84c', letterSpacing: 8 }}>
        SAFUU · ETHIOPIA
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 70,
          lineHeight: 1.15,
          marginTop: 35,
        }}
      >
        <span>Corruption ends</span>
        <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>when people</span>
        <span>refuse to be silent.</span>
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 'auto',
          paddingTop: 30,
          borderTop: '1px solid #153944',
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
