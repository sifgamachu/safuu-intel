'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const FACTS = [
  ["Platform name","SAFUU Intel"],
  ["Meaning","ሳፉ (Safuu) — Oromo for 'the moral order that holds society together'"],
  ["Mission","Anonymous anti-corruption intelligence platform for Ethiopia"],
  ["Founded","2026"],
  ["Technology","Claude AI · OpenAI Whisper · Hive Moderation · AES-256-GCM · Blockchain-style ledger"],
  ["Languages","11 Ethiopian languages + English"],
  ["Channels","Telegram bot (@SafuuIntelBot) · Web form"],
  ["Key agencies","FEACC (959) · EHRC (1488) · Ombudsman (6060) · Federal Police (911) · OFAG"],
  ["Disclosure model","Progressive — 15 verified reports triggers full public name disclosure"],
  ["Identity protection","SHA-256 one-way hash — mathematically impossible to reverse"],
  ["Website","safuu.net"],
];

const QUOTES = [
  { quote:"Every birr stolen from public funds is a school unfunded, a hospital understaffed, a road unpaved.", attr:"SAFUU Intel mission statement" },
  { quote:"SAFUU exists because silence is complicity — and because the tools now exist to break that silence safely.", attr:"About SAFUU, safuu.net/about" },
  { quote:"ሙስና ይጥፋእ — Justice will prevail.", attr:"SAFUU system message, Tigrinya" },
];

export default function Press() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>PRESS KIT</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>MEDIA & PRESS</span>
          <div style={{flex:1,height:"1px",background:`rgba(184,32,32,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>Press Kit</h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"56px"}}>
          For journalists and media covering corruption accountability in Ethiopia. All facts, quotes, and assets below are cleared for publication.
        </p>

        {/* Fast facts */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(201,168,76,0.12)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>FAST FACTS</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
            {FACTS.map(([k,v],i)=>(
              <div key={k} style={{display:"grid",gridTemplateColumns:"180px 1fr",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`,background:i%2===0?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"11px",fontWeight:"600",color:G,fontFamily:"'Courier New',monospace",paddingRight:"16px",lineHeight:"1.6"}}>{k}</div>
                <div style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",lineHeight:"1.6"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Approved quotes */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>APPROVED QUOTES</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {QUOTES.map((q,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,borderLeft:`3px solid ${G}`,padding:"24px 28px"}}>
                <p style={{fontSize:"15px",fontStyle:"italic",color:"rgba(240,236,224,0.8)",lineHeight:"1.65",fontFamily:"'Playfair Display',serif",marginBottom:"12px"}}>"{q.quote}"</p>
                <div style={{fontSize:"10px",color:`rgba(201,168,76,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>— {q.attr}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How SAFUU works — journalist summary */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>HOW IT WORKS — JOURNALIST SUMMARY</span>
          </div>
          <div style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.95"}}>
            <p style={{marginBottom:"16px"}}>Citizens file anonymous reports via Telegram (@SafuuIntelBot) or the web form, in any of 11 Ethiopian languages. No identity is ever stored — only a one-way SHA-256 cryptographic hash, making identification mathematically impossible.</p>
            <p style={{marginBottom:"16px"}}>Each report is analyzed by Claude AI (Anthropic) for corruption type and severity, forensically verified using EXIF image analysis and Hive Moderation's AI detection, and automatically routed to the appropriate Ethiopian authority: FEACC, Federal Police, Ombudsman, EHRC, or OFAG.</p>
            <p style={{marginBottom:"16px"}}>Reports are sealed in a cryptographic hash chain — a tamper-evident evidence ledger suitable for court proceedings. Multiple reports on the same official cluster together.</p>
            <p>When verified reports on an official reach the configured threshold (default: 15), the name is publicly disclosed on the SAFUU Transparency Wall and the case is formally escalated. Below the threshold, only city and office are shown — protecting against false accusations while building the evidence record.</p>
          </div>
        </div>

        {/* Key numbers */}
        <div style={{marginBottom:"56px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,borderRadius:"2px",overflow:"hidden"}}>
          {[["233+","Anonymous tips filed"],["139","AI-verified reports"],["3","Officials publicly disclosed"],["15","Disclosure threshold (reports)"],["11","Ethiopian languages"],["5","Accountability agencies"],["76","Automated security tests"],["94%","AI image-detection accuracy"]].map(([v,l],i)=>(
            <div key={i} style={{background:"#030507",padding:"22px 18px",textAlign:"center"}}>
              <div style={{fontSize:"clamp(20px,3vw,32px)",fontWeight:"900",color:G,fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"6px"}}>{v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",lineHeight:"1.4"}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Media contact */}
        <div style={{background:"rgba(0,212,255,0.03)",border:`1px solid rgba(0,212,255,0.15)`,padding:"36px"}}>
          <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",marginBottom:"16px",fontWeight:"700"}}>MEDIA CONTACT</div>
          <h3 style={{fontSize:"22px",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"12px"}}>Need more information?</h3>
          <p style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"24px",maxWidth:"500px"}}>
            For interview requests, additional data, or coverage of specific cases on the transparency wall, contact us via Telegram (@SafuuIntelBot). We respond to verified media organizations within 48 hours.
          </p>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
            <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer"
              style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 28px",letterSpacing:"0.12em",textDecoration:"none"}}>
              CONTACT VIA WHATSAPP
            </a>
            <a href="/transparency" style={{background:"transparent",color:`rgba(0,212,255,0.7)`,border:`1px solid rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
              VIEW TRANSPARENCY WALL →
            </a>
          </div>
          <div style={{marginTop:"20px",fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
            safuu.net · github.com/sifgamachu/safuu-intel · FEACC: 959 · EHRC: 1488
          </div>
        </div>
      </div>
    </div>
  );
}
