'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

export default function AmharicPage() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)",direction:"ltr"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"serif",lineHeight:1}}>ሳፉ</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.2em",fontFamily:"'Courier New',monospace",opacity:0.6}}>SAFUU INTEL</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>English</a>
          <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em"}}>ሪፖርት ያድርጉ ⚖</a>
        </div>
      </nav>

      <section style={{minHeight:"85vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"72px 32px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{maxWidth:"800px",margin:"0 auto",width:"100%"}}>
          {/* Overline */}
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>
              ኢትዮጵያ · 2026 · SAFUU.NET
            </span>
            <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.2)"}}/>
          </div>

          {/* Amharic headline */}
          <h1 style={{fontSize:"clamp(42px,8vw,88px)",fontWeight:"900",fontFamily:"serif",lineHeight:1.1,marginBottom:"24px",letterSpacing:"-0.01em"}}>
            <span style={{display:"block",color:"rgba(240,236,224,0.95)"}}>ሙስናን ሪፖርት</span>
            <span style={{display:"block",color:G,fontStyle:"italic"}}>ያድርጉ</span>
          </h1>

          <p style={{fontSize:"16px",color:"rgba(240,236,224,0.5)",lineHeight:"1.9",marginBottom:"12px",maxWidth:"560px",fontFamily:"serif"}}>
            ማንነትዎ ሙሉ በሙሉ ይጠበቃል። ስምዎ፣ ቁጥርዎ፣ ወይም ማንነትዎ <strong style={{color:G}}>ፈጽሞ አይሰበሰብም</strong>።
          </p>
          <p style={{fontSize:"14px",color:"rgba(240,236,224,0.4)",lineHeight:"1.9",marginBottom:"40px",maxWidth:"560px",fontFamily:"serif"}}>
            ሪፖርቱ በ AI ተረጋግጦ ለፀረ-ሙስና ኮሚሽን (ፀኮ)፣ ለፌደራል ፖሊስ፣ ወይም ለሌሎች አካላት ይላካል።
            15 የተረጋገጡ ሪፖርቶች ሲደርሱ ስሙ ለሕዝብ ይወጣል።
          </p>

          {/* Report channels */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px",marginBottom:"40px"}}>
            {[
              {icon:"📲",title:"ቴሌግራም",sub:"ድምፅ ወይም ፅሑፍ",cta:"@SafuuIntelBot",href:"https://t.me/SafuuIntelBot"},
              {icon:"📱",title:"SMS",sub:"ማንኛውም ስልክ — 21000",cta:"SAFUU [ስም] | [ቢሮ] | [ምን ሆነ]",href:"/sms"},
              {icon:"🌐",title:"ድረ-ገጽ",sub:"ቀጥታ ቅጽ",cta:"ሪፖርት ያድርጉ →",href:"/report"},
            ].map((c,i)=>(
              <a key={i} href={c.href} target={c.href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,padding:"24px",display:"block",transition:"all 0.2s",textDecoration:"none",color:"inherit"}}>
                <div style={{fontSize:"28px",marginBottom:"10px"}}>{c.icon}</div>
                <div style={{fontSize:"16px",fontWeight:"700",color:"rgba(240,236,224,0.9)",marginBottom:"4px",fontFamily:"serif"}}>{c.title}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",marginBottom:"14px"}}>{c.sub}</div>
                <div style={{fontSize:"11px",color:G,fontFamily:"'Courier New',monospace"}}>{c.cta}</div>
              </a>
            ))}
          </div>

          {/* What can be reported */}
          <div style={{marginBottom:"48px"}}>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>ምን ሪፖርት ማድረግ ይቻላል?</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {["የመሬት ማጭበርበር","ጉቦ ማስከፈል","ቀጠሮ ማጭበርበር","የታሪፍ ማጭበርበር","ሕገ-ወጥ ክፍያ ማስገደድ","ቅጥር ዝምድና አቢዩዝ","ሙስና ፍርድ ቤት","ትምህርት ቤት ጉቦ","ሆስፒታል ስርቆት"].map(t=>(
                <span key={t} style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",padding:"6px 12px",border:`1px solid rgba(0,212,255,0.1)`,fontFamily:"serif"}}>{t}</span>
              ))}
            </div>
          </div>

          {/* Security assurances */}
          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"24px 28px"}}>
            <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>ደህንነት</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"16px"}}>
              {[
                ["🔐 ማንነት","SHA-256 ሃሽ — ወደ ኋላ መመለስ አይቻልም"],
                ["🔒 ምስጠራ","AES-256-GCM — ሁሉም መስኮች ተጠብቀዋል"],
                ["⛓️ ማስረጃ","ምስጠራ ሰንሰለት — ፍርድ ቤት ዝግጁ"],
                ["⚖️ ተቋማት","FEACC (959) · ፌደራል ፖሊስ (911)"],
              ].map(([k,v])=>(
                <div key={k} style={{fontSize:"12px"}}>
                  <div style={{color:G,marginBottom:"4px",fontFamily:"serif"}}>{k}</div>
                  <div style={{color:"rgba(240,236,224,0.4)",lineHeight:"1.6",fontFamily:"serif"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"24px 32px",background:"rgba(0,0,0,0.9)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <span style={{fontSize:"9px",color:`rgba(0,212,255,0.2)`,fontFamily:"'Courier New',monospace"}}>
          SAFUU INTEL · FEACC: 959 · EHRC: 1488 · ፖሊስ: 911
        </span>
        <a href="/" style={{fontSize:"9px",color:`rgba(201,168,76,0.3)`,fontFamily:"'Courier New',monospace"}}>
          English version →
        </a>
      </div>
    </div>
  );
}
