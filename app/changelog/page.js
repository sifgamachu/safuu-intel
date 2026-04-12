'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const CHANGES = [
  {
    date:"2026-04-12", version:"v2.0", tag:"MAJOR",
    items:[
      "Launched safuu-intel.vercel.app — full Next.js 16 platform",
      "Investigative cyber collaborative design — Playfair Display + Space Grotesk",
      "Live network canvas showing 14 anonymous reporter nodes feeding central hub",
      "Transparency wall: progressive disclosure with clickable case detail pages",
      "Case detail pages: evidence timeline, progress ring, language badges",
      "7-step web-based anonymous report intake form",
      "Analytics dashboard: charts by region, type, monthly trend, agency routing",
      "Amharic (/am), Oromiffa (/or), Tigrinya (/ti) language landing pages",
      "Press kit, Partners page, Privacy policy, About, SMS guide",
      "Backend activation guide with copy-to-clipboard commands",
      "Domain setup guide: Namecheap, GoDaddy, Cloudflare, Google Domains",
      "GitHub Actions CI: 76 backend security tests on every push",
      "OG image (1200×630) via Next.js ImageResponse edge runtime",
      "Per-page SEO metadata on all 15+ routes",
      "Custom error boundary and loading states",
      "Sitemap with 9 pages, robots.txt",
    ]
  },
  {
    date:"2026-04-12", version:"v1.9", tag:"SECURITY",
    items:[
      "Upgraded Next.js 15.3.1 → 16.2.3 (patches CVE-2025-66478)",
      "Upgraded React 18.3.1 → 19.2.5",
      "Upgraded recharts 2.x → 3.8.1 (React 19 compatible)",
      "All dependencies current as of April 2026",
    ]
  },
  {
    date:"2026-04-11", version:"v1.8", tag:"DESIGN",
    items:[
      "Redesigned: investigative editorial × intelligence file × cyber collaborative",
      "Gold #c9a84c (justice) + Cyan #00d4ff (data) + Red #b82020 (danger)",
      "Ge'ez/Ethiopic matrix rain background — amber + cyan flashes, 9% opacity",
      "HUD corner brackets on nav logo and network panel",
      "Angled clip-path buttons (cyber-cut corners)",
      "Removed all Ethiopian flag elements — ⚖️ scales icon only",
      "Removed glitch shadow/mirror text effect",
      "Restored Georgia serif font on headline",
    ]
  },
  {
    date:"2026-04-10", version:"v1.5", tag:"BACKEND",
    items:[
      "safuu-bot.js: 11-step structured Telegram intake",
      "safuu-security.js: AES-256-GCM, PBKDF2 310k iterations, JWT, RBAC",
      "safuu-transparency-api.js: progressive disclosure endpoints",
      "safuu-notes-panel: multilingual tipper notes browser",
      "76 automated security tests — all passing",
      "Nginx hardened config: TLS 1.3, HSTS preload, WAF-lite",
      "PM2 ecosystem config for process management",
      "Added step 11: notes in any Ethiopian language (voice + text)",
    ]
  },
  {
    date:"2026-04-09", version:"v1.0", tag:"LAUNCH",
    items:[
      "Initial platform concept: anonymous Ethiopian anti-corruption intelligence",
      "GitHub repo created: sifgamachu/safuu-intel",
      "Telegram bot: 11-step intake, 11 Ethiopian languages",
      "Hive AI image forensics (94% AI-generated detection)",
      "EXIF date verification against reported incident",
      "SHA-256 deduplication: irreversible, one-way",
      "Progressive name disclosure at configurable threshold (default: 15)",
      "Tamper-evident cryptographic hash chain evidence ledger",
      "Auto-routing to FEACC, EHRC, Federal Police, Ombudsman, OFAG",
    ]
  },
];

const TAG_COLORS = { MAJOR:"#4ade80", SECURITY:R, DESIGN:G, BACKEND:CY, LAUNCH:"#a78bfa" };

export default function Changelog() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>CHANGELOG</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="https://github.com/sifgamachu/safuu-intel/commits/main" target="_blank" rel="noreferrer"
            className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>GITHUB COMMITS →</a>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
        </div>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>PLATFORM HISTORY</span>
          <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"12px",letterSpacing:"-0.02em"}}>
          Changelog
        </h1>
        <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",lineHeight:"1.8",marginBottom:"56px",fontFamily:"'Courier New',monospace"}}>
          Full version history. All changes tracked on{" "}
          <a href="https://github.com/sifgamachu/safuu-intel" target="_blank" rel="noreferrer"
            style={{color:G,textDecoration:"underline"}}>GitHub</a>.
        </p>

        <div style={{display:"flex",flexDirection:"column",gap:"32px"}}>
          {CHANGES.map((c,i)=>(
            <div key={i} style={{position:"relative",paddingLeft:"0"}}>
              {/* Version header */}
              <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px",paddingBottom:"16px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
                <div style={{fontSize:"18px",fontWeight:"900",color:"rgba(240,236,224,0.9)",fontFamily:"'Playfair Display',serif"}}>{c.version}</div>
                <span style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",padding:"3px 10px",background:`${TAG_COLORS[c.tag]}18`,border:`1px solid ${TAG_COLORS[c.tag]}44`,color:TAG_COLORS[c.tag]}}>
                  {c.tag}
                </span>
                <div style={{flex:1}}/>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{c.date}</div>
              </div>

              {/* Items */}
              <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                {c.items.map((item,j)=>(
                  <div key={j} style={{display:"flex",gap:"12px",alignItems:"flex-start",padding:"8px 14px",background:j%2===0?"rgba(0,0,0,0.2)":"transparent",borderRadius:"1px"}}>
                    <span style={{color:`rgba(0,212,255,0.35)`,fontFamily:"'Courier New',monospace",fontSize:"10px",flexShrink:0,marginTop:"2px"}}>+</span>
                    <span style={{fontSize:"13px",color:"rgba(240,236,224,0.55)",lineHeight:"1.6"}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{marginTop:"56px",paddingTop:"24px",borderTop:`1px solid rgba(0,212,255,0.06)`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <span style={{fontSize:"9px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>
            All changes tracked at github.com/sifgamachu/safuu-intel
          </span>
          <a href="/" style={{fontSize:"9px",color:`rgba(201,168,76,0.3)`,fontFamily:"'Courier New',monospace"}}>← safuu.net</a>
        </div>
      </div>
    </div>
  );
}
