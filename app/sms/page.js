'use client';
import { TelegramButton, TG_BLUE, TG_DARK, TG_HANDLE } from "../components/ReportButtons";

const TIERS = [
  { icon:"✏️", tier:"Text only",         threshold:100, color:"rgba(255,255,255,0.5)", desc:"Written description only — no attachment" },
  { icon:"📷", tier:"+ Photo evidence",  threshold:15,  color:"#c9a84c",              desc:"Photo attached (scene, receipt, document)" },
  { icon:"📄", tier:"+ Financial docs",  threshold:15,  color:"#c9a84c",              desc:"Bank statement, receipt, payment record" },
  { icon:"🔴", tier:"+ Demand proof",    threshold:3,   color:"#b82020",              desc:"Screenshot of official demanding money" },
];

export default function ReportingGuide() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .lnk:hover{color:${TG_BLUE}!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(34,158,217,0.3)}
        @media(max-width:640px){.two-col{grid-template-columns:1fr!important}.pad{padding:32px 20px!important}}
      `}</style>

      <nav style={{borderBottom:"1px solid rgba(0,212,255,0.1)",padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:"1px solid rgba(201,168,76,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:"#00d4ff",letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>HOW TO REPORT</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      <div className="pad" style={{maxWidth:"760px",margin:"0 auto",padding:"60px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>

        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",background:"#b82020",transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:"#b82020",fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>ANONYMOUS REPORTING · AFRICA</span>
          <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.2)"}}/>
        </div>
        <h1 style={{fontSize:"clamp(28px,5vw,48px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"12px",letterSpacing:"-0.02em"}}>
          Report on Telegram
        </h1>
        <p style={{fontSize:"15px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"44px",maxWidth:"560px"}}>
          SAFUU uses Telegram exclusively — it requires no phone number, supports fully anonymous accounts, and is end-to-end encrypted.
          More secure than any alternative.
        </p>

        {/* Main Telegram card */}
        <div style={{marginBottom:"48px",padding:"32px",background:"linear-gradient(135deg,rgba(34,158,217,0.1),rgba(34,158,217,0.04))",border:`1px solid rgba(34,158,217,0.25)`,borderRadius:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"28px"}}>
            <div style={{width:"52px",height:"52px",borderRadius:"50%",background:TG_BLUE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 6px 20px rgba(34,158,217,0.55)",fontSize:"28px"}}>✈️</div>
            <div>
              <div style={{fontSize:"22px",fontWeight:"700",color:"white",marginBottom:"3px"}}>Telegram</div>
              <div style={{fontSize:"14px",color:TG_BLUE,fontFamily:"'Courier New',monospace"}}>{TG_HANDLE}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px",marginBottom:"28px"}} className="two-col">
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.45)",letterSpacing:"0.14em",marginBottom:"14px",textTransform:"uppercase"}}>5 steps to report</div>
              {[
                "Download Telegram if you don't have it",
                "Search for " + TG_HANDLE + " — tap Start",
                "The bot asks you one question at a time",
                "Attach photo, receipt, or screenshot when asked",
                "Confirm and submit — receive your case number",
              ].map((s,i) => (
                <div key={i} style={{display:"flex",gap:"10px",marginBottom:"11px",alignItems:"flex-start"}}>
                  <span style={{color:TG_BLUE,fontWeight:"700",flexShrink:0,fontSize:"13px",minWidth:"18px"}}>{i+1}.</span>
                  <span style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",lineHeight:"1.6"}}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.45)",letterSpacing:"0.14em",marginBottom:"14px",textTransform:"uppercase"}}>What you can send</div>
              {[
                {icon:"✏️", t:"Text description",    n:"Who, where, when, how much"},
                {icon:"📷", t:"Photos",              n:"Scene, document, official ID"},
                {icon:"📄", t:"Documents",           n:"Receipts, bank records, statements"},
                {icon:"📸", t:"Screenshots",         n:"Proof of demand — lowers threshold to 3"},
              ].map(s => (
                <div key={s.t} style={{display:"flex",gap:"10px",marginBottom:"11px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"16px",flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:"rgba(240,236,224,0.75)",marginBottom:"2px"}}>{s.t}</div>
                    <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",lineHeight:"1.5"}}>{s.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TelegramButton text={"Open " + TG_HANDLE + " on Telegram"} size="lg" fullWidth/>
        </div>

        {/* Why Telegram, not WhatsApp */}
        <div style={{marginBottom:"40px",padding:"20px 24px",background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:"9px",fontWeight:"700",color:"rgba(255,255,255,0.35)",letterSpacing:"0.18em",marginBottom:"14px",textTransform:"uppercase",fontFamily:"'Courier New',monospace"}}>Why Telegram, not WhatsApp</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}} className="two-col">
            {[
              {t:"No phone number required",       n:"Telegram accounts can be created without linking a phone number — true anonymity from the start."},
              {t:"End-to-end encrypted",           n:"Bot conversations use Telegram's server-side encryption. No third party can intercept your message."},
              {t:"No metadata trail",              n:"WhatsApp shares metadata with Meta. Telegram does not share conversation data with third parties."},
              {t:"Delete conversation trace",      n:"After submitting, delete the conversation. No record remains on your device or in Telegram's logs."},
            ].map(s => (
              <div key={s.t} style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                <span style={{color:TG_BLUE,fontSize:"14px",flexShrink:0,marginTop:"2px"}}>✓</span>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"600",color:"rgba(240,236,224,0.7)",marginBottom:"4px"}}>{s.t}</div>
                  <div style={{fontSize:"12px",color:"rgba(240,236,224,0.38)",lineHeight:"1.65"}}>{s.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence tiers */}
        <div style={{marginBottom:"40px"}}>
          <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.35)",letterSpacing:"0.18em",marginBottom:"16px",textTransform:"uppercase",fontFamily:"'Courier New',monospace"}}>What you send affects the threshold</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"10px"}}>
            {TIERS.map((t,i) => (
              <div key={i} style={{padding:"16px",background:"rgba(0,0,0,0.45)",border:`1px solid ${t.color}22`,borderTop:`3px solid ${t.color}`}}>
                <div style={{fontSize:"22px",marginBottom:"8px"}}>{t.icon}</div>
                <div style={{fontSize:"12px",fontWeight:"700",color:t.color,marginBottom:"4px"}}>{t.tier}</div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.38)",lineHeight:"1.6",marginBottom:"10px"}}>{t.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{fontSize:"24px",fontWeight:"900",color:t.color,fontFamily:"'Courier New',monospace"}}>{t.threshold}</div>
                  <div style={{fontSize:"9px",color:"rgba(240,236,224,0.28)",fontFamily:"monospace",lineHeight:"1.4"}}>verified<br/>reports needed</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"12px",fontSize:"11px",color:"rgba(240,236,224,0.28)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
            // Screenshot of a demand = 3 reports to disclose · Text only = 100 reports needed<br/>
            // Voice intake: built in system — not active yet · Text + attachments active now
          </div>
        </div>

        {/* Pan-African note */}
        <div style={{padding:"20px 24px",background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.18)"}}>
          <div style={{fontSize:"9px",fontWeight:"700",color:"#c9a84c",letterSpacing:"0.18em",marginBottom:"10px",textTransform:"uppercase",fontFamily:"'Courier New',monospace"}}>🌍 Expanding across Africa</div>
          <p style={{fontSize:"13px",color:"rgba(240,236,224,0.48)",lineHeight:"1.85"}}>
            SAFUU started in Ethiopia. The <strong style={{color:"rgba(240,236,224,0.7)"}}>@SafuuAfBot</strong> handle reflects the pan-African vision —
            the same anonymous reporting infrastructure, evidence tier system, and accountability pipeline will expand to serve citizens across the continent.
            One platform. Multiple countries. Zero identity stored.
          </p>
        </div>
      </div>
    </div>
  );
}
