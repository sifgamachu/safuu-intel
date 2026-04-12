'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const COSTS = [
  {amount:"$7/mo",  label:"Starter",    desc:"Covers AI processing for ~40 tips per month — Claude API analysis + Whisper transcription.",                             icon:"⚡"},
  {amount:"$25/mo", label:"Reporter",   desc:"Covers 150 tips/month + Hive Moderation image forensics for submitted photos. One active investigator's worth.",        icon:"📊"},
  {amount:"$60/mo", label:"Analyst",    desc:"Full month of backend infrastructure: server costs, database, Nginx, PM2 + 300 tips processed.",                        icon:"🔬"},
  {amount:"$120/mo",label:"Guardian",   desc:"Sustains the entire platform for a month: infrastructure + AI costs + SMS intake for rural reporters without smartphones.", icon:"🛡️"},
];

const IMPACT = [
  {n:"$0.17",l:"Cost per tip analyzed by Claude AI"},
  {n:"$0.04",l:"Cost per Whisper voice transcription"},
  {n:"$0.12",l:"Cost per Hive image forensic check"},
  {n:"$5/mo", l:"Backend VPS server minimum cost"},
  {n:"$12/mo",l:"Full infrastructure at current scale"},
  {n:"Free",  l:"The platform code — MIT licensed on GitHub"},
];

export default function Donate() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.card:hover{border-color:rgba(201,168,76,0.35)!important;transform:translateY(-2px)}.card{transition:all 0.2s}.lnk:hover{color:${CY}!important}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>SUPPORT</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>SUSTAIN THE MISSION</span>
          <div style={{flex:1,height:"1px",background:`rgba(201,168,76,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Keep accountability alive.
        </h1>
        <p style={{fontSize:"15px",color:"rgba(240,236,224,0.45)",maxWidth:"600px",lineHeight:"1.9",marginBottom:"14px"}}>
          SAFUU Intel is a public-interest platform. The code is MIT-licensed and free to use. The running costs — AI APIs, server infrastructure, SMS routing — are real.
        </p>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.35)",lineHeight:"1.85",marginBottom:"52px",maxWidth:"580px"}}>
          Every tip analyzed, every voice message transcribed, every forensic image check has a cost. Your support keeps the pipeline running for reporters who have no other safe option.
        </p>

        {/* Support tiers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"12px",marginBottom:"56px"}}>
          {COSTS.map((c,i)=>(
            <div key={i} className="card" style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,padding:"26px 22px"}}>
              <div style={{fontSize:"24px",marginBottom:"12px"}}>{c.icon}</div>
              <div style={{fontSize:"22px",fontWeight:"900",color:G,fontFamily:"'Playfair Display',serif",marginBottom:"4px"}}>{c.amount}</div>
              <div style={{fontSize:"11px",fontWeight:"700",color:"rgba(240,236,224,0.7)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginBottom:"12px"}}>{c.label}</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.75"}}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* How to support */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>HOW TO SUPPORT</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"12px"}}>
            {[
              {method:"GitHub Sponsors",  icon:"⭐",desc:"Star or sponsor the project at github.com/sifgamachu/safuu-intel. Sponsorship goes directly to API and infrastructure costs.",href:"https://github.com/sifgamachu/safuu-intel"},
              {method:"Partner with Us",  icon:"🤝",desc:"Organizations can become formal partners — contributing resources in exchange for data access and early feature access.",href:"/partners"},
              {method:"Contribute Code",  icon:"💻",desc:"The backend is MIT-licensed. Submit pull requests, security audits, or translations at github.com/sifgamachu/safuu-intel.",href:"https://github.com/sifgamachu/safuu-intel"},
              {method:"Spread the Word",  icon:"📢",desc:"Share safuu.net with civil society organizations, journalists, and community leaders across Ethiopia. Awareness is infrastructure.",href:"/press"},
            ].map((s,i)=>(
              <a key={i} href={s.href} target={s.href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                className="card" style={{background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.1)`,padding:"22px",display:"block",textDecoration:"none",color:"inherit"}}>
                <div style={{fontSize:"22px",marginBottom:"10px"}}>{s.icon}</div>
                <div style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"8px"}}>{s.method}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.75"}}>{s.desc}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Cost transparency */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>COST TRANSPARENCY</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
            {IMPACT.map((item,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"120px 1fr",padding:"13px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`,background:i%2===0?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.15)"}}>
                <div style={{fontSize:"13px",fontWeight:"900",color:G,fontFamily:"'Playfair Display',serif"}}>{item.n}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",lineHeight:"1.6"}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission statement */}
        <div style={{background:`rgba(201,168,76,0.04)`,border:`1px solid rgba(201,168,76,0.18)`,padding:"32px",textAlign:"center"}}>
          <p style={{fontSize:"18px",fontWeight:"700",fontFamily:"'Playfair Display',serif",fontStyle:"italic",color:"rgba(240,236,224,0.85)",lineHeight:"1.55",marginBottom:"16px"}}>
            "Every birr stolen from public funds is a school unfunded, a hospital understaffed, a road unpaved."
          </p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"24px"}}>
            <div style={{width:"32px",height:"1px",background:G}}/>
            <span style={{fontSize:"9px",color:`rgba(201,168,76,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>SAFUU INTEL · SAFUU.NET</span>
            <div style={{width:"32px",height:"1px",background:G}}/>
          </div>
          <a href="https://github.com/sifgamachu/safuu-intel" target="_blank" rel="noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:"8px",background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 28px",letterSpacing:"0.12em",textDecoration:"none"}}>
            ⭐ STAR ON GITHUB
          </a>
        </div>
      </div>
    </div>
  );
}
