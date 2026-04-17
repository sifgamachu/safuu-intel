'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const CHANNELS = [
  {
    icon:"💬", name:"WhatsApp", color:G,
    number:"+251 911 000 000",
    steps:[
      "Save the number +251911000000 in your contacts",
      "Open WhatsApp and start a new chat with SAFUU",
      "Send a voice note or text message describing the corruption",
      "Share photos or documents as evidence if you have them",
      "You will receive a case reference number in reply",
    ],
    tips:[
      "Voice messages work in all 11 Ethiopian languages — Whisper AI transcribes automatically",
      "WhatsApp's end-to-end encryption adds a layer of protection in transit",
      "You can send long messages, multiple photos, and documents in one conversation",
    ],
    example:"Tesfaye Bekele | Ministry of Transport, Addis Ababa | Demanded ETB 5,000 for permit approval on March 14 2026",
  },
  {
    icon:"📲", name:"Telegram", color:CY,
    number:"@SafuuEthBot",
    steps:[
      "Open Telegram and search for @SafuuEthBot",
      "Press Start to begin the 8-step structured intake",
      "The bot will guide you step by step in your language",
      "Upload photos, voice messages, or documents when prompted",
      "Receive your case reference number at the end",
    ],
    tips:[
      "The Telegram bot is more structured — 8 guided steps ensure complete information",
      "Telegram accounts can be created with a phone number then set to anonymous",
      "Use Telegram's 'Delete account' feature after reporting if you want zero trace",
    ],
    example:"The bot asks each question individually — no free-form message needed",
  },
];

const LANGS = [
  "አማርኛ (Amharic)","Oromiffa","ትግርኛ (Tigrinya)","Soomaali","Qafar (Afar)",
  "Sidaamu","Wolayttatto","Hadiyyissa","Dawro","Gamo","Bench","English",
];

export default function WhatsAppGuide() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>HOW TO REPORT</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>TWO WAYS TO REPORT ANONYMOUSLY</span>
          <div style={{flex:1,height:"1px",background:`rgba(201,168,76,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"14px",letterSpacing:"-0.02em"}}>
          WhatsApp & Telegram
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"52px",maxWidth:"580px"}}>
          SAFUU accepts anonymous reports via <strong style={{color:G}}>WhatsApp</strong> and <strong style={{color:CY}}>Telegram</strong>.
          Both support voice messages, photos, and documents in all 11 Ethiopian languages.
          Your identity is never stored — SHA-256 one-way hash only.
        </p>

        {/* Channel cards */}
        <div style={{display:"flex",flexDirection:"column",gap:"24px",marginBottom:"56px"}}>
          {CHANNELS.map((ch,i)=>(
            <div key={i} style={{background:"rgba(0,0,0,0.5)",border:`1px solid ${ch.color}22`,overflow:"hidden"}}>
              {/* Header */}
              <div style={{display:"flex",alignItems:"center",gap:"16px",padding:"22px 28px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:`${ch.color}08`}}>
                <div style={{fontSize:"32px"}}>{ch.icon}</div>
                <div>
                  <div style={{fontSize:"20px",fontWeight:"900",color:ch.color,fontFamily:"'Playfair Display',serif",marginBottom:"4px"}}>{ch.name}</div>
                  <div style={{fontSize:"14px",color:"rgba(240,236,224,0.7)",fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{ch.number}</div>
                </div>
                <a href={ch.name==="WhatsApp"?"https://wa.me/251911000000":"https://t.me/SafuuEthBot"}
                  target="_blank" rel="noreferrer"
                  style={{marginLeft:"auto",background:ch.color,color:"#030507",fontFamily:"'Courier New',monospace",
                    fontSize:"10px",fontWeight:"700",padding:"10px 22px",letterSpacing:"0.12em",textDecoration:"none",flexShrink:0}}>
                  OPEN {ch.name.toUpperCase()} →
                </a>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0"}}>
                {/* Steps */}
                <div style={{padding:"22px 24px",borderRight:`1px solid rgba(255,255,255,0.04)`}}>
                  <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"14px"}}>HOW TO USE</div>
                  {ch.steps.map((s,j)=>(
                    <div key={j} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                      <span style={{fontSize:"9px",color:ch.color,fontFamily:"'Courier New',monospace",flexShrink:0,marginTop:"3px",fontWeight:"700"}}>{String(j+1).padStart(2,"0")}</span>
                      <span style={{fontSize:"12px",color:"rgba(240,236,224,0.55)",lineHeight:"1.65"}}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div style={{padding:"22px 24px"}}>
                  <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"14px"}}>TIPS</div>
                  {ch.tips.map((t,j)=>(
                    <div key={j} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                      <span style={{color:ch.color,flexShrink:0,marginTop:"1px",fontSize:"10px"}}>◆</span>
                      <span style={{fontSize:"12px",color:"rgba(240,236,224,0.45)",lineHeight:"1.65"}}>{t}</span>
                    </div>
                  ))}
                  {/* Example message */}
                  <div style={{marginTop:"16px",padding:"12px 14px",background:"rgba(0,0,0,0.4)",border:`1px solid ${ch.color}25`}}>
                    <div style={{fontSize:"8px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",marginBottom:"6px"}}>EXAMPLE</div>
                    <div style={{fontSize:"11px",color:"rgba(240,236,224,0.5)",lineHeight:"1.6",fontFamily:"'Courier New',monospace"}}>{ch.example}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Which to choose */}
        <div style={{marginBottom:"48px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px 32px"}}>
          <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>WHICH SHOULD I USE?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
            <div>
              <div style={{fontSize:"14px",fontWeight:"700",color:G,marginBottom:"10px",fontFamily:"'Playfair Display',serif"}}>💬 Use WhatsApp if…</div>
              {["You already have WhatsApp installed","You want a simple free-form conversation","You prefer voice messages","You want to share multiple photos easily"].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"7px",fontSize:"12px",color:"rgba(240,236,224,0.5)"}}>
                  <span style={{color:G,flexShrink:0}}>✓</span>{s}
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:"14px",fontWeight:"700",color:CY,marginBottom:"10px",fontFamily:"'Playfair Display',serif"}}>📲 Use Telegram if…</div>
              {["You want step-by-step structured guidance","You want maximum privacy control","You prefer not using your phone number","You want to delete your account trace after reporting"].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"7px",fontSize:"12px",color:"rgba(240,236,224,0.5)"}}>
                  <span style={{color:CY,flexShrink:0}}>✓</span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>SUPPORTED LANGUAGES</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {LANGS.map(l=>(
              <span key={l} style={{fontSize:"11px",color:"rgba(240,236,224,0.5)",padding:"5px 14px",border:`1px solid rgba(0,212,255,0.1)`}}>{l}</span>
            ))}
          </div>
          <p style={{fontSize:"12px",color:"rgba(240,236,224,0.3)",marginTop:"12px",fontFamily:"'Courier New',monospace",lineHeight:"1.7"}}>
            // Voice messages are automatically transcribed by OpenAI Whisper<br/>
            // You can mix languages in a single report — AI processes each segment
          </p>
        </div>

        {/* Anonymity assurance */}
        <div style={{background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.18)`,padding:"28px 32px"}}>
          <div style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"14px",fontWeight:"700"}}>YOUR ANONYMITY</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px"}}>
            {[
              {icon:"🔐",t:"Identity",v:"SHA-256 hash only — your phone number or Telegram ID is never stored"},
              {icon:"🔒",t:"Encryption",v:"AES-256-GCM at rest — all report content is encrypted"},
              {icon:"⛓️",t:"Evidence",v:"Every report sealed in a cryptographic hash chain — court-ready"},
              {icon:"⚖️",t:"Routing",v:"Auto-matched to FEACC, Federal Police, EHRC, Ombudsman, or OFAG"},
            ].map(s=>(
              <div key={s.t} style={{fontSize:"12px"}}>
                <div style={{color:G,marginBottom:"4px",fontWeight:"700"}}>{s.icon} {s.t}</div>
                <div style={{color:"rgba(240,236,224,0.4)",lineHeight:"1.7"}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
