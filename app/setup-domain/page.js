'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const REGISTRARS = [
  {
    name:"Namecheap", icon:"🐢",
    steps:[
      "Log in → Domain List → click Manage next to safuu.net",
      "Click the Advanced DNS tab",
      "Delete any existing A Record for @",
      "Add Record: Type A · Host @ · Value 76.76.21.21 · TTL Automatic",
      "Add Record: Type CNAME · Host www · Value cname.vercel-dns.com · TTL Automatic",
      "Click the green checkmark to save each record",
    ]
  },
  {
    name:"GoDaddy", icon:"🤠",
    steps:[
      "My Products → Domains → click your domain → Manage DNS",
      "Edit the A record: @ → 76.76.21.21",
      "Add CNAME record: www → cname.vercel-dns.com",
      "Click Save — propagation takes 10–30 minutes",
    ]
  },
  {
    name:"Google Domains / Squarespace", icon:"🔲",
    steps:[
      "DNS → Custom records",
      "Add: Type A · Name @ · Data 76.76.21.21",
      "Add: Type CNAME · Name www · Data cname.vercel-dns.com",
      "Save and wait 5–15 minutes",
    ]
  },
  {
    name:"Cloudflare", icon:"🌐",
    steps:[
      "Select safuu.net → DNS → Records",
      "Add A record: Name @ · IPv4 76.76.21.21 · Proxy status: DNS only (grey cloud)",
      "Add CNAME record: Name www · Target cname.vercel-dns.com · Proxy: DNS only",
      "⚠ Important: Keep proxy OFF (grey cloud) — Vercel handles SSL",
    ]
  },
];

export default function SetupDomain() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>DOMAIN SETUP</div>
          </div>
        </a>
        <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>CONNECT SAFUU.NET TO VERCEL</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Domain Setup Guide
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"52px"}}>
          Connect <strong style={{color:G}}>safuu.net</strong> to the Vercel project so it points to the live platform.
          Two steps: add the domain in Vercel, then add DNS records at your registrar.
        </p>

        {/* Step 1 - Vercel */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"28px",height:"28px",background:`rgba(0,212,255,0.1)`,border:`1px solid rgba(0,212,255,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontFamily:"'Courier New',monospace",fontWeight:"700",color:CY,flexShrink:0}}>1</div>
            <span style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)"}}>Add domain in Vercel Dashboard</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              "Go to vercel.com → your team → safuu-intel project",
              "Click Settings → Domains",
              "Type safuu.net → click Add",
              "Type www.safuu.net → click Add",
              "Vercel will show you the DNS records to add (same as below)",
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:"12px",alignItems:"flex-start",padding:"12px 16px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.07)`}}>
                <span style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",flexShrink:0,marginTop:"1px"}}>{String(i+1).padStart(2,"0")}</span>
                <span style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",lineHeight:"1.6"}}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DNS Records */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"28px",height:"28px",background:`rgba(0,212,255,0.1)`,border:`1px solid rgba(0,212,255,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontFamily:"'Courier New',monospace",fontWeight:"700",color:CY,flexShrink:0}}>2</div>
            <span style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)"}}>Add these DNS records at your registrar</span>
          </div>

          <div style={{background:"rgba(0,0,0,0.7)",border:`2px solid ${G}`,padding:"24px 28px",fontFamily:"'Courier New',monospace",marginBottom:"16px"}}>
            <div style={{fontSize:"9px",color:`rgba(201,168,76,0.5)`,letterSpacing:"0.2em",marginBottom:"16px"}}>DNS RECORDS TO ADD</div>
            <div style={{display:"grid",gridTemplateColumns:"80px 60px 1fr",gap:"8px 20px",fontSize:"13px"}}>
              <span style={{color:`rgba(0,212,255,0.5)`,fontWeight:"700"}}>TYPE</span>
              <span style={{color:`rgba(0,212,255,0.5)`,fontWeight:"700"}}>NAME</span>
              <span style={{color:`rgba(0,212,255,0.5)`,fontWeight:"700"}}>VALUE</span>
              <span style={{color:G}}>A</span>
              <span style={{color:"rgba(240,236,224,0.7)"}}>@</span>
              <span style={{color:G,letterSpacing:"0.05em"}}>76.76.21.21</span>
              <span style={{color:G}}>CNAME</span>
              <span style={{color:"rgba(240,236,224,0.7)"}}>www</span>
              <span style={{color:G,letterSpacing:"0.02em"}}>cname.vercel-dns.com</span>
            </div>
          </div>
          <div style={{fontSize:"11px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>
            TTL: Automatic or 3600 · Propagation: 5–60 minutes
          </div>
        </div>

        {/* Registrar-specific */}
        <div style={{marginBottom:"48px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"20px"}}>REGISTRAR-SPECIFIC STEPS</div>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {REGISTRARS.map(r=>(
              <div key={r.name} style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
                  <span style={{fontSize:"18px"}}>{r.icon}</span>
                  <span style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)"}}>{r.name}</span>
                </div>
                <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {r.steps.map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",fontSize:"12px",color:"rgba(240,236,224,0.5)",lineHeight:"1.65"}}>
                      <span style={{color:`rgba(0,212,255,0.35)`,fontFamily:"'Courier New',monospace",flexShrink:0,marginTop:"1px"}}>{i+1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verify */}
        <div style={{background:"rgba(74,222,128,0.04)",border:`1px solid rgba(74,222,128,0.2)`,padding:"28px"}}>
          <div style={{fontSize:"9px",color:"rgba(74,222,128,0.6)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"14px"}}>VERIFY IT WORKED</div>
          <p style={{fontSize:"14px",color:"rgba(240,236,224,0.6)",lineHeight:"1.85",marginBottom:"20px"}}>
            After adding the DNS records, wait 5–60 minutes then visit{" "}
            <a href="https://safuu.net" target="_blank" rel="noreferrer" style={{color:G,textDecoration:"underline"}}>safuu.net</a>.
            Vercel handles SSL automatically — the site will be HTTPS.
          </p>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:"12px",color:"rgba(74,222,128,0.6)",background:"rgba(0,0,0,0.4)",padding:"14px 18px",lineHeight:"2"}}>
            # Test via terminal (optional):<br/>
            dig safuu.net +short  # should return 76.76.21.21<br/>
            curl -I https://safuu.net  # should return 200 OK
          </div>
        </div>
      </div>
    </div>
  );
}
