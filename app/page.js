'use client';
import { useState, useEffect, useRef, useCallback } from "react";

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

// ── Digital rain canvas ───────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols   = Math.floor(canvas.width / 20);
    const drops  = Array(cols).fill(0).map(() => Math.random() * -100);
    const CHARS  = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,10,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const brightness = Math.random();
        ctx.fillStyle = brightness > 0.95
          ? "#e8c84b"
          : brightness > 0.7
          ? `rgba(0,230,118,${brightness})`
          : `rgba(0,180,80,${brightness * 0.6})`;
        ctx.font = `${14 + Math.random() * 4}px monospace`;
        ctx.fillText(char, i * 20, y * 20);
        drops[i] = y > canvas.height / 20 + Math.random() * 20 ? 0 : y + 0.5;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.18, pointerEvents:"none" }}/>;
}

// ── Particle field ────────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,230,118,${p.a * 0.5})`;
        ctx.fill();
      });
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,230,118,${(1 - dist/120) * 0.12})`;
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
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.6, pointerEvents:"none" }}/>;
}

// ── Glitch text ───────────────────────────────────────────────────────────────
function GlitchText({ children, style = {} }) {
  return (
    <span className="glitch" data-text={children} style={{ position:"relative", ...style }}>
      {children}
    </span>
  );
}

// ── Terminal typing ───────────────────────────────────────────────────────────
function TerminalLine({ prefix = ">", text, delay = 0, color = "#00e676" }) {
  const [shown, setShown] = useState("");
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!active) return;
    if (shown.length >= text.length) return;
    const t = setTimeout(() => setShown(text.slice(0, shown.length + 1)), 35);
    return () => clearTimeout(t);
  }, [active, shown, text]);
  return (
    <div style={{ fontFamily:"monospace", fontSize:"11px", color, lineHeight:"1.9", opacity: active ? 1 : 0, transition:"opacity 0.2s" }}>
      <span style={{ color:"rgba(0,230,118,0.4)", marginRight:"8px" }}>{prefix}</span>
      {shown}
      {shown.length < text.length && <span style={{ animation:"blink 0.8s infinite", marginLeft:"2px" }}>█</span>}
    </div>
  );
}

// ── HEX counter display ───────────────────────────────────────────────────────
function HexStat({ val, suffix, label, sub, active }) {
  const n = useCountUp(val, active);
  return (
    <div style={{ padding:"28px 20px", borderRight:"1px solid rgba(0,230,118,0.08)", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#00e676,transparent)", opacity:0.5 }}/>
      <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:"6px" }}>
        0x{n.toString(16).toUpperCase().padStart(4,"0")}
      </div>
      <div style={{ fontSize:"clamp(34px,4vw,52px)", fontWeight:"900", color:"#00e676", fontFamily:"monospace", lineHeight:1, marginBottom:"6px", textShadow:"0 0 30px rgba(0,230,118,0.6), 0 0 60px rgba(0,230,118,0.2)" }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)", marginBottom:"4px", fontWeight:"600" }}>{label}</div>
      <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"monospace" }}>{sub}</div>
    </div>
  );
}

// ── Holographic card ──────────────────────────────────────────────────────────
function HoloCard({ children, style = {} }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef();
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setPos({ x:0.5, y:0.5 })}
      style={{
        position:"relative", transition:"transform 0.15s",
        background:`radial-gradient(ellipse at ${pos.x*100}% ${pos.y*100}%, rgba(0,230,118,0.05) 0%, rgba(0,0,0,0) 70%), #080c10`,
        border:"1px solid rgba(0,230,118,0.15)",
        borderRadius:"4px",
        boxShadow:`0 0 20px rgba(0,230,118,0.05), inset 0 0 20px rgba(0,0,0,0.5)`,
        transform:`perspective(600px) rotateX(${(pos.y-0.5)*4}deg) rotateY(${(pos.x-0.5)*4}deg)`,
        ...style,
      }}>
      {children}
    </div>
  );
}

const CORRUPTION_TYPES = [
  "land fraud","procurement bribery","customs extortion",
  "court corruption","tax evasion","nepotism",
  "embezzlement","police extortion","healthcare theft",
];

const STATS = [
  { val:233, suffix:"+", label:"Anonymous tips filed",     sub:"// all identities protected"    },
  { val:139, suffix:"",  label:"Reports verified by AI",   sub:"// exif + hive + forensics"     },
  { val:15,  suffix:"+", label:"Officials on record",      sub:"// across 6 regions"            },
  { val:3,   suffix:"",  label:"Active investigations",    sub:"// FEACC + federal police"      },
];

const PROCESS = [
  { id:"01", icon:"📲", title:"ANONYMOUS_INPUT()",   body:"Telegram voice or text. SMS from any feature phone. 11 Ethiopian languages. No account. No identity." },
  { id:"02", icon:"🔬", title:"AI_VERIFY(evidence)", body:"EXIF date forensics. AI-image detection at 94% accuracy. Voice transcription via Whisper. Claude categorizes severity." },
  { id:"03", icon:"⚖️", title:"ROUTE_TO(agency)",   body:"Auto-matched to FEACC, Federal Police, Ombudsman, OFAG, or EHRC. No manual steps. No delays." },
  { id:"04", icon:"📊", title:"DISCLOSE_AT(threshold)",body:"City and office shown immediately. Full name disclosed publicly when verified reports reach the configured threshold." },
];

const SHIELD = [
  { code:"SHA256", label:"Identity",   val:"Irreversible hash",        icon:"🔐" },
  { code:"AES256", label:"Encryption", val:"GCM at rest",              icon:"🔒" },
  { code:"HIVE",   label:"AI Detect",  val:"94% fake image accuracy",  icon:"🤖" },
  { code:"CHAIN",  label:"Ledger",     val:"Tamper-evident hash chain", icon:"⛓️" },
  { code:"WHISPER",label:"Languages",  val:"11 Ethiopian languages",   icon:"🗣️" },
  { code:"AUTO",   label:"Routing",    val:"5 agencies, zero delays",  icon:"⚡" },
];

const FAQS = [
  { q:"Is reporting really anonymous?",
    a:"Yes. SAFUU never stores your Telegram username, user ID, phone number, or real name. One-way SHA-256 — mathematically impossible to reverse. Not even admins can identify you." },
  { q:"What happens after I submit?",
    a:"Claude AI analyzes corruption type and severity. Evidence is forensically verified. The tip is auto-routed to the correct Ethiopian agency. Reports on the same official cluster — when verified reports hit the threshold, name is disclosed publicly." },
  { q:"How does name disclosure work?",
    a:"Below threshold: only city and office are shown publicly — protecting against false accusations. At threshold: full name disclosed on the public transparency wall and flagged for formal investigation." },
  { q:"No smartphone — can I still report?",
    a:"Yes. SMS shortcode 21000. Format: SAFUU [Name] | [Office] | [What happened]. Works from any mobile phone — no internet needed. Same AI pipeline as Telegram." },
  { q:"Which languages are supported?",
    a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages transcribed automatically by Whisper." },
];

export default function SafuuLanding() {
  const [statsActive, setStatsActive] = useState(false);
  const [typingIdx,   setTypingIdx]   = useState(0);
  const [typedText,   setTypedText]   = useState("");
  const [typePhase,   setTypePhase]   = useState("typing");
  const [openFaq,     setOpenFaq]     = useState(null);
  const [tick,        setTick]        = useState(0);
  const statsRef = useRef();

  // Intersection observer for stats
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold:0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Clock tick for live display
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Typewriter
  useEffect(() => {
    const word = CORRUPTION_TYPES[typingIdx];
    if (typePhase === "typing") {
      if (typedText.length < word.length) { const t = setTimeout(() => setTypedText(word.slice(0, typedText.length+1)), 65); return () => clearTimeout(t); }
      else { const t = setTimeout(() => setTypePhase("pausing"), 2000); return () => clearTimeout(t); }
    } else if (typePhase === "pausing") {
      const t = setTimeout(() => setTypePhase("erasing"), 300); return () => clearTimeout(t);
    } else {
      if (typedText.length > 0) { const t = setTimeout(() => setTypedText(typedText.slice(0,-1)), 28); return () => clearTimeout(t); }
      else { setTypingIdx(i => (i+1) % CORRUPTION_TYPES.length); setTypePhase("typing"); }
    }
  }, [typedText, typePhase, typingIdx]);

  const now = new Date();
  const timeStr = now.toTimeString().slice(0,8);
  const dateStr = now.toISOString().slice(0,10);

  return (
    <div style={{ background:"#00040a", color:"rgba(255,255,255,0.85)", fontFamily:"'Georgia','Palatino',serif", overflowX:"hidden", position:"relative", minHeight:"100vh" }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { color:inherit; text-decoration:none; }
        
        @keyframes blink     { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes scanline  { 0%{top:-5%} 100%{top:105%} }
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.5)} 60%{box-shadow:0 0 0 16px rgba(0,230,118,0)} }
        @keyframes glitch1   { 0%,100%{clip-path:none} 20%{clip-path:inset(30% 0 50% 0);transform:translate(-3px,0)} 40%{clip-path:inset(70% 0 10% 0);transform:translate(3px,0)} }
        @keyframes drift     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes rotate360 { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes data-stream { 0%{opacity:0;transform:translateY(-10px)} 10%{opacity:1} 90%{opacity:1} 100%{opacity:0;transform:translateY(10px)} }
        @keyframes border-trace { 0%,100%{background-position:0% 0%} 25%{background-position:100% 0%} 50%{background-position:100% 100%} 75%{background-position:0% 100%} }
        @keyframes flicker   { 0%,99%{opacity:1} 100%{opacity:0.97} }
        
        .glow-green  { text-shadow: 0 0 20px rgba(0,230,118,0.8), 0 0 40px rgba(0,230,118,0.4); }
        .glow-gold   { text-shadow: 0 0 20px rgba(232,200,75,0.8), 0 0 40px rgba(232,200,75,0.4); }
        .glitch { animation: flicker 8s infinite; }
        .glitch::before {
          content: attr(data-text); position:absolute; left:-2px; top:0;
          color:#00e676; clip-path:inset(0 0 70% 0);
          animation:glitch1 6s infinite; opacity:0.7;
        }
        .btn-cyber:hover { 
          background: #00e676 !important; color: #000 !important;
          box-shadow: 0 0 30px rgba(0,230,118,0.7), 0 0 60px rgba(0,230,118,0.3) !important;
          transform: translateY(-2px);
        }
        .btn-ghost:hover {
          background: rgba(0,230,118,0.08) !important;
          border-color: rgba(0,230,118,0.4) !important;
        }
        .card-cyber:hover {
          border-color: rgba(0,230,118,0.4) !important;
          box-shadow: 0 0 20px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.03) !important;
          transform: translateY(-3px);
        }
        .nav-a:hover { color: #00e676 !important; }
        .faq-row:hover { background: rgba(0,230,118,0.04) !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#00e676; border-radius:2px; }
        ::-webkit-scrollbar-track { background:#000; }
        @media(max-width:640px) { .hide-mob { display:none !important; } }
      `}</style>

      {/* Background layers */}
      <MatrixRain/>
      <ParticleField/>

      {/* Grid overlay */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,230,118,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.025) 1px,transparent 1px)",
        backgroundSize:"50px 50px" }}/>

      {/* Scanning line */}
      <div style={{ position:"fixed", left:0, right:0, height:"3px", zIndex:1, pointerEvents:"none",
        background:"linear-gradient(transparent,rgba(0,230,118,0.08),transparent)",
        animation:"scanline 8s linear infinite" }}/>

      {/* Vignette */}
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.8) 100%)" }}/>

      {/* ── ETHIOPIA FLAG BAR (official, top) ── */}
      <div style={{ position:"relative", zIndex:10, display:"flex", height:"5px" }}>
        <div style={{ flex:1, background:"#078930" }}/><div style={{ flex:1, background:"#FCDD09" }}/><div style={{ flex:1, background:"#DA121A" }}/>
      </div>

      {/* ── SYSTEM STATUS TICKER ── */}
      <div style={{ position:"relative", zIndex:10, background:"rgba(0,0,0,0.9)", height:"28px",
        borderBottom:"1px solid rgba(0,230,118,0.15)", overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div style={{ background:"#00e676", color:"#000", fontSize:"8px", fontWeight:"900", padding:"0 12px",
          height:"100%", display:"flex", alignItems:"center", fontFamily:"monospace", letterSpacing:"0.15em", flexShrink:0 }}>
          SYS
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"marquee 35s linear infinite", whiteSpace:"nowrap" }}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
                {[
                  `⬤ SYSTEM_ONLINE :: ${dateStr} ${timeStr}`,
                  "⬤ ENCRYPTION :: AES-256-GCM ACTIVE",
                  "⬤ IDENTITY_STORAGE :: NULL",
                  "⬤ TIPS_RECEIVED :: 233+",
                  "⬤ LEDGER_INTEGRITY :: VERIFIED",
                  "⬤ AI_PIPELINE :: OPERATIONAL",
                  "⬤ CHANNELS :: TELEGRAM + SMS/21000",
                  "⬤ LANGUAGES :: 11 ETHIOPIAN + EN",
                ].map((t,j)=>(
                  <span key={j} style={{ fontSize:"9px", color:"rgba(0,230,118,0.7)", fontFamily:"monospace", letterSpacing:"0.08em", padding:"0 24px" }}>
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(0,4,10,0.95)",
        backdropFilter:"blur(20px) saturate(1.5)",
        borderBottom:"1px solid rgba(0,230,118,0.12)",
        padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px" }}>

        {/* Logo — ⚖️ icon restored */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"38px", height:"38px", borderRadius:"6px", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:"20px",
            background:"rgba(0,230,118,0.08)", border:"1px solid rgba(0,230,118,0.25)",
            boxShadow:"0 0 12px rgba(0,230,118,0.2)" }}>
            ⚖️
          </div>
          <div>
            <div className="glow-green" style={{ fontSize:"16px", fontWeight:"900", color:"#00e676",
              letterSpacing:"0.18em", fontFamily:"monospace", lineHeight:1 }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:"rgba(0,230,118,0.4)", letterSpacing:"0.25em", fontFamily:"monospace" }}>
              INTEL v2.0 :: SAFUU.NET
            </div>
          </div>
        </div>

        <div className="hide-mob" style={{ display:"flex", gap:"24px", alignItems:"center" }}>
          {[["#how","HOW_IT_WORKS"],["#impact","IMPACT"],["#agencies","AGENCIES"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={l} href={h} className="nav-a"
              style={{ fontSize:"10px", color:"rgba(0,230,118,0.45)", fontFamily:"monospace",
                letterSpacing:"0.12em", transition:"color 0.2s" }}>{l}</a>
          ))}
        </div>

        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
          style={{ background:"transparent", color:"#00e676", fontFamily:"monospace", fontSize:"10px",
            fontWeight:"800", padding:"9px 20px", borderRadius:"3px",
            border:"1px solid #00e676", letterSpacing:"0.12em", transition:"all 0.2s",
            boxShadow:"0 0 10px rgba(0,230,118,0.2)", display:"flex", alignItems:"center", gap:"7px" }}>
          <span style={{ animation:"blink 1.5s infinite" }}>█</span> REPORT_NOW()
        </a>
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section style={{ minHeight:"95vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:"80px 32px 60px",
        position:"relative", zIndex:5, overflow:"hidden" }}>

        <div style={{ maxWidth:"920px", textAlign:"center", animation:"fadeUp 1s ease-out" }}>

          {/* System badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", marginBottom:"32px",
            background:"rgba(0,0,0,0.7)", border:"1px solid rgba(0,230,118,0.3)",
            borderRadius:"2px", padding:"8px 20px",
            boxShadow:"0 0 20px rgba(0,230,118,0.1)" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#00e676",
              animation:"pulse-green 2s infinite", display:"inline-block" }}/>
            <span style={{ fontSize:"10px", color:"#00e676", fontFamily:"monospace", letterSpacing:"0.2em" }}>
              SYSTEM :: ONLINE // ANONYMOUS // ENCRYPTED
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{ fontSize:"clamp(40px,7.5vw,90px)", fontWeight:"900", lineHeight:1.05,
            letterSpacing:"-0.02em", marginBottom:"20px" }}>
            <GlitchText style={{ color:"#fff", display:"block" }}>Corruption ends</GlitchText>
            <span style={{ color:"#00e676", display:"block" }}
              className="glow-green">when people</span>
            <span style={{ color:"#fff", display:"block" }}>refuse to be silent.</span>
          </h1>

          {/* Typewriter */}
          <div style={{ height:"44px", display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:"36px", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(0,230,118,0.1)",
            borderRadius:"2px", padding:"0 24px", maxWidth:"520px", margin:"0 auto 36px" }}>
            <span style={{ fontSize:"11px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", marginRight:"10px" }}>
              CASE_TYPE:
            </span>
            <span style={{ fontSize:"14px", color:"#00e676", fontFamily:"monospace", flex:1, textAlign:"left" }}>
              {typedText}<span style={{ animation:"blink 0.8s infinite" }}>_</span>
            </span>
          </div>

          {/* Terminal lines */}
          <div style={{ background:"rgba(0,0,0,0.7)", border:"1px solid rgba(0,230,118,0.15)",
            borderRadius:"4px", padding:"20px 24px", maxWidth:"580px", margin:"0 auto 44px",
            textAlign:"left", boxShadow:"0 0 40px rgba(0,0,0,0.8)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"14px",
              paddingBottom:"10px", borderBottom:"1px solid rgba(0,230,118,0.1)" }}>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#ff5f57" }}/>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#ffbd2e" }}/>
              <span style={{ width:"10px",height:"10px",borderRadius:"50%",background:"#28c840" }}/>
              <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.3)", fontFamily:"monospace", marginLeft:"8px" }}>
                safuu-intel // anonymous-pipeline
              </span>
            </div>
            <TerminalLine prefix="$" text="safuu --mode=anonymous --lang=amharic"    delay={200}/>
            <TerminalLine prefix=">" text="Connecting to secure pipeline..."         delay={900}  color="rgba(0,230,118,0.6)"/>
            <TerminalLine prefix=">" text="Identity: NOT_STORED [ SHA256 one-way ]"  delay={1600} color="rgba(0,230,118,0.6)"/>
            <TerminalLine prefix=">" text="Encryption: AES-256-GCM // ACTIVE"        delay={2300} color="#00e676"/>
            <TerminalLine prefix=">" text="Pipeline: READY. Submit your report."     delay={3000} color="#e8c84b"/>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"36px" }}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
              style={{ display:"flex", alignItems:"center", gap:"12px",
                background:"rgba(0,230,118,0.1)", color:"#00e676",
                padding:"16px 36px", borderRadius:"3px",
                border:"2px solid #00e676", fontFamily:"monospace",
                fontSize:"13px", fontWeight:"900", letterSpacing:"0.12em",
                transition:"all 0.2s", boxShadow:"0 0 20px rgba(0,230,118,0.2)",
                animation:"pulse-green 3s infinite" }}>
              ⚖ REPORT_ANONYMOUSLY()
            </a>
            <a href="#how" className="btn-ghost"
              style={{ display:"flex", alignItems:"center", gap:"10px",
                background:"transparent", color:"rgba(255,255,255,0.6)",
                padding:"16px 32px", borderRadius:"3px",
                border:"1px solid rgba(255,255,255,0.12)",
                fontFamily:"monospace", fontSize:"12px", letterSpacing:"0.1em",
                transition:"all 0.2s" }}>
              HOW_IT_WORKS() ↓
            </a>
          </div>

          {/* Trust row */}
          <div style={{ display:"flex", gap:"0", justifyContent:"center", flexWrap:"wrap",
            background:"rgba(0,0,0,0.5)", border:"1px solid rgba(0,230,118,0.08)",
            borderRadius:"2px", maxWidth:"640px", margin:"0 auto" }}>
            {[
              ["IDENTITY","NULL // NEVER_STORED"],
              ["LEDGER","HASH_CHAIN // IMMUTABLE"],
              ["LANGUAGES","0x0B // 11 SUPPORTED"],
            ].map(([k,v],i)=>(
              <div key={i} style={{ flex:"1 1 180px", padding:"12px 16px",
                borderRight: i < 2 ? "1px solid rgba(0,230,118,0.08)" : "none" }}>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.4)", fontFamily:"monospace", letterSpacing:"0.2em", marginBottom:"2px" }}>{k}</div>
                <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.8)", fontFamily:"monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section ref={statsRef} id="impact" style={{ position:"relative", zIndex:5,
        borderTop:"1px solid rgba(0,230,118,0.12)", borderBottom:"1px solid rgba(0,230,118,0.12)",
        background:"rgba(0,0,0,0.7)" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", padding:"48px 32px 28px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.25em" }}>▸ PLATFORM_METRICS // LIVE</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))" }}>
            {STATS.map((s,i)=><HexStat key={i} {...s} active={statsActive}/>)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW ═══════════════════════ */}
      <section id="how" style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ marginBottom:"56px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ PROCESS_FLOW()</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,38px)", fontWeight:"800", color:"#fff", lineHeight:1.2 }}>
            From tip to investigation<br/>
            <span className="glow-green" style={{ color:"#00e676" }}>in four functions.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"12px" }}>
          {PROCESS.map((s,i)=>(
            <HoloCard key={i} style={{ padding:"28px 24px", transition:"all 0.2s" }}>
              <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"monospace", letterSpacing:"0.2em", marginBottom:"16px" }}>
                {s.id} / {`0${PROCESS.length}`[1]}
              </div>
              <div style={{ fontSize:"24px", marginBottom:"12px" }}>{s.icon}</div>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#00e676", fontFamily:"monospace",
                marginBottom:"12px", letterSpacing:"0.05em" }}>{s.title}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:"1.8" }}>{s.body}</div>
            </HoloCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ QUOTE ═══════════════════════ */}
      <div style={{ position:"relative", zIndex:5, background:"rgba(0,230,118,0.05)",
        borderTop:"1px solid rgba(0,230,118,0.15)", borderBottom:"1px solid rgba(0,230,118,0.15)",
        padding:"60px 32px", textAlign:"center" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(45deg,rgba(0,230,118,0.015) 0px,rgba(0,230,118,0.015) 1px,transparent 1px,transparent 10px)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
          <div style={{ fontSize:"60px", color:"rgba(0,230,118,0.15)", fontFamily:"monospace", lineHeight:0.8, marginBottom:"20px" }}>"</div>
          <p style={{ fontSize:"clamp(18px,2.5vw,24px)", fontWeight:"700", color:"#fff", lineHeight:"1.6", marginBottom:"16px", fontStyle:"italic" }}>
            Every birr stolen from public funds is a school unfunded,
            a hospital understaffed, a road unpaved.
          </p>
          <div style={{ fontSize:"10px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.2em" }}>
            // SAFUU EXISTS BECAUSE SILENCE IS COMPLICITY
          </div>
        </div>
      </div>

      {/* ═══════════════════════ SHIELD SPECS ═══════════════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ marginBottom:"56px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ SECURITY_SPECS()</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,38px)", fontWeight:"800", color:"#fff", lineHeight:1.2 }}>
            Protection by design.<br/>
            <span className="glow-green" style={{ color:"#00e676" }}>Zero trust. Zero identity.</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"10px" }}>
          {SHIELD.map((s,i)=>(
            <div key={i} className="card-cyber"
              style={{ background:"rgba(0,0,0,0.6)", border:"1px solid rgba(0,230,118,0.1)",
                borderRadius:"3px", padding:"22px", transition:"all 0.2s",
                boxShadow:"0 0 0 rgba(0,230,118,0)" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
                <div style={{ width:"36px", height:"36px", background:"rgba(0,230,118,0.08)",
                  border:"1px solid rgba(0,230,118,0.2)", borderRadius:"3px",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:"3px" }}>
                    [{s.code}]
                  </div>
                  <div style={{ fontSize:"13px", fontWeight:"700", color:"#00e676", marginBottom:"4px" }}>{s.val}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", fontFamily:"monospace" }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ AGENCIES ═══════════════════════ */}
      <section id="agencies" style={{ position:"relative", zIndex:5,
        background:"rgba(0,0,0,0.6)", borderTop:"1px solid rgba(0,230,118,0.1)", padding:"80px 32px" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ marginBottom:"44px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ ROUTE_TABLE()</div>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:"800", color:"#fff" }}>Ethiopian accountability bodies</h2>
            <p style={{ fontSize:"11px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", marginTop:"8px" }}>
              // SAFUU auto-matches each tip to the correct authority
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:"10px" }}>
            {[
              {name:"FEACC",          am:"ፀረሙስና ኮሚሽን", phone:"959",  type:"All corruption types",   color:"#4ade80"},
              {name:"EHRC",           am:"የሰብዓዊ መብት",   phone:"1488", type:"Human rights",           color:"#38bdf8"},
              {name:"Ombudsman",      am:"ዕርቀ ሚካሄ",     phone:"6060", type:"Abuse of power",         color:"#a78bfa"},
              {name:"Federal Police", am:"ፌደራል ፖሊስ",   phone:"911",  type:"Criminal corruption",    color:"#f87171"},
              {name:"OFAG",           am:"ዋና ኦዲተር",     phone:"•••",  type:"Public fund misuse",     color:"#fb923c"},
            ].map(a=>(
              <div key={a.name} className="card-cyber"
                style={{ background:"rgba(0,0,0,0.7)", borderRadius:"3px", padding:"18px",
                  borderLeft:`2px solid ${a.color}`, border:`1px solid rgba(255,255,255,0.05)`,
                  transition:"all 0.2s" }}>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.3)", fontFamily:"monospace", letterSpacing:"0.12em", marginBottom:"6px" }}>
                  AGENCY::{a.name}
                </div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#fff", marginBottom:"2px" }}>{a.name}</div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)", fontFamily:"monospace", marginBottom:"10px" }}>{a.am}</div>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.25)", fontFamily:"monospace", marginBottom:"12px" }}>{a.type}</div>
                <div style={{ fontSize:"20px", fontWeight:"900", color:a.color, fontFamily:"monospace",
                  textShadow:`0 0 15px ${a.color}88` }}>
                  {a.phone !== "•••" ? `📞 ${a.phone}` : "✉ Email"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section id="faq" style={{ position:"relative", zIndex:5, padding:"100px 32px", maxWidth:"760px", margin:"0 auto" }}>
        <div style={{ marginBottom:"52px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.25em", marginBottom:"12px" }}>▸ FAQ.execute()</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,34px)", fontWeight:"800", color:"#fff" }}>Your questions, answered.</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq-row" onClick={()=>setOpenFaq(openFaq===i?null:i)}
              style={{ borderRadius:"3px", overflow:"hidden", cursor:"pointer",
                border:`1px solid ${openFaq===i?"rgba(0,230,118,0.25)":"rgba(0,230,118,0.07)"}`,
                background:openFaq===i?"rgba(0,230,118,0.04)":"transparent", transition:"all 0.15s" }}>
              <div style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"clamp(13px,1.8vw,15px)", fontWeight:"600", color:"#fff", paddingRight:"20px" }}>{f.q}</span>
                <span style={{ color:"#00e676", fontSize:"18px", flexShrink:0, fontFamily:"monospace",
                  transition:"transform 0.2s", display:"inline-block", transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
              </div>
              {openFaq===i && (
                <div style={{ padding:"0 20px 20px", animation:"fadeIn 0.2s ease-out" }}>
                  <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:"1.85" }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"100px 32px", textAlign:"center", overflow:"hidden" }}>
        {/* Background hex grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(0,230,118,0.08) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,rgba(0,230,118,0.05) 0%,transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
          <div style={{ fontSize:"48px", marginBottom:"24px", animation:"drift 4s ease-in-out infinite" }}>⚖️</div>
          <h2 style={{ fontSize:"clamp(26px,4.5vw,48px)", fontWeight:"900", color:"#fff",
            marginBottom:"16px", lineHeight:"1.15" }}>
            Silence protects the corrupt.<br/>
            <span className="glow-green" style={{ color:"#00e676" }}>Your voice protects Ethiopia.</span>
          </h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", lineHeight:"1.85",
            marginBottom:"40px", fontFamily:"monospace" }}>
            ሙስናን ሪፖርት አድርጉ · Report corruption · Gabaasa malaanmmaltummaa<br/>
            <span style={{ color:"rgba(0,230,118,0.5)" }}>// anonymous · encrypted · verified · court-ready</span>
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-cyber"
            style={{ display:"inline-flex", alignItems:"center", gap:"12px",
              background:"rgba(0,230,118,0.1)", color:"#00e676",
              padding:"18px 44px", borderRadius:"3px",
              border:"2px solid #00e676", fontFamily:"monospace",
              fontSize:"14px", fontWeight:"900", letterSpacing:"0.12em",
              transition:"all 0.2s", boxShadow:"0 0 30px rgba(0,230,118,0.2)" }}>
            <span style={{ animation:"blink 1s infinite" }}>█</span> START_REPORTING_NOW()
          </a>
          <div style={{ marginTop:"18px", fontSize:"10px", color:"rgba(0,230,118,0.3)", fontFamily:"monospace" }}>
            // no smartphone? → SMS <strong style={{ color:"rgba(0,230,118,0.6)" }}>21000</strong> from any phone
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position:"relative", zIndex:5, borderTop:"1px solid rgba(0,230,118,0.1)",
        padding:"28px 32px 20px", background:"rgba(0,0,0,0.9)" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px", marginBottom:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ fontSize:"18px" }}>⚖️</span>
              <div>
                <div className="glow-green" style={{ fontSize:"13px", fontWeight:"900", color:"#00e676", fontFamily:"monospace", letterSpacing:"0.15em" }}>SAFUU INTEL</div>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.3)", fontFamily:"monospace" }}>ሳፉ // MORAL ORDER // ANTI-CORRUPTION PLATFORM</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"24px", flexWrap:"wrap" }}>
              {[["/transparency","transparency_wall"],["https://github.com/sifgamachu/safuu-intel","github"],["https://t.me/SafuuEthBot","telegram_bot"]].map(([href,label])=>(
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="nav-a"
                  style={{ fontSize:"10px", color:"rgba(0,230,118,0.35)", fontFamily:"monospace", letterSpacing:"0.08em", transition:"color 0.2s" }}>
                  ./{label} →
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(0,230,118,0.06)", paddingTop:"16px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace" }}>
              © 2026 SAFUU_INTEL :: FEACC:959 :: EHRC:1488 :: POLICE:911
            </span>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.2)", fontFamily:"monospace" }}>
              BUILD :: {dateStr} // safuu.net
            </span>
          </div>
        </div>
      </footer>

      {/* ── ETHIOPIA FLAG BAR (official, bottom) ── */}
      <div style={{ position:"relative", zIndex:10, display:"flex", height:"4px" }}>
        <div style={{ flex:1, background:"#078930" }}/><div style={{ flex:1, background:"#FCDD09" }}/><div style={{ flex:1, background:"#DA121A" }}/>
      </div>
    </div>
  );
}
