'use client';
import { useState, useEffect, useRef } from "react";

// ── Ge'ez rain (amber-toned, atmospheric) ─────────────────────────────────────
function GeezRain() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const G = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ01";
    const cols = Math.floor(c.width / 20);
    const drops = Array.from({length:cols}, () => ({ y:Math.random()*-80, s:0.15+Math.random()*0.4 }));
    let id;
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.11)"; ctx.fillRect(0,0,c.width,c.height);
      drops.forEach((d,i) => {
        const ch = G[Math.floor(Math.random()*G.length)];
        const b = 0.04 + Math.random()*0.12;
        const isCyan = Math.random() > 0.97;
        ctx.fillStyle = isCyan ? `rgba(0,200,255,${b+0.05})` : `rgba(180,145,50,${b})`;
        ctx.font = `12px serif`;
        ctx.fillText(ch, i*20, d.y*20);
        d.y += d.s; if (d.y*20 > c.height+40) { d.y = -Math.random()*30; d.s = 0.15+Math.random()*0.4; }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.09, pointerEvents:"none" }}/>;
}

// ── Network node visualization (collaborative reporting) ──────────────────────
function NetworkCanvas() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth; c.height = c.offsetHeight;

    // Nodes represent anonymous reporters feeding into hub
    const hub = { x: c.width * 0.5, y: c.height * 0.48 };
    const nodeCount = 14;
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.5;
      const r = 80 + Math.random() * 110;
      return {
        x: hub.x + Math.cos(angle) * r,
        y: hub.y + Math.sin(angle) * r,
        r: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        active: Math.random() > 0.4,
        sending: Math.random() > 0.6,
        progress: Math.random(),
        color: Math.random() > 0.7 ? "#b82020" : Math.random() > 0.5 ? "#00d4ff" : "#c9a84c",
      };
    });

    let id;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const t = Date.now() / 1000;

      // Draw connection lines
      nodes.forEach(n => {
        if (!n.active) return;
        const alpha = 0.08 + Math.sin(n.pulse + t * n.speed) * 0.05;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.strokeStyle = n.color === "#b82020" ? `rgba(184,32,32,${alpha})` : `rgba(0,212,255,${alpha * 1.2})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Data packet traveling along line
        if (n.sending) {
          n.progress += 0.004;
          if (n.progress > 1) n.progress = 0;
          const px = n.x + (hub.x - n.x) * n.progress;
          const py = n.y + (hub.y - n.y) * n.progress;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.8;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // Hub — central intelligence node
      const hubPulse = Math.sin(t * 1.5) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,168,76,${hubPulse * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 26, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,168,76,${hubPulse * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#c9a84c";
      ctx.globalAlpha = hubPulse;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw reporter nodes
      nodes.forEach(n => {
        if (!n.active) return;
        const pulse = Math.sin(n.pulse + t * n.speed);
        const r = n.r + pulse * 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.5 + pulse * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        // Outer ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.15 + pulse * 0.1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block" }}/>;
}

// ── HUD corner brackets ────────────────────────────────────────────────────────
function HUDBrackets({ color = "#c9a84c", size = 16, children, style = {} }) {
  const b = { position:"absolute", width:size, height:size, borderColor:color, borderStyle:"solid" };
  return (
    <div style={{ position:"relative", ...style }}>
      <div style={{ ...b, top:0, left:0, borderWidth:"1px 0 0 1px" }}/>
      <div style={{ ...b, top:0, right:0, borderWidth:"1px 1px 0 0" }}/>
      <div style={{ ...b, bottom:0, left:0, borderWidth:"0 0 1px 1px" }}/>
      <div style={{ ...b, bottom:0, right:0, borderWidth:"0 1px 1px 0" }}/>
      {children}
    </div>
  );
}

// ── Scan badge ─────────────────────────────────────────────────────────────────
function ScanBadge({ label, value, color = "#00d4ff" }) {
  return (
    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"10px" }}>
      <div style={{ color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", marginBottom:"3px" }}>{label}</div>
      <div style={{ color, fontWeight:"700", letterSpacing:"0.08em" }}>{value}</div>
    </div>
  );
}

// ── Reveal ─────────────────────────────────────────────────────────────────────
function useReveal(t=0.1) {
  const ref = useRef(); const [v,setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:t});
    if(ref.current) o.observe(ref.current); return ()=>o.disconnect();
  },[]);
  return [ref,v];
}

// ── Counter ────────────────────────────────────────────────────────────────────
function useCount(target, active, ms=2200) {
  const [v,setV] = useState(0);
  useEffect(()=>{
    if(!active)return;
    let s=null;
    const f=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/ms,1);setV(Math.floor((1-Math.pow(1-p,4))*target));if(p<1)requestAnimationFrame(f);};
    requestAnimationFrame(f);
  },[target,active]);
  return v;
}

// ── Terminal line ──────────────────────────────────────────────────────────────
function TLine({ text, delay=0, color="#c9a84c", dim }) {
  const [s,setS] = useState(""); const [on,setOn] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setOn(true),delay);return()=>clearTimeout(t);},[delay]);
  useEffect(()=>{
    if(!on||s.length>=text.length)return;
    const t=setTimeout(()=>setS(text.slice(0,s.length+1)),24);return()=>clearTimeout(t);
  },[on,s,text]);
  return (
    <div style={{fontSize:"11px",lineHeight:"1.9",color:dim?"rgba(201,168,76,0.35)":color,fontFamily:"'Courier New',monospace",opacity:on?1:0,transition:"opacity 0.3s"}}>
      <span style={{color:"rgba(201,168,76,0.25)",marginRight:"10px"}}>›</span>{s}
      {s.length<text.length&&on&&<span style={{animation:"cur 0.8s steps(1) infinite"}}>_</span>}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TYPES = ["land fraud","procurement bribery","customs extortion","court corruption","tax evasion","nepotism","embezzlement","police extortion"];
const STATS = [
  {n:233,s:"+",l:"Tips Received",       d:"all anonymous"},
  {n:139,s:"", l:"AI-Verified Reports", d:"forensics confirmed"},
  {n:15, s:"+",l:"Officials on Record", d:"6 regions tracked"},
  {n:3,  s:"", l:"Active Investigations",d:"FEACC escalated"},
];
const PROCESS = [
  {n:"01",icon:"📲",title:"ANONYMOUS_INPUT()",    body:"Telegram voice or text. SMS from any phone. 11 Ethiopian languages. Zero identity stored — SHA-256 one-way hash only."},
  {n:"02",icon:"🔬",title:"AI_VERIFY(evidence)",  body:"EXIF forensics. Hive AI image detection at 94% accuracy. Whisper voice transcription. Claude categorizes severity."},
  {n:"03",icon:"⚖️",title:"ROUTE_TO(agency)",    body:"Auto-matched to FEACC, Police, Ombudsman, OFAG, or EHRC. No manual steps. No delays."},
  {n:"04",icon:"📊",title:"DISCLOSE_AT(threshold)",body:"City and office shown immediately. Full name publicly disclosed when verified reports reach the configured threshold."},
];
const SHIELDS = [
  {code:"SHA-256",   val:"One-way hash — irreversible",    icon:"🔐", c:"#c9a84c"},
  {code:"AES-256",   val:"GCM at rest — all fields",       icon:"🔒", c:"#00d4ff"},
  {code:"HIVE_AI",   val:"94% AI-image accuracy",          icon:"🤖", c:"#00d4ff"},
  {code:"LEDGER",    val:"Tamper-evident hash chain",       icon:"⛓️", c:"#c9a84c"},
  {code:"WHISPER",   val:"11 Ethiopian languages",          icon:"🗣️", c:"#00d4ff"},
  {code:"AUTOROUTE", val:"5 agencies — zero delay",         icon:"⚡", c:"#c9a84c"},
];
const AGENCIES = [
  {name:"FEACC",       am:"ፀረሙስና ኮሚሽን", phone:"959",  c:"#4ade80"},
  {name:"EHRC",        am:"ሰብዓዊ መብቶች",  phone:"1488", c:"#60a5fa"},
  {name:"Ombudsman",   am:"ዕርቀ ሚካሄ",    phone:"6060", c:"#a78bfa"},
  {name:"Fed. Police", am:"ፌደራል ፖሊስ",  phone:"911",  c:"#f87171"},
  {name:"OFAG",        am:"ዋና ኦዲተር",    phone:"—",    c:"#fb923c"},
];
const FAQS = [
  {q:"Is reporting truly anonymous?",   a:"Yes. SAFUU never stores your Telegram username, user ID, phone, or real name. One-way SHA-256 — impossible to reverse. Not even administrators can identify you."},
  {q:"What happens after I submit?",    a:"Claude AI categorizes type and severity. Evidence is forensically verified. The tip is auto-routed to the correct agency. Reports cluster — at threshold, name disclosed publicly."},
  {q:"How does name disclosure work?",  a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed on the transparency wall and formally flagged."},
  {q:"No smartphone — can I report?",  a:"SMS 21000. Format: SAFUU [Name] | [Office] | [What happened]. Any mobile phone. No internet needed. Same AI pipeline as Telegram."},
  {q:"Which languages are supported?",  a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice auto-transcribed by Whisper."},
];

const G = "#c9a84c";  // gold
const CY = "#00d4ff"; // cyan
const R  = "#b82020"; // red

// ═══════════════════════════════════════════
export default function Safuu() {
  const [statsOn,  setStats]  = useState(false);
  const [typeIdx,  setTIdx]   = useState(0);
  const [typed,    setTyped]  = useState("");
  const [phase,    setPhase]  = useState("typing");
  const [faq,      setFaq]    = useState(null);
  const [scrolled, setScroll] = useState(false);
  const statsRef = useRef();

  useEffect(()=>{
    const fn=()=>setScroll(window.scrollY>50);
    window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn);
  },[]);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStats(true);},{threshold:0.2});
    if(statsRef.current)o.observe(statsRef.current);return()=>o.disconnect();
  },[]);
  useEffect(()=>{
    const w=TYPES[typeIdx];
    if(phase==="typing"){
      if(typed.length<w.length){const t=setTimeout(()=>setTyped(w.slice(0,typed.length+1)),55);return()=>clearTimeout(t);}
      else{const t=setTimeout(()=>setPhase("pause"),2000);return()=>clearTimeout(t);}
    }else if(phase==="pause"){const t=setTimeout(()=>setPhase("erase"),300);return()=>clearTimeout(t);}
    else{
      if(typed.length>0){const t=setTimeout(()=>setTyped(typed.slice(0,-1)),22);return()=>clearTimeout(t);}
      else{setTIdx(i=>(i+1)%TYPES.length);setPhase("typing");}
    }
  },[typed,phase,typeIdx]);

  const date = new Date().toISOString().slice(0,10);

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"var(--font-body,sans-serif)",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        html{scroll-behavior:smooth}
        @keyframes cur     {0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes marquee {from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes drift   {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes scan    {0%{top:-3%}100%{top:104%}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes blipOn  {0%,90%{opacity:0.3}50%{opacity:1}}
        @keyframes sweepX  {0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}

        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:13px 32px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px)}
        .btn-outline{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:12px 28px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-outline:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .card-hud{background:rgba(0,212,255,0.03);border:1px solid rgba(0,212,255,0.12);transition:all 0.25s;position:relative;overflow:hidden}
        .card-hud::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.04),transparent);animation:sweepX 4s infinite;animation-timing-function:ease-in-out}
        .card-hud:hover{border-color:rgba(0,212,255,0.35);background:rgba(0,212,255,0.06);transform:translateY(-3px)}
        .card-gold{background:rgba(201,168,76,0.03);border:1px solid rgba(201,168,76,0.12);transition:all 0.25s}
        .card-gold:hover{border-color:rgba(201,168,76,0.3);background:rgba(201,168,76,0.06);transform:translateY(-3px)}
        .faq-row{border-bottom:1px solid rgba(201,168,76,0.1);cursor:pointer;transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.03)}
        .lnk:hover{color:${CY}!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}::-webkit-scrollbar-track{background:#000}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important}
          .hide-mob{display:none!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .process-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:540px){
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .process-grid{grid-template-columns:1fr!important}
          .shield-grid{grid-template-columns:1fr!important}
          .agency-grid{grid-template-columns:1fr 1fr!important}
          .section-pad{padding:60px 20px!important}
          .hero-pad{padding:60px 20px 40px!important}
          nav{padding:0 20px!important}
        }
        @media(max-width:600px){.stats-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>

      <GeezRain/>

      {/* Grid */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:`linear-gradient(rgba(0,212,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.015) 1px,transparent 1px)`,
        backgroundSize:"52px 52px"}}/>
      {/* Radial vignette */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 30%,rgba(3,5,7,0.75) 100%)"}}/>
      {/* Scan line */}
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",
        background:`linear-gradient(transparent,${CY}18,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* ── TICKER ── */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",
        borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",
          height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",
          letterSpacing:"0.2em",flexShrink:0}}>⚠ INTEL</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[
                  `● SYSTEM ONLINE · ${date}`,
                  "● IDENTITY_STORAGE :: NULL",
                  "● ሙስና ይጥፋእ · JUSTICE WILL PREVAIL",
                  "● AES-256-GCM ACTIVE",
                  "● ሙስናን ሪፖርት አድርጉ",
                  "● 233+ ANONYMOUS TIPS FILED",
                  "● Malaanmmaltummaa Dhabamu",
                  "● SAFUU.NET · COLLABORATIVE INTELLIGENCE",
                ].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",
                    color:j%2===0?`rgba(0,212,255,0.65)`:`rgba(201,168,76,0.55)`}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,
        background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.85)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${scrolled?"rgba(0,212,255,0.15)":"rgba(0,212,255,0.07)"}`,
        padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",
        height:"62px",transition:"all 0.3s"}}>

        {/* Logo with HUD corners */}
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <HUDBrackets color={G} size={18} style={{padding:"6px 8px"}}>
            <span style={{fontSize:"18px",lineHeight:1}}>⚖️</span>
          </HUDBrackets>
          <div>
            <div style={{fontSize:"18px",fontWeight:"900",color:"rgba(240,236,224,0.95)",
              fontFamily:"var(--font-display,serif)",lineHeight:1,letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",
              fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.6}}>INTEL v2.0 · SAFUU.NET</div>
          </div>
        </div>

        <div className="hide-mob" style={{display:"flex",gap:"32px",alignItems:"center"}}>
          {[["#how","PROCESS"],["#agencies","AGENCIES"],["#faq","FAQ"],["/transparency","WALL"],["/about","ABOUT"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.45)`,
              fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>

        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-gold">
          ⚖ REPORT NOW
        </a>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{position:"relative",zIndex:5,minHeight:"95vh",display:"flex",
        alignItems:"center",padding:"80px 40px 60px",WebkitFontSmoothing:"antialiased",overflow:"hidden"}}>

        {/* Cyan accent line — left edge */}
        <div style={{position:"absolute",left:0,top:"15%",bottom:"15%",width:"2px",
          background:`linear-gradient(transparent,${CY},transparent)`,opacity:0.4}}/>

        <div className="hero-grid" style={{maxWidth:"1180px",margin:"0 auto",width:"100%",
          display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center"}}>

          {/* LEFT — investigative headline */}
          <div style={{animation:"fadeUp 0.9s ease-out"}}>
            {/* Overline */}
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
              <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",
                letterSpacing:"0.25em",fontWeight:"700"}}>INTELLIGENCE REPORT · ETHIOPIA · {new Date().getFullYear()}</span>
              <div style={{flex:1,height:"1px",background:`rgba(184,32,32,0.25)`}}/>
            </div>

            {/* Headline */}
            <h1 style={{fontFamily:"var(--font-display,serif)",fontSize:"clamp(42px,5.5vw,76px)",
              fontWeight:"900",lineHeight:1.1,letterSpacing:"-0.02em",marginBottom:"28px"}}>
              <span style={{display:"block",color:"rgba(240,236,224,0.95)",marginBottom:"2px"}}>Corruption ends</span>
              <span style={{display:"block",color:G,fontStyle:"italic",marginBottom:"2px"}}>when people</span>
              <span style={{display:"block",color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
            </h1>

            {/* Typewriter flagged case */}
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"30px",
              padding:"10px 16px",background:"rgba(184,32,32,0.06)",
              borderLeft:`2px solid ${R}`,borderBottom:`1px solid rgba(184,32,32,0.2)`}}>
              <span style={{fontSize:"9px",color:"rgba(200,80,80,0.7)",fontFamily:"'Courier New',monospace",
                letterSpacing:"0.12em",flexShrink:0}}>FLAGGED:</span>
              <span style={{fontSize:"13px",color:"rgba(220,110,110,0.9)",fontFamily:"'Courier New',monospace",flex:1}}>
                {typed}<span style={{animation:"cur 0.8s steps(1) infinite"}}>_</span>
              </span>
              <span style={{fontSize:"8px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",flexShrink:0}}>ACTIVE</span>
            </div>

            <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85",
              marginBottom:"36px",maxWidth:"460px"}}>
              Anonymous tips verified by AI forensics. Every report sealed in a cryptographic ledger.
              Names disclosed when evidence reaches the threshold. Collaborative intelligence for Ethiopia.
            </p>

            <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"24px"}}>
              <a href="/report" className="btn-gold">
                ⚖ Report Online
              </a>
              <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-outline">
                Telegram Bot
              </a>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"32px"}}>
              <div style={{height:"1px",flex:1,background:"rgba(0,212,255,0.08)"}}/>
              <span style={{fontSize:"9px",color:"rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",flexShrink:0}}>OR SMS 21000 FROM ANY PHONE</span>
              <div style={{height:"1px",flex:1,background:"rgba(0,212,255,0.08)"}}/>
            </div>

            {/* Status indicators */}
            <div style={{display:"flex",gap:"0",background:"rgba(0,0,0,0.4)",
              border:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden"}}>
              {[
                {k:"SHA-256",v:"Identity null"},
                {k:"AES-256-GCM",v:"Encrypted"},
                {k:"11 languages",v:"Voice + text"},
              ].map((s,i)=>(
                <div key={i} style={{padding:"10px 16px",borderRight:i<2?`1px solid rgba(0,212,255,0.1)`:"none",flex:1}}>
                  <div style={{fontSize:"7px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",
                    letterSpacing:"0.15em",marginBottom:"2px"}}>{s.k}</div>
                  <div style={{fontSize:"9px",color:`rgba(0,212,255,0.75)`,fontFamily:"'Courier New',monospace"}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — network visualization */}
          <div style={{animation:"fadeUp 1.1s ease-out"}}>
            <HUDBrackets color={CY} size={20} style={{height:"420px",background:"rgba(0,0,0,0.3)"}}>
              <div style={{position:"absolute",top:"12px",left:"24px",right:"24px",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"8px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>
                  NETWORK · LIVE
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#4ade80",animation:"blipOn 2s infinite",display:"inline-block"}}/>
                  <span style={{fontSize:"8px",color:"#4ade80",fontFamily:"'Courier New',monospace"}}>233 NODES</span>
                </div>
              </div>

              <div style={{position:"absolute",inset:"32px 0 48px 0"}}>
                <NetworkCanvas/>
              </div>

              {/* Bottom data strip */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,
                borderTop:`1px solid rgba(0,212,255,0.15)`,padding:"10px 20px",
                display:"flex",gap:"20px",background:"rgba(0,0,0,0.4)"}}>
                <ScanBadge label="REPORTS" value="233+" color={G}/>
                <ScanBadge label="VERIFIED" value="139" color={CY}/>
                <ScanBadge label="REGIONS" value="6" color={CY}/>
                <ScanBadge label="STATUS" value="ACTIVE" color="#4ade80"/>
              </div>
            </HUDBrackets>

            {/* Terminal below network */}
            <div style={{marginTop:"16px",background:"rgba(0,0,0,0.7)",
              border:`1px solid rgba(201,168,76,0.15)`,padding:"16px 20px"}}>
              <TLine text="$ safuu --mode=anonymous --encrypt=AES256 --lang=am" delay={400}/>
              <TLine text="› Identity: NOT_STORED [ SHA-256 → irreversible ]" delay={1400}/>
              <TLine text="› Ledger: SEALED ✓  Encryption: AES-256-GCM ✓"    delay={2200}/>
              <TLine text="› ሙስናን ሪፖርት አድርጉ — Pipeline READY."              delay={3000} color="#4ade80"/>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section ref={statsRef} id="impact" style={{position:"relative",zIndex:5,
        borderTop:`1px solid rgba(0,212,255,0.1)`,borderBottom:`1px solid rgba(0,212,255,0.1)`,
        background:"rgba(0,0,0,0.6)"}}>
        <div style={{maxWidth:"1180px",margin:"0 auto",padding:"0 40px"}}>
          <div className="stats-grid" className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {STATS.map((s,i)=>{
              const [ref,vis]=useReveal(); const n=useCount(s.n,vis);
              return(
              <div key={i} ref={ref} style={{padding:"52px 32px",position:"relative",
                borderRight:i<3?`1px solid rgba(0,212,255,0.08)`:"none",
                opacity:vis?1:0,transform:vis?"none":"translateY(16px)",
                transition:`all 0.65s ${i*0.1}s ease`}}>
                {/* Cyan top accent */}
                <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:"1px",
                  background:`linear-gradient(90deg,transparent,${CY}55,transparent)`}}/>
                <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",
                  letterSpacing:"0.2em",marginBottom:"10px"}}>
                  0x{n.toString(16).toUpperCase().padStart(4,"0")}
                </div>
                <div style={{fontSize:"clamp(48px,5vw,68px)",fontWeight:"900",color:"rgba(240,236,224,0.95)",
                  fontFamily:"var(--font-display,serif)",lineHeight:1,marginBottom:"10px",letterSpacing:"-0.02em"}}>
                  {n.toLocaleString()}{s.s}
                </div>
                <div style={{fontSize:"12px",color:G,marginBottom:"4px",fontWeight:"600",
                  fontFamily:"'Courier New',monospace",letterSpacing:"0.05em"}}>{s.l}</div>
                <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>{s.d}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section id="how" style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"1180px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"60px",
            opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0,marginBottom:"4px"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",
              letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>PROCESS_FLOW()</span>
            <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
            <h2 style={{fontSize:"clamp(26px,3.5vw,40px)",fontWeight:"900",
              fontFamily:"var(--font-display,serif)",color:"rgba(240,236,224,0.95)",
              letterSpacing:"-0.01em",flexShrink:0}}>Four steps to accountability</h2>
          </div>
          );})()}

          <div className="process-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"12px"}}>
            {PROCESS.map((s,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} className="card-hud" style={{padding:"32px 28px",
                opacity:v?1:0,transform:v?"none":"translateY(20px)",
                transition:`all 0.65s ${i*0.12}s ease`}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
                  <span style={{fontSize:"8px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",
                    letterSpacing:"0.2em"}}>{s.n}/04</span>
                  <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
                  <span style={{fontSize:"18px"}}>{s.icon}</span>
                </div>
                <div style={{fontSize:"11px",fontWeight:"700",color:CY,fontFamily:"'Courier New',monospace",
                  marginBottom:"14px",letterSpacing:"0.04em"}}>{s.title}</div>
                <div style={{fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8"}}>{s.body}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════ PULL QUOTE ══════════════════ */}
      <div style={{position:"relative",zIndex:5,overflow:"hidden",
        background:`linear-gradient(135deg,rgba(201,168,76,0.04),rgba(0,0,0,0),rgba(0,212,255,0.02))`,
        borderTop:`1px solid ${G}22`,borderBottom:`1px solid ${G}22`,padding:"72px 40px"}}>
        <div style={{position:"absolute",right:"8%",top:"50%",transform:"translateY(-50%)",
          fontSize:"280px",color:`rgba(201,168,76,0.04)`,fontFamily:"var(--font-display,serif)",
          lineHeight:1,pointerEvents:"none",userSelect:"none"}}>⚖</div>
        {(()=>{const [r,v]=useReveal();return(
        <div ref={r} style={{maxWidth:"780px",margin:"0 auto",position:"relative",
          opacity:v?1:0,transform:v?"none":"translateY(20px)",transition:"all 0.8s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px"}}>
            <div style={{width:"32px",height:"1px",background:G}}/>
            <span style={{fontSize:"9px",color:`rgba(201,168,76,0.5)`,fontFamily:"'Courier New',monospace",
              letterSpacing:"0.2em"}}>INTELLIGENCE BRIEF</span>
          </div>
          <p style={{fontSize:"clamp(20px,2.8vw,28px)",fontWeight:"700",
            fontFamily:"var(--font-display,serif)",fontStyle:"italic",
            color:"rgba(240,236,224,0.9)",lineHeight:"1.55",marginBottom:"24px"}}>
            Every birr stolen from public funds is a school unfunded,
            a hospital understaffed, a road unpaved.
          </p>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <div style={{width:"40px",height:"1px",background:CY,opacity:0.4}}/>
            <span style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",
              letterSpacing:"0.15em"}}>ሙስና = ስርቆት · Malaanmmaltummaa = Hatuu</span>
          </div>
        </div>
        );})()}
      </div>

      {/* ══════════════════ SECURITY ══════════════════ */}
      <section style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"1180px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"60px",
            opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0,marginBottom:"4px"}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",
              letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>SECURITY_SPECS()</span>
            <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
            <h2 style={{fontSize:"clamp(26px,3.5vw,40px)",fontWeight:"900",
              fontFamily:"var(--font-display,serif)",color:"rgba(240,236,224,0.95)",
              letterSpacing:"-0.01em",flexShrink:0}}>Zero trust. Zero identity.</h2>
          </div>
          );})()}
          <div className="shield-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"10px"}}>
            {SHIELDS.map((s,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} className={s.c===CY?"card-hud":"card-gold"}
                style={{padding:"22px 24px",opacity:v?1:0,transform:v?"none":"translateY(16px)",
                  transition:`all 0.55s ${i*0.07}s ease`}}>
                <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                  <div style={{width:"36px",height:"36px",background:`${s.c}12`,border:`1px solid ${s.c}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{fontSize:"8px",color:`${s.c}99`,fontFamily:"'Courier New',monospace",
                      letterSpacing:"0.18em",marginBottom:"4px"}}>[{s.code}]</div>
                    <div style={{fontSize:"14px",fontWeight:"700",color:s.c,marginBottom:"2px"}}>{s.val}</div>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════ AGENCIES ══════════════════ */}
      <section id="agencies" style={{position:"relative",zIndex:5,
        background:"rgba(0,0,0,0.55)",borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"80px 40px"}}>
        <div style={{maxWidth:"1180px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"52px",
            opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0,marginBottom:"4px"}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",
              letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>ROUTE_TABLE()</span>
            <div style={{flex:1,height:"1px",background:`rgba(201,168,76,0.2)`}}/>
            <h2 style={{fontSize:"clamp(22px,3vw,36px)",fontWeight:"900",
              fontFamily:"var(--font-display,serif)",color:"rgba(240,236,224,0.95)",
              letterSpacing:"-0.01em",flexShrink:0}}>Ethiopian accountability bodies</h2>
          </div>
          );})()}
          <div className="agency-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:"10px"}}>
            {AGENCIES.map((a,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={a.name} ref={r} className="card-hud" style={{padding:"22px",
                borderLeft:`3px solid ${a.c}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",
                transition:`all 0.55s ${i*0.08}s ease`}}>
                <div style={{fontSize:"8px",color:`rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",
                  letterSpacing:"0.12em",marginBottom:"6px"}}>AGENCY</div>
                <div style={{fontSize:"16px",fontWeight:"700",color:"rgba(240,236,224,0.95)",
                  fontFamily:"var(--font-display,serif)",marginBottom:"2px"}}>{a.name}</div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace",
                  marginBottom:"14px"}}>{a.am}</div>
                <div style={{fontSize:"24px",fontWeight:"900",color:a.c,
                  fontFamily:"var(--font-display,serif)"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section id="faq" style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"760px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{marginBottom:"52px",opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
              <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em"}}>FAQ.execute()</span>
            </div>
            <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",fontWeight:"900",
              fontFamily:"var(--font-display,serif)",color:"rgba(240,236,224,0.95)"}}>Your questions answered.</h2>
          </div>
          );})()}
          <div style={{borderTop:`1px solid rgba(0,212,255,0.1)`}}>
            {FAQS.map((f,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} className="faq-row" style={{opacity:v?1:0,transform:v?"none":"translateY(12px)",
                transition:`all 0.5s ${i*0.07}s ease`}} onClick={()=>setFaq(faq===i?null:i)}>
                <div style={{padding:"22px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"clamp(14px,1.8vw,16px)",fontWeight:"700",
                    color:faq===i?G:"rgba(240,236,224,0.88)",
                    fontFamily:"var(--font-display,serif)",paddingRight:"20px",transition:"color 0.2s"}}>{f.q}</span>
                  <span style={{color:faq===i?CY:G,fontSize:"20px",flexShrink:0,
                    fontFamily:"var(--font-display,serif)",transition:"transform 0.25s",
                    display:"inline-block",transform:faq===i?"rotate(45deg)":"none",fontWeight:"300"}}>+</span>
                </div>
                {faq===i&&<div style={{paddingBottom:"22px",paddingRight:"4px"}}>
                  <div style={{height:"1px",background:`rgba(0,212,255,0.12)`,marginBottom:"18px"}}/>
                  <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85"}}>{f.a}</p>
                </div>}
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section style={{position:"relative",zIndex:5,overflow:"hidden"}}>
        <div style={{height:"1px",background:`linear-gradient(90deg,transparent,${G},${CY},transparent)`}}/>
        <div style={{padding:"100px 40px 120px",position:"relative",
          background:`linear-gradient(135deg,rgba(0,0,0,0.8),rgba(0,212,255,0.02))`}}>
          {/* Large background scales */}
          <div style={{position:"absolute",right:"5%",top:"50%",transform:"translateY(-50%)",
            fontSize:"340px",color:`rgba(201,168,76,0.04)`,fontFamily:"var(--font-display,serif)",
            lineHeight:1,pointerEvents:"none",userSelect:"none",animation:"drift 7s ease-in-out infinite"}}>⚖</div>
          {/* HUD corner on CTA block */}
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{position:"relative",maxWidth:"680px",opacity:v?1:0,transform:v?"none":"translateY(20px)",transition:"all 0.8s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
              <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
              <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em"}}>CALL TO ACTION</span>
            </div>
            <h2 style={{fontFamily:"var(--font-display,serif)",fontSize:"clamp(36px,6vw,68px)",
              fontWeight:"900",lineHeight:1.05,letterSpacing:"-0.02em",marginBottom:"16px"}}>
              <span style={{color:"rgba(240,236,224,0.95)"}}>Silence protects</span>
              <span style={{color:R,fontStyle:"italic",display:"block"}}>the corrupt.</span>
              <span style={{color:G}}>Speak up.</span>
            </h2>
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"28px"}}>
              <div style={{width:"40px",height:"1px",background:G}}/>
              <div style={{width:"20px",height:"1px",background:CY,opacity:0.5}}/>
            </div>
            <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",lineHeight:"1.9",
              marginBottom:"44px",fontFamily:"'Courier New',monospace"}}>
              ሙስናን ሪፖርት አድርጉ · Gabaasa malaanmmaltummaa<br/>
              <span style={{color:`rgba(0,212,255,0.4)`}}>// anonymous · encrypted · verified · court-ready</span>
            </p>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              <a href="/report" className="btn-gold" style={{fontSize:"13px",padding:"15px 40px"}}>
                ⚖ Start Reporting Now
              </a>
              <a href="/transparency" className="btn-outline" style={{fontSize:"12px",padding:"14px 28px"}}>
                View Transparency Wall
              </a>
            </div>
            <div style={{marginTop:"16px",fontSize:"10px",color:`rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace"}}>
              // no smartphone? → SMS <strong style={{color:`rgba(0,212,255,0.5)`}}>21000</strong> from any phone
            </div>
          </div>
          );})()}
        </div>
        <div style={{height:"1px",background:`linear-gradient(90deg,transparent,${CY},${G},transparent)`}}/>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{position:"relative",zIndex:5,borderTop:`1px solid rgba(0,212,255,0.08)`,
        padding:"40px 40px 32px",background:"rgba(0,0,0,0.92)"}}>
        <div style={{maxWidth:"1180px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"24px",marginBottom:"24px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <HUDBrackets color={G} size={14} style={{padding:"5px 7px"}}>
                <span style={{fontSize:"16px",lineHeight:1}}>⚖️</span>
              </HUDBrackets>
              <div>
                <div style={{fontSize:"16px",fontWeight:"900",color:"rgba(240,236,224,0.95)",
                  fontFamily:"var(--font-display,serif)",letterSpacing:"0.05em"}}>SAFUU INTEL</div>
                <div style={{fontSize:"8px",color:`rgba(0,212,255,0.35)`,fontFamily:"'Courier New',monospace",
                  marginTop:"2px",letterSpacing:"0.18em"}}>ሳፉ · MORAL ORDER · ETHIOPIA</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"32px",flexWrap:"wrap"}}>
              {[["/transparency","Transparency Wall"],["/analytics","Analytics"],["/about","About"],["/report","File a Report"],["/sms","SMS Guide"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuEthBot","Telegram"]].map(([h,l])=>(
                <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                  className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.3)`,
                    fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:`1px solid rgba(0,212,255,0.06)`,paddingTop:"20px",
            display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"9px",color:`rgba(0,212,255,0.2)`,fontFamily:"'Courier New',monospace"}}>
              © 2026 SAFUU_INTEL · FEACC:959 · EHRC:1488 · POLICE:911</span>
            <span style={{fontSize:"9px",color:`rgba(201,168,76,0.2)`,fontFamily:"'Courier New',monospace"}}>
              {date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
