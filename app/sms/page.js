'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

export default function SMSGuide() {
  const EXAMPLES = [
    { lang:"አማርኛ", code:"AM", text:"SAFUU Tesfaye Bekele | የትራንስፖርት ሚኒስቴር | ሙስናን ሪፖርት", note:"Amharic example" },
    { lang:"Oromiffa", code:"OR", text:"SAFUU Abebe Girma | Customs Authority | Malaanmmaltummaa", note:"Oromiffa example" },
    { lang:"English",  code:"EN", text:"SAFUU John Doe | Ministry of Finance | Demanded ETB 10,000 bribe for permit approval", note:"English example" },
  ];

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>SMS GUIDE</div>
          </div>
        </a>
        <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"72px 40px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>NO SMARTPHONE NEEDED</span>
        </div>
        <h1 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Report by SMS
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"56px",maxWidth:"580px"}}>
          Any mobile phone in Ethiopia can submit a report to SAFUU — no internet, no smartphone, no app needed. Just send an SMS to <strong style={{color:G}}>21000</strong>.
        </p>

        {/* Format box */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>SMS FORMAT</div>
          <div style={{background:"rgba(0,0,0,0.7)",border:`2px solid ${G}`,padding:"28px 32px",fontFamily:"'Courier New',monospace"}}>
            <div style={{fontSize:"clamp(14px,2.5vw,18px)",color:G,letterSpacing:"0.05em",marginBottom:"12px",lineHeight:"1.6"}}>
              SAFUU <span style={{color:"rgba(240,236,224,0.5)"}}>[Name]</span> | <span style={{color:"rgba(240,236,224,0.5)"}}>[Office]</span> | <span style={{color:"rgba(240,236,224,0.5)"}}>[What happened]</span>
            </div>
            <div style={{fontSize:"12px",color:`rgba(0,212,255,0.4)`,marginTop:"8px"}}>Send to: <strong style={{color:CY,fontSize:"20px"}}>21000</strong></div>
          </div>
        </div>

        {/* Field guide */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>FIELD GUIDE</div>
          <div style={{display:"flex",flexDirection:"column",gap:"1px",border:`1px solid rgba(0,212,255,0.1)`}}>
            {[
              {field:"[Name]",   req:"Required", desc:"Official's name. Partial name acceptable. Add title if known."},
              {field:"[Office]", req:"Required", desc:"Institution, ministry, court, police station, or department."},
              {field:"[What happened]",req:"Required",desc:"Brief description of the corruption. Amount demanded, what was offered in return, any threats made."},
            ].map(f=>(
              <div key={f.field} style={{display:"grid",gridTemplateColumns:"130px 80px 1fr",gap:"0",alignItems:"start",padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`,background:"rgba(0,0,0,0.4)"}}>
                <div style={{fontSize:"12px",fontWeight:"700",color:G,fontFamily:"'Courier New',monospace"}}>{f.field}</div>
                <div style={{fontSize:"10px",color:R,fontFamily:"'Courier New',monospace",paddingTop:"1px"}}>{f.req}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",lineHeight:"1.7"}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>EXAMPLES</div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {EXAMPLES.map(ex=>(
              <div key={ex.code} style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,padding:"20px 24px"}}>
                <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"12px"}}>
                  <span style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",padding:"3px 10px",background:`rgba(0,212,255,0.08)`,border:`1px solid rgba(0,212,255,0.2)`}}>{ex.code}</span>
                  <span style={{fontSize:"10px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace"}}>{ex.lang}</span>
                </div>
                <div style={{fontSize:"13px",color:"rgba(240,236,224,0.75)",fontFamily:"'Courier New',monospace",lineHeight:"1.6",wordBreak:"break-word"}}>
                  {ex.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>COMMON QUESTIONS</div>
          {[
            ["Is my phone number recorded?","No. Your phone number is passed through a one-way SHA-256 hash — a mathematical fingerprint that cannot be reversed. It is used only to prevent spam flooding from the same number."],
            ["Which languages can I use?","Any Ethiopian language. Our AI automatically detects the language and processes the text. Voice SMS is also transcribed."],
            ["How do I know it was received?","You'll receive a confirmation SMS within a few minutes with a case reference number. No personal information is included."],
            ["What happens next?","Your report is analyzed by AI, forensically verified, and routed to FEACC, Federal Police, Ombudsman, or another relevant authority."],
          ].map(([q,a])=>(
            <div key={q} style={{marginBottom:"24px",paddingBottom:"24px",borderBottom:`1px solid rgba(0,212,255,0.06)`}}>
              <div style={{fontSize:"14px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"8px",fontFamily:"'Playfair Display',serif"}}>{q}</div>
              <div style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.8"}}>{a}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",padding:"40px",background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.15)`}}>
          <div style={{fontSize:"40px",marginBottom:"16px"}}>📱</div>
          <div style={{fontSize:"32px",fontWeight:"900",color:G,fontFamily:"'Courier New',monospace",marginBottom:"8px"}}>21000</div>
          <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace",marginBottom:"16px",lineHeight:"1.8"}}>
            Type: SAFUU [Name] | [Office] | [What happened]<br/>
            Works on any Ethiopian mobile network
          </div>
          <div style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>
            Africa's Talking · Powered by SAFUU Intel
          </div>
        </div>
      </div>
    </div>
  );
}
