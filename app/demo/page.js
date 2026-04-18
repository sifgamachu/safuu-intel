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

// ── Animated count ───────────────────────────────────────────────────────────
function useCount(target, ms=1800) {
  const [v,setV]=useState(0);
  useEffect(()=>{
    let s=null;
    const f=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/ms,1);setV(Math.floor((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(f);};
    requestAnimationFrame(f);
  },[target]);
  return v;
}

// ── Threshold Ring ───────────────────────────────────────────────────────────
function Ring({val,max,color,size=88}) {
  const [w,setW]=useState(0);
  useEffect(()=>{setTimeout(()=>setW(val/max),300);},[]);
  const r=34,c2=2*Math.PI*r,dash=w*c2;
  return(
    <svg width={size} height={size} viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
      <circle cx="44" cy="44" r={r} fill="none" stroke={w>=1?R:color} strokeWidth="7"
        strokeDasharray={`${dash} ${c2}`} strokeDashoffset={c2/4} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s ease"}}/>
      <text x="44" y="40" textAnchor="middle" fill={w>=1?R:color} fontSize="15" fontWeight="900" fontFamily="monospace">{val}</text>
      <text x="44" y="54" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">/{max}</text>
    </svg>
  );
}

// ═══ DATA ═══════════════════════════════════════════════════════════════════
const FEED_POOL = [
  {office:"Ministry of Transport",       region:"Addis Ababa", type:"Procurement Bribery", lang:"AM", sev:3},
  {office:"Customs Authority",           region:"Dire Dawa",   type:"Customs Extortion",   lang:"OR", sev:3},
  {office:"Land Administration Bureau", region:"Bahir Dar",   type:"Land Fraud",           lang:"AM", sev:3},
  {office:"Regional Health Bureau",      region:"Hawassa",     type:"Healthcare Theft",     lang:"TI", sev:2},
  {office:"Federal Police Station",      region:"Mekelle",     type:"Police Extortion",     lang:"TI", sev:2},
  {office:"Education Department",        region:"Jimma",       type:"Bribery",              lang:"OR", sev:2},
  {office:"Federal Tax Authority",       region:"Addis Ababa", type:"Tax Extortion",        lang:"AM", sev:2},
  {office:"Water & Irrigation Bureau",  region:"Hawassa",     type:"Procurement Fraud",    lang:"WO", sev:1},
  {office:"Municipality Housing Office",region:"Addis Ababa", type:"Land Fraud",           lang:"AM", sev:2},
  {office:"Regional Court",             region:"Adama",       type:"Court Corruption",     lang:"OR", sev:3},
  {office:"Agriculture Bureau",         region:"Bahir Dar",   type:"Embezzlement",         lang:"AM", sev:2},
  {office:"Immigration & Nationality",  region:"Addis Ababa", type:"Document Bribery",     lang:"SO", sev:1},
  {office:"Procurement Authority",      region:"Addis Ababa", type:"Tender Fraud",         lang:"AM", sev:3},
  {office:"Regional Finance Bureau",    region:"Semera",      type:"Fund Misuse",          lang:"AF", sev:2},
  {office:"Construction Office",        region:"Oromia",      type:"Contract Bribery",     lang:"OR", sev:2},
];

const OFFICES = [
  {name:"Ministry of Transport",     region:"Addis Ababa", reports:48, type:"Procurement"},
  {name:"Customs Authority",         region:"Dire Dawa",   reports:34, type:"Extortion"},
  {name:"Land Administration",       region:"Amhara",      reports:29, type:"Land Fraud"},
  {name:"Federal Tax Authority",     region:"Addis Ababa", reports:22, type:"Tax"},
  {name:"Municipal Housing Office",  region:"Addis Ababa", reports:19, type:"Land Fraud"},
  {name:"Regional Health Bureau",    region:"Sidama",      reports:16, type:"Theft"},
  {name:"Education Department",      region:"Oromia",      reports:14, type:"Bribery"},
  {name:"Federal Police HQ",         region:"Addis Ababa", reports:12, type:"Extortion"},
];

const PENDING = [
  {id:"ETH-007",office:"Federal Tax Authority",    region:"Adama",   type:"Tax Extortion",    reports:11,threshold:15,since:"Jan 2026"},
  {id:"ETH-004",office:"Regional Health Bureau",   region:"Hawassa", type:"Healthcare Theft", reports:9, threshold:15,since:"Feb 2026"},
  {id:"ETH-005",office:"Education Department",     region:"Jimma",   type:"Bribery",          reports:6, threshold:15,since:"Mar 2026"},
  {id:"ETH-006",office:"Federal Police Station",   region:"Mekelle", type:"Extortion",        reports:4, threshold:15,since:"Apr 2026"},
];

const TYPES = [
  {name:"Procurement Bribery", v:67, color:"#f87171"},
  {name:"Land Fraud",          v:48, color:G},
  {name:"Customs Extortion",   v:34, color:CY},
  {name:"Tax Evasion",         v:28, color:PU},
  {name:"Court Corruption",    v:22, color:"#fb923c"},
  {name:"Police Extortion",    v:19, color:"#60a5fa"},
  {name:"Healthcare Theft",    v:15, color:GR},
];

const MONTHLY = [8,12,16,22,29,34,45,52,58,62,68,73];
const MONTHS  = ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];
const SEV_C   = {1:CY,2:G,3:R};
const SEV_L   = {1:"LOW",2:"MED",3:"HIGH"};

const FAQS = [
  {q:"Is my identity truly protected?",   a:"Yes. SAFUU never stores your Telegram ID, or real name. A one-way SHA-256 hash is the only derivative — mathematically irreversible. Not even administrators can identify you."},
  {q:"What happens after I submit?",       a:"Claude AI categorizes severity and type. Evidence is forensically verified. The report is auto-routed to the correct Ethiopian agency. Reports cluster — at threshold, the official's name is publicly disclosed."},
  {q:"How does name disclosure work?",    a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed and formally escalated to FEACC or relevant authority."},
  {q:"Which languages are supported?",    a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages are auto-transcribed by Whisper AI."},
];

// ═══ MAIN ══════════════════════════════════════════════════════════════════
export default function Safuu() {
  const [scrolled, setScrolled] = useState(false);
  const [feed,     setFeed]     = useState(()=>FEED_POOL.slice(0,10).map((f,i)=>({...f,id:i,ts:Date.now()-i*52000})));
  const [total,    setTotal]    = useState(233);
  const [today,    setToday]    = useState(12);
  const [faq,      setFaq]      = useState(null);
  const [chartView,setChart]    = useState("monthly");  // monthly|weekly
  const nextId = useRef(200);
  const date = new Date().toISOString().slice(0,10);
  const [tick, setTick] = useState(0);

  const t233=useCount(total,2000); const t139=useCount(139,2200);
  const t3  =useCount(3,1400);     const t15 =useCount(15,1600);

  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn);},[]);

  // New tip every 7s
  useEffect(()=>{
    const t=setInterval(()=>{
      const tmpl=FEED_POOL[Math.floor(Math.random()*FEED_POOL.length)];
      setFeed(f=>[{...tmpl,id:nextId.current++,ts:Date.now(),isNew:true},...f.slice(0,13)]);
      if(Math.random()>0.5)setTotal(n=>n+1);
      setToday(n=>n+1);
    },7000);
    return()=>clearInterval(t);
  },[]);

  // Tick for relative timestamps
  useEffect(()=>{const t=setInterval(()=>setTick(n=>n+1),8000);return()=>clearInterval(t);},[]);

  const fmtAgo=ts=>{
    const s=Math.floor((Date.now()-ts)/1000);
    if(s<15)return"just now";if(s<60)return`${s}s ago`;
    if(s<3600)return`${Math.floor(s/60)}m ago`;return`${Math.floor(s/3600)}h ago`;
  };

  const WEEKLY=[12,9,15,18,11,20,today];
  const WDAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Today"];
  const chartData=chartView==="monthly"?MONTHLY:WEEKLY;
  const chartLabels=chartView==="monthly"?MONTHS:WDAYS;
  const chartMax=Math.max(...chartData);

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none} html{scroll-behavior:smooth}
        @keyframes marquee  {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan     {0%{top:-3%}100%{top:104%}}
        @keyframes slidein  {from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse-g  {0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes drift    {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:12px 28px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.25)}
        .btn-cy{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:11px 24px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-cy:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .feed-row{display:grid;grid-template-columns:80px 1fr 1fr;gap:12px;align-items:center;padding:14px 24px;border-bottom:1px solid rgba(0,212,255,0.06);transition:background 0.15s}
        .feed-row:hover{background:rgba(0,212,255,0.035)}
        .feed-new{animation:slidein 0.5s ease;background:rgba(0,212,255,0.055)!important}
        .bar-row{padding:12px 24px;transition:background 0.15s}
        .bar-row:hover{background:rgba(255,255,255,0.025)}
        .ctab{padding:8px 20px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.14em;cursor:pointer;border:none;text-transform:uppercase;transition:all 0.15s}
        .ctab-on{background:rgba(0,212,255,0.1);color:${CY};border-bottom:2px solid ${CY}}
        .ctab-off{background:transparent;color:rgba(240,236,224,0.3);border-bottom:1px solid rgba(0,212,255,0.07)}
        .ctab:hover{color:${CY}}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.02)}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:900px){.two-col{grid-template-columns:1fr!important}}
        @media(max-width:640px){.hide-mob{display:none!important}nav{padding:0 16px!important}.sec{padding:28px 16px!important}.feed-row{grid-template-columns:70px 1fr!important}.hide-sm{display:none!important}}
      `}</style>

      <GeezRain/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(0,212,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.012) 1px,transparent 1px)`,backgroundSize:"52px 52px"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 25%,rgba(3,5,7,0.82) 100%)"}}/>
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${CY}14,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* TICKER */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>⚠ LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● SYSTEM ONLINE · ${date}`,`● ${total} TIPS · ${today} TODAY`,"● IDENTITY :: NULL","● ሙስና ይጥፋእ · JUSTICE WILL PREVAIL","● AES-256-GCM ACTIVE","● WHATSAPP @SafuuIntelBot","● Malaanmmaltummaa Dhabamu","● SAFUU.NET · COLLABORATIVE INTELLIGENCE"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DEMO BANNER */}
      <div style={{position:"relative",zIndex:10,background:"rgba(201,168,76,0.12)",borderBottom:"1px solid rgba(201,168,76,0.35)",padding:"10px 40px",display:"flex",alignItems:"center",gap:"14px"}}>
        <div style={{width:"8px",height:"8px",background:"#c9a84c",transform:"rotate(45deg)",flexShrink:0}}/>
        <span style={{fontSize:"11px",color:"rgba(201,168,76,0.9)",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",fontWeight:"700"}}>
          DEMONSTRATION MODE — This is a preview of how the live dashboard will look once real reports are submitted. All data shown here is simulated for illustration purposes only.
        </span>
        <a href="/" style={{marginLeft:"auto",fontSize:"10px",color:"rgba(0,212,255,0.6)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",flexShrink:0,textDecoration:"underline"}}>← VIEW LIVE DASHBOARD</a>
      </div>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.88)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.14)":"rgba(0,212,255,0.06)"}`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",transition:"all 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"34px",height:"34px",border:`1px solid rgba(201,168,76,0.28)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",background:"rgba(201,168,76,0.04)"}}>⚖️</div>
          <div>
            <div style={{fontSize:"17px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",lineHeight:1,letterSpacing:"0.04em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:"#c9a84c",letterSpacing:"0.28em",fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.8}}>DEMO MODE · NOT LIVE DATA</div>
          </div>
        </div>
        <div className="hide-mob" style={{display:"flex",gap:"24px",alignItems:"center"}}>
          {[["#feed","LIVE FEED"],["#building","BUILDING"],["#agencies","AGENCIES"],["/faq","FAQ"],["/transparency","WALL"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.42)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer" className="btn-cy" style={{padding:"8px 16px",fontSize:"10px"}}></a>
          <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer" className="btn-gold" style={{padding:"8px 18px",fontSize:"10px"}}>📲 Telegram</a>
        </div>
      </nav>

      {/* ══ HERO — compact ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"40px 40px 32px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
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
          {/* 4 live counters */}
          <div style={{display:"flex",gap:"1px",background:"rgba(0,212,255,0.07)",borderRadius:"2px",overflow:"hidden",flexShrink:0}}>
            {[{v:t233,l:"Tips processed",c:G},{v:t139,l:"AI-verified",c:CY},{v:t3,l:"Disclosed",c:R},{v:today,l:"Today",c:GR}].map((s,i)=>(
              <div key={i} style={{background:"#030507",padding:"14px 22px",textAlign:"center",minWidth:"84px"}}>
                <div style={{fontSize:"clamp(24px,3vw,36px)",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.28)",fontFamily:"'Courier New',monospace",marginTop:"3px",letterSpacing:"0.08em"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 1 — LIVE FEED  (full width)
      ══════════════════════════════════════════ */}
      <section id="feed" className="sec" style={{position:"relative",zIndex:5,padding:"0",borderBottom:`1px solid rgba(0,212,255,0.1)`}}>
        {/* Section label bar */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 40px",background:"rgba(0,0,0,0.4)",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
          <span style={{width:"8px",height:"8px",borderRadius:"50%",background:GR,animation:"pulse-g 1.8s infinite",display:"inline-block",flexShrink:0}}/>
          <span style={{fontSize:"9px",color:GR,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>LIVE INTAKE FEED</span>
          <div style={{flex:1,height:"1px",background:"rgba(74,222,128,0.12)"}}/>
          <span style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>{total} total · no names · no identifiers · office + region only</span>
        </div>

        {/* Column headers */}
        <div style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr",gap:"12px",padding:"8px 24px",background:"rgba(0,0,0,0.3)"}}>
          {["TIME","OFFICE","REGION & TYPE"].map((h,i)=>(
            <div key={h} style={{fontSize:"8px",color:"rgba(0,212,255,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.16em"}}>{h}</div>
          ))}
        </div>

        {/* Feed rows */}
        {feed.map((r,i)=>(
          <div key={r.id} className={`feed-row${i===0?" feed-new":""}`}>
            {/* Time + severity */}
            <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
              <div style={{fontSize:"10px",fontFamily:"'Courier New',monospace",color:i===0?GR:"rgba(240,236,224,0.28)",fontWeight:i===0?"700":"400"}}>{i===0?"now →":fmtAgo(r.ts)}</div>
              <div style={{fontSize:"8px",fontFamily:"'Courier New',monospace",padding:"2px 7px",display:"inline-block",width:"fit-content",border:`1px solid ${SEV_C[r.sev]}44`,color:SEV_C[r.sev],background:`${SEV_C[r.sev]}11`,letterSpacing:"0.08em"}}>{SEV_L[r.sev]}</div>
            </div>
            {/* Office */}
            <div style={{fontSize:"14px",fontWeight:"600",color:i===0?"rgba(240,236,224,0.95)":"rgba(240,236,224,0.72)",fontFamily:"'Playfair Display',serif"}}>{r.office}</div>
            {/* Region + type */}
            <div className="hide-sm">
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",marginBottom:"2px"}}>{r.region}</div>
              <div style={{fontSize:"11px",color:"rgba(240,236,224,0.32)"}}>{r.type}</div>
            </div>

          </div>
        ))}
        <div style={{padding:"12px 24px",textAlign:"center",fontSize:"10px",color:"rgba(240,236,224,0.15)",fontFamily:"'Courier New',monospace",background:"rgba(0,0,0,0.2)"}}>
          // DEMO DATA — simulated entries showing how real submissions will appear · not actual reports
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — TOP OFFICES + THRESHOLD CASES
      ══════════════════════════════════════════ */}
      <section className="sec two-col" style={{position:"relative",zIndex:5,padding:"40px 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",maxWidth:"1300px",margin:"0 auto",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>

        {/* TOP OFFICES */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>OFFICES BY REPORT VOLUME</span>
            <div style={{flex:1,height:"1px",background:"rgba(184,32,32,0.15)"}}/>
          </div>
          {OFFICES.map((o,i)=>{
            const pct=(o.reports/48)*100;
            const color=i<3?R:G;
            return(
            <div key={i} className="bar-row">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"6px"}}>
                <div>
                  <span style={{fontSize:"13px",fontWeight:"600",color:i<3?"rgba(240,236,224,0.9)":"rgba(240,236,224,0.65)"}}>{o.name}</span>
                  <span style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",marginLeft:"8px"}}>{o.region}</span>
                </div>
                <span style={{fontSize:"15px",fontWeight:"900",color,fontFamily:"'Courier New',monospace"}}>{o.reports}</span>
              </div>
              <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:color,transition:`width 0.9s ${i*0.08}s ease`,borderRadius:"2px"}}/>
              </div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.22)",marginTop:"3px",fontFamily:"'Courier New',monospace"}}>{o.type}</div>
            </div>
          );})}
          <div style={{marginTop:"16px",padding:"0 24px"}}>
            <a href="/transparency" style={{fontSize:"10px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>View transparency wall →</a>
          </div>
        </div>

        {/* CASES BUILDING TOWARD THRESHOLD */}
        <div id="building">
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>BUILDING TOWARD DISCLOSURE</span>
            <div style={{flex:1,height:"1px",background:"rgba(201,168,76,0.15)"}}/>
          </div>
          <div style={{fontSize:"11px",color:"rgba(240,236,224,0.28)",fontFamily:"'Courier New',monospace",lineHeight:"1.7",marginBottom:"20px",padding:"0 4px"}}>
            Name is withheld until {"{threshold}"} verified reports. Only office and region are shown below — protecting against false accusations while evidence accumulates.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {PENDING.map((p,i)=>{
              const pct=(p.reports/p.threshold)*100;
              return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px",background:"rgba(0,0,0,0.35)",border:`1px solid rgba(0,212,255,0.08)`,borderLeft:`2px solid ${pct>60?R:G}`}}>
                <Ring val={p.reports} max={p.threshold} color={pct>60?R:G} size={88}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:"9px",color:"rgba(0,212,255,0.38)",fontFamily:"'Courier New',monospace",marginBottom:"4px"}}>{p.id} · since {p.since}</div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.82)",marginBottom:"2px",fontFamily:"'Playfair Display',serif"}}>{p.office}</div>
                  <div style={{fontSize:"11px",color:"rgba(240,236,224,0.38)",marginBottom:"8px"}}>{p.region} · {p.type}</div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden",marginBottom:"5px"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct>60?"linear-gradient(90deg,"+G+","+R+")":G,transition:`width 1.2s ${i*0.15}s ease`,borderRadius:"2px"}}/>
                  </div>
                  <div style={{fontSize:"9px",color:pct>60?"rgba(220,80,80,0.6)":"rgba(201,168,76,0.45)",fontFamily:"'Courier New',monospace"}}>
                    {p.threshold-p.reports} more reports needed to disclose
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — TREND CHART + TYPE BREAKDOWN
      ══════════════════════════════════════════ */}
      <section className="sec two-col" style={{position:"relative",zIndex:5,padding:"40px 40px",display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:"24px",maxWidth:"1300px",margin:"0 auto",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>

        {/* TREND CHART */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>INTAKE VOLUME OVER TIME</span>
            <div style={{flex:1}}/>
            {/* Toggle */}
            <div style={{display:"flex"}}>
              {[["monthly","MONTHLY"],["weekly","THIS WEEK"]].map(([k,l])=>(
                <button key={k} className={`ctab ${chartView===k?"ctab-on":"ctab-off"}`} onClick={()=>setChart(k)}>{l}</button>
              ))}
            </div>
          </div>
          {/* Chart */}
          <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"160px",paddingBottom:"6px",borderBottom:`1px solid rgba(0,212,255,0.07)`,marginBottom:"8px"}}>
            {chartData.map((v,i)=>{
              const isLast=i===chartData.length-1;
              return(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",justifyContent:"flex-end"}}>
                <div style={{fontSize:"9px",fontFamily:"'Courier New',monospace",color:isLast?GR:"rgba(240,236,224,0.35)",fontWeight:isLast?"700":"400"}}>{isLast||v===chartMax?v:""}</div>
                <div style={{width:"100%",borderRadius:"2px 2px 0 0",height:`${(v/chartMax)*148}px`,minHeight:"4px",
                  background:isLast?`linear-gradient(${GR},${CY}44)`:v===chartMax?`linear-gradient(${R}cc,${R}44)`:`linear-gradient(${G}88,${G}22)`,
                  transition:`height 0.8s ${i*0.04}s ease`}}/>
              </div>
            );})}
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            {chartLabels.map((l,i)=>(
              <div key={i} style={{flex:1,textAlign:"center",fontSize:"8px",color:i===chartData.length-1?"rgba(74,222,128,0.65)":"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>{l}</div>
            ))}
          </div>
          {/* Summary stats */}
          <div style={{display:"flex",gap:"0",marginTop:"20px",background:"rgba(0,0,0,0.35)",border:`1px solid rgba(0,212,255,0.08)`}}>
            {[
              {v:chartData[chartData.length-1],l:chartView==="monthly"?"this month":"today",c:GR},
              {v:Math.round(chartData.reduce((a,b)=>a+b,0)/chartData.length),l:"average",c:CY},
              {v:Math.max(...chartData),l:"peak",c:R},
            ].map((s,i)=>(
              <div key={i} style={{flex:1,padding:"14px 12px",textAlign:"center",borderRight:i<2?`1px solid rgba(0,212,255,0.08)`:"none"}}>
                <div style={{fontSize:"24px",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",marginTop:"3px"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TYPE BREAKDOWN */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
            <div style={{width:"6px",height:"6px",background:"#f87171",transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:"#f87171",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>BY CORRUPTION TYPE</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {TYPES.map((t,i)=>(
              <div key={i} className="bar-row" style={{padding:"4px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <div style={{width:"8px",height:"8px",background:t.color,borderRadius:"1px",flexShrink:0}}/>
                    <span style={{fontSize:"12px",color:"rgba(240,236,224,0.68)"}}>{t.name}</span>
                  </div>
                  <span style={{fontSize:"13px",fontWeight:"700",color:t.color,fontFamily:"'Courier New',monospace"}}>{t.v}</span>
                </div>
                <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(t.v/67)*100}%`,background:t.color,transition:`width 0.8s ${i*0.07}s ease`,borderRadius:"2px"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"20px",padding:"12px 16px",background:"rgba(0,0,0,0.3)",border:`1px solid rgba(0,212,255,0.07)`}}>
            <div style={{fontSize:"8px",color:"rgba(0,212,255,0.35)",fontFamily:"'Courier New',monospace",marginBottom:"8px",letterSpacing:"0.12em"}}>CHANNEL SPLIT</div>
            <div style={{display:"flex",gap:"0",height:"8px",borderRadius:"2px",overflow:"hidden"}}>
              <div title="Telegram 100%" style={{width:"100%",background:"#229ED9",height:"100%"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:"6px",fontSize:"9px",fontFamily:"'Courier New',monospace"}}>
              <span style={{color:`rgba(201,168,76,0.6)`}}> 58%</span>
              <span style={{color:`rgba(0,212,255,0.55)`}}>📲 Telegram 42%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — REPORT CTAs (full width, prominent)
      ══════════════════════════════════════════ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"48px 40px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
        <div style={{maxWidth:"1300px",margin:"0 auto",display:"flex",alignItems:"center",gap:"32px",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:"240px"}}>
            <h2 style={{fontSize:"clamp(20px,3vw,30px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.9)",marginBottom:"6px"}}>
              Know something? <span style={{color:G,fontStyle:"italic"}}>Report it.</span>
            </h2>
            <p style={{fontSize:"13px",color:"rgba(240,236,224,0.38)",fontFamily:"'Courier New',monospace",lineHeight:"1.7"}}>
              Your identity is never stored · SHA-256 one-way hash · 11 Ethiopian languages · Voice supported
            </p>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer" className="btn-gold" style={{fontSize:"13px",padding:"14px 32px"}}>💬 Report on Telegram</a>
            <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer" className="btn-cy" style={{fontSize:"13px",padding:"13px 28px"}}>📲 Report on Telegram</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — AGENCIES
      ══════════════════════════════════════════ */}
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
            <div key={i} style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.08)`,padding:"18px",borderLeft:`3px solid ${a.c}`,transition:"border-color 0.2s"}}>
              <div style={{fontSize:"8px",color:"rgba(0,212,255,0.28)",fontFamily:"'Courier New',monospace",marginBottom:"4px",letterSpacing:"0.1em"}}>AGENCY</div>
              <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.88)",fontFamily:"'Playfair Display',serif",marginBottom:"2px"}}>{a.name}</div>
              <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",marginBottom:"10px"}}>{a.am}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.22)",marginBottom:"10px"}}>{a.type}</div>
              <div style={{fontSize:"22px",fontWeight:"900",color:a.c,fontFamily:"'Courier New',monospace"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — FAQ
      ══════════════════════════════════════════ */}
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
          <a href="/faq" className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Full FAQ (20 questions) →</a>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:"rgba(201,168,76,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Transparency wall →</a>
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
                ["PLATFORM",   [["/"," Home"],["/transparency","Transparency"],["/report","File a Report"],["/analytics","Analytics"],["/sms","Telegram"]]],
                ["LANGUAGES",  [["/am","አማርኛ (Amharic)"],["/or","Oromiffa"],["/ti","ትግርኛ (Tigrinya)"]]],
                ["ABOUT",      [["/about","About"],["/faq","FAQ"],["/partners","Partners"],["/press","Press"],["/donate","Support"],["/privacy","Privacy"],["/changelog","Changelog"]]],
                ["DEVELOPERS", [["/backend","Backend Setup"],["/api-docs","API Reference"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuIntelBot","Telegram"],["https://t.me/SafuuIntelBot","Telegram"]]],
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
            <span style={{fontSize:"9px",color:"rgba(0,212,255,0.18)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · All data aggregated and anonymized · No personal information displayed below threshold</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.18)",fontFamily:"'Courier New',monospace"}}>{date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
