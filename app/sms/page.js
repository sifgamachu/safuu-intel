'use client';
import { WhatsAppButton, TelegramButton, ReportSection, WA_GREEN, TG_BLUE } from "../components/ReportButtons";

const TIERS = [
  { icon:"✏️", tier:"Text only",        threshold:100, color:"rgba(255,255,255,0.5)", desc:"Written description only — no attachment" },
  { icon:"📷", tier:"+ Photo evidence", threshold:15,  color:"#c9a84c",              desc:"Photo attached (receipt, scene, document)" },
  { icon:"📄", tier:"+ Financial docs", threshold:15,  color:"#c9a84c",              desc:"Bank statement, receipt, payment record" },
  { icon:"🔴", tier:"+ Demand proof",   threshold:3,   color:"#b82020",              desc:"Screenshot of official demanding money" },
];

export default function ReportingGuide() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .lnk:hover{color:#00d4ff!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:640px){.two-col{grid-template-columns:1fr!important}.pad{padding:32px 20px!important}}
      `}</style>

      {/* Nav */}
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

      <div className="pad" style={{maxWidth:"860px",margin:"0 auto",padding:"60px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",background:"#b82020",transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:"#b82020",fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>TWO WAYS TO REPORT ANONYMOUSLY</span>
          <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.2)"}}/>
        </div>
        <h1 style={{fontSize:"clamp(28px,5vw,48px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"12px",letterSpacing:"-0.02em"}}>
          Report on WhatsApp or Telegram
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"44px",maxWidth:"580px"}}>
          Both channels accept text and photo/document attachments.
          Your identity is never stored — one-way SHA-256 hash only.
          Text and attachments are the two accepted formats right now.
        </p>

        {/* The main two-channel card */}
        <div style={{marginBottom:"52px"}}>
          <ReportSection/>
        </div>

        {/* WhatsApp detail */}
        <div style={{marginBottom:"40px",padding:"28px 32px",background:`rgba(37,211,102,0.05)`,border:`1px solid rgba(37,211,102,0.2)`,borderLeft:`4px solid ${WA_GREEN}`,borderRadius:"2px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"50%",background:WA_GREEN,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"22px"}}>
              <span>💬</span>
            </div>
            <div>
              <div style={{fontSize:"20px",fontWeight:"700",color:"white"}}>WhatsApp</div>
              <div style={{fontSize:"13px",color:WA_GREEN,fontFamily:"monospace"}}>+251 911 000 000</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"24px"}} className="two-col">
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",marginBottom:"12px",textTransform:"uppercase"}}>How to send a report</div>
              {[
                "Save our number: +251 911 000 000",
                "Open WhatsApp → New message → SAFUU",
                "Type what happened in your own words",
                "Attach a photo, receipt, or screenshot if you have one",
                "Send — you'll receive a confirmation with your case number",
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                  <span style={{color:WA_GREEN,fontWeight:"700",flexShrink:0,marginTop:"1px",fontSize:"13px"}}>{i+1}.</span>
                  <span style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",lineHeight:"1.6"}}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",marginBottom:"12px",textTransform:"uppercase"}}>What you can send</div>
              {[
                {icon:"✏️",t:"Text description",      n:"Write what happened — who, where, when, how much"},
                {icon:"📷",t:"Photos",                n:"Scene, official, receipt, document — photo evidence"},
                {icon:"📄",t:"Documents",             n:"Bank statements, receipts, payment records"},
                {icon:"📸",t:"Screenshots",           n:"Screenshot of a WhatsApp/message demanding money"},
              ].map(s=>(
                <div key={s.t} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"16px",flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:"rgba(240,236,224,0.75)",marginBottom:"1px"}}>{s.t}</div>
                    <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",lineHeight:"1.5"}}>{s.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WhatsAppButton text="Save number and message us" size="lg"/>
        </div>

        {/* Telegram detail */}
        <div style={{marginBottom:"52px",padding:"28px 32px",background:`rgba(34,158,217,0.05)`,border:`1px solid rgba(34,158,217,0.2)`,borderLeft:`4px solid ${TG_BLUE}`,borderRadius:"2px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"50%",background:TG_BLUE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"22px"}}>
              <span>✈️</span>
            </div>
            <div>
              <div style={{fontSize:"20px",fontWeight:"700",color:"white"}}>Telegram</div>
              <div style={{fontSize:"13px",color:TG_BLUE,fontFamily:"monospace"}}>@SafuuEthBot</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"24px"}} className="two-col">
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",marginBottom:"12px",textTransform:"uppercase"}}>How to use the bot</div>
              {[
                "Open Telegram → Search @SafuuEthBot",
                "Tap Start — the bot guides you step by step",
                "Answer each question at your own pace",
                "Attach photos or documents when prompted",
                "Review and confirm — receive your case number",
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                  <span style={{color:TG_BLUE,fontWeight:"700",flexShrink:0,marginTop:"1px",fontSize:"13px"}}>{i+1}.</span>
                  <span style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",lineHeight:"1.6"}}>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",marginBottom:"12px",textTransform:"uppercase"}}>Why use Telegram</div>
              {[
                {icon:"🔒",t:"Maximum privacy",       n:"Create an account without showing your number"},
                {icon:"🤖",t:"Guided 8 steps",        n:"Bot walks you through — nothing is missed"},
                {icon:"📎",t:"All attachment types",  n:"Photo, document, screenshot — same as WhatsApp"},
                {icon:"🗑️",t:"Delete trace",           n:"Delete the conversation after — no record on your device"},
              ].map(s=>(
                <div key={s.t} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"16px",flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:"rgba(240,236,224,0.75)",marginBottom:"1px"}}>{s.t}</div>
                    <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",lineHeight:"1.5"}}>{s.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TelegramButton text="Open @SafuuEthBot in Telegram" size="lg"/>
        </div>

        {/* Evidence tiers */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",marginBottom:"18px",textTransform:"uppercase"}}>What you send affects how quickly action is taken</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"10px"}}>
            {TIERS.map((t,i)=>(
              <div key={i} style={{padding:"16px",background:"rgba(0,0,0,0.45)",border:`1px solid ${t.color}22`,borderTop:`3px solid ${t.color}`}}>
                <div style={{fontSize:"22px",marginBottom:"8px"}}>{t.icon}</div>
                <div style={{fontSize:"12px",fontWeight:"700",color:t.color,marginBottom:"4px"}}>{t.tier}</div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",lineHeight:"1.6",marginBottom:"10px"}}>{t.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{fontSize:"24px",fontWeight:"900",color:t.color,fontFamily:"'Courier New',monospace"}}>{t.threshold}</div>
                  <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"monospace",lineHeight:"1.4"}}>verified<br/>reports needed</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"12px",fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
            // A screenshot of an official demanding money = threshold of 3 verified reports<br/>
            // Text only = 100 reports required to protect against coordinated false reporting<br/>
            // Voice intake: built in the system — not active yet (future feature)
          </div>
        </div>

        {/* Privacy assurance */}
        <div style={{padding:"24px 28px",background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.18)"}}>
          <div style={{fontSize:"9px",color:"#c9a84c",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"14px",fontWeight:"700"}}>YOUR PRIVACY — WHAT SAFUU NEVER STORES</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}} className="two-col">
            {[
              ["❌ Your WhatsApp number","SHA-256 hashed — cannot be reversed"],
              ["❌ Your Telegram ID","SHA-256 hashed — cannot be reversed"],
              ["❌ Your name","Never requested, never stored"],
              ["❌ Your location","Not tracked, not logged"],
            ].map(([k,v])=>(
              <div key={k} style={{fontSize:"12px"}}>
                <div style={{color:"rgba(240,236,224,0.6)",marginBottom:"3px",fontWeight:"600"}}>{k}</div>
                <div style={{color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",fontSize:"11px"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
