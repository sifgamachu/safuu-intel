'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const G="#c9a84c", CY="#00d4ff", R="#b82020", PU="#a78bfa", GR="#4ade80";

// ── Ge'ez rain ──────────────────────────────────────────────────────────────
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
        ctx.fillStyle = Math.random()>0.97 ? `rgba(0,200,255,${b+0.05})` : `rgba(180,145,50,${b})`;
        ctx.font = "12px serif";
        ctx.fillText(ch, i*20, d.y*20);
        d.y += d.s; if (d.y*20 > c.height+40) { d.y=-Math.random()*30; d.s=0.15+Math.random()*0.4; }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,opacity:0.08,pointerEvents:"none"}}/>;
}

// ── Animated count-up ────────────────────────────────────────────────────────
function useCount(target, ms=1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = null;
    const f = ts => { if(!s)s=ts; const p=Math.min((ts-s)/ms,1); setV(Math.floor((1-Math.pow(1-p,3))*target)); if(p<1)requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }, [target]);
  return v;
}

// ── Donut SVG ────────────────────────────────────────────────────────────────
function Donut({ data, size=180, hovered, onHover }) {
  const total = data.reduce((s,d)=>s+d.v,0);
  let cum = 0;
  const r=72, cx=size/2, cy=size/2;
  const toRad = a => (a-90)*Math.PI/180;
  const segments = data.map((d,i)=>{
    const pct=d.v/total, start=cum*360, end=(cum+pct)*360;
    cum+=pct;
    const x1=cx+r*Math.cos(toRad(start)), y1=cy+r*Math.sin(toRad(start));
    const x2=cx+r*Math.cos(toRad(end)),   y2=cy+r*Math.sin(toRad(end));
    return {...d, i, path:`M${cx},${cy}L${x1},${y1}A${r},${r} 0 ${(end-start)>180?1:0} 1 ${x2},${y2}Z`, pct:Math.round(pct*100)};
  });
  const h = hovered!==null ? data[hovered] : null;
  return (
    <svg width={size} height={size}>
      {segments.map((s,i)=>(
        <path key={i} d={s.path} fill={s.color}
          opacity={hovered===null||hovered===i?0.85:0.3}
          style={{cursor:"pointer",transition:"opacity 0.2s"}}
          onMouseEnter={()=>onHover(i)} onMouseLeave={()=>onHover(null)}/>
      ))}
      <circle cx={cx} cy={cy} r={r*0.52} fill="#030507"/>
      {h ? <>
        <text x={cx} y={cy-10} textAnchor="middle" fill={h.color} fontSize="18" fontWeight="900" fontFamily="'Playfair Display',serif">{h.pct}%</text>
        <text x={cx} y={cy+8} textAnchor="middle" fill="rgba(240,236,214,0.6)" fontSize="8" fontFamily="monospace">{h.label.slice(0,14)}</text>
        <text x={cx} y={cy+22} textAnchor="middle" fill={h.color} fontSize="10" fontFamily="monospace" fontWeight="700">{h.v}</text>
      </> : <>
        <text x={cx} y={cy-6} textAnchor="middle" fill="rgba(240,236,214,0.4)" fontSize="10" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy+8} textAnchor="middle" fill="rgba(240,236,214,0.25)" fontSize="8" fontFamily="monospace">TOTAL</text>
      </>}
    </svg>
  );
}

// ── Threshold Ring ────────────────────────────────────────────────────────────
function Ring({ val, max, color, size=100 }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(()=>setW(val/max),200); }, []);
  const r=40, c2=2*Math.PI*r, dash=w*c2;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={w>=1?R:color} strokeWidth="8"
        strokeDasharray={`${dash} ${c2}`} strokeDashoffset={c2/4} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s ease"}}/>
      <text x="50" y="46" textAnchor="middle" fill={w>=1?R:color} fontSize="16" fontWeight="900" fontFamily="monospace">{val}</text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">/{max}</text>
    </svg>
  );
}

// ── Bar Row ──────────────────────────────────────────────────────────────────
function BarRow({ label, sub, val, max, color, rank, onClick, active }) {
  const [w, setW] = useState(0);
  useEffect(()=>{setTimeout(()=>setW((val/max)*100),rank*80+200);},[]);
  return (
    <div onClick={onClick} style={{padding:"10px 20px",cursor:"pointer",transition:"background 0.15s",background:active?"rgba(0,212,255,0.06)":"transparent",borderLeft:active?`2px solid ${color}`:"2px solid transparent"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"5px"}}>
        <div>
          <span style={{fontSize:"12px",fontWeight:"600",color:active?"rgba(240,236,224,0.95)":"rgba(240,236,224,0.75)"}}>{label}</span>
          {sub&&<span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",marginLeft:"8px",fontFamily:"'Courier New',monospace"}}>{sub}</span>}
        </div>
        <span style={{fontSize:"14px",fontWeight:"900",color,fontFamily:"'Courier New',monospace"}}>{val}</span>
      </div>
      <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${w}%`,background:color,transition:`width 0.9s ${rank*0.08}s ease`,borderRadius:"2px"}}/>
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height=40 }) {
  const w = 200, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v,i)=>[
    (i/(data.length-1))*w,
    h - ((v-min)/(max-min||1))*(h-6) - 3
  ]);
  const path = pts.map((p,i)=>`${i===0?"M":"L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#grad-${color.replace("#","")})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════
const FEED_POOL = [
  {office:"Ministry of Transport",        region:"Addis Ababa", type:"Procurement Bribery", lang:"AM",severity:3},
  {office:"Customs Authority",            region:"Dire Dawa",   type:"Customs Extortion",   lang:"OR",severity:3},
  {office:"Land Administration Bureau",  region:"Bahir Dar",   type:"Land Fraud",           lang:"AM",severity:3},
  {office:"Regional Health Bureau",       region:"Hawassa",     type:"Healthcare Theft",     lang:"TI",severity:2},
  {office:"Federal Police Station",       region:"Mekelle",     type:"Police Extortion",     lang:"TI",severity:2},
  {office:"Education Department",         region:"Jimma",       type:"Bribery",              lang:"OR",severity:2},
  {office:"Federal Tax Authority",        region:"Addis Ababa", type:"Tax Extortion",        lang:"AM",severity:2},
  {office:"Water & Irrigation Bureau",   region:"Hawassa",     type:"Procurement Fraud",    lang:"WO",severity:1},
  {office:"Municipality Housing",         region:"Addis Ababa", type:"Land Fraud",           lang:"AM",severity:2},
  {office:"Regional Court",              region:"Adama",       type:"Court Corruption",     lang:"OR",severity:3},
  {office:"Agriculture Bureau",          region:"Bahir Dar",   type:"Embezzlement",         lang:"AM",severity:2},
  {office:"Immigration & Nationality",   region:"Addis Ababa", type:"Document Bribery",     lang:"SO",severity:1},
  {office:"Procurement Authority",       region:"Addis Ababa", type:"Tender Fraud",         lang:"AM",severity:3},
  {office:"Regional Finance Bureau",     region:"Semera",      type:"Fund Misappropriation",lang:"AF",severity:2},
  {office:"Construction Office",         region:"Oromia",      type:"Contract Bribery",     lang:"OR",severity:2},
];

const OFFICES = [
  {name:"Ministry of Transport",      region:"Addis Ababa", reports:48, type:"Procurement", color:R},
  {name:"Customs Authority",          region:"Dire Dawa",   reports:34, type:"Extortion",   color:R},
  {name:"Land Administration",        region:"Amhara",      reports:29, type:"Land Fraud",  color:R},
  {name:"Federal Tax Authority",      region:"Addis Ababa", reports:22, type:"Tax",         color:G},
  {name:"Municipal Housing",          region:"Addis Ababa", reports:19, type:"Land Fraud",  color:G},
  {name:"Regional Health Bureau",     region:"Sidama",      reports:16, type:"Theft",       color:G},
  {name:"Education Department",       region:"Oromia",      reports:14, type:"Bribery",     color:G},
  {name:"Federal Police HQ",          region:"Addis Ababa", reports:12, type:"Extortion",   color:G},
  {name:"Regional Court",             region:"Oromia",      reports:10, type:"Corruption",  color:CY},
  {name:"Procurement Authority",      region:"Addis Ababa", reports:9,  type:"Tender Fraud",color:CY},
];

const REGIONS = [
  {name:"Addis Ababa", reports:78, pct:34, color:"#f87171"},
  {name:"Oromia",      reports:52, pct:22, color:G},
  {name:"Amhara",      reports:34, pct:15, color:CY},
  {name:"SNNPR",       reports:28, pct:12, color:PU},
  {name:"Tigray",      reports:21, pct:9,  color:"#60a5fa"},
  {name:"Dire Dawa",   reports:12, pct:5,  color:"#fb923c"},
  {name:"Somali",      reports:8,  pct:3,  color:GR},
];

const TYPES_DONUT = [
  {label:"Procurement",  v:67, color:"#f87171"},
  {label:"Land Fraud",   v:48, color:G},
  {label:"Extortion",    v:34, color:CY},
  {label:"Tax",          v:28, color:PU},
  {label:"Court",        v:22, color:"#fb923c"},
  {label:"Police",       v:19, color:"#60a5fa"},
  {label:"Healthcare",   v:15, color:GR},
];

const PENDING = [
  {id:"ETH-007",office:"Federal Tax Authority",    region:"Adama",    type:"Tax Extortion",    reports:11,threshold:15,since:"Jan 2026",color:G},
  {id:"ETH-004",office:"Regional Health Bureau",   region:"Hawassa",  type:"Healthcare Theft", reports:9, threshold:15,since:"Feb 2026",color:G},
  {id:"ETH-005",office:"Education Department",     region:"Jimma",    type:"Bribery",          reports:6, threshold:15,since:"Mar 2026",color:G},
  {id:"ETH-006",office:"Federal Police Station",   region:"Mekelle",  type:"Extortion",        reports:4, threshold:15,since:"Apr 2026",color:G},
  {id:"ETH-008",office:"Procurement Authority",    region:"A.Ababa",  type:"Tender Fraud",     reports:3, threshold:15,since:"Apr 2026",color:G},
];

const MONTHLY = [8,12,16,22,29,34,45,52,58,62,68,73];
const WEEKLY  = [12,9,15,18,11,20,16];
const LANGS_DIST = [
  {l:"AM",n:"Amharic",  v:118,color:G},
  {l:"OR",n:"Oromiffa", v:62, color:CY},
  {l:"TI",n:"Tigrinya", v:28, color:PU},
  {l:"SO",n:"Somali",   v:14, color:"#fb923c"},
  {l:"EN",n:"English",  v:9,  color:"#60a5fa"},
  {l:"AF",n:"Afar",     v:2,  color:GR},
];

const LANG_LABEL = {AM:"AM·አማርኛ",OR:"OR·Oromiffa",TI:"TI·ትግርኛ",SO:"SO·Soomaali",WO:"WO·Wolaytta",AF:"AF·Qafar"};
const SEV_COLOR  = {1:CY, 2:G, 3:R};
const SEV_LABEL  = {1:"LOW",2:"MED",3:"HIGH"};

// ══════════════════════════════════════════════════════
export default function Safuu() {
  const [scrolled, setScrolled]     = useState(false);
  const [feed,     setFeed]         = useState(() => FEED_POOL.slice(0,8).map((f,i)=>({...f,id:i,ts:Date.now()-i*45000})));
  const [total,    setTotal]        = useState(233);
  const [today,    setToday]        = useState(12);
  const [activeOf, setActiveOf]     = useState(null);   // active office row
  const [activeReg,setActiveReg]    = useState(null);   // active region row
  const [donutHov, setDonutHov]     = useState(null);
  const [faq,      setFaq]          = useState(null);
  const [tab,      setTab]          = useState("offices"); // offices|regions|languages
  const [chartTab, setChartTab]     = useState("monthly");
  const nextId = useRef(100);

  const t233 = useCount(total, 2000);
  const t139 = useCount(139,   2200);
  const t3   = useCount(3,     1400);
  const t15  = useCount(15,    1600);

  const date = new Date().toISOString().slice(0,10);

  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn);},[]);

  // Live feed — new entry every 7s
  useEffect(()=>{
    const t = setInterval(()=>{
      const template = FEED_POOL[Math.floor(Math.random()*FEED_POOL.length)];
      const entry = {...template, id:nextId.current++, ts:Date.now(), isNew:true};
      setFeed(f=>[entry,...f.slice(0,11)]);
      if(Math.random()>0.5) setTotal(n=>n+1);
      if(Math.random()>0.3) setToday(n=>n+1);
    }, 7000);
    return ()=>clearInterval(t);
  },[]);

  const fmtTime = ts => {
    const s = Math.floor((Date.now()-ts)/1000);
    if(s<10) return "just now";
    if(s<60)  return `${s}s ago`;
    if(s<3600) return `${Math.floor(s/60)}m ago`;
    return `${Math.floor(s/3600)}h ago`;
  };
  const [, tick] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>tick(n=>n+1),5000); return()=>clearInterval(t); },[]);

  const FAQS = [
    {q:"Is my identity truly protected?",a:"Yes. SAFUU never stores your WhatsApp number, Telegram ID, or real name. A one-way SHA-256 hash is the only derivative — mathematically irreversible. Not even administrators can identify you."},
    {q:"What happens after I submit?",a:"Claude AI categorizes severity and type. Evidence is forensically verified. The report is auto-routed to the correct Ethiopian agency. Reports cluster — at threshold, the official's name is publicly disclosed."},
    {q:"How does name disclosure work?",a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed and formally escalated to FEACC or relevant authority."},
    {q:"Which languages?",a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, English. Voice messages auto-transcribed by Whisper AI."},
  ];

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none} html{scroll-behavior:smooth}
        @keyframes marquee  {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan     {0%{top:-3%}100%{top:104%}}
        @keyframes fadein   {from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes ring-in  {from{stroke-dasharray:0 1000}to{}}
        @keyframes drift    {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes blink-r  {0%,49%{background:${R}}50%,100%{background:transparent}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:12px 28px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.3)}
        .btn-cy{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:11px 24px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-cy:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .tab{padding:7px 16px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.14em;cursor:pointer;border:none;transition:all 0.15s;text-transform:uppercase}
        .tab-active{background:rgba(0,212,255,0.1);color:${CY};border-bottom:2px solid ${CY}}
        .tab-idle{background:transparent;color:rgba(240,236,224,0.3);border-bottom:1px solid rgba(0,212,255,0.08)}
        .tab:hover{color:${CY}}
        .panel{background:rgba(0,0,0,0.55);border:1px solid rgba(0,212,255,0.1);backdrop-filter:blur(4px);overflow:hidden;transition:border-color 0.2s}
        .panel:hover{border-color:rgba(0,212,255,0.2)}
        .panel-hdr{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid rgba(0,212,255,0.09);background:rgba(0,0,0,0.3)}
        .hdr-tag{font-size:9px;font-family:'Courier New',monospace;letter-spacing:0.18em;font-weight:700}
        .feed-row{display:grid;grid-template-columns:52px 1fr auto;gap:10px;padding:10px 18px;border-bottom:1px solid rgba(0,212,255,0.05);align-items:center;transition:background 0.15s;cursor:default}
        .feed-row:hover{background:rgba(0,212,255,0.04)}
        .feed-new{animation:fadein 0.5s ease;background:rgba(0,212,255,0.06)!important}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.025)}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:900px){.dash-main{grid-template-columns:1fr!important}.dash-row2{grid-template-columns:1fr!important}}
        @media(max-width:640px){.hide-mob{display:none!important}nav{padding:0 16px!important}.pad{padding:32px 16px!important}}
      `}</style>

      <GeezRain/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(0,212,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.013) 1px,transparent 1px)`,backgroundSize:"52px 52px"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 25%,rgba(3,5,7,0.8) 100%)"}}/>
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${CY}15,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* TICKER */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>⚠ LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● SYSTEM ONLINE · ${date}`,`● ${total} TIPS PROCESSED · ${today} TODAY`,"● IDENTITY_STORAGE :: NULL","● ሙስና ይጥፋእ · JUSTICE WILL PREVAIL","● AES-256-GCM ACTIVE","● WHATSAPP: +251911000000","● Malaanmmaltummaa Dhabamu","● SAFUU.NET · COLLABORATIVE INTELLIGENCE"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.88)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.15)":"rgba(0,212,255,0.07)"}`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"36px",height:"36px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",background:"rgba(201,168,76,0.05)"}}>⚖️</div>
          <div>
            <div style={{fontSize:"17px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",lineHeight:1,letterSpacing:"0.04em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.28em",fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.6}}>INTEL v2.0 · SAFUU.NET</div>
          </div>
        </div>
        <div className="hide-mob" style={{display:"flex",gap:"24px",alignItems:"center"}}>
          {[["#dashboard","DASHBOARD"],["#threshold","BUILDING"],["#agencies","AGENCIES"],["/faq","FAQ"],["/transparency","WALL"],["/about","ABOUT"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.45)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-cy" style={{padding:"8px 16px",fontSize:"10px"}}>💬 WhatsApp</a>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-gold" style={{padding:"8px 18px",fontSize:"10px"}}>📲 Telegram</a>
        </div>
      </nav>

      {/* ══ COMPACT HERO ══ */}
      <section className="pad" style={{position:"relative",zIndex:5,padding:"40px 40px 32px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
        <div style={{maxWidth:"1400px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"20px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <div style={{width:"5px",height:"5px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>INTELLIGENCE REPORT · ETHIOPIA · {new Date().getFullYear()}</span>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px,3vw,40px)",fontWeight:"900",lineHeight:1.1,letterSpacing:"-0.02em"}}>
              <span style={{color:"rgba(240,236,224,0.95)"}}>Corruption ends </span>
              <span style={{color:G,fontStyle:"italic"}}>when people </span>
              <span style={{color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
            </h1>
            <p style={{fontSize:"12px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",marginTop:"6px"}}>
              Anonymous · Encrypted · Court-ready · Identity never stored
            </p>
          </div>
          {/* Live pulse stats */}
          <div style={{display:"flex",gap:"1px",background:"rgba(0,212,255,0.08)",borderRadius:"2px",overflow:"hidden",flexShrink:0}}>
            {[{v:t233,l:"Tips processed",c:G},{v:t139,l:"AI-verified",c:CY},{v:t3,l:"Disclosed",c:R},{v:today,l:"Today",c:GR}].map((s,i)=>(
              <div key={i} style={{background:"#030507",padding:"14px 22px",textAlign:"center",minWidth:"80px"}}>
                <div style={{fontSize:"clamp(22px,3vw,34px)",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginTop:"3px",letterSpacing:"0.08em"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN DASHBOARD
      ══════════════════════════════════════ */}
      <section id="dashboard" className="pad" style={{position:"relative",zIndex:5,padding:"32px 40px",maxWidth:"1400px",margin:"0 auto"}}>

        {/* ROW 1 — Feed (wide) + Offices/Regions/Languages (tabbed) */}
        <div className="dash-main" style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:"14px",marginBottom:"14px"}}>

          {/* ── LIVE FEED ── */}
          <div className="panel">
            <div className="panel-hdr">
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:GR,animation:"pulse-dot 1.5s infinite",display:"inline-block",flexShrink:0}}/>
              <span className="hdr-tag" style={{color:GR}}>LIVE INTAKE FEED</span>
              <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>updates every 7s · office & region only</span>
            </div>
            {/* Feed entries */}
            <div style={{height:"420px",overflowY:"auto"}}>
              {feed.map((r,i)=>(
                <div key={r.id} className={`feed-row${i===0?" feed-new":""}`}>
                  {/* Time + severity */}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:i===0?"9px":"8px",fontFamily:"'Courier New',monospace",color:i===0?GR:"rgba(240,236,224,0.25)",fontWeight:i===0?"700":"400",marginBottom:"3px"}}>{i===0?"NOW":fmtTime(r.ts)}</div>
                    <div style={{fontSize:"8px",fontFamily:"'Courier New',monospace",padding:"1px 6px",border:`1px solid ${SEV_COLOR[r.severity]}44`,color:SEV_COLOR[r.severity],background:`${SEV_COLOR[r.severity]}11`}}>{SEV_LABEL[r.severity]}</div>
                  </div>
                  {/* Office + details */}
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:i===0?"rgba(240,236,224,0.95)":"rgba(240,236,224,0.7)",marginBottom:"3px"}}>{r.office}</div>
                    <div style={{fontSize:"10px",color:"rgba(240,236,224,0.35)",display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <span>{r.region}</span>
                      <span style={{color:"rgba(0,212,255,0.3)"}}>·</span>
                      <span>{r.type}</span>
                    </div>
                  </div>
                  {/* Language badge */}
                  <div style={{fontSize:"8px",fontFamily:"'Courier New',monospace",padding:"3px 9px",background:"rgba(0,212,255,0.08)",border:`1px solid rgba(0,212,255,0.2)`,color:"rgba(0,212,255,0.65)",flexShrink:0,textAlign:"center"}}>
                    {LANG_LABEL[r.lang]||r.lang}
                  </div>
                </div>
              ))}
              <div style={{padding:"14px 18px",textAlign:"center",fontSize:"10px",color:"rgba(240,236,224,0.18)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
                // No names · No personal identifiers<br/>
                // Office + region + type + language only
              </div>
            </div>
            {/* Sparkline footer */}
            <div style={{padding:"12px 20px",borderTop:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.2)",display:"flex",alignItems:"center",gap:"16px"}}>
              <div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginBottom:"4px"}}>DAILY INTAKE TREND</div>
                <Sparkline data={WEEKLY} color={GR} height={36}/>
              </div>
              <div style={{flex:1,display:"flex",gap:"16px",justifyContent:"flex-end"}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"18px",fontWeight:"900",color:GR,fontFamily:"'Playfair Display',serif"}}>{today}</div>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>today</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:"18px",fontWeight:"900",color:CY,fontFamily:"'Playfair Display',serif"}}>7</div>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>avg/day</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TABBED: OFFICES / REGIONS / LANGUAGES ── */}
          <div className="panel" style={{display:"flex",flexDirection:"column"}}>
            <div className="panel-hdr" style={{padding:"0",flexDirection:"column",alignItems:"stretch",gap:0}}>
              <div style={{display:"flex"}}>
                {[["offices","TOP OFFICES"],["regions","BY REGION"],["languages","LANGUAGES"]].map(([k,l])=>(
                  <button key={k} className={`tab ${tab===k?"tab-active":"tab-idle"}`} style={{flex:1}} onClick={()=>setTab(k)}>{l}</button>
                ))}
              </div>
            </div>

            {tab==="offices"&&(
              <div style={{flex:1,overflowY:"auto",height:"370px"}}>
                <div style={{padding:"10px 0"}}>
                  {OFFICES.map((o,i)=>(
                    <BarRow key={i} label={o.name} sub={o.region} val={o.reports} max={48} color={o.color}
                      rank={i} active={activeOf===i} onClick={()=>setActiveOf(activeOf===i?null:i)}/>
                  ))}
                </div>
                {activeOf!==null&&(
                  <div style={{margin:"0 16px 12px",padding:"12px 16px",background:"rgba(0,212,255,0.05)",border:`1px solid rgba(0,212,255,0.15)`}}>
                    <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",marginBottom:"6px"}}>SELECTED · {OFFICES[activeOf].name.toUpperCase()}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",fontSize:"11px"}}>
                      <div><span style={{color:"rgba(240,236,224,0.35)"}}>Region: </span><span style={{color:"rgba(240,236,224,0.7)"}}>{OFFICES[activeOf].region}</span></div>
                      <div><span style={{color:"rgba(240,236,224,0.35)"}}>Type: </span><span style={{color:"rgba(240,236,224,0.7)"}}>{OFFICES[activeOf].type}</span></div>
                      <div><span style={{color:"rgba(240,236,224,0.35)"}}>Reports: </span><span style={{color:OFFICES[activeOf].color,fontWeight:"700"}}>{OFFICES[activeOf].reports}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab==="regions"&&(
              <div style={{flex:1,display:"flex",flexDirection:"column",height:"370px"}}>
                <div style={{flex:1,overflowY:"auto"}}>
                  <div style={{padding:"10px 0"}}>
                    {REGIONS.map((r,i)=>(
                      <BarRow key={i} label={r.name} val={r.reports} max={78} color={r.color}
                        rank={i} active={activeReg===i} onClick={()=>setActiveReg(activeReg===i?null:i)}
                        sub={`${r.pct}%`}/>
                    ))}
                  </div>
                </div>
                {/* Map-like visual */}
                <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"12px 20px",background:"rgba(0,0,0,0.2)"}}>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",marginBottom:"8px"}}>REGIONAL DISTRIBUTION</div>
                  <div style={{display:"flex",gap:"3px",alignItems:"flex-end",height:"40px"}}>
                    {REGIONS.map((r,i)=>(
                      <div key={i} title={r.name} onClick={()=>setActiveReg(activeReg===i?null:i)}
                        style={{flex:1,background:activeReg===i||activeReg===null?r.color:`${r.color}44`,height:`${(r.pct/34)*100}%`,minHeight:"4px",cursor:"pointer",transition:"all 0.2s",borderRadius:"1px 1px 0 0"}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab==="languages"&&(
              <div style={{flex:1,padding:"16px",display:"flex",flexDirection:"column",gap:"10px",height:"370px",overflowY:"auto"}}>
                {LANGS_DIST.map((l,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                      <div>
                        <span style={{fontSize:"12px",fontWeight:"600",color:"rgba(240,236,224,0.8)"}}>{l.n}</span>
                        <span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginLeft:"8px"}}>{l.l}</span>
                      </div>
                      <span style={{fontSize:"13px",fontWeight:"700",color:l.color,fontFamily:"'Courier New',monospace"}}>{l.v}</span>
                    </div>
                    <div style={{height:"6px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(l.v/118)*100}%`,background:l.color,borderRadius:"2px",transition:`width 0.9s ${i*0.1}s ease`}}/>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:"auto",padding:"12px",background:"rgba(0,0,0,0.3)",border:`1px solid rgba(0,212,255,0.08)`}}>
                  <div style={{fontSize:"9px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace",marginBottom:"6px"}}>VOICE VS TEXT</div>
                  <div style={{display:"flex",gap:"16px"}}>
                    <div style={{textAlign:"center"}}><div style={{fontSize:"20px",fontWeight:"900",color:G,fontFamily:"'Playfair Display',serif"}}>61%</div><div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>Voice msg</div></div>
                    <div style={{textAlign:"center"}}><div style={{fontSize:"20px",fontWeight:"900",color:CY,fontFamily:"'Playfair Display',serif"}}>39%</div><div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>Text msg</div></div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer counts */}
            <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"10px 20px",background:"rgba(0,0,0,0.2)",display:"flex",gap:"16px"}}>
              <a href="/analytics" style={{fontSize:"10px",color:`rgba(0,212,255,0.45)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>Full analytics →</a>
              <a href="/transparency" style={{fontSize:"10px",color:`rgba(201,168,76,0.45)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>Transparency wall →</a>
            </div>
          </div>
        </div>

        {/* ROW 2 — Threshold Cases + Type Donut + Monthly Chart */}
        <div className="dash-row2" style={{display:"grid",gridTemplateColumns:"1.3fr 0.85fr 0.85fr",gap:"14px",marginBottom:"14px"}}>

          {/* ── CASES BUILDING TOWARD THRESHOLD ── */}
          <div id="threshold" className="panel">
            <div className="panel-hdr">
              <div style={{width:"7px",height:"7px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
              <span className="hdr-tag" style={{color:G}}>CASES BUILDING TOWARD DISCLOSURE</span>
              <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>name hidden below threshold</span>
            </div>
            <div style={{padding:"14px 0 4px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0"}}>
                {PENDING.map((p,i)=>{
                  const pct=(p.reports/p.threshold)*100;
                  const remaining=p.threshold-p.reports;
                  return(
                  <div key={i} style={{padding:"16px 20px",borderRight:(i%2===0)?"1px solid rgba(0,212,255,0.07)":"none",borderBottom:"1px solid rgba(0,212,255,0.07)"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"10px"}}>
                      <Ring val={p.reports} max={p.threshold} color={pct>60?R:G} size={76}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"9px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace",marginBottom:"4px"}}>{p.id}</div>
                        <div style={{fontSize:"12px",fontWeight:"700",color:"rgba(240,236,224,0.8)",lineHeight:"1.3",marginBottom:"3px"}}>{p.office}</div>
                        <div style={{fontSize:"9px",color:"rgba(240,236,224,0.35)"}}>{p.region}</div>
                        <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",marginTop:"2px",fontFamily:"'Courier New',monospace"}}>{p.type}</div>
                      </div>
                    </div>
                    <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden",marginBottom:"5px"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:pct>60?"linear-gradient(90deg,"+G+","+R+")":G,transition:`width 1.2s ${i*0.15}s ease`,borderRadius:"2px"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",fontFamily:"'Courier New',monospace",color:"rgba(240,236,224,0.3)"}}>
                      <span style={{color:pct>60?"rgba(220,80,80,0.7)":"rgba(201,168,76,0.5)"}}>{remaining} reports needed</span>
                      <span>since {p.since}</span>
                    </div>
                  </div>
                );})}
              </div>
              <div style={{padding:"10px 20px",fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",lineHeight:"1.8",borderTop:`1px solid rgba(0,212,255,0.06)`,marginTop:"4px"}}>
                // Name withheld until {"{threshold}"} verified reports · Office + region visible to track accountability
              </div>
            </div>
          </div>

          {/* ── TYPE DONUT ── */}
          <div className="panel">
            <div className="panel-hdr">
              <div style={{width:"7px",height:"7px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
              <span className="hdr-tag" style={{color:R}}>CORRUPTION TYPES</span>
            </div>
            <div style={{padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
              <Donut data={TYPES_DONUT} size={180} hovered={donutHov} onHover={setDonutHov}/>
              <div style={{width:"100%",display:"flex",flexDirection:"column",gap:"5px"}}>
                {TYPES_DONUT.map((t,i)=>(
                  <div key={i} onMouseEnter={()=>setDonutHov(i)} onMouseLeave={()=>setDonutHov(null)}
                    style={{display:"flex",alignItems:"center",gap:"8px",padding:"4px 8px",cursor:"pointer",borderRadius:"2px",background:donutHov===i?"rgba(255,255,255,0.04)":"transparent",transition:"background 0.15s"}}>
                    <div style={{width:"8px",height:"8px",background:t.color,borderRadius:"1px",flexShrink:0}}/>
                    <span style={{fontSize:"11px",color:donutHov===i?"rgba(240,236,224,0.9)":"rgba(240,236,224,0.55)",flex:1}}>{t.label}</span>
                    <span style={{fontSize:"11px",fontWeight:"700",color:t.color,fontFamily:"'Courier New',monospace"}}>{t.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── MONTHLY / WEEKLY CHART ── */}
          <div className="panel" style={{display:"flex",flexDirection:"column"}}>
            <div className="panel-hdr" style={{padding:"0",flexDirection:"column",alignItems:"stretch",gap:0}}>
              <div style={{display:"flex"}}>
                {[["monthly","MONTHLY"],["weekly","WEEKLY"]].map(([k,l])=>(
                  <button key={k} className={`tab ${chartTab===k?"tab-active":"tab-idle"}`} style={{flex:1}} onClick={()=>setChartTab(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{flex:1,padding:"20px"}}>
              {/* Bar chart */}
              {(()=>{
                const data = chartTab==="monthly"?MONTHLY:WEEKLY;
                const labels = chartTab==="monthly"?["O","N","D","J","F","M","A","M","J","J","A","S"]:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                const max = Math.max(...data);
                return(
                <div>
                  <div style={{display:"flex",alignItems:"flex-end",gap:chartTab==="monthly"?"3px":"6px",height:"140px",borderBottom:`1px solid rgba(0,212,255,0.1)`,paddingBottom:"6px",marginBottom:"6px"}}>
                    {data.map((v,i)=>(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",justifyContent:"flex-end"}}>
                        <div style={{fontSize:"9px",fontFamily:"'Courier New',monospace",color:i===data.length-1?GR:"rgba(240,236,224,0.4)",fontWeight:i===data.length-1?"700":"400"}}>{v}</div>
                        <div style={{width:"100%",background:i===data.length-1?`linear-gradient(${GR},${CY})`:`linear-gradient(${G}88,${G}44)`,borderRadius:"1px 1px 0 0",height:`${(v/max)*120}px`,minHeight:"3px",transition:`height 0.8s ${i*0.05}s ease`}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:chartTab==="monthly"?"3px":"6px"}}>
                    {labels.map((l,i)=>(
                      <div key={i} style={{flex:1,textAlign:"center",fontSize:"8px",color:i===data.length-1?"rgba(74,222,128,0.7)":"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>{l}</div>
                    ))}
                  </div>
                  <div style={{marginTop:"16px",display:"flex",justifyContent:"space-between",fontSize:"11px"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"20px",fontWeight:"900",color:GR,fontFamily:"'Playfair Display',serif"}}>{data[data.length-1]}</div>
                      <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>current</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"20px",fontWeight:"900",color:CY,fontFamily:"'Playfair Display',serif"}}>{Math.round(data.reduce((a,b)=>a+b,0)/data.length)}</div>
                      <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>average</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"20px",fontWeight:"900",color:R,fontFamily:"'Playfair Display',serif"}}>{Math.max(...data)}</div>
                      <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>peak</div>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ── REPORT CTAs ── */}
        <div style={{display:"flex",gap:"12px",flexWrap:"wrap",justifyContent:"center",padding:"20px 0 32px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" className="btn-gold" style={{fontSize:"13px",padding:"14px 36px"}}>💬 Report on WhatsApp</a>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cy" style={{fontSize:"13px",padding:"13px 32px"}}>📲 Report on Telegram</a>
          <a href="/report" style={{fontSize:"11px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace",padding:"14px 16px",letterSpacing:"0.1em",border:"1px solid rgba(0,212,255,0.12)"}}>WEB FORM →</a>
        </div>

        {/* ── AGENCIES ── */}
        <div id="agencies" style={{padding:"32px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"12px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>ROUTE_TABLE()</span>
            <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.1)`}}/>
            <h2 style={{fontSize:"20px",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.9)",flexShrink:0}}>Ethiopian accountability bodies</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"10px"}}>
            {[
              {name:"FEACC",       am:"ፀረሙስና ኮሚሽን", phone:"959",  c:"#4ade80",type:"All corruption"},
              {name:"EHRC",        am:"ሰብዓዊ መብቶች",  phone:"1488", c:"#60a5fa",type:"Human rights"},
              {name:"Ombudsman",   am:"ዕርቀ ሚካሄ",    phone:"6060", c:PU,       type:"Abuse of power"},
              {name:"Fed. Police", am:"ፌደራል ፖሊስ",  phone:"911",  c:"#f87171",type:"Criminal"},
              {name:"OFAG",        am:"ዋና ኦዲተር",    phone:"—",    c:"#fb923c",type:"Public funds"},
            ].map((a,i)=>(
              <div key={i} className="panel" style={{padding:"18px",borderLeft:`3px solid ${a.c}`}}>
                <div style={{fontSize:"8px",color:"rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginBottom:"5px"}}>AGENCY</div>
                <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.9)",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{a.name}</div>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",marginBottom:"12px"}}>{a.am}</div>
                <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",marginBottom:"10px"}}>{a.type}</div>
                <div style={{fontSize:"22px",fontWeight:"900",color:a.c,fontFamily:"'Courier New',monospace"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{maxWidth:"760px",paddingBottom:"40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"12px",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>FAQ.execute()</span>
            <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.1)`}}/>
            <h2 style={{fontSize:"20px",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.9)",flexShrink:0}}>Your questions answered</h2>
          </div>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.07)`}}>
            {FAQS.map((f,i)=>(
              <div key={i} className="faq-row" onClick={()=>setFaq(faq===i?null:i)}>
                <div style={{padding:"16px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"15px",fontWeight:"700",color:faq===i?G:"rgba(240,236,224,0.85)",fontFamily:"'Playfair Display',serif",paddingRight:"20px",transition:"color 0.2s"}}>{f.q}</span>
                  <span style={{color:faq===i?CY:G,fontSize:"20px",flexShrink:0,transition:"transform 0.2s",display:"inline-block",transform:faq===i?"rotate(45deg)":"none",fontWeight:"300"}}>+</span>
                </div>
                {faq===i&&<div style={{paddingBottom:"16px"}}>
                  <div style={{height:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"12px"}}/>
                  <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85"}}>{f.a}</p>
                </div>}
              </div>
            ))}
          </div>
          <div style={{marginTop:"16px",display:"flex",gap:"16px"}}>
            <a href="/faq" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>Full FAQ (20 questions) →</a>
            <a href="/transparency" style={{fontSize:"10px",color:`rgba(201,168,76,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>Transparency wall →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:5,borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"44px 40px 28px",background:"rgba(0,0,0,0.92)"}}>
        <div style={{maxWidth:"1400px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"32px",marginBottom:"28px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0"}}>
              <div style={{width:"3px",height:"36px",background:G,marginRight:"16px",flexShrink:0}}/>
              <div>
                <div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU INTEL</div>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",marginTop:"2px",letterSpacing:"0.15em"}}>ሳፉ · MORAL ORDER · ETHIOPIA</div>
                <div style={{fontSize:"9px",color:"rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",marginTop:"6px"}}>FEACC: 959 · EHRC: 1488 · POLICE: 911</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"40px",flexWrap:"wrap"}}>
              {[
                ["PLATFORM",   [["/"," Home"],["/transparency","Transparency"],["/report","File a Report"],["/analytics","Analytics"],["/sms","WhatsApp & Telegram"]]],
                ["LANGUAGES",  [["/am","አማርኛ (Amharic)"],["/or","Oromiffa"],["/ti","ትግርኛ (Tigrinya)"]]],
                ["ABOUT",      [["/about","About SAFUU"],["/faq","FAQ"],["/partners","Partners"],["/press","Press Kit"],["/donate","Support"],["/privacy","Privacy"],["/changelog","Changelog"]]],
                ["DEVELOPERS", [["/backend","Backend Setup"],["/api-docs","API Reference"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://wa.me/251911000000","WhatsApp"],["https://t.me/SafuuEthBot","Telegram"]]],
              ].map(([col,links])=>(
                <div key={col}>
                  <div style={{fontSize:"8px",color:"rgba(201,168,76,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>{col}</div>
                  {links.map(([h,l])=>(
                    <div key={l} style={{marginBottom:"8px"}}>
                      <a href={h} target={h.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="lnk" style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",transition:"color 0.2s"}}>{l}</a>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.06)`,paddingTop:"18px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"9px",color:"rgba(0,212,255,0.2)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · All data aggregated and anonymized · No personal information displayed</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.2)",fontFamily:"'Courier New',monospace"}}>{date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
