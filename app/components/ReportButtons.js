'use client';

export const WA_GREEN = "#25D366";
export const WA_DARK  = "#1DA851";
export const TG_BLUE  = "#229ED9";
export const TG_DARK  = "#1585B8";
export const WA_LINK  = "https://wa.me/251911000000";
export const TG_LINK  = "https://t.me/SafuuEthBot";

const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

const TG_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

// WhatsApp button — pill shape, official green, their font style
export function WhatsAppButton({ text="Message us on WhatsApp", size="md", fullWidth=false, style={} }) {
  const sizes = {
    sm: { p:"9px 20px",  f:"13px", r:"100px", gap:"8px",  iw:"17px" },
    md: { p:"13px 26px", f:"14px", r:"100px", gap:"10px", iw:"20px" },
    lg: { p:"16px 36px", f:"16px", r:"100px", gap:"12px", iw:"22px" },
  };
  const s = sizes[size]||sizes.md;
  return (
    <a href={WA_LINK} target="_blank" rel="noreferrer"
      style={{
        display:"inline-flex", alignItems:"center", gap:s.gap,
        background:WA_GREEN, color:"white",
        fontFamily:"-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontWeight:"600", fontSize:s.f, padding:s.p,
        borderRadius:s.r, textDecoration:"none", cursor:"pointer",
        boxShadow:`0 4px 14px rgba(37,211,102,0.45)`,
        transition:"all 0.2s ease", whiteSpace:"nowrap",
        width:fullWidth?"100%":"auto", justifyContent:"center",
        ...style,
      }}
      onMouseOver={e=>{e.currentTarget.style.background=WA_DARK;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(37,211,102,0.6)";}}
      onMouseOut={e=>{e.currentTarget.style.background=WA_GREEN;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 14px rgba(37,211,102,0.45)";}}
    >
      <span dangerouslySetInnerHTML={{__html:WA_SVG}} style={{width:s.iw,height:s.iw,display:"flex",flexShrink:0}}/>
      {text}
    </a>
  );
}

// Telegram button — rounded rectangle, official blue, their font style
export function TelegramButton({ text="Open in Telegram", size="md", fullWidth=false, style={} }) {
  const sizes = {
    sm: { p:"9px 20px",  f:"13px", r:"8px",  gap:"8px",  iw:"17px" },
    md: { p:"13px 26px", f:"14px", r:"10px", gap:"10px", iw:"20px" },
    lg: { p:"16px 36px", f:"16px", r:"12px", gap:"12px", iw:"22px" },
  };
  const s = sizes[size]||sizes.md;
  return (
    <a href={TG_LINK} target="_blank" rel="noreferrer"
      style={{
        display:"inline-flex", alignItems:"center", gap:s.gap,
        background:TG_BLUE, color:"white",
        fontFamily:"-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",
        fontWeight:"600", fontSize:s.f, padding:s.p,
        borderRadius:s.r, textDecoration:"none", cursor:"pointer",
        boxShadow:`0 4px 14px rgba(34,158,217,0.4)`,
        transition:"all 0.2s ease", whiteSpace:"nowrap",
        width:fullWidth?"100%":"auto", justifyContent:"center",
        ...style,
      }}
      onMouseOver={e=>{e.currentTarget.style.background=TG_DARK;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(34,158,217,0.55)";}}
      onMouseOut={e=>{e.currentTarget.style.background=TG_BLUE;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 14px rgba(34,158,217,0.4)";}}
    >
      <span dangerouslySetInnerHTML={{__html:TG_SVG}} style={{width:s.iw,height:s.iw,display:"flex",flexShrink:0}}/>
      {text}
    </a>
  );
}

// Combined "Report Now" section — card with both options side by side
export function ReportSection({ compact=false }) {
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0",
      border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:"16px", overflow:"hidden",
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {/* WhatsApp side */}
      <div style={{
        background:`linear-gradient(135deg, rgba(37,211,102,0.12), rgba(37,211,102,0.04))`,
        borderRight:"1px solid rgba(255,255,255,0.05)",
        padding: compact ? "20px" : "28px",
        display:"flex", flexDirection:"column", gap:"14px",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:WA_GREEN,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 12px rgba(37,211,102,0.5)`}}>
            <span dangerouslySetInnerHTML={{__html:WA_SVG}} style={{width:"20px",height:"20px",display:"flex"}}/>
          </div>
          <div>
            <div style={{fontSize:"16px",fontWeight:"700",color:"white",fontFamily:"-apple-system,'Helvetica Neue',sans-serif"}}>WhatsApp</div>
            <div style={{fontSize:"11px",color:WA_GREEN,fontFamily:"monospace"}}>+251 911 000 000</div>
          </div>
        </div>
        <p style={{fontSize:"13px",color:"rgba(240,236,224,0.55)",lineHeight:"1.75",fontFamily:"-apple-system,'Helvetica Neue',sans-serif",margin:0}}>
          Send a message, photo, or document directly to our number. Simple, familiar, fast.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {["Text description","Photo evidence","Document / receipt","Screenshot of demand"].map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"12px",color:"rgba(240,236,224,0.5)",fontFamily:"-apple-system,sans-serif"}}>
              <span style={{color:WA_GREEN,fontSize:"14px"}}>✓</span>{t}
            </div>
          ))}
        </div>
        <WhatsAppButton text="Message on WhatsApp" size="md" fullWidth style={{marginTop:"4px"}}/>
      </div>

      {/* Telegram side */}
      <div style={{
        background:`linear-gradient(135deg, rgba(34,158,217,0.12), rgba(34,158,217,0.04))`,
        padding: compact ? "20px" : "28px",
        display:"flex", flexDirection:"column", gap:"14px",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"36px",height:"36px",borderRadius:"50%",background:TG_BLUE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 12px rgba(34,158,217,0.5)`}}>
            <span dangerouslySetInnerHTML={{__html:TG_SVG}} style={{width:"20px",height:"20px",display:"flex"}}/>
          </div>
          <div>
            <div style={{fontSize:"16px",fontWeight:"700",color:"white",fontFamily:"-apple-system,'Helvetica Neue',sans-serif"}}>Telegram</div>
            <div style={{fontSize:"11px",color:TG_BLUE,fontFamily:"monospace"}}>@SafuuEthBot</div>
          </div>
        </div>
        <p style={{fontSize:"13px",color:"rgba(240,236,224,0.55)",lineHeight:"1.75",fontFamily:"-apple-system,'Helvetica Neue',sans-serif",margin:0}}>
          Guided 8-step process. The bot walks you through each detail step by step.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {["Step-by-step guidance","Photo + document upload","Maximum privacy options","Works on low data"].map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"12px",color:"rgba(240,236,224,0.5)",fontFamily:"-apple-system,sans-serif"}}>
              <span style={{color:TG_BLUE,fontSize:"14px"}}>✓</span>{t}
            </div>
          ))}
        </div>
        <TelegramButton text="Open in Telegram" size="md" fullWidth style={{marginTop:"4px"}}/>
      </div>
    </div>
  );
}
