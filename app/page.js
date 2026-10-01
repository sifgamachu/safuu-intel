'use client';
import { useState, useEffect, useRef } from 'react';
import { TelegramButton, ReportSection, TG_BLUE, TG_LINK } from './components/ReportButtons';
import ClassicNav from './components/ClassicNav';
import ClassicDashboard from './components/ClassicDashboard';

const G = '#c9a84c',
  CY = '#00d4ff',
  R = '#b82020',
  GR = '#4ade80';

// ── Ge'ez rain ───────────────────────────────────────────────────────────────
function GeezRain() {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters =
      'ሀሁሂሃሄህሆለሉሊላሌልሎመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶቀቁቂቃቄቅቆበቡቢባቤብቦተቱቲታቴትቶነኑኒናኔንኖአኡኢኣኤእኦከኩኪካኬክኮወዉዊዋዌውዎዘዙዚዛዜዝዞደዱዲዳዴድዶገጉጊጋጌግጎፈፉፊፋፌፍፎ01';
    let drops = [],
      frame,
      lastDraw = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.min(100, Math.ceil(canvas.width / 20)) }, () => ({
        y: Math.random() * -80,
        s: 0.15 + Math.random() * 0.4,
      }));
    };
    const draw = (now) => {
      frame = undefined;
      if (document.hidden || motion.matches) return;
      if (now - lastDraw >= 1000 / 24) {
        lastDraw = now;
        context.fillStyle = 'rgba(3,5,7,0.11)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '12px "Noto Sans Ethiopic Variable",serif';
        drops.forEach((drop, index) => {
          const brightness = 0.04 + Math.random() * 0.12;
          context.fillStyle =
            Math.random() > 0.97
              ? `rgba(0,200,255,${brightness + 0.05})`
              : `rgba(180,145,50,${brightness})`;
          context.fillText(
            characters[Math.floor(Math.random() * characters.length)],
            index * 20,
            drop.y * 20,
          );
          drop.y += drop.s;
          if (drop.y * 20 > canvas.height + 40) drop.y = -Math.random() * 30;
        });
      }
      frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = undefined;
      if (motion.matches) context.clearRect(0, 0, canvas.width, canvas.height);
      if (!document.hidden && !motion.matches) frame = requestAnimationFrame(draw);
    };
    resize();
    resume();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resume);
    motion.addEventListener('change', resume);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', resume);
      motion.removeEventListener('change', resume);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.08, pointerEvents: 'none' }}
    />
  );
}

function SealNote() {
  return (
    <>
      <span style={{ color: CY }}>◆ PRIVATE INTAKE</span>
      <span style={{ color: 'rgba(240,236,224,0.2)', margin: '0 10px' }}>║</span>
      <span style={{ color: G }}>A receipt follows a confirmed save.</span>
    </>
  );
}

export default function Safuu() {
  const [faq, setFaq] = useState(null);
  const [date, setDate] = useState('');
  useEffect(() => setDate(new Date().toISOString().slice(0, 10)), []);

  const FAQS = [
    {
      q: 'When will the dashboard show real data?',
      a: 'Saved reports appear in aggregate totals. Reports and attachments stay private while authorized staff review them. Only explicitly approved cases appear on the public wall.',
    },
    {
      q: 'Why is the public wall empty?',
      a: 'No cases have been approved for publication yet. We show real saved totals and approved records, rather than invented incidents or public allegations awaiting review.',
    },
    {
      q: 'How do I know the platform works?',
      a: 'The code and validation record are available in the public GitHub repository. The web form issues a private receipt only after the report is saved. You can use that receipt to follow your report.',
    },
    {
      q: 'How is my identity protected?',
      a: 'The web form does not ask for your name, phone number, or account. Visitor identifiers are hashed, and private report contents are encrypted. Details or attachments you provide may still identify you. Telegram and your network provider may have information about your visit.',
    },
    {
      q: 'What happens to my report?',
      a: 'The report goes to a restricted review queue. Authorized staff assess the evidence. Publication requires at least 100 distinct verified reporting identities and an explicit staff decision; it is not automatic.',
    },
  ];

  return (
    <div
      className="classic-home"
      style={{
        background: '#030507',
        color: 'rgba(240,236,224,0.9)',
        fontFamily: 'var(--font-body),var(--font-ethiopic),sans-serif',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        :where(.classic-home,.classic-home *,.classic-home *::before,.classic-home *::after){box-sizing:border-box;margin:0;padding:0}
        :where(.classic-home a){color:inherit;text-decoration:none} html{scroll-behavior:smooth}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan{0%{top:-3%}100%{top:104%}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulsering{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.3)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}
        @keyframes slidedown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',var(--font-ethiopic),monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:13px 32px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,0.3)}
        .btn-cy{background:transparent;color:${CY};font-family:'Courier New',var(--font-ethiopic),monospace;font-size:11px;letter-spacing:0.1em;padding:12px 28px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-cy:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.02)}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}

        /* ── Hamburger button ─────────────────────────────── */
        .hamburger{display:none;width:42px;height:42px;border:1px solid rgba(0,212,255,0.18);background:rgba(0,0,0,0.4);cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:5px;transition:all 0.2s;flex-shrink:0}
        .hamburger:hover{border-color:rgba(0,212,255,0.4);background:rgba(0,212,255,0.06)}
        .hamburger span{display:block;width:18px;height:1.5px;background:rgba(0,212,255,0.7);transition:transform 0.2s,opacity 0.2s}
        .hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
        .hamburger.open span:nth-child(2){opacity:0}
        .hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}

        /* ── Mobile menu drawer ───────────────────────────── */
        .mobile-menu{display:none;position:fixed;top:86px;left:0;right:0;z-index:99;background:rgba(3,5,7,0.98);backdrop-filter:blur(24px);border-bottom:1px solid rgba(0,212,255,0.16);padding:16px 20px 24px;animation:slidedown 0.18s ease-out}
        .mobile-menu a{display:block;padding:16px 8px;font-size:15px;color:rgba(240,236,224,0.85);font-family:var(--font-body),var(--font-ethiopic),sans-serif;letter-spacing:0.04em;border-bottom:1px solid rgba(0,212,255,0.06);transition:color 0.15s;min-height:48px;display:flex;align-items:center}
        .mobile-menu a:last-child{border-bottom:none}
        .mobile-menu a:active{color:${CY}}

        /* ── 1024px and below ─────────────────────────────── */
        @media(max-width:1024px){
          .two-col{grid-template-columns:1fr!important}
          .three-col-mob{grid-template-columns:1fr!important}
        }

        /* ── 768px and below — tablet/mobile ──────────────── */
        @media(max-width:768px){
          .hamburger{display:flex}
          .desktop-nav{display:none!important}
          .nav-cta-extra{display:none!important}
          .ticker-hide-mob{display:none!important}
          .hide-mob-dash{display:none!important}
          .mob-callout{display:block!important}
          .sec{padding:40px 20px!important}
          .classic-home h1{font-size:clamp(32px,9vw,42px)!important;line-height:1.1!important;margin-bottom:18px!important}
          .classic-home h2{font-size:clamp(22px,6vw,28px)!important}
          .body-prose{font-size:16px!important;line-height:1.7!important}
          .faq-row span:first-child{font-size:16px!important;line-height:1.45!important;padding-right:12px!important}
          .faq-row > div{padding:18px 4px!important;min-height:60px!important}
          /* Increase the trust-strip readability */
          .trust-strip{flex-direction:column!important}
          .trust-strip > div{flex:1 1 100%!important;border-right:none!important;border-bottom:1px solid rgba(0,212,255,0.08)!important;text-align:left!important;display:flex!important;align-items:center!important;gap:14px!important;padding:14px 18px!important}
          .trust-strip > div:last-child{border-bottom:none!important}
          .trust-strip > div > div:first-child{font-size:22px!important;margin-bottom:0!important}
          /* Tap targets */
          a, button{min-height:44px}
        }

        /* ── 480px and below — phone ──────────────────────── */
        @media(max-width:480px){
          .classic-nav{padding:0 14px!important;height:64px!important}
          .sec{padding:32px 16px!important}
          .nav-brand-meta{display:none!important}
        }

        /* ── Default desktop (open by default) ────────────── */
        .mob-callout{display:none}

        /* ── INVESTIGATIVE DECLASSIFIED HERO ──────────────── */
        @keyframes r-peel{to{transform:scaleX(0)}}
        @keyframes stamp-slam{
          0%  {transform:rotate(-7deg) scale(1.55);opacity:0;filter:blur(2px)}
          45% {opacity:0.95;filter:blur(0)}
          70% {transform:rotate(-7deg) scale(0.93)}
          100%{transform:rotate(-7deg) scale(1);opacity:0.92}
        }
        @keyframes meta-fade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes seal-fade{from{opacity:0}to{opacity:1}}

        .doc-meta{
          display:flex;align-items:center;gap:10px;margin-bottom:20px;
          font-size:10px;color:rgba(0,212,255,0.5);font-family:'Courier New',var(--font-ethiopic),monospace;
          letter-spacing:0.18em;font-weight:700;flex-wrap:wrap;
          animation:meta-fade 0.4s ease-out 0s both;
        }
        .doc-headline-wrap{position:relative;margin-bottom:34px;padding-right:24px}
        .doc-h1{
          font-family:var(--font-display),var(--font-ethiopic),serif;
          font-size:clamp(34px,6vw,72px);
          font-weight:900;line-height:1.18;letter-spacing:-0.02em;
          display:grid;grid-template-columns:auto 1fr;column-gap:24px;row-gap:6px;
          align-items:start;margin:0;
        }
        .line-num{
          font-family:'Courier New',var(--font-ethiopic),monospace;font-size:11px;font-weight:700;
          letter-spacing:0.1em;color:rgba(0,212,255,0.32);
          padding-top:0.5em;
        }
        .r-line{
          position:relative;display:inline-block;width:fit-content;
          color:rgba(240,236,224,0.95);
        }
        .r-line.emph{color:${G};font-style:italic}
        .r-line::after{
          content:"";position:absolute;top:-2px;bottom:-2px;left:-10px;right:-10px;
          background:#0a0a0a;
          transform:scaleX(1);transform-origin:right center;
          animation:r-peel 0.5s cubic-bezier(0.7,0.05,0.3,1) forwards;
          animation-delay:var(--rd,0s);
          box-shadow:0 0 0 1px rgba(0,0,0,0.5),0 1px 2px rgba(0,0,0,0.6);
        }
        .declassified-stamp{
          position:absolute;bottom:-14px;right:0;
          border:3px solid ${R};color:${R};
          font-family:'Courier New',var(--font-ethiopic),monospace;font-weight:900;
          font-size:18px;letter-spacing:0.18em;
          padding:9px 18px;
          background:rgba(184,32,32,0.04);
          transform:rotate(-7deg) scale(0.7);opacity:0;
          animation:stamp-slam 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.7s forwards;
          box-shadow:inset 0 0 0 1px rgba(184,32,32,0.4);
          text-shadow:0 0 8px rgba(184,32,32,0.25);
          pointer-events:none;
        }
        .seal-ticker{
          font-family:'Courier New',var(--font-ethiopic),monospace;font-size:11px;letter-spacing:0.04em;
          padding:11px 14px;background:rgba(0,0,0,0.55);
          border:1px solid rgba(0,212,255,0.14);border-radius:3px;
          margin-bottom:34px;
          display:inline-flex;align-items:center;flex-wrap:wrap;
          opacity:0;animation:seal-fade 0.5s ease-out 0.4s forwards;
        }
        @media(prefers-reduced-motion:reduce){
          .r-line::after{animation:none;transform:scaleX(0)}
          .declassified-stamp{animation:none;opacity:0.92;transform:rotate(-7deg) scale(1)}
        }
        @media(max-width:768px){
          .line-num{display:none}
          .doc-h1{grid-template-columns:1fr;column-gap:0}
          .declassified-stamp{font-size:14px;padding:7px 14px;border-width:2px;bottom:-8px}
          .doc-meta{font-size:9px;letter-spacing:0.14em}
          .seal-ticker{font-size:10px;padding:9px 12px;width:100%}
          .seal-ticker > span{display:inline-block}
        }
        @media(max-width:480px){
          .declassified-stamp{
            position:static;display:inline-block;margin-top:18px;
            transform:rotate(-4deg) scale(1);
            animation:stamp-slam-mob 0.45s cubic-bezier(0.34,1.56,0.64,1) 1.7s forwards;
          }
          @keyframes stamp-slam-mob{
            0%{transform:rotate(-4deg) scale(1.4);opacity:0;filter:blur(2px)}
            70%{transform:rotate(-4deg) scale(0.94);opacity:0.95;filter:blur(0)}
            100%{transform:rotate(-4deg) scale(1);opacity:0.92}
          }
          .doc-headline-wrap{padding-right:0}
        }
      `}</style>

      <GeezRain />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(0,212,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.012) 1px,transparent 1px)`,
          backgroundSize: '52px 52px',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center,transparent 25%,rgba(3,5,7,0.82) 100%)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          height: '1px',
          zIndex: 2,
          pointerEvents: 'none',
          background: `linear-gradient(transparent,${CY}14,transparent)`,
          animation: 'scan 10s linear infinite',
        }}
      />

      {/* TICKER */}
      <div
        className="ticker-hide-mob"
        style={{
          position: 'relative',
          zIndex: 10,
          background: '#010204',
          height: '26px',
          borderBottom: `1px solid rgba(0,212,255,0.12)`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: GR,
            color: '#030507',
            fontSize: '11px',
            fontWeight: '700',
            padding: '0 14px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontFamily: "'Courier New',var(--font-ethiopic),monospace",
            letterSpacing: '0.2em',
            flexShrink: 0,
          }}
        >
          ◆ SAFUU
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              animation: 'marquee 44s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: 'inline-flex' }}>
                {[
                  '◆ PRIVATE REPORTING · ETHIOPIA',
                  '◆ SAVE YOUR RECEIPT · TRACK YOUR REPORT',
                  '◆ GUIDED INTAKE IN FIVE LANGUAGES',
                  '◆ ENCRYPTED PRIVATE REPORT CONTENTS',
                  '◆ HUMAN REVIEW BEFORE PUBLICATION',
                  '◆ WEB + TELEGRAM · @SafuuIntelBot',
                  '◆ ሙስናን ሪፖርት አድርጉ · REPORT CORRUPTION',
                ].map((t, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: '11px',
                      fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                      padding: '0 24px',
                      color: j % 2 === 0 ? 'rgba(0,212,255,0.65)' : 'rgba(201,168,76,0.55)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      <a className="sf-skip" href="#main">
        Skip to content
      </a>
      <ClassicNav />
      <main id="main">
        {/* ══ HERO ══ */}
        <section
          className="sec"
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '72px 40px 56px',
            borderBottom: `1px solid rgba(0,212,255,0.08)`,
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '760px',
              margin: '0 auto',
              width: '100%',
              animation: 'fadein 0.9s ease-out',
            }}
          >
            {/* ══ DECLASSIFIED DOCUMENT HERO ══ */}
            <div className="doc-meta">
              <span style={{ color: R }}>▼</span>
              <span>SAFUU · PUBLIC BRIEFING</span>
              <span style={{ opacity: 0.4 }}>╱</span>
              <span>CLEARANCE: PUBLIC</span>
              <span style={{ opacity: 0.4 }}>╱</span>
              <span style={{ color: R }}>◆ DECLASSIFIED</span>
            </div>

            <div className="doc-headline-wrap">
              <h1 className="doc-h1">
                <span className="line-num" aria-hidden="true">
                  01
                </span>
                <span className="r-line" style={{ '--rd': '0.2s' }}>
                  Corruption ends
                </span>
                <span className="line-num" aria-hidden="true">
                  02
                </span>
                <span className="r-line emph" style={{ '--rd': '0.7s' }}>
                  when people
                </span>
                <span className="line-num" aria-hidden="true">
                  03
                </span>
                <span className="r-line" style={{ '--rd': '1.2s' }}>
                  refuse to be silent.
                </span>
              </h1>
              <div className="declassified-stamp">DECLASSIFIED</div>
            </div>

            <div className="seal-ticker">
              <SealNote />
            </div>

            <p
              className="body-prose"
              style={{
                fontSize: '16px',
                color: 'rgba(240,236,224,0.5)',
                lineHeight: '1.85',
                marginBottom: '36px',
                maxWidth: '580px',
              }}
            >
              Private corruption reporting for Ethiopia. Tell us what happened on the web or through
              Telegram. Keep a receipt. Let evidence and human review guide the public record.
            </p>

            <div style={{ marginBottom: '48px', maxWidth: '680px' }}>
              <ReportSection />
            </div>

            {/* Trust strip */}
            <div
              className="trust-strip"
              style={{
                display: 'flex',
                gap: '0',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid rgba(0,212,255,0.1)`,
                overflow: 'hidden',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: '🔐', label: 'HMAC-SHA-256', sub: 'Hashed visitor identifiers' },
                { icon: '🔒', label: 'AES-256-GCM', sub: 'Private report encryption' },
                { icon: '⚖️', label: 'Human review', sub: 'Evidence before publication' },
                { icon: '⛓️', label: 'Hash chain', sub: 'Tamper-evident ledger' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    flex: '1 1 140px',
                    padding: '14px 16px',
                    borderRight: i < 3 ? `1px solid rgba(0,212,255,0.08)` : 'none',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: CY,
                      fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                      letterSpacing: '0.06em',
                      marginBottom: '2px',
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,236,224,0.3)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ClassicDashboard />

        {/* ══ HOW IT WORKS ══ */}
        <section
          id="how"
          className="sec"
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '56px 40px',
            borderBottom: `1px solid rgba(0,212,255,0.08)`,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
              paddingBottom: '14px',
              borderBottom: `1px solid rgba(0,212,255,0.09)`,
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                background: CY,
                transform: 'rotate(45deg)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: CY,
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.2em',
                fontWeight: '700',
              }}
            >
              HOW IT WORKS
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,212,255,0.1)' }} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                n: '01',
                icon: '💬',
                title: 'Report privately',
                body: 'Use the web form or @SafuuIntelBot. Guided intake is available in five languages. Share the incident and optional evidence.',
              },
              {
                n: '02',
                icon: '🔒',
                title: 'Keep your receipt',
                body: 'A receipt is issued after the report is saved. Keep its private tracking code so you can follow the review without an account.',
              },
              {
                n: '03',
                icon: '⚖️',
                title: 'Evidence and human review',
                body: 'Your report enters a restricted review queue. Authorized staff assess the evidence and record a decision.',
              },
              {
                n: '04',
                icon: '📊',
                title: 'Reviewed public record',
                body: 'Cases require 100 distinct verified reporting identities and explicit staff approval before publication. Reports and attachments remain private.',
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  background: 'rgba(0,0,0,0.35)',
                  border: `1px solid rgba(0,212,255,0.09)`,
                  borderTop: `2px solid rgba(0,212,255,${0.5 - i * 0.1})`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'rgba(0,212,255,0.35)',
                      fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                      letterSpacing: '0.2em',
                    }}
                  >
                    {s.n}/04
                  </span>
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: CY,
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    marginBottom: '10px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{ fontSize: '13px', color: 'rgba(240,236,224,0.45)', lineHeight: '1.8' }}
                >
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SUBSCRIBE SECTION ══ */}
        <section
          className="sec"
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '48px 40px',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              alignItems: 'center',
            }}
            className="two-col"
          >
            {/* Left — headline */}
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}
              >
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    background: '#229ED9',
                    transform: 'rotate(45deg)',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#229ED9',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    letterSpacing: '0.22em',
                    fontWeight: '700',
                  }}
                >
                  PUBLIC RECORD · ETHIOPIA
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                  fontSize: 'clamp(22px,3vw,36px)',
                  fontWeight: '900',
                  color: 'rgba(240,236,224,0.95)',
                  lineHeight: 1.1,
                  marginBottom: '14px',
                  letterSpacing: '-0.01em',
                }}
              >
                Stay informed on corruption
                <br />
                <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>
                  through the reviewed public record.
                </span>
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(240,236,224,0.45)',
                  lineHeight: '1.85',
                  maxWidth: '440px',
                }}
              >
                Read approved cases and follow your own report with its private receipt. Allegations
                are reviewed before publication. Your report does not become a public post
                automatically.
              </p>
            </div>
            {/* Right — what you get */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                background: 'rgba(34,158,217,0.06)',
                border: '1px solid rgba(34,158,217,0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {[
                {
                  icon: '🔴',
                  color: '#b82020',
                  title: 'Approved cases',
                  desc: 'Only cases approved for publication appear on the transparency wall.',
                },
                {
                  icon: '📊',
                  color: '#c9a84c',
                  title: 'Real reporting totals',
                  desc: 'Aggregate counts come from saved reports, including reports awaiting review.',
                },
                {
                  icon: '🔒',
                  color: '#229ED9',
                  title: 'Private evidence',
                  desc: 'Attachments are accessible only through the authorized review process.',
                },
                {
                  icon: '🧾',
                  color: '#a78bfa',
                  title: 'Private tracking',
                  desc: 'Keep the receipt issued after saving and use it to check your report status.',
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < 3 ? '1px solid rgba(34,158,217,0.1)' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{s.icon}</div>
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: 'rgba(240,236,224,0.85)',
                        marginBottom: '3px',
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(240,236,224,0.4)',
                        lineHeight: '1.65',
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '16px 20px', background: 'rgba(34,158,217,0.08)' }}>
                <a
                  className="classic-outline-button"
                  href="/transparency"
                  style={{ width: '100%' }}
                >
                  Explore the transparency wall
                </a>
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.25)',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    textAlign: 'center',
                    lineHeight: '1.7',
                  }}
                >
                  Your report stays private while it is reviewed.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ AGENCIES ══ */}
        <section
          id="agencies"
          className="sec"
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '48px 40px',
            maxWidth: '1200px',
            margin: '0 auto',
            borderBottom: `1px solid rgba(0,212,255,0.08)`,
          }}
        >
          <div
            className="classic-section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '14px',
              borderBottom: `1px solid rgba(0,212,255,0.09)`,
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                background: G,
                transform: 'rotate(45deg)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: G,
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.2em',
                fontWeight: '700',
              }}
            >
              ACCOUNTABILITY BODIES
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.12)' }} />
            <h2
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                fontWeight: '900',
                fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                color: 'rgba(240,236,224,0.88)',
                flexShrink: 0,
              }}
            >
              Ethiopian accountability bodies
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
              gap: '10px',
            }}
          >
            {[
              { name: 'FEACC', am: 'ፀረሙስና ኮሚሽን', c: GR, type: 'All corruption' },
              { name: 'EHRC', am: 'ሰብዓዊ መብቶች', c: '#60a5fa', type: 'Human rights' },
              { name: 'Ombudsman', am: 'ዕርቀ ሚካሄ', c: '#a78bfa', type: 'Abuse of power' },
              { name: 'Fed. Police', am: 'ፌደራል ፖሊስ', c: '#f87171', type: 'Criminal' },
              { name: 'OFAG', am: 'ዋና ኦዲተር', c: '#fb923c', type: 'Public funds' },
            ].map((a, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: `1px solid rgba(0,212,255,0.08)`,
                  padding: '18px',
                  borderLeft: `3px solid ${a.c}`,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(0,212,255,0.28)',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    marginBottom: '4px',
                    letterSpacing: '0.1em',
                  }}
                >
                  AGENCY
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'rgba(240,236,224,0.88)',
                    fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                    marginBottom: '2px',
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(240,236,224,0.3)',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    marginBottom: '10px',
                  }}
                >
                  {a.am}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(240,236,224,0.22)',
                    marginBottom: '10px',
                  }}
                >
                  {a.type}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: a.c,
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                  }}
                >
                  Independent body
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '20px', fontSize: '13px', lineHeight: 1.7, color: '#a2adb7' }}>
            Safuu is an independent platform. Reports submitted here are not automatically forwarded
            to these bodies.
          </p>
        </section>

        {/* ══ FAQ ══ */}
        <section
          className="sec"
          style={{
            position: 'relative',
            zIndex: 5,
            padding: '48px 40px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <div
            className="classic-section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              paddingBottom: '14px',
              borderBottom: `1px solid rgba(0,212,255,0.09)`,
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                background: CY,
                transform: 'rotate(45deg)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: CY,
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.2em',
                fontWeight: '700',
              }}
            >
              FAQ.execute()
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,212,255,0.12)' }} />
            <h2
              style={{
                fontSize: 'clamp(16px,2vw,20px)',
                fontWeight: '900',
                fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                color: 'rgba(240,236,224,0.88)',
                flexShrink: 0,
              }}
            >
              Your questions answered
            </h2>
          </div>
          <div style={{ borderTop: `1px solid rgba(0,212,255,0.07)` }}>
            {FAQS.map((f, i) => (
              <div key={i} className="faq-row">
                <button
                  type="button"
                  className="classic-faq-toggle"
                  onClick={() => setFaq(faq === i ? null : i)}
                  aria-expanded={faq === i}
                  aria-controls={`home-faq-${i}`}
                  style={{
                    padding: '16px 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: faq === i ? G : 'rgba(240,236,224,0.85)',
                      fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                      paddingRight: '20px',
                      transition: 'color 0.2s',
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      color: faq === i ? CY : G,
                      fontSize: '20px',
                      flexShrink: 0,
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                      transform: faq === i ? 'rotate(45deg)' : 'none',
                      fontWeight: '300',
                    }}
                  >
                    +
                  </span>
                </button>
                {faq === i && (
                  <div id={`home-faq-${i}`} style={{ paddingBottom: '16px' }}>
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(0,212,255,0.07)',
                        marginBottom: '12px',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'rgba(240,236,224,0.48)',
                        lineHeight: '1.85',
                      }}
                    >
                      {f.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="/faq"
              className="lnk"
              style={{
                fontSize: '12px',
                color: 'rgba(0,212,255,0.38)',
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.1em',
                transition: 'color 0.2s',
              }}
            >
              Read the FAQ →
            </a>
            <a
              href="/transparency"
              className="lnk"
              style={{
                fontSize: '12px',
                color: 'rgba(201,168,76,0.38)',
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.1em',
                transition: 'color 0.2s',
              }}
            >
              Transparency wall →
            </a>
            <a
              href="/demo"
              className="lnk"
              style={{
                fontSize: '12px',
                color: 'rgba(201,168,76,0.38)',
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                letterSpacing: '0.1em',
                transition: 'color 0.2s',
              }}
            >
              Dashboard demo →
            </a>
          </div>
        </section>
      </main>
      {/* FOOTER */}
      <footer
        style={{
          position: 'relative',
          zIndex: 5,
          borderTop: `1px solid rgba(0,212,255,0.08)`,
          padding: '44px 40px 28px',
          background: 'rgba(0,0,0,0.92)',
        }}
      >
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '32px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div
                style={{
                  width: '3px',
                  height: '36px',
                  background: G,
                  marginRight: '16px',
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '900',
                    color: 'rgba(240,236,224,0.95)',
                    fontFamily: 'var(--font-display),var(--font-ethiopic),serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  SAFUU INTEL
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(201,168,76,0.3)',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    marginTop: '2px',
                    letterSpacing: '0.15em',
                  }}
                >
                  ሳፉ · MORAL ORDER · ETHIOPIA
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(0,212,255,0.28)',
                    fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                    marginTop: '6px',
                  }}
                >
                  PRIVATE INTAKE · EVIDENCE · HUMAN REVIEW
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {[
                [
                  'PLATFORM',
                  [
                    ['/', ' Home'],
                    ['/demo', 'Live Dashboard Demo'],
                    ['/transparency', 'Transparency Wall'],
                    ['/report', 'File a Report'],
                    ['/analytics', 'Analytics'],
                    ['/sms', 'Telegram'],
                  ],
                ],
                [
                  'LANGUAGES',
                  [
                    ['/am', 'አማርኛ (Amharic)'],
                    ['/or', 'Oromiffa'],
                    ['/ti', 'ትግርኛ (Tigrinya)'],
                  ],
                ],
                [
                  'ABOUT',
                  [
                    ['/about', 'About'],
                    ['/faq', 'FAQ'],
                    ['/partners', 'Partners'],
                    ['/press', 'Press'],
                    ['/donate', 'Support'],
                    ['/privacy', 'Privacy'],
                    ['/changelog', 'Changelog'],
                  ],
                ],
                [
                  'DEVELOPERS',
                  [
                    ['/backend', 'Backend Setup'],
                    ['/api-docs', 'API Reference'],
                    ['https://github.com/sifgamachu/safuu-intel', 'GitHub'],
                    ['https://t.me/SafuuIntelBot', 'Telegram'],
                    ['/admin', 'Review desk'],
                  ],
                ],
              ].map(([col, links]) => (
                <div key={col}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(201,168,76,0.32)',
                      fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                      letterSpacing: '0.2em',
                      marginBottom: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {col}
                  </div>
                  {links.map(([h, l]) => (
                    <div key={l} style={{ marginBottom: '8px' }}>
                      <a
                        href={h}
                        target={h.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="lnk"
                        style={{
                          fontSize: '11px',
                          color: 'rgba(240,236,224,0.28)',
                          fontFamily: "'Courier New',var(--font-ethiopic),monospace",
                          letterSpacing: '0.06em',
                          transition: 'color 0.2s',
                        }}
                      >
                        {l}
                      </a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderTop: `1px solid rgba(0,212,255,0.05)`,
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: 'rgba(0,212,255,0.18)',
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
              }}
            >
              © 2026 SAFUU_INTEL · Saved totals · Approved public cases
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'rgba(201,168,76,0.18)',
                fontFamily: "'Courier New',var(--font-ethiopic),monospace",
              }}
            >
              {date} · safuu.net
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
