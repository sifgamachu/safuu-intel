'use client';
import { useState, useEffect, useRef } from "react";

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 2200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return val;
}

// ── GEEZ MATRIX RAIN ──────────────────────────────────────────────────────────
// Pure Ethiopic / Ge'ez script characters — no Japanese
function GeezMatrixRain() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();

    // Ethiopic/Ge'ez character set (U+1200–U+137F range)
    const GEEZ = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮኰኲኳኴኵኸኹኺኻኼኽኾዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ";
    const DIGITS = "01";

    const cols  = Math.floor(canvas.width / 18);
    const drops = Array.from({ length: cols }, () => ({ y: Math.random() * -80, speed: 0.3 + Math.random() * 0.7 }));

    let animId;
    const draw = () => {
      // Deep red-black fade for danger feel
      ctx.fillStyle = "rgba(4,0,0,0.14)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drops.forEach((drop, i) => {
        const isHighlight = Math.random() > 0.992;
        const isDanger    = Math.random() > 0.997;
        const isDigit     = Math.random() > 0.85;
        const char = isDigit
          ? DIGITS[Math.floor(Math.random() * DIGITS.length)]
          : GEEZ[Math.floor(Math.random() * GEEZ.length)];

        if (isDanger) {
          ctx.fillStyle = `rgba(220,30,30,${0.6 + Math.random() * 0.4})`;
          ctx.font = `bold ${15 + Math.random() * 5}px serif`;
        } else if (isHighlight) {
          ctx.fillStyle = `rgba(232,200,75,${0.7 + Math.random() * 0.3})`;
          ctx.font = `bold ${14 + Math.random() * 4}px serif`;
        } else {
          const bright = 0.15 + Math.random() * 0.5;
          ctx.fillStyle = `rgba(0,${Math.floor(120 + bright * 110)},${Math.floor(bright * 60)},${bright})`;
          ctx.font = `${13 + Math.random() * 3}px serif`;
        }

        ctx.fillText(char, i * 18, drop.y * 18);
        drop.y += drop.speed;
        if (drop.y * 18 > canvas.height + 50) {
          drop.y = -Math.random() * 30;
          drop.speed = 0.3 + Math.random() * 0.7;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.07, pointerEvents:"none" }}/>;
}

// ── "NO TO CORRUPTION" floating words ─────────────────────────────────────────
// 12 languages, Ethiopic script heavy




// ── Particle mesh ──────────────────────────────────────────────────────────────
function ParticleMesh() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
      danger: Math.random() > 0.85, // red danger particles
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.danger ? "rgba(220,30,30,0.5)" : "rgba(0,200,80,0.35)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const mixed = particles[i].danger || particles[j].danger;
            ctx.strokeStyle = mixed
              ? `rgba(200,20,20,${(1 - d/130) * 0.15})`
              : `rgba(0,180,70,${(1 - d/130) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.12, pointerEvents:"none" }}/>;
}




// ── Glitch text ───────────────────────────────────────────────────────────────
function GlitchText({ children, style = {} }) {
  return (
    <span className="glitch" data-text={children} style={{ position:"relative", ...style }}>
      {children}
    </span>
  );
}

// ── Terminal line ──────────────────────────────────────────────────────────────
function TerminalLine({ prefix = ">", text, delay = 0, color = "#00e676" }) {
  const [shown, setShown] = useState("");
  const [active, setActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setActive(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!active || shown.length >= text.length) return;
    const t = setTimeout(() => setShown(text.slice(0, shown.length + 1)), 32);
    return () => clearTimeout(t);
  }, [active, shown, text]);
  return (
    <div style={{ fontFamily:"monospace", fontSize:"11px", color, lineHeight:"2", opacity:active?1:0, transition:"opacity 0.3s" }}>
      <span style={{ color:"rgba(0,230,118,0.16)", marginRight:"8px" }}>{prefix}</span>
      {shown}
      {shown.length < text.length && <span style={{ animation:"blink 0.7s infinite", marginLeft:"1px" }}>█</span>}
    </div>
  );
}

// ── Hex stat ───────────────────────────────────────────────────────────────────
function HexStat({ val, suffix, label, sub, active }) {
  const n = useCountUp(val, active);
  return (
    <div style={{ padding:"28px 20px", borderRight:"1px solid rgba(0,230,118,0.07)", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,#dc2020,#00e676,transparent)", opacity:0.6 }}/>
      <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.18)", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:"5px" }}>
        0x{n.toString(16).toUpperCase().padStart(4,"0")}
      </div>
      <div style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:"900", color:"#00e676", fontFamily:"monospace", lineHeight:1, marginBottom:"6px", textShadow:"0 0 30px rgba(0,230,118,0.7), 0 0 60px rgba(0,230,118,0.2)" }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.27)", marginBottom:"3px", fontWeight:"600" }}>{label}</div>
      <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.18)", fontFamily:"monospace" }}>{sub}</div>
    </div>
  );
}

// ── Holographic card ───────────────────────────────────────────────────────────
function HoloCard({ children, style = {} }) {
  const [pos, setPos] = useState({ x:0.5, y:0.5 });
  const ref = useRef();
  return (
    <div ref={ref}
      onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setPos({ x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height }); }}
      onMouseLeave={() => setPos({ x:0.5, y:0.5 })}
      style={{
        position:"relative", borderRadius:"3px",
        background:`radial-gradient(ellipse at ${pos.x*100}% ${pos.y*100}%, rgba(0,220,80,0.05) 0%, rgba(0,0,0,0) 70%), #050a08`,
        border:"1px solid rgba(0,230,118,0.13)",
        boxShadow:"0 0 20px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.5)",
        transform:`perspective(600px) rotateX(${(pos.y-0.5)*5}deg) rotateY(${(pos.x-0.5)*5}deg)`,
        transition:"transform 0.15s", ...style,
      }}>
      {children}
    </div>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const CORRUPTION_TYPES = [
  "land fraud","procurement bribery","customs extortion",
  "court corruption","tax evasion","nepotism",
  "embezzlement","police extortion","healthcare theft","education bribery",
];

const STATS = [
  { val:233, suffix:"+", label:"Anonymous tips filed",     sub:"// identity = null"         },
  { val:139, suffix:"",  label:"Reports verified by AI",   sub:"// exif + hive + forensics" },
  { val:15,  suffix:"+", label:"Officials on record",      sub:"// 6 regions tracked"       },
  { val:3,   suffix:"",  label:"Active investigations",    sub:"// FEACC escalated"         },
];

const PROCESS = [
  { id:"01", icon:"📲", fn:"ANONYMOUS_INPUT()",    body:"Telegram voice or text. SMS from any phone. 11 Ethiopian languages. No account created. No identity linked." },
  { id:"02", icon:"🔬", fn:"AI_VERIFY(evidence)",  body:"EXIF date forensics. AI-image detection 94% accuracy. Whisper voice transcription. Claude severity scoring." },
  { id:"03", icon:"⚖️", fn:"ROUTE_TO(agency)",    body:"Auto-matched to FEACC, Federal Police, Ombudsman, OFAG, or EHRC. Zero manual steps. Zero delays." },
  { id:"04", icon:"📊", fn:"DISCLOSE_AT(n)",       body:"City and office shown immediately. Full name disclosed when verified report count reaches configured threshold." },
];

const SHIELD = [
  { code:"SHA256",  label:"Identity",    val:"Irreversible one-way hash",    icon:"🔐" },
  { code:"AES256",  label:"Encryption",  val:"GCM at rest, all fields",      icon:"🔒" },
  { code:"HIVE_AI", label:"Fake detect", val:"94% AI-image accuracy",        icon:"🤖" },
  { code:"LEDGER",  label:"Evidence",    val:"Tamper-evident hash chain",     icon:"⛓️" },
  { code:"WHISPER", label:"Languages",   val:"11 Ethiopian + EN",             icon:"🗣️" },
  { code:"AUTO",    label:"Routing",     val:"5 agencies, no delays",         icon:"⚡" },
];

const FAQS = [
  { q:"Is reporting really anonymous?",
    a:"Yes. SAFUU never stores your Telegram username, user ID, phone number, or real name. One-way SHA-256 — mathematically impossible to reverse. Not even administrators can identify you." },
  { q:"What happens after I submit?",
    a:"Claude AI categorizes corruption type and severity. Evidence is forensically verified. The tip is auto-routed to the correct agency. Reports on the same official cluster — when verified reports hit the threshold, the name is disclosed publicly and the case escalated." },
  { q:"How does name disclosure work?",
    a:"Below threshold: only city and office are shown — protecting against false accusations. At threshold: full name is disclosed on the public transparency wall and formally flagged for investigation." },
  { q:"No smartphone — can I still report?",
    a:"Yes. SMS shortcode 21000. Format: SAFUU [Name] | [Office] | [What happened]. Works from any mobile phone. No internet needed. Same AI pipeline as Telegram." },
  { q:"Which languages are supported?",
    a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages transcribed automatically by Whisper." },
];

export default function SafuuLanding() {
  const [statsActive, setStatsActive] = useState(false);
  const [typingIdx,   setTypingIdx]   = useState(0);
  const [typedText,   setTypedText]   = useState("");
  const [typePhase,   setTypePhase]   = useState("typing");
  const [openFaq,     setOpenFaq]     = useState(null);
  const statsRef = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold:0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const word = CORRUPTION_TYPES[typingIdx];
    if (typePhase === "typing") {
      if (typedText.length < word.length) { const t = setTimeout(() => setTypedText(word.slice(0,typedText.length+1)), 65); return ()=>clearTimeout(t); }
      else { const t = setTimeout(()=>setTypePhase("pausing"),2000); return ()=>clearTimeout(t); }
    } else if (typePhase === "pausing") {
      const t = setTimeout(()=>setTypePhase("erasing"),300); return ()=>clearTimeout(t);
    } else {
      if (typedText.length > 0) { const t = setTimeout(()=>setTypedText(typedText.slice(0,-1)),28); return ()=>clearTimeout(t); }
      else { setTypingIdx(i=>(i+1)%CORRUPTION_TYPES.length); setTypePhase("typing"); }
    }
  }, [typedText, typePhase, typingIdx]);

  const dateStr = new Date().toISOString().slice(0,10);

  return (
    <div style={{ background:"#020408", color:"rgba(255,255,255,0.38)", fontFamily:"'Georgia','Palatino',serif", overflowX:"hidden", position:"relative", minHeight:"100vh" }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { color:inherit; text-decoration:none; }

        @keyframes blink      { 0%,49%{opacity:1}50%,100%{opacity:0} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0}to{opacity:1} }
        @keyframes scanline   { 0%{top:-4%}100%{top:105%} }
        @keyframes drift      { 0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)} }
        @keyframes marquee    { from{transform:translateX(0)}to{transform:translateX(-50%)} }
        @keyframes pulse-red  { 0%,100%{box-shadow:0 0 0 0 rgba(220,30,30,0.5)}60%{box-shadow:0 0 0 16px rgba(220,30,30,0)} }
        @keyframes pulse-green{ 0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.5)}60%{box-shadow:0 0 0 16px rgba(0,230,118,0)} }
        @keyframes glitch1    { 0%,90%,100%{clip-path:none;transform:none}
          91%{clip-path:inset(20% 0 60% 0);transform:translate(-4px,0);color:#ff2020}
          93%{clip-path:inset(60% 0 20% 0);transform:translate(4px,0);color:#00e676}
          95%{clip-path:none;transform:none} }
        
          10% {opacity:1}
          80% {opacity:1}
          100%{opacity:0;transform:translateY(-6px)}
        }
        @keyframes wordFloat  {
          0%  {opacity:0;transform:scale(0.85) translateY(6px)}
          8%  {opacity:1;transform:scale(1) translateY(0)}
          85% {opacity:1;transform:scale(1) translateY(-4px)}
          100%{opacity:0;transform:scale(0.95) translateY(-10px)}
        }
        @keyframes dangerPulse {
          0%,100%{text-shadow:0 0 8px rgba(220,30,30,0.5)}
          50%{text-shadow:0 0 20px rgba(255,30,30,0.9),0 0 40px rgba(255,30,30,0.4)}
        }
        @keyframes borderGlow {
          0%,100%{border-color:rgba(220,30,30,0.15)}
          50%{border-color:rgba(220,30,30,0.4)}
        }

        .glitch { animation: glitch1 7s infinite; }
        .glitch::before {
          content:attr(data-text); position:absolute; left:-2px; top:0;
          color:rgba(255,30,30,0.6); clip-path:inset(0 0 65% 0);
          animation:glitch1 5s 0.3s infinite; pointer-events:none;
        }

        .btn-cyber:hover {
          background: rgba(0,230,118,0.15) !important;
          box-shadow: 0 0 30px rgba(0,230,118,0.7), 0 0 60px rgba(0,230,118,0.2) !important;
          transform: translateY(-2px);
          color: #00e676 !important;
        }
        .btn-ghost:hover {
          background: rgba(0,230,118,0.06) !important;
          border-color: rgba(0,230,118,0.3) !important;
        }
        .card-h:hover {
          border-color: rgba(0,230,118,0.3) !important;
          box-shadow: 0 0 24px rgba(0,230,118,0.08) !important;
          transform: translateY(-3px) !important;
        }
        .nav-a:hover { color:#00e676 !important; }
        .faq-r:hover { background:rgba(0,230,118,0.03) !important; }

        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(220,30,30,0.6); border-radius:2px; }
        ::-webkit-scrollbar-track { background:#000; }

        @media(max-width:640px) { .hide-mob { display:none !important; } }
      `}</style>

      {/* ── BG Layers ── */}
      <GeezMatrixRain/>
      <ParticleMesh/>

      {/* Grid overlay */}
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,180,60,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,60,0.012) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }}/>

      {/* Scanline */}
      <div style={{ position:"fixed", left:0, right:0, height:"3px", zIndex:2, pointerEvents:"none",
        background:"linear-gradient(transparent,rgba(220,30,30,0.03),rgba(0,230,118,0.025),transparent)",
        animation:"scanline 9s linear infinite" }}/>

      {/* Vignette */}
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.85) 100%)" }}/>

      {/* ── SYSTEM STATUS TICKER (no flag) ── */}
      <div style={{ position:"relative", zIndex:10, background:"rgba(0,0,0,0.95)",
        height:"28px", borderBottom:"1px solid rgba(220,30,30,0.3)",
        overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div style={{ background:"#dc1e1e", color:"#fff", fontSize:"8px", fontWeight:"900",
          padding:"0 12px", height:"100%", display:"flex", alignItems:"center",
          fontFamily:"monospace", letterSpacing:"0.2em", flexShrink:0 }}>
          ⚠ ALERT
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"marquee 38s linear infinite", whiteSpace:"nowrap" }}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
                {[
                  "⬤ ሙስና ይጥፋእ — CORRUPTION MUST FALL",
                  "⬤ SYSTEM :: ONLINE // ANONYMOUS // ENCRYPTED",
                  "⬤ IDENTITY_STORAGE :: NULL — NEVER RECORDED",
                  "⬤ ሙስናን ሪፖርት አድርጉ — REPORT NOW",
                  "⬤ AES-256-GCM :: ACTIVE // LEDGER :: SEALED",
                  "⬤ Malaanmmaltummaa Dhabamu — OROMIFFA",
                  "⬤ ሙስና ሃገርን ይበልዛል — CORRUPTION DESTROYS NATIONS",
                  `⬤ SAFUU.NET // ${dateStr}`,
                ].map((t,j)=>(
                  <span key={j} style={{
                    fontSize:"9px", fontFamily:"monospace", letterSpacing:"0.08em", padding:"0 20px",
                    color: j % 3 === 0 ? "rgba(220,60,60,0.8)" : "rgba(0,230,118,0.65)",
                  }}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100,
        background:"rgba(2,4,8,0.97)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(0,230,118,0.1)",
        padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px" }}>

        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          {/* ⚖️ icon — restored, no flag */}
          <div style={{ width:"38px", height:"38px", borderRadius:"5px",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px",
            background:"rgba(0,230,118,0.07)", border:"1px solid rgba(0,230,118,0.2)",
            boxShadow:"0 0 14px rgba(0,230,118,0.15)" }}>
            ⚖️
          </div>
          <div>
            <div style={{ fontSize:"16px", fontWeight:"900", color:"#00e676",
              letterSpacing:"0.18em", fontFamily:"monospace", lineHeight:1,
              textShadow:"0 0 20px rgba(0,230,118,0.6)" }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:"rgba(0,230,118,0.18)", letterSpacing:"0.22em", fontFamily:"monospace" }}>
              INTEL v2.0 :: SAFUU.NET
            </div>
          </div>
        </div>

        <div className="hide-mob" style={{ display:"flex", gap:"24px", alignItems:"center" }}>
          {[["#how","HOW_IT_WORKS"],["#impact","IMPACT"],["#agencies","AGENCIES"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={l} href={h} className="nav-a"
              style={{ fontSize:"10px", color:"rgba(0,230,118,0.18)", fontFamily:"monospace",
                letterSpacing:"0.12em", transition:"color 0.2s" }}>{l}</a>
          ))}
        </div>

        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
          style={{ background:"transparent", color:"#00e676", fontFamily:"monospace",
            fontSize:"10px", fontWeight:"800", padding:"9px 20px", borderRadius:"3px",
            border:"1px solid #00e676", letterSpacing:"0.12em", transition:"all 0.2s",
            boxShadow:"0 0 10px rgba(0,230,118,0.15)", display:"flex", alignItems:"center", gap:"7px" }}>
          <span style={{ animation:"blink 1.5s infinite" }}>█</span> REPORT_NOW()
        </a>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ minHeight:"95vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"80px 32px 60px", position:"relative", zIndex:5, overflow:"hidden" }}>

        <div style={{ maxWidth:"920px", textAlign:"center", animation:"fadeUp 1s ease-out" }}>

          {/* Danger badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", marginBottom:"32px",
            background:"rgba(0,0,0,0.8)", border:"1px solid rgba(220,30,30,0.4)",
            borderRadius:"2px", padding:"8px 20px",
            boxShadow:"0 0 20px rgba(220,30,30,0.12)",
            animation:"borderGlow 3s ease-in-out infinite" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#dc1e1e",
              animation:"pulse-red 1.8s infinite", display:"inline-block" }}/>
            <span style={{ fontSize:"10px", color:"rgba(220,80,80,0.41)", fontFamily:"monospace", letterSpacing:"0.2em" }}>
              SYSTEM :: ONLINE // ሙስና ጠላት ነው — CORRUPTION IS THE ENEMY
            </span>
          </div>

          {/* HEADLINE — with glitch */}
          <h1 style={{ fontSize:"clamp(40px,7.5vw,88px)", fontWeight:"900",
            lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:"22px" }}>
            <GlitchText style={{ color:"#fff", display:"block" }}>Corruption ends</GlitchText>
            <span style={{ color:"#00e676", display:"block",
              textShadow:"0 0 40px rgba(0,230,118,0.5), 0 0 80px rgba(0,230,118,0.2)" }}>
              when people
            </span>
            <span style={{ color:"#fff", display:"block" }}>refuse to be silent.</span>
          </h1>

          {/* Typewriter terminal */}
          <div style={{ height:"44px", display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:"36px", background:"rgba(0,0,0,0.7)",
            border:"1px solid rgba(220,30,30,0.2)", borderRadius:"2px",
            padding:"0 24px", maxWidth:"520px", margin:"0 auto 36px" }}>
            <span style={{ fontSize:"11px", color:"rgba(220,80,80,0.32)", fontFamily:"monospace", marginRight:"10px" }}>
              CASE_TYPE:
            </span>
            <span style={{ fontSize:"14px", color:"#ff6060", fontFamily:"monospace", flex:1, textAlign:"left",
              textShadow:"0 0 8px rgba(255,60,60,0.5)" }}>
              {typedText}<span style={{ animation:"blink 0.8s infinite" }}>_</span>
            </span>
          </div>

          {/* Boot terminal */}
          <div style={{ background:"rgba(0,0,0,0.85)", border:"1px solid rgba(0,230,118,0.12)",
            borderRadius:"4px", padding:"20px 24px", maxWidth:"580px", margin:"0 auto 44px",
            textAlign:"left", boxShadow:"0 0 40px rgba(0,0,0,0.9), 0 0 60px rgba(220,30,30,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"14px",
              paddingBottom:"10px", borderBottom:"1px solid rgba(0,230,118,0.08)" }}>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#ff5f57" }}/>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#ffbd2e" }}/>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#28c840" }}/>
              <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.14)", fontFamily:"monospace", marginLeft:"8px" }}>
                safuu-intel // secure-pipeline
              </span>
            </div>
            <TerminalLine prefix="$" text="safuu --mode=anonymous --encrypt=AES256"    delay={200}/>
            <TerminalLine prefix=">" text="Initialising secure pipeline..."            delay={900}  color="rgba(0,230,118,0.55)"/>
            <TerminalLine prefix=">" text="WARNING: corruption detected in system"     delay={1600} color="rgba(220,60,60,0.9)"/>
            <TerminalLine prefix=">" text="Identity: HASH_ONLY [ SHA256 → irreversible ]" delay={2300} color="rgba(0,230,118,0.7)"/>
            <TerminalLine prefix=">" text="Encryption: AES-256-GCM // ACTIVE ✓"       delay={3000} color="#00e676"/>
            <TerminalLine prefix=">" text="Pipeline READY. ሙስናን ሪፖርት አድርጉ."          delay={3700} color="#e8c84b"/>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"36px" }}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
              style={{ display:"flex", alignItems:"center", gap:"12px",
                background:"rgba(0,230,118,0.08)", color:"#00e676",
                padding:"16px 36px", borderRadius:"3px",
                border:"2px solid #00e676", fontFamily:"monospace",
                fontSize:"13px", fontWeight:"900", letterSpacing:"0.12em",
                transition:"all 0.2s", boxShadow:"0 0 20px rgba(0,230,118,0.15)",
                animation:"pulse-green 3s infinite" }}>
              ⚖ REPORT_ANONYMOUSLY()
            </a>
            <a href="#how" className="btn-ghost"
              style={{ display:"flex", alignItems:"center", gap:"10px",
                background:"transparent", color:"rgba(255,255,255,0.25)",
                padding:"16px 32px", borderRadius:"3px",
                border:"1px solid rgba(255,255,255,0.1)",
                fontFamily:"monospace", fontSize:"12px",
                letterSpacing:"0.1em", transition:"all 0.2s" }}>
              HOW_IT_WORKS() ↓
            </a>
          </div>

          {/* Trust bar */}
          <div style={{ display:"flex", gap:"0", justifyContent:"center", flexWrap:"wrap",
            background:"rgba(0,0,0,0.6)", border:"1px solid rgba(0,230,118,0.07)",
            borderRadius:"2px", maxWidth:"640px", margin:"0 auto" }}>
            {[
              ["IDENTITY","NULL // SHA256 → NEVER_STORED"],
              ["LEDGER",  "HASH_CHAIN // IMMUTABLE"],
              ["SCOPE",   "0x0B // 11 ETHIOPIAN LANGUAGES"],
            ].map(([k,v],i)=>(
              <div key={i} style={{ flex:"1 1 180px", padding:"12px 14px",
                borderRight:i<2?"1px solid rgba(0,230,118,0.07)":"none" }}>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.16)", fontFamily:"monospace", letterSpacing:"0.18em", marginBottom:"2px" }}>{k}</div>
                <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.34)", fontFamily:"monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} id="impact" style={{ position:"relative", zIndex:5,
        borderTop:"1px solid rgba(0,230,118,0.1)", borderBottom:"1px solid rgba(0,230,118,0.1)",
        background:"rgba(0,0,0,0.8)" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", padding:"44px 32px 24px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.25em" }}>▸ PLATFORM_METRICS :: LIVE</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))" }}>
            {STATS.map((s,i)=><HexStat key={i} {...s} active={statsActive}/>)}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW ══════════════ */}
      <section id="how" style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ marginBottom:"52px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ PROCESS_FLOW()</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,38px)", fontWeight:"800", color:"#fff", lineHeight:1.2 }}>
            From tip to investigation<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 30px rgba(0,230,118,0.4)" }}>in four functions.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"10px" }}>
          {PROCESS.map((s,i)=>(
            <HoloCard key={i} style={{ padding:"28px 24px", transition:"all 0.2s" }}>
              <div className="card-h">
                <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.16)", fontFamily:"monospace", letterSpacing:"0.18em", marginBottom:"14px" }}>{s.id}/04</div>
                <div style={{ fontSize:"24px", marginBottom:"12px" }}>{s.icon}</div>
                <div style={{ fontSize:"11px", fontWeight:"700", color:"#00e676", fontFamily:"monospace", marginBottom:"12px", letterSpacing:"0.04em" }}>{s.fn}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.18)", lineHeight:"1.8" }}>{s.body}</div>
              </div>
            </HoloCard>
          ))}
        </div>
      </section>

      {/* ══════════════ QUOTE ══════════════ */}
      <div style={{ position:"relative", zIndex:5,
        background:"rgba(220,30,30,0.04)",
        borderTop:"1px solid rgba(220,30,30,0.2)",
        borderBottom:"1px solid rgba(220,30,30,0.2)",
        padding:"64px 32px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"repeating-linear-gradient(45deg,rgba(220,30,30,0.02) 0px,rgba(220,30,30,0.02) 1px,transparent 1px,transparent 10px)",
          pointerEvents:"none" }}/>
        <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ fontSize:"64px", color:"rgba(220,30,30,0.07)", fontFamily:"serif", lineHeight:0.8, marginBottom:"20px" }}>"</div>
          <p style={{ fontSize:"clamp(18px,2.5vw,25px)", fontWeight:"700", color:"#f0e8e8",
            lineHeight:"1.6", marginBottom:"16px", fontStyle:"italic" }}>
            Every birr stolen from public funds is a school unfunded,
            a hospital understaffed, a road unpaved.
          </p>
          <div style={{ fontSize:"10px", color:"rgba(220,80,80,0.27)", fontFamily:"monospace", letterSpacing:"0.2em",
            animation:"dangerPulse 3s ease-in-out infinite" }}>
            // ሙስና = ስርቆት — CORRUPTION = THEFT — Malaanmmaltummaa = Hatuu
          </div>
        </div>
      </div>

      {/* ══════════════ SHIELD ══════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ marginBottom:"52px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ SECURITY_SPECS()</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,38px)", fontWeight:"800", color:"#fff", lineHeight:1.2 }}>
            Protection by design.<br/>
            <span style={{ color:"#00e676" }}>Zero trust. Zero identity.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"10px" }}>
          {SHIELD.map((s,i)=>(
            <div key={i} className="card-h"
              style={{ background:"rgba(0,0,0,0.7)", border:"1px solid rgba(0,230,118,0.09)",
                borderRadius:"3px", padding:"22px", transition:"all 0.2s",
                boxShadow:"0 0 0 rgba(0,230,118,0)" }}>
              <div style={{ display:"flex", gap:"12px" }}>
                <div style={{ width:"36px", height:"36px", background:"rgba(0,230,118,0.07)",
                  border:"1px solid rgba(0,230,118,0.18)", borderRadius:"3px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"16px", flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:"3px" }}>[{s.code}]</div>
                  <div style={{ fontSize:"13px", fontWeight:"700", color:"#00e676", marginBottom:"3px" }}>{s.val}</div>
                  <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.14)", fontFamily:"monospace" }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ AGENCIES ══════════════ */}
      <section id="agencies" style={{ position:"relative", zIndex:5,
        background:"rgba(0,0,0,0.7)", borderTop:"1px solid rgba(0,230,118,0.08)", padding:"80px 32px" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ marginBottom:"44px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ ROUTE_TABLE()</div>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:"800", color:"#fff" }}>Ethiopian accountability bodies</h2>
            <p style={{ fontSize:"11px", color:"rgba(0,230,118,0.18)", fontFamily:"monospace", marginTop:"8px" }}>
              // auto-matched by AI — no manual routing
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:"10px" }}>
            {[
              {name:"FEACC",am:"ፀረሙስና",  phone:"959",  color:"#4ade80", type:"All corruption"},
              {name:"EHRC", am:"ሰብዓዊ መብት",phone:"1488", color:"#38bdf8", type:"Human rights"},
              {name:"Ombudsman",am:"ዕርቀ",phone:"6060", color:"#a78bfa", type:"Abuse of power"},
              {name:"Fed. Police",am:"ፖሊስ",phone:"911",color:"#f87171", type:"Criminal"},
              {name:"OFAG",am:"ኦዲተር",   phone:"•••",  color:"#fb923c", type:"Public funds"},
            ].map(a=>(
              <div key={a.name} className="card-h"
                style={{ background:"rgba(0,0,0,0.8)", borderRadius:"3px", padding:"18px",
                  borderLeft:`2px solid ${a.color}`,
                  border:`1px solid rgba(255,255,255,0.04)`, transition:"all 0.2s" }}>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.14)", fontFamily:"monospace", letterSpacing:"0.1em", marginBottom:"5px" }}>AGENCY::{a.name}</div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#fff", marginBottom:"2px" }}>{a.name}</div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.16)", fontFamily:"monospace", marginBottom:"8px" }}>{a.am}</div>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.09)", marginBottom:"10px", fontFamily:"monospace" }}>{a.type}</div>
                <div style={{ fontSize:"20px", fontWeight:"900", color:a.color, fontFamily:"monospace",
                  textShadow:`0 0 12px ${a.color}88` }}>
                  {a.phone!=="•••"?`📞 ${a.phone}`:"✉ Email"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section id="faq" style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"760px", margin:"0 auto" }}>
        <div style={{ marginBottom:"52px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ FAQ.execute()</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,34px)", fontWeight:"800", color:"#fff" }}>Your questions, answered.</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq-r" onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{ borderRadius:"3px", overflow:"hidden", cursor:"pointer",
                border:`1px solid ${openFaq===i?"rgba(0,230,118,0.2)":"rgba(0,230,118,0.06)"}`,
                background:openFaq===i?"rgba(0,230,118,0.03)":"transparent", transition:"all 0.15s" }}>
              <div style={{ padding:"17px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"clamp(13px,1.8vw,15px)", fontWeight:"600", color:"#fff", paddingRight:"20px" }}>{f.q}</span>
                <span style={{ color:"#00e676", fontSize:"18px", flexShrink:0, fontFamily:"monospace",
                  transition:"transform 0.2s", display:"inline-block", transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
              </div>
              {openFaq===i && (
                <div style={{ padding:"0 20px 18px", animation:"fadeIn 0.2s ease-out" }}>
                  <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.2)", lineHeight:"1.85" }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"100px 32px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(0,230,118,0.06) 1px,transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center,rgba(0,230,118,0.04) 0%,transparent 65%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
          <div style={{ fontSize:"52px", marginBottom:"24px", animation:"drift 4s ease-in-out infinite" }}>⚖️</div>
          <h2 style={{ fontSize:"clamp(26px,4.5vw,48px)", fontWeight:"900", color:"#fff",
            marginBottom:"14px", lineHeight:"1.15" }}>
            Silence protects the corrupt.<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 30px rgba(0,230,118,0.5)" }}>
              Your voice protects Ethiopia.
            </span>
          </h2>
          {/* Multilingual "No to corruption" in Geez */}
          <div style={{ marginBottom:"24px", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"12px" }}>
            {["ሙስና ይጥፋእ","ሙስናን አንቀበልም","Malaanmmaltummaa Dhabamu","REPORT. EXPOSE. STOP."].map((t,i)=>(
              <span key={i} style={{ fontSize:"13px", color:i%2===0?"rgba(220,60,60,0.75)":"rgba(0,200,80,0.6)",
                fontFamily:"'Noto Serif Ethiopic',serif", fontWeight:"700",
                animation:`dangerPulse ${3+i*0.5}s ${i*0.3}s ease-in-out infinite` }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.16)", lineHeight:"1.85",
            marginBottom:"40px", fontFamily:"monospace" }}>
            ሙስናን ሪፖርት አድርጉ · Report corruption · Gabaasa malaanmmaltummaa<br/>
            <span style={{ color:"rgba(0,230,118,0.2)" }}>// anonymous · encrypted · verified · court-ready</span>
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
            style={{ display:"inline-flex", alignItems:"center", gap:"12px",
              background:"rgba(0,230,118,0.08)", color:"#00e676",
              padding:"18px 44px", borderRadius:"3px",
              border:"2px solid #00e676", fontFamily:"monospace",
              fontSize:"14px", fontWeight:"900", letterSpacing:"0.12em",
              transition:"all 0.2s", boxShadow:"0 0 30px rgba(0,230,118,0.15)" }}>
            <span style={{ animation:"blink 1s infinite" }}>█</span> START_REPORTING_NOW()
          </a>
          <div style={{ marginTop:"16px", fontSize:"10px", color:"rgba(0,230,118,0.14)", fontFamily:"monospace" }}>
            // no smartphone? → SMS <strong style={{ color:"rgba(0,230,118,0.23)" }}>21000</strong>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ position:"relative", zIndex:5,
        borderTop:"1px solid rgba(0,230,118,0.08)",
        padding:"28px 32px 20px", background:"rgba(0,0,0,0.95)" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px", marginBottom:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ fontSize:"18px" }}>⚖️</span>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"900", color:"#00e676",
                  fontFamily:"monospace", letterSpacing:"0.15em",
                  textShadow:"0 0 16px rgba(0,230,118,0.5)" }}>SAFUU INTEL</div>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.14)", fontFamily:"monospace" }}>ሳፉ // MORAL ORDER // ANTI-CORRUPTION PLATFORM</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"24px", flexWrap:"wrap" }}>
              {[["/transparency","transparency_wall"],["https://github.com/sifgamachu/safuu-intel","github"],["https://t.me/SafuuEthBot","telegram_bot"]].map(([href,label])=>(
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                  className="nav-a" style={{ fontSize:"10px", color:"rgba(0,230,118,0.14)",
                    fontFamily:"monospace", letterSpacing:"0.08em", transition:"color 0.2s" }}>
                  ./{label} →
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(0,230,118,0.05)", paddingTop:"16px",
            display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.08)", fontFamily:"monospace" }}>
              © 2026 SAFUU_INTEL :: FEACC:959 :: EHRC:1488 :: POLICE:911
            </span>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.08)", fontFamily:"monospace" }}>
              {dateStr} // safuu.net
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
