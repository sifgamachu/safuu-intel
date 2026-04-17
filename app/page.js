'use client';
import { useState, useEffect, useRef } from "react";

const G="#c9a84c", CY="#00d4ff", R="#b82020";

// ── Ge'ez rain ────────────────────────────────────────────────────────────────
function GeezRain() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const G2 = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ01";
    const cols = Math.floor(c.width / 20);
    const drops = Array.from({length:cols}, () => ({ y:Math.random()*-80, s:0.15+Math.random()*0.4 }));
    let id;
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.11)"; ctx.fillRect(0,0,c.width,c.height);
      drops.forEach((d,i) => {
        const ch = G2[Math.floor(Math.random()*G2.length)];
        const b = 0.04 + Math.random()*0.12;
        const isCyan = Math.random() > 0.97;
        ctx.fillStyle = isCyan ? `rgba(0,200,255,${b+0.05})` : `rgba(180,145,50,${b})`;
        ctx.font = "12px serif";
        ctx.fillText(ch, i*20, d.y*20);
        d.y += d.s; if (d.y*20 > c.height+40) { d.y = -Math.random()*30; d.s = 0.15+Math.random()*0.4; }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,opacity:0.09,pointerEvents:"none"}}/>;
}

// ── Reveal on scroll ──────────────────────────────────────────────────────────
function useReveal(t=0.08) {
  const ref = useRef(); const [v,setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:t});
    if(ref.current) o.observe(ref.current); return ()=>o.disconnect();
  },[]);
  return [ref,v];
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useCount(target, active, ms=1800) {
  const [v,setV] = useState(0);
  useEffect(()=>{
    if(!active)return;
    let s=null;
    const f=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/ms,1);setV(Math.floor((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(f);};
    requestAnimationFrame(f);
  },[target,active]);
  return v;
}

// ── LIVE FEED SIMULATION ──────────────────────────────────────────────────────
const FEED_TEMPLATES = [
  {office:"Ministry of Transport",        region:"Addis Ababa", type:"Procurement Bribery",    lang:"AM", ago:"2m"},
  {office:"Customs Authority",            region:"Dire Dawa",   type:"Customs Extortion",       lang:"OR", ago:"5m"},
  {office:"Land Administration",          region:"Amhara",      type:"Land Fraud",              lang:"AM", ago:"8m"},
  {office:"Regional Health Bureau",       region:"Sidama",      type:"Healthcare Theft",        lang:"TI", ago:"11m"},
  {office:"Federal Police Station",       region:"Tigray",      type:"Police Extortion",        lang:"TI", ago:"14m"},
  {office:"Education Department",         region:"Oromia",      type:"Bribery",                 lang:"OR", ago:"17m"},
  {office:"Tax Authority",                region:"Addis Ababa", type:"Tax Extortion",           lang:"AM", ago:"22m"},
  {office:"Water & Irrigation Bureau",    region:"SNNPR",       type:"Procurement Fraud",       lang:"WO", ago:"28m"},
  {office:"Municipality Housing",         region:"Addis Ababa", type:"Land Fraud",              lang:"AM", ago:"33m"},
  {office:"Regional Court",               region:"Oromia",      type:"Court Corruption",        lang:"OR", ago:"39m"},
  {office:"Agriculture Bureau",           region:"Amhara",      type:"Embezzlement",            lang:"AM", ago:"45m"},
  {office:"Immigration & Nationality",    region:"Addis Ababa", type:"Document Bribery",        lang:"SO", ago:"52m"},
];

const OFFICES_DATA = [
  {name:"Ministry of Transport",       reports:48, region:"Addis Ababa", type:"Procurement"},
  {name:"Customs Authority",           reports:34, region:"Dire Dawa",   type:"Extortion"},
  {name:"Land Administration",         reports:29, region:"Amhara",      type:"Land Fraud"},
  {name:"Federal Tax Authority",       reports:22, region:"Addis Ababa", type:"Tax"},
  {name:"Municipal Housing Office",    reports:19, region:"Addis Ababa", type:"Land Fraud"},
  {name:"Regional Health Bureau",      reports:16, region:"Sidama",      type:"Theft"},
  {name:"Education Department",        reports:14, region:"Oromia",      type:"Bribery"},
  {name:"Federal Police HQ",           reports:12, region:"Addis Ababa", type:"Extortion"},
];

const REGIONS_DATA = [
  {name:"Addis Ababa", reports:78, pct:34},
  {name:"Oromia",      reports:52, pct:22},
  {name:"Amhara",      reports:34, pct:15},
  {name:"SNNPR",       reports:28, pct:12},
  {name:"Tigray",      reports:21, pct:9},
  {name:"Dire Dawa",   reports:12, pct:5},
  {name:"Somali",      reports:8,  pct:3},
];

const TYPES_DATA = [
  {name:"Procurement Bribery", count:67, color:"#f87171"},
  {name:"Land Fraud",          count:48, color:G},
  {name:"Customs Extortion",   count:34, color:CY},
  {name:"Tax Evasion",         count:28, color:"#a78bfa"},
  {name:"Court Corruption",    count:22, color:"#fb923c"},
  {name:"Police Extortion",    count:19, color:"#60a5fa"},
  {name:"Healthcare Theft",    count:15, color:"#4ade80"},
];

// Active cases nearing threshold (public info: office + progress only)
const PENDING_CASES = [
  {id:"ETH-004", office:"Regional Health Bureau", region:"Hawassa", type:"Healthcare Theft", reports:9,  threshold:15, since:"Feb 2026"},
  {id:"ETH-005", office:"Education Department",   region:"Jimma",   type:"Bribery",          reports:6,  threshold:15, since:"Mar 2026"},
  {id:"ETH-006", office:"Federal Police Station", region:"Mekelle", type:"Extortion",        reports:4,  threshold:15, since:"Apr 2026"},
  {id:"ETH-007", office:"Tax Authority",          region:"Adama",   type:"Tax Extortion",    reports:11, threshold:15, since:"Jan 2026"},
];

const LANG_MAP = {AM:"AM·አማርኛ",OR:"OR·Oromiffa",TI:"TI·ትግርኛ",SO:"SO·Soomaali",WO:"WO·Wolaytta"};

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({tag,color=CY,title,mono}) {
  const [r,v]=useReveal();
  return (
    <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"16px",marginBottom:"28px",
      paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.1)`,
      opacity:v?1:0,transform:v?"none":"translateY(12px)",transition:"all 0.5s ease"}}>
      <div style={{width:"6px",height:"6px",background:color,transform:"rotate(45deg)",flexShrink:0,marginBottom:"3px"}}/>
      <span style={{fontSize:"9px",color,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700",flexShrink:0}}>{tag}</span>
      <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.12)`}}/>
      <h2 style={{fontSize:"clamp(16px,2vw,22px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",
        color:"rgba(240,236,224,0.9)",flexShrink:0,letterSpacing:"-0.01em"}}>{title}</h2>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
export default function Safuu() {
  const [scrolled,   setScrolled]  = useState(false);
  const [faq,        setFaq]       = useState(null);
  const [feedIdx,    setFeedIdx]   = useState(0);
  const [totalCount, setTotal]     = useState(233);
  const [todayCount, setToday]     = useState(12);
  const [statsOn,    setStatsOn]   = useState(false);
  const statsRef = useRef();
  const date = new Date().toISOString().slice(0,10);

  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn);},[]);

  // Simulate live incoming tips every 8 seconds
  useEffect(()=>{
    const t = setInterval(()=>{
      setFeedIdx(i=>(i+1)%FEED_TEMPLATES.length);
      if(Math.random()>0.6) setTotal(n=>n+1);
      if(Math.random()>0.5) setToday(n=>n+1);
    }, 8000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStatsOn(true);},{threshold:0.2});
    if(statsRef.current)o.observe(statsRef.current);return()=>o.disconnect();
  },[]);

  const t233=useCount(totalCount,statsOn,1600);
  const t139=useCount(139,statsOn,1800);
  const t3  =useCount(3,  statsOn,1200);
  const t15 =useCount(15, statsOn,1400);

  // Recent feed entries, rotating
  const recentFeed = [
    FEED_TEMPLATES[feedIdx],
    FEED_TEMPLATES[(feedIdx+1)%FEED_TEMPLATES.length],
    FEED_TEMPLATES[(feedIdx+2)%FEED_TEMPLATES.length],
    FEED_TEMPLATES[(feedIdx+3)%FEED_TEMPLATES.length],
    FEED_TEMPLATES[(feedIdx+4)%FEED_TEMPLATES.length],
    FEED_TEMPLATES[(feedIdx+5)%FEED_TEMPLATES.length],
  ];

  const FAQS = [
    {q:"Is my identity truly protected?",a:"Yes. SAFUU never stores your WhatsApp number, Telegram ID, or real name. A one-way SHA-256 hash is the only derivative — mathematically irreversible. Not even administrators can identify you."},
    {q:"What happens after I submit?",a:"Claude AI categorizes severity and corruption type. Evidence is forensically verified (EXIF, Hive AI). The report is auto-routed to the correct agency. Reports cluster — at threshold, the case is formally escalated."},
    {q:"How does name disclosure work?",a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed publicly and formally escalated to FEACC or relevant authority."},
    {q:"Which languages are supported?",a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages auto-transcribed by Whisper AI."},
  ];

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        html{scroll-behavior:smooth}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan{0%{top:-3%}100%{top:104%}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
        @keyframes slide-in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes count-up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bar-grow{from{width:0}to{width:var(--w)}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:12px 28px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px)}
        .btn-outline{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:11px 24px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-outline:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .card-glow{background:rgba(0,0,0,0.5);border:1px solid rgba(0,212,255,0.1);transition:all 0.2s}
        .card-glow:hover{border-color:rgba(0,212,255,0.3);background:rgba(0,212,255,0.03)}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.025)!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:768px){.hide-mob{display:none!important}.hero-grid{grid-template-columns:1fr!important}}
        @media(max-width:540px){.pad-mob{padding:60px 20px!important}nav{padding:0 20px!important}}
      `}</style>

      <GeezRain/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(0,212,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.013) 1px,transparent 1px)`,backgroundSize:"52px 52px"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 30%,rgba(3,5,7,0.75) 100%)"}}/>
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${CY}15,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* ── TICKER ── */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>⚠ LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● SYSTEM ONLINE · ${date}`,`● ${totalCount} TIPS PROCESSED · ${todayCount} TODAY`,"● IDENTITY_STORAGE :: NULL — SHA-256 ONLY","● ሙስና ይጥፋእ · JUSTICE WILL PREVAIL","● AES-256-GCM ACTIVE","● WHATSAPP: +251911000000","● Malaanmmaltummaa Dhabamu · OROMIFFA","● SAFUU.NET · COLLABORATIVE INTELLIGENCE"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.88)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.15)":"rgba(0,212,255,0.07)"}`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"62px",transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{width:"36px",height:"36px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",background:"rgba(201,168,76,0.05)"}}>⚖️</div>
          <div>
            <div style={{fontSize:"18px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",lineHeight:1,letterSpacing:"0.04em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.6}}>INTEL v2.0 · SAFUU.NET</div>
          </div>
        </div>
        <div className="hide-mob" style={{display:"flex",gap:"28px",alignItems:"center"}}>
          {[["#dashboard","DASHBOARD"],["#agencies","AGENCIES"],["/faq","FAQ"],["/transparency","WALL"],["/about","ABOUT"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.45)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-outline" style={{padding:"9px 16px",fontSize:"10px"}}>💬 WhatsApp</a>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-gold" style={{padding:"9px 20px",fontSize:"10px"}}>📲 Telegram</a>
        </div>
      </nav>

      {/* ════════════════ COMPACT HERO ════════════════ */}
      <section style={{position:"relative",zIndex:5,padding:"56px 40px 40px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"24px"}}>
          {/* Compact headline */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
              <div style={{width:"5px",height:"5px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>INTELLIGENCE REPORT · ETHIOPIA · {new Date().getFullYear()}</span>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,3.5vw,44px)",fontWeight:"900",lineHeight:1.1,letterSpacing:"-0.02em",marginBottom:"8px"}}>
              <span style={{color:"rgba(240,236,224,0.95)"}}>Corruption ends </span>
              <span style={{color:G,fontStyle:"italic"}}>when people </span>
              <span style={{color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
            </h1>
            <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace",maxWidth:"480px",lineHeight:"1.7"}}>
              Anonymous intelligence platform · Identity never stored · Court-ready evidence
            </p>
          </div>
          {/* Live pulse stats strip */}
          <div style={{display:"flex",gap:"1px",background:"rgba(0,212,255,0.08)",borderRadius:"2px",overflow:"hidden",flexShrink:0}}>
            {[{v:totalCount,l:"Tips filed"},{v:todayCount,l:"Today",suffix:"new"},{v:3,l:"Disclosed"}].map((s,i)=>(
              <div key={i} style={{background:"#030507",padding:"16px 24px",textAlign:"center"}}>
                <div style={{fontSize:"clamp(22px,3vw,30px)",fontWeight:"900",color:i===2?R:G,fontFamily:"'Playfair Display',serif",lineHeight:1,animation:"count-up 0.5s ease"}}>{s.v}{s.suffix?<span style={{fontSize:"14px",marginLeft:"3px",color:"rgba(0,212,255,0.5)"}}>{s.suffix}</span>:""}</div>
                <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginTop:"4px"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ INTELLIGENCE DASHBOARD ════════════════ */}
      <section id="dashboard" style={{position:"relative",zIndex:5,padding:"48px 40px",maxWidth:"1200px",margin:"0 auto"}}>

        {/* ── ROW 1: Live Feed + Top Offices ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>

          {/* LIVE INTAKE FEED */}
          <div className="card-glow" style={{padding:"0",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.1)`,background:"rgba(0,0,0,0.3)"}}>
              <span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#4ade80",animation:"pulse-dot 1.8s infinite",display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:"#4ade80",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>LIVE INTAKE FEED</span>
              <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{totalCount} total</span>
            </div>
            <div style={{height:"320px",overflowY:"auto"}}>
              {recentFeed.map((r,i)=>(
                <div key={`${feedIdx}-${i}`} style={{display:"grid",gridTemplateColumns:"60px 1fr auto",gap:"10px",padding:"11px 20px",borderBottom:`1px solid rgba(0,212,255,0.05)`,alignItems:"center",animation:i===0?"slide-in 0.4s ease":"none",background:i===0?"rgba(0,212,255,0.04)":"transparent"}}>
                  <div style={{fontSize:"8px",color:i===0?"rgba(0,212,255,0.7)":"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>
                    {i===0?<span style={{color:"#4ade80"}}>NOW</span>:r.ago+" ago"}
                  </div>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:"600",color:"rgba(240,236,224,0.8)",marginBottom:"2px"}}>{r.office}</div>
                    <div style={{fontSize:"10px",color:"rgba(240,236,224,0.35)"}}>{r.region} · {r.type}</div>
                  </div>
                  <div style={{fontSize:"8px",fontFamily:"'Courier New',monospace",padding:"2px 8px",background:"rgba(0,212,255,0.08)",border:`1px solid rgba(0,212,255,0.18)`,color:"rgba(0,212,255,0.6)",flexShrink:0}}>
                    {LANG_MAP[r.lang]||r.lang}
                  </div>
                </div>
              ))}
              <div style={{padding:"12px 20px",fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",textAlign:"center"}}>
                // No names · No identifiers · Office + Region only
              </div>
            </div>
          </div>

          {/* TOP OFFICES BY REPORT VOLUME */}
          <div className="card-glow" style={{padding:"0",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.1)`,background:"rgba(0,0,0,0.3)"}}>
              <div style={{width:"7px",height:"7px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>OFFICES BY REPORT VOLUME</span>
              <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>anonymous tips only</span>
            </div>
            <div style={{padding:"12px 0",height:"320px",overflowY:"auto"}}>
              {OFFICES_DATA.map((o,i)=>{
                const [r,v]=useReveal();
                const pct=(o.reports/48)*100;
                return(
                <div key={i} ref={r} style={{padding:"10px 20px",borderBottom:`1px solid rgba(0,212,255,0.04)`,opacity:v?1:0,transition:`opacity 0.4s ${i*0.06}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"5px"}}>
                    <div>
                      <span style={{fontSize:"12px",fontWeight:"600",color:"rgba(240,236,224,0.8)"}}>{o.name}</span>
                      <span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",marginLeft:"8px",fontFamily:"'Courier New',monospace"}}>{o.region}</span>
                    </div>
                    <span style={{fontSize:"13px",fontWeight:"700",color:i<3?R:G,fontFamily:"'Courier New',monospace"}}>{o.reports}</span>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"1px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:v?`${pct}%`:"0%",background:i<3?R:G,transition:`width 0.9s ${i*0.08}s ease`,borderRadius:"1px"}}/>
                  </div>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",marginTop:"3px"}}>{o.type}</div>
                </div>
              );})}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Cases Nearing Threshold + Type Breakdown + Regional ── */}
        <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.9fr 0.9fr",gap:"16px",marginBottom:"16px"}}>

          {/* CASES BUILDING TOWARD DISCLOSURE */}
          <div className="card-glow" style={{padding:"0",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.1)`,background:"rgba(0,0,0,0.3)"}}>
              <div style={{width:"7px",height:"7px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>BUILDING TOWARD THRESHOLD</span>
            </div>
            <div style={{padding:"12px 0"}}>
              <div style={{padding:"8px 20px 14px",fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.7",borderBottom:`1px solid rgba(0,212,255,0.06)`}}>
                Name is hidden until {"{threshold}"} verified reports. Office and region only shown below.
              </div>
              {PENDING_CASES.map((pc,i)=>{
                const [r,v]=useReveal();
                const pct=(pc.reports/pc.threshold)*100;
                const remaining = pc.threshold-pc.reports;
                return(
                <div key={i} ref={r} style={{padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.05)`,opacity:v?1:0,transition:`opacity 0.4s ${i*0.1}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:"600",color:"rgba(240,236,224,0.75)",marginBottom:"1px"}}>{pc.office}</div>
                      <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{pc.region} · {pc.type}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:"14px",fontWeight:"900",color:pct>60?R:G,fontFamily:"'Courier New',monospace"}}>{pc.reports}<span style={{fontSize:"10px",color:"rgba(240,236,224,0.3)"}}>/{pc.threshold}</span></div>
                      <div style={{fontSize:"8px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>{remaining} needed</div>
                    </div>
                  </div>
                  <div style={{height:"6px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden",marginBottom:"4px"}}>
                    <div style={{height:"100%",width:v?`${pct}%`:"0%",background:pct>60?"linear-gradient(90deg,"+G+","+R+")":G,transition:`width 1s ${i*0.1}s ease`,borderRadius:"2px"}}/>
                  </div>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>{pc.id} · since {pc.since}</div>
                </div>
              );})}
            </div>
          </div>

          {/* CORRUPTION TYPE BREAKDOWN */}
          <div className="card-glow" style={{padding:"0",overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.1)`,background:"rgba(0,0,0,0.3)"}}>
              <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>BY CORRUPTION TYPE</span>
            </div>
            <div style={{padding:"12px 0"}}>
              {TYPES_DATA.map((t,i)=>{
                const [r,v]=useReveal();
                const pct=(t.count/67)*100;
                return(
                <div key={i} ref={r} style={{padding:"8px 18px",opacity:v?1:0,transition:`opacity 0.4s ${i*0.06}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                    <span style={{fontSize:"11px",color:"rgba(240,236,224,0.6)"}}>{t.name}</span>
                    <span style={{fontSize:"11px",color:t.color,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{t.count}</span>
                  </div>
                  <div style={{height:"3px",background:"rgba(255,255,255,0.05)",borderRadius:"1px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:v?`${pct}%`:"0%",background:t.color,transition:`width 0.8s ${i*0.07}s ease`}}/>
                  </div>
                </div>
              );})}
            </div>
          </div>

          {/* REGIONAL BREAKDOWN */}
          <div className="card-glow" style={{padding:"0",overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.1)`,background:"rgba(0,0,0,0.3)"}}>
              <span style={{fontSize:"9px",color:"#a78bfa",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>BY REGION</span>
            </div>
            <div style={{padding:"12px 0"}}>
              {REGIONS_DATA.map((r2,i)=>{
                const [ref,v]=useReveal();
                return(
                <div key={i} ref={ref} style={{padding:"9px 18px",opacity:v?1:0,transition:`opacity 0.4s ${i*0.07}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <span style={{fontSize:"11px",color:"rgba(240,236,224,0.65)"}}>{r2.name}</span>
                    <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                      <span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{r2.pct}%</span>
                      <span style={{fontSize:"12px",fontWeight:"700",color:"#a78bfa",fontFamily:"'Courier New',monospace"}}>{r2.reports}</span>
                    </div>
                  </div>
                  <div style={{height:"3px",background:"rgba(255,255,255,0.05)",borderRadius:"1px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:v?`${r2.pct}%`:"0%",background:"#a78bfa",transition:`width 0.8s ${i*0.07}s ease`}}/>
                  </div>
                </div>
              );})}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Platform stats strip ── */}
        <div ref={statsRef} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:"rgba(0,212,255,0.08)",borderRadius:"2px",overflow:"hidden",marginBottom:"16px"}}>
          {[
            {v:t233,s:"+",l:"Anonymous tips",   sub:"identity = null"},
            {v:t139,s:"", l:"AI-verified",       sub:"forensics confirmed"},
            {v:t3,  s:"", l:"Officials disclosed",sub:"FEACC escalated"},
            {v:t15, s:"", l:"Disclosure threshold",sub:"verified reports needed"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"24px 20px",textAlign:"center"}}>
              <div style={{fontSize:"9px",color:"rgba(0,212,255,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"6px"}}>
                0x{s.v.toString(16).toUpperCase().padStart(3,"0")}
              </div>
              <div style={{fontSize:"clamp(32px,4vw,48px)",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"6px"}}>
                {s.v.toLocaleString()}{s.s}
              </div>
              <div style={{fontSize:"11px",color:G,marginBottom:"3px",fontWeight:"600"}}>{s.l}</div>
              <div style={{fontSize:"9px",color:"rgba(0,212,255,0.35)",fontFamily:"'Courier New',monospace"}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div style={{padding:"14px 20px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.07)`,fontSize:"10px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",lineHeight:"1.8",marginBottom:"48px"}}>
          // All data is aggregated and anonymized · No names shown below disclosure threshold · No reporter identities stored or displayed<br/>
          // Office names, regions, and corruption types are factual — no personal information about reporters or subjects below threshold
        </div>

        {/* ── REPORT CTAs ── */}
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap",justifyContent:"center",marginBottom:"48px"}}>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-gold" style={{fontSize:"13px",padding:"15px 36px"}}>💬 Report on WhatsApp</a>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-outline" style={{fontSize:"13px",padding:"14px 32px"}}>📲 Report on Telegram</a>
        </div>

        {/* ── AGENCIES ── */}
        <div id="agencies" style={{marginBottom:"48px"}}>
          <SectionHeader tag="ROUTE_TABLE()" color={G} title="Ethiopian accountability bodies"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"10px"}}>
            {[
              {name:"FEACC",       am:"ፀረሙስና ኮሚሽን",phone:"959",  c:"#4ade80",type:"All corruption"},
              {name:"EHRC",        am:"ሰብዓዊ መብቶች",  phone:"1488", c:"#60a5fa",type:"Human rights"},
              {name:"Ombudsman",   am:"ዕርቀ ሚካሄ",    phone:"6060", c:"#a78bfa",type:"Abuse of power"},
              {name:"Fed. Police", am:"ፌደራል ፖሊስ",  phone:"911",  c:"#f87171",type:"Criminal"},
              {name:"OFAG",        am:"ዋና ኦዲተር",    phone:"—",    c:"#fb923c",type:"Public funds"},
            ].map((a,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} className="card-glow" style={{padding:"20px",borderLeft:`3px solid ${a.c}`,opacity:v?1:0,transform:v?"none":"translateY(12px)",transition:`all 0.5s ${i*0.08}s ease`}}>
                <div style={{fontSize:"8px",color:"rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginBottom:"5px"}}>AGENCY</div>
                <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.9)",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{a.name}</div>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",marginBottom:"12px"}}>{a.am}</div>
                <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",marginBottom:"10px"}}>{a.type}</div>
                <div style={{fontSize:"22px",fontWeight:"900",color:a.c,fontFamily:"'Courier New',monospace"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
              </div>
            );})}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{maxWidth:"760px"}}>
          <SectionHeader tag="FAQ.execute()" color={CY} title="Your questions answered"/>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`}}>
            {FAQS.map((f,i)=>(
              <div key={i} className="faq-row" onClick={()=>setFaq(faq===i?null:i)}>
                <div style={{padding:"18px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"clamp(14px,1.8vw,15px)",fontWeight:"700",color:faq===i?G:"rgba(240,236,224,0.85)",fontFamily:"'Playfair Display',serif",paddingRight:"20px",transition:"color 0.2s"}}>{f.q}</span>
                  <span style={{color:faq===i?CY:G,fontSize:"20px",flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:faq===i?"rotate(45deg)":"none",fontWeight:"300"}}>+</span>
                </div>
                {faq===i&&<div style={{paddingBottom:"18px",paddingRight:"4px"}}>
                  <div style={{height:"1px",background:"rgba(0,212,255,0.1)",marginBottom:"14px"}}/>
                  <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85"}}>{f.a}</p>
                </div>}
              </div>
            ))}
          </div>
          <div style={{marginTop:"20px",display:"flex",gap:"12px"}}>
            <a href="/faq" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>Full FAQ →</a>
            <a href="/transparency" style={{fontSize:"10px",color:`rgba(201,168,76,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>Transparency Wall →</a>
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{position:"relative",zIndex:5,borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"48px 40px 32px",background:"rgba(0,0,0,0.92)"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"32px",marginBottom:"32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0"}}>
              <div style={{width:"3px",height:"36px",background:G,marginRight:"16px",flexShrink:0}}/>
              <div>
                <div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU INTEL</div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",marginTop:"2px",letterSpacing:"0.15em"}}>ሳፉ · MORAL ORDER · ETHIOPIA</div>
                <div style={{fontSize:"9px",color:"rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",marginTop:"6px"}}>FEACC: 959 · EHRC: 1488 · POLICE: 911</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>PLATFORM</div>
                {[["/"," Home"],["/transparency","Transparency"],["/report","File a Report"],["/analytics","Analytics"],["/sms","WhatsApp & Telegram"]].map(([h,l])=>(
                  <div key={l} style={{marginBottom:"8px"}}><a href={h} className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a></div>
                ))}
              </div>
              <div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>LANGUAGES</div>
                {[["/am","አማርኛ (Amharic)"],["/or","Oromiffa"],["/ti","ትግርኛ (Tigrinya)"]].map(([h,l])=>(
                  <div key={l} style={{marginBottom:"8px"}}><a href={h} className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a></div>
                ))}
              </div>
              <div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>ABOUT</div>
                {[["/about","About SAFUU"],["/faq","FAQ"],["/partners","Partners"],["/press","Press Kit"],["/donate","Support"],["/privacy","Privacy"],["/changelog","Changelog"]].map(([h,l])=>(
                  <div key={l} style={{marginBottom:"8px"}}><a href={h} className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a></div>
                ))}
              </div>
              <div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>DEVELOPERS</div>
                {[["/backend","Backend Setup"],["/api-docs","API Reference"],["/setup-domain","Domain Setup"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://wa.me/251911000000","WhatsApp"],["https://t.me/SafuuEthBot","Telegram Bot"]].map(([h,l])=>(
                  <div key={l} style={{marginBottom:"8px"}}><a href={h} target={h.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a></div>
                ))}
              </div>
            </div>
          </div>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.06)`,paddingTop:"20px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"9px",color:"rgba(0,212,255,0.2)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · All data aggregated and anonymized</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.2)",fontFamily:"'Courier New',monospace"}}>{date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
