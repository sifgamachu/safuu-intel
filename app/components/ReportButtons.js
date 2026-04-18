'use client';

// Official Telegram brand
export const TG_BLUE  = "#229ED9";
export const TG_DARK  = "#1585B8";
export const TG_LINK  = "https://t.me/SafuuIntelBot";
export const TG_HANDLE = "@SafuuIntelBot";

// Official Telegram paper plane SVG
export const TG_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

// Telegram button — official blue, rounded rectangle, their font
export function TelegramButton({ text = "Open in Telegram", size = "md", fullWidth = false, style = {} }) {
  const sizes = {
    sm: { p:"9px 20px",  f:"13px", r:"10px", gap:"8px",  iw:"17px" },
    md: { p:"13px 28px", f:"14px", r:"12px", gap:"10px", iw:"20px" },
    lg: { p:"16px 36px", f:"16px", r:"14px", gap:"12px", iw:"22px" },
  };
  const s = sizes[size] || sizes.md;
  return (
    <a href={TG_LINK} target="_blank" rel="noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: s.gap,
        background: TG_BLUE, color: "white",
        fontFamily: "-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontWeight: "600", fontSize: s.f, padding: s.p,
        borderRadius: s.r, textDecoration: "none", cursor: "pointer",
        boxShadow: `0 4px 16px rgba(34,158,217,0.45)`,
        transition: "all 0.2s ease", whiteSpace: "nowrap",
        width: fullWidth ? "100%" : "auto", justifyContent: "center",
        ...style,
      }}
      onMouseOver={e => { e.currentTarget.style.background = TG_DARK; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(34,158,217,0.6)"; }}
      onMouseOut={e  => { e.currentTarget.style.background = TG_BLUE; e.currentTarget.style.transform = "none";           e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,158,217,0.45)"; }}
    >
      <span dangerouslySetInnerHTML={{ __html: TG_SVG }} style={{ width: s.iw, height: s.iw, display: "flex", flexShrink: 0 }} />
      {text}
    </a>
  );
}

// Alias — some pages import WhatsAppButton, redirect to TelegramButton
export const WhatsAppButton = TelegramButton;

// Single-channel report section — Telegram only
export function ReportSection({ compact = false }) {
  return (
    <div style={{
      border: "1px solid rgba(34,158,217,0.25)",
      borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      background: "linear-gradient(135deg, rgba(34,158,217,0.1), rgba(34,158,217,0.04))",
      padding: compact ? "20px" : "28px",
      display: "flex", flexDirection: "column", gap: "18px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: TG_BLUE, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 6px 20px rgba(34,158,217,0.55)`, flexShrink: 0,
        }}>
          <span dangerouslySetInnerHTML={{ __html: TG_SVG }} style={{ width: "26px", height: "26px", display: "flex" }} />
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "white", fontFamily: "-apple-system,'Helvetica Neue',sans-serif", marginBottom: "2px" }}>Report on Telegram</div>
          <div style={{ fontSize: "13px", color: TG_BLUE, fontFamily: "'Courier New',monospace" }}>{TG_HANDLE} · Anonymous · No phone number needed</div>
        </div>
      </div>

      {/* Why Telegram */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { icon: "🔒", t: "No phone number required",   n: "Create an account anonymously" },
          { icon: "🤖", t: "Guided step-by-step bot",    n: "8 steps — nothing missed" },
          { icon: "📎", t: "Text, photo & documents",    n: "All evidence types accepted" },
          { icon: "🌍", t: "Pan-African rollout",         n: "Expanding across Africa" },
        ].map(s => (
          <div key={s.t} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "rgba(240,236,224,0.8)", marginBottom: "1px", fontFamily: "-apple-system,sans-serif" }}>{s.t}</div>
              <div style={{ fontSize: "11px", color: "rgba(240,236,224,0.4)", fontFamily: "-apple-system,sans-serif" }}>{s.n}</div>
            </div>
          </div>
        ))}
      </div>

      <TelegramButton text="Open @SafuuIntelBot on Telegram" size="lg" fullWidth />
    </div>
  );
}
