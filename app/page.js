'use client';
import { useState, useEffect, useRef } from "react";

const G="#c9a84c", CY="#00d4ff", R="#b82020", PU="#a78bfa", GR="#4ade80";

// ── Ge'ez rain ───────────────────────────────────────────────────────────────
function GeezRain() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const S = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ01";
    const cols = Math.floor(c.width / 20);
    const drops = Array.from({length:cols}, () => ({ y:Math.random()*-80, s:0.15+Math.random()*0.4 }));
    let id;
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.11)"; ctx.fillRect(0,0,c.width,c.height);
      drops.forEach((d,i) => {
        const ch = S[Math.floor(Math.random()*S.length)];
        const b = 0.04+Math.random()*0.12;
        ctx.fillStyle = Math.random()>0.97?`rgba(0,200,255,${b+0.05})`:`rgba(180,145,50,${b})`;
        ctx.font="12px serif"; ctx.fillText(ch, i*20, d.y*20);
        d.y+=d.s; if(d.y*20>c.height+40){d.y=-Math.random()*30;d.s=0.15+Math.random()*0.4;}
      });
      id=requestAnimationFrame(draw);
    };
    draw(); window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,opacity:0.08,pointerEvents:"none"}}/>;
}

const FAQS = [
  {q:"Is my identity truly protected?",   a:"Yes. SAFUU never stores your WhatsApp number, Telegram ID, or real name. A one-way SHA-256 hash is the only derivative — mathematically irreversible. Not even administrators can identify you."},
  {q:"What happens after I submit?",       a:"Claude AI categorizes severity and type. Evidence is forensically verified. The report is auto-routed to the correct Ethiopian agency. Reports cluster — at threshold, the official's name is publicly disclosed."},
  {q:"How does name disclosure work?",    a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed and formally escalated to FEACC or relevant authority."},
  {q:"Which languages are supported?",    a:"Report in any language — Amharic, Oromiffa, Tigrinya, Somali, or any other. Voice messages are auto-transcribed. The platform works for every Ethiopian regardless of language."},
];

// ═══════════════════════════════════════════════════════════
export default function Safuu() {
  const [scrolled, setScrolled] = useState(false);
  const [faq,      setFaq]      = useState(null);
  const [pulse,    setPulse]    = useState(false);
  const date = new Date().toISOString().slice(0,10);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  // Slow heartbeat on the "waiting" indicator
  useEffect(()=>{
    const t=setInterval(()=>setPulse(p=>!p),2000);
    return()=>clearInterval(t);
  },[]);

  const EmptyBar = ({w="60%"}) => (
    <div style={{height:"5px",background:"rgba(255,255,255,0.04)",borderRadius:"2px",width:w,overflow:"hidden"}}>
      <div style={{height:"100%",width:"0%",background:G,borderRadius:"2px"}}/>
    </div>
  );

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none} html{scroll-behavior:smooth}
        @keyframes marquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan    {0%{top:-3%}100%{top:104%}}
        @keyframes breathe {0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes drift   {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:13px 32px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.25)}
        .btn-cy{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:12px 28px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-cy:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%);background-size:200% 100%;animation:shimmer 2.5s infinite linear;border-radius:2px}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.02)}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:900px){.two-col{grid-template-columns:1fr!important}}
        @media(max-width:640px){.hide-mob{display:none!important}nav{padding:0 16px!important}.sec{padding:28px 16px!important}}
      `}</style>

      <GeezRain/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(0,212,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.012) 1px,transparent 1px)`,backgroundSize:"52px 52px"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 25%,rgba(3,5,7,0.82) 100%)"}}/>
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${CY}14,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* TICKER */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:"rgba(0,212,255,0.15)",color:CY,fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0,border:`1px solid rgba(0,212,255,0.25)`,borderTop:"none",borderBottom:"none"}}>AWAITING</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● PLATFORM ONLINE · ${date}`,"● AWAITING FIRST SUBMISSION","● IDENTITY_STORAGE :: NULL — SHA-256 ONLY","● ሙስና ይጥፋእ · JUSTICE WILL PREVAIL","● AES-256-GCM ACTIVE","● WHATSAPP: +251911000000","● SYSTEM READY · SUBMIT TO ACTIVATE","● SAFUU.NET · COLLABORATIVE INTELLIGENCE"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.55)":"rgba(201,168,76,0.45)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.88)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.14)":"rgba(0,212,255,0.06)"}`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"34px",height:"34px",border:`1px solid rgba(201,168,76,0.28)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",background:"rgba(201,168,76,0.04)"}}>⚖️</div>
          <div>
            <div style={{fontSize:"17px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",lineHeight:1,letterSpacing:"0.04em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.28em",fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.55}}>INTEL v2.0 · SAFUU.NET</div>
          </div>
        </div>
        <div className="hide-mob" style={{display:"flex",gap:"24px",alignItems:"center"}}>
          {[["#dashboard","DASHBOARD"],["#agencies","AGENCIES"],["/faq","FAQ"],["/transparency","WALL"],["/demo","DEMO"],["/about","ABOUT"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.42)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-cy" style={{padding:"8px 16px",fontSize:"10px"}}>💬 WhatsApp</a>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-gold" style={{padding:"8px 18px",fontSize:"10px"}}>📲 Telegram</a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"48px 40px 36px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
        <div style={{maxWidth:"1300px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"20px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <div style={{width:"5px",height:"5px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>INTELLIGENCE REPORT · ETHIOPIA · {new Date().getFullYear()}</span>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,38px)",fontWeight:"900",lineHeight:1.12,letterSpacing:"-0.02em"}}>
              <span style={{color:"rgba(240,236,224,0.95)"}}>Corruption ends </span>
              <span style={{color:G,fontStyle:"italic"}}>when people </span>
              <span style={{color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
            </h1>
            <p style={{fontSize:"12px",color:"rgba(240,236,224,0.32)",fontFamily:"'Courier New',monospace",marginTop:"6px"}}>
              Anonymous · Encrypted · Court-ready · Identity never stored
            </p>
          </div>
          {/* Empty counters — 0 / awaiting */}
          <div style={{display:"flex",gap:"1px",background:"rgba(0,212,255,0.07)",borderRadius:"2px",overflow:"hidden",flexShrink:0}}>
            {[{l:"Tips received",c:G},{l:"AI-verified",c:CY},{l:"Disclosed",c:R},{l:"Today",c:GR}].map((s,i)=>(
              <div key={i} style={{background:"#030507",padding:"14px 22px",textAlign:"center",minWidth:"90px"}}>
                <div style={{fontSize:"clamp(24px,3vw,36px)",fontWeight:"900",color:"rgba(255,255,255,0.12)",fontFamily:"'Playfair Display',serif",lineHeight:1,letterSpacing:"-0.02em"}}>—</div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.22)",fontFamily:"'Courier New',monospace",marginTop:"3px",letterSpacing:"0.08em"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD WAITING STATE ══ */}
      <section id="dashboard" className="sec" style={{position:"relative",zIndex:5,padding:"0",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>

        {/* Feed header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 40px",background:"rgba(0,0,0,0.4)",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
          <span style={{width:"8px",height:"8px",borderRadius:"50%",background:CY,opacity:pulse?1:0.25,display:"inline-block",flexShrink:0,transition:"opacity 0.6s"}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>LIVE INTAKE FEED</span>
          <div style={{flex:1,height:"1px",background:"rgba(0,212,255,0.1)"}}/>
          <span style={{fontSize:"9px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>waiting for first verified submission</span>
        </div>

        {/* Empty feed state */}
        <div style={{padding:"64px 40px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:"20px",background:"rgba(0,0,0,0.15)"}}>
          <div style={{fontSize:"48px",opacity:0.12,animation:"drift 4s ease-in-out infinite"}}>⚖️</div>
          <div>
            <div style={{fontSize:"16px",fontWeight:"700",color:"rgba(240,236,224,0.3)",fontFamily:"'Playfair Display',serif",marginBottom:"8px"}}>No submissions yet.</div>
            <div style={{fontSize:"12px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",lineHeight:"1.9",maxWidth:"420px"}}>
              The dashboard populates in real time as verified reports arrive.<br/>
              Office, region, and corruption type are shown — no names, no identifiers.
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
            <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-gold" style={{fontSize:"12px",padding:"11px 28px"}}>💬 Be the first to report</a>
            <a href="/demo" className="btn-cy" style={{fontSize:"12px",padding:"10px 24px"}}>View demo →</a>
          </div>
          <div style={{fontSize:"10px",color:"rgba(240,236,224,0.15)",fontFamily:"'Courier New',monospace",marginTop:"4px"}}>
            Want to see what the live dashboard looks like? <a href="/demo" style={{color:"rgba(0,212,255,0.35)",textDecoration:"underline"}}>View the demo</a>
          </div>
        </div>

        {/* Skeleton rows — show the structure, signal its ready */}
        <div style={{borderTop:`1px solid rgba(0,212,255,0.06)`}}>
          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr",gap:"12px",padding:"8px 40px",background:"rgba(0,0,0,0.25)"}}>
            {["TIME","OFFICE","REGION & TYPE"].map(h=>(
              <div key={h} style={{fontSize:"8px",color:"rgba(0,212,255,0.2)",fontFamily:"'Courier New',monospace",letterSpacing:"0.16em"}}>{h}</div>
            ))}
          </div>
          {/* 5 skeleton rows */}
          {[...Array(5)].map((_,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr",gap:"12px",padding:"16px 40px",borderBottom:`1px solid rgba(0,212,255,0.04)`,alignItems:"center",opacity:1-(i*0.15)}}>
              <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                <div className="skeleton" style={{height:"10px",width:"50px"}}/>
                <div className="skeleton" style={{height:"10px",width:"36px"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                <div className="skeleton" style={{height:"13px",width:`${60+Math.random()*30}%`}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                <div className="skeleton" style={{height:"11px",width:`${40+Math.random()*30}%`}}/>
                <div className="skeleton" style={{height:"10px",width:`${30+Math.random()*25}%`}}/>
              </div>
            </div>
          ))}
          <div style={{padding:"12px 40px",textAlign:"center",fontSize:"10px",color:"rgba(240,236,224,0.12)",fontFamily:"'Courier New',monospace",background:"rgba(0,0,0,0.15)"}}>
            // Structure ready · Data populates from real verified submissions
          </div>
        </div>
      </section>

      {/* ══ SECTION 2 — OFFICES + THRESHOLD (skeleton) ══ */}
      <section className="sec two-col" style={{position:"relative",zIndex:5,padding:"40px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",maxWidth:"1300px",margin:"0 auto",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>

        {/* TOP OFFICES skeleton */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0,opacity:0.3}}/>
            <span style={{fontSize:"9px",color:"rgba(184,32,32,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>OFFICES BY REPORT VOLUME</span>
            <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.08)"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{opacity:1-(i*0.14)}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"7px"}}>
                  <div className="skeleton" style={{height:"12px",width:`${50+Math.random()*35}%`}}/>
                  <div className="skeleton" style={{height:"12px",width:"28px"}}/>
                </div>
                <div style={{height:"5px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:"20px",fontSize:"11px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",fontStyle:"italic"}}>
            Populates when verified reports arrive
          </div>
        </div>

        {/* THRESHOLD CASES skeleton */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0,opacity:0.3}}/>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>BUILDING TOWARD DISCLOSURE</span>
            <div style={{flex:1,height:"1px",background:"rgba(201,168,76,0.08)"}}/>
          </div>
          <div style={{fontSize:"11px",color:"rgba(240,236,224,0.22)",fontFamily:"'Courier New',monospace",lineHeight:"1.8",marginBottom:"24px",padding:"14px 16px",border:`1px solid rgba(0,212,255,0.07)`,background:"rgba(0,0,0,0.3)"}}>
            When reports on the same office cluster, a case appears here.<br/><br/>
            Name stays hidden. Only office and region are shown — protecting against false accusations while evidence accumulates to the {"{threshold}"}.
          </div>
          {/* 2 empty case slots */}
          {[...Array(2)].map((_,i)=>(
            <div key={i} style={{display:"flex",gap:"16px",padding:"16px",background:"rgba(0,0,0,0.25)",border:`1px solid rgba(0,212,255,0.06)`,marginBottom:"12px",opacity:1-(i*0.35)}}>
              {/* Empty ring */}
              <svg width="88" height="88" viewBox="0 0 88 88" style={{flexShrink:0,opacity:0.18}}>
                <circle cx="44" cy="44" r="34" fill="none" stroke={G} strokeWidth="7"/>
                <circle cx="44" cy="44" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                <text x="44" y="48" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="monospace">0/15</text>
              </svg>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:"8px",justifyContent:"center"}}>
                <div className="skeleton" style={{height:"10px",width:"60px"}}/>
                <div className="skeleton" style={{height:"14px",width:"75%"}}/>
                <div className="skeleton" style={{height:"11px",width:"50%"}}/>
                <div style={{height:"4px",background:"rgba(255,255,255,0.04)",borderRadius:"2px",marginTop:"4px"}}/>
                <div className="skeleton" style={{height:"9px",width:"40%"}}/>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ REPORT CTA ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"56px 40px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
        <div style={{maxWidth:"1300px",margin:"0 auto",display:"flex",alignItems:"center",gap:"40px",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:"240px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
              <div style={{width:"5px",height:"5px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>ACTIVATE THE DASHBOARD</span>
            </div>
            <h2 style={{fontSize:"clamp(22px,3vw,34px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.9)",marginBottom:"10px",lineHeight:1.15}}>
              Every report you file<br/>
              <span style={{color:G,fontStyle:"italic"}}>makes this dashboard real.</span>
            </h2>
            <p style={{fontSize:"13px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",lineHeight:"1.8",maxWidth:"460px"}}>
              The dashboard above is empty because no submissions have been received yet.<br/>
              Your anonymous report — sent via WhatsApp or Telegram — builds the public record.<br/>
              Identity never stored · SHA-256 one-way hash · Voice supported · 11 Ethiopian languages
            </p>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-gold" style={{fontSize:"13px",padding:"15px 36px"}}>💬 Report on WhatsApp</a>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cy" style={{fontSize:"13px",padding:"14px 30px"}}>📲 Report on Telegram</a>
          </div>
        </div>
      </section>

      {/* ══ AGENCIES ══ */}
      <section id="agencies" className="sec" style={{position:"relative",zIndex:5,padding:"40px 40px",maxWidth:"1300px",margin:"0 auto",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>ROUTE_TABLE()</span>
          <div style={{flex:1,height:"1px",background:"rgba(201,168,76,0.12)"}}/>
          <h2 style={{fontSize:"clamp(16px,2vw,20px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.88)",flexShrink:0}}>Ethiopian accountability bodies</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"10px"}}>
          {[
            {name:"FEACC",       am:"ፀረሙስና ኮሚሽን", phone:"959",  c:GR,       type:"All corruption"},
            {name:"EHRC",        am:"ሰብዓዊ መብቶች",  phone:"1488", c:"#60a5fa",type:"Human rights"},
            {name:"Ombudsman",   am:"ዕርቀ ሚካሄ",    phone:"6060", c:PU,       type:"Abuse of power"},
            {name:"Fed. Police", am:"ፌደራል ፖሊስ",  phone:"911",  c:"#f87171",type:"Criminal"},
            {name:"OFAG",        am:"ዋና ኦዲተር",    phone:"—",    c:"#fb923c",type:"Public funds"},
          ].map((a,i)=>(
            <div key={i} style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.08)`,padding:"18px",borderLeft:`3px solid ${a.c}`}}>
              <div style={{fontSize:"8px",color:"rgba(0,212,255,0.28)",fontFamily:"'Courier New',monospace",marginBottom:"4px",letterSpacing:"0.1em"}}>AGENCY</div>
              <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.88)",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{a.name}</div>
              <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginBottom:"10px"}}>{a.am}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.22)",marginBottom:"10px"}}>{a.type}</div>
              <div style={{fontSize:"22px",fontWeight:"900",color:a.c,fontFamily:"'Courier New',monospace"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"40px 40px",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>FAQ.execute()</span>
          <div style={{flex:1,height:"1px",background:"rgba(0,212,255,0.12)"}}/>
          <h2 style={{fontSize:"clamp(16px,2vw,20px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.88)",flexShrink:0}}>Your questions answered</h2>
        </div>
        <div style={{borderTop:`1px solid rgba(0,212,255,0.07)`}}>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq-row" onClick={()=>setFaq(faq===i?null:i)}>
              <div style={{padding:"16px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"15px",fontWeight:"700",color:faq===i?G:"rgba(240,236,224,0.85)",fontFamily:"'Playfair Display',serif",paddingRight:"20px",transition:"color 0.2s"}}>{f.q}</span>
                <span style={{color:faq===i?CY:G,fontSize:"20px",flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:faq===i?"rotate(45deg)":"none",fontWeight:"300"}}>+</span>
              </div>
              {faq===i&&<div style={{paddingBottom:"16px"}}>
                <div style={{height:"1px",background:"rgba(0,212,255,0.07)",marginBottom:"12px"}}/>
                <p style={{fontSize:"14px",color:"rgba(240,236,224,0.48)",lineHeight:"1.85"}}>{f.a}</p>
              </div>}
            </div>
          ))}
        </div>
        <div style={{marginTop:"16px",display:"flex",gap:"16px"}}>
          <a href="/faq" className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Full FAQ →</a>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:"rgba(201,168,76,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Transparency wall →</a>
          <a href="/demo" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.38)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>See demo dashboard →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:5,borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"44px 40px 28px",background:"rgba(0,0,0,0.92)"}}>
        <div style={{maxWidth:"1300px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"32px",marginBottom:"28px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0"}}>
              <div style={{width:"3px",height:"36px",background:G,marginRight:"16px",flexShrink:0}}/>
              <div>
                <div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU INTEL</div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",marginTop:"2px",letterSpacing:"0.15em"}}>ሳፉ · MORAL ORDER · ETHIOPIA</div>
                <div style={{fontSize:"9px",color:"rgba(0,212,255,0.28)",fontFamily:"'Courier New',monospace",marginTop:"6px"}}>FEACC: 959 · EHRC: 1488 · POLICE: 911</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>
              {[
                ["PLATFORM",   [["/"," Home"],["/demo","Live Demo"],["/transparency","Transparency"],["/report","File a Report"],["/analytics","Analytics"],["/sms","WhatsApp & Telegram"]]],
                ["LANGUAGES",  [["/am","አማርኛ (Amharic)"],["/or","Oromiffa"],["/ti","ትግርኛ (Tigrinya)"]]],
                ["ABOUT",      [["/about","About"],["/faq","FAQ"],["/partners","Partners"],["/press","Press"],["/donate","Support"],["/privacy","Privacy"],["/changelog","Changelog"]]],
                ["DEVELOPERS", [["/backend","Backend Setup"],["/api-docs","API Reference"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://wa.me/251911000000","WhatsApp"],["https://t.me/SafuuEthBot","Telegram"]]],
              ].map(([col,links])=>(
                <div key={col}>
                  <div style={{fontSize:"8px",color:"rgba(201,168,76,0.32)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>{col}</div>
                  {links.map(([h,l])=>(
                    <div key={l} style={{marginBottom:"8px"}}>
                      <a href={h} target={h.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.28)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.05)`,paddingTop:"18px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"9px",color:"rgba(0,212,255,0.18)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · Dashboard populates with real verified submissions only</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.18)",fontFamily:"'Courier New',monospace"}}>{date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
