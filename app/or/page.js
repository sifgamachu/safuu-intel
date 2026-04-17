'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";
export default function OromiffaPage() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div><div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"serif"}}>SAFUU</div><div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>OROMIFFA</div></div>
        </a>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>English</a>
          <a href="/am" style={{fontSize:"10px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>አማርኛ</a>
          <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em"}}>Gabaasi ⚖</a>
        </div>
      </nav>
      <section style={{minHeight:"85vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"72px 32px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{maxWidth:"800px",margin:"0 auto",width:"100%"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>ITOOPHIYAA · 2026 · SAFUU.NET</span>
            <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.2)"}}/>
          </div>
          <h1 style={{fontSize:"clamp(40px,8vw,84px)",fontWeight:"900",fontFamily:"serif",lineHeight:1.1,marginBottom:"24px"}}>
            <span style={{display:"block",color:"rgba(240,236,224,0.95)"}}>Malaanmmaltummaa</span>
            <span style={{display:"block",color:G,fontStyle:"italic"}}>Gabaasi</span>
          </h1>
          <p style={{fontSize:"16px",color:"rgba(240,236,224,0.5)",lineHeight:"1.9",marginBottom:"12px",maxWidth:"560px"}}>
            Eenyummaan kee <strong style={{color:G}}>gonkumaa hin qabamtu</strong>. Galmeen SHA-256 qofa — eenyummaakee beekuun hindanda'amu.
          </p>
          <p style={{fontSize:"14px",color:"rgba(240,236,224,0.4)",lineHeight:"1.9",marginBottom:"40px",maxWidth:"560px"}}>
            Gabaasni AI dhaan mirkana'ee FEACC, Poolisii Federaalaa, yookaan dhaabbata biraa bira ni ergama.
            Gabaasa 15 yoo guutame maqaan isaa uummataaf ni baha.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"40px"}}>
            {[{icon:"📲",t:"WhatsApp",s:"Sagalee / barreeffama",href:"https://wa.me/251911000000"},{icon:"📱",t:"SMS — 21000",s:"Bilbila kamiyyuu",href:"/sms"},{icon:"🌐",t:"Galmee Intarneetii",s:"Kallattiin gabaasi",href:"/report"}].map((c,i)=>(
              <a key={i} href={c.href} target={c.href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,padding:"22px",display:"block",textDecoration:"none",color:"inherit",transition:"all 0.2s"}}>
                <div style={{fontSize:"26px",marginBottom:"8px"}}>{c.icon}</div>
                <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.9)",marginBottom:"4px"}}>{c.t}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)"}}>{c.s}</div>
              </a>
            ))}
          </div>
          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px 24px"}}>
            <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px"}}>EEGUMSA</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"14px",fontSize:"12px"}}>
              {[["🔐 Eenyummaa","SHA-256 — duubatti hin deebi'u"],["🔒 Daangessuu","AES-256-GCM — lamaanuu eegama"],["⛓️ Ragaa","Sarara tiifii — mana murtiif qophaa'e"],["⚖️ Dhaabbata","FEACC 959 · Poolisii 911"]].map(([k,v])=>(
                <div key={k}><div style={{color:G,marginBottom:"3px"}}>{k}</div><div style={{color:"rgba(240,236,224,0.4)",lineHeight:"1.6"}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"20px 32px",background:"rgba(0,0,0,0.9)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <span style={{fontSize:"9px",color:`rgba(0,212,255,0.2)`,fontFamily:"'Courier New',monospace"}}>SAFUU INTEL · FEACC: 959 · EHRC: 1488 · POOLISII: 911</span>
        <a href="/" style={{fontSize:"9px",color:`rgba(201,168,76,0.3)`,fontFamily:"'Courier New',monospace"}}>English →</a>
      </div>
    </div>
  );
}
