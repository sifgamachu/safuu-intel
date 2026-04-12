'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ── Scroll-triggered reveal ───────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 2400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return val;
}

// ── Ge'ez matrix rain ─────────────────────────────────────────────────────────
function GeezRain() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const GEEZ = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮኸኹኺኻኼኽኾዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ01";
    const cols  = Math.floor(canvas.width / 20);
    const drops = Array.from({ length: cols }, () => ({ y: Math.random() * -80, speed: 0.2 + Math.random() * 0.5 }));
    let id;
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((drop, i) => {
        const char = GEEZ[Math.floor(Math.random() * GEEZ.length)];
        const isRed = Math.random() > 0.998;
        const bright = 0.08 + Math.random() * 0.25;
        ctx.fillStyle = isRed ? `rgba(200,30,30,${bright + 0.1})` : `rgba(0,${Math.floor(140 + bright * 90)},${Math.floor(bright * 50)},${bright})`;
        ctx.font = `${13 + Math.random() * 3}px serif`;
        ctx.fillText(char, i * 20, drop.y * 20);
        drop.y += drop.speed;
        if (drop.y * 20 > canvas.height + 40) { drop.y = -Math.random() * 30; drop.speed = 0.2 + Math.random() * 0.5; }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.07, pointerEvents:"none" }}/>;
}

// ── Terminal typewriter ───────────────────────────────────────────────────────
function TermLine({ prefix="$", text, delay=0, color="#00e676" }) {
  const [shown, setShown] = useState("");
  const [on, setOn]       = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!on || shown.length >= text.length) return;
    const t = setTimeout(() => setShown(text.slice(0, shown.length + 1)), 28);
    return () => clearTimeout(t);
  }, [on, shown, text]);
  return (
    <div style={{ fontFamily:"var(--font-mono, monospace)", fontSize:"11px", color, lineHeight:"2", opacity:on?1:0, transition:"opacity 0.4s" }}>
      <span style={{ color:"rgba(0,230,118,0.3)", marginRight:"10px" }}>{prefix}</span>
      {shown}{shown.length < text.length && on && <span style={{ animation:"blink 0.7s infinite" }}>█</span>}
    </div>
  );
}

// ── Reveal wrapper ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.8s ${delay}s ease, transform 0.8s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ val, suffix, label, sub, active, delay }) {
  const n = useCountUp(val, active, 2400);
  return (
    <Reveal delay={delay} style={{ textAlign:"center", padding:"40px 28px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(0,230,118,0.4),transparent)" }}/>
      <div style={{ fontSize:"10px", color:"rgba(0,230,118,0.35)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.2em", marginBottom:"10px" }}>
        0x{n.toString(16).toUpperCase().padStart(4,"0")}
      </div>
      <div style={{ fontSize:"clamp(44px,5vw,64px)", fontWeight:"800", color:"#00e676",
        fontFamily:"var(--font-syne,serif)", lineHeight:1, marginBottom:"10px",
        textShadow:"0 0 40px rgba(0,230,118,0.5), 0 0 80px rgba(0,230,118,0.15)" }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-syne,serif)", fontWeight:"600", marginBottom:"5px" }}>{label}</div>
      <div style={{ fontSize:"10px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)" }}>{sub}</div>
    </Reveal>
  );
}

// ── Process step ──────────────────────────────────────────────────────────────
function Step({ n, icon, fn, body, delay }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      background:"rgba(0,230,118,0.02)", border:"1px solid rgba(0,230,118,0.1)",
      borderTop:`2px solid rgba(0,230,118,${0.6 - n * 0.12})`,
      borderRadius:"2px", padding:"32px 28px",
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(28px)",
      transition:`all 0.7s ${delay}s ease`,
    }}>
      <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.3)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.2em", marginBottom:"18px" }}>0{n}/04</div>
      <div style={{ fontSize:"26px", marginBottom:"14px" }}>{icon}</div>
      <div style={{ fontSize:"11px", fontWeight:"700", color:"#00e676", fontFamily:"var(--font-mono,monospace)", marginBottom:"14px", letterSpacing:"0.06em" }}>{fn}</div>
      <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", lineHeight:"1.85", fontFamily:"var(--font-syne,serif)" }}>{body}</div>
    </div>
  );
}

// ── Shield spec ───────────────────────────────────────────────────────────────
function Shield({ code, label, val, icon, delay }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      display:"flex", gap:"14px", alignItems:"flex-start",
      background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,230,118,0.07)",
      borderRadius:"2px", padding:"20px",
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(20px)",
      transition:`all 0.6s ${delay}s ease`,
    }}>
      <div style={{ width:"38px", height:"38px", background:"rgba(0,230,118,0.06)", border:"1px solid rgba(0,230,118,0.15)",
        borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.18em", marginBottom:"4px" }}>[{code}]</div>
        <div style={{ fontSize:"14px", fontWeight:"700", color:"#00e676", marginBottom:"4px", fontFamily:"var(--font-syne,serif)" }}>{val}</div>
        <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-mono,monospace)" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TYPES = ["land fraud","procurement bribery","customs extortion","court corruption","tax evasion","nepotism","embezzlement","police extortion","healthcare theft"];

const STATS = [
  { val:233, suffix:"+", label:"Anonymous tips filed",    sub:"// identity = null"       },
  { val:139, suffix:"",  label:"Reports verified by AI",  sub:"// exif + forensics"      },
  { val:15,  suffix:"+", label:"Officials on record",     sub:"// 6 regions"             },
  { val:3,   suffix:"",  label:"Active investigations",   sub:"// FEACC escalated"       },
];

const PROCESS = [
  { n:1, icon:"📲", fn:"ANONYMOUS_INPUT()",   body:"Telegram voice or text. SMS from any phone. 11 Ethiopian languages. Zero identity created." },
  { n:2, icon:"🔬", fn:"AI_VERIFY(evidence)", body:"EXIF forensics. AI-image detection. Whisper voice transcription. Claude severity scoring." },
  { n:3, icon:"⚖️", fn:"ROUTE_TO(agency)",   body:"Auto-matched to FEACC, Police, Ombudsman, OFAG, or EHRC. No manual steps. No delays." },
  { n:4, icon:"📊", fn:"DISCLOSE_AT(n)",      body:"City and office shown immediately. Full name disclosed when verified reports hit threshold." },
];

const SHIELDS = [
  { code:"SHA-256",   label:"Identity",    val:"One-way hash. Irreversible.",       icon:"🔐" },
  { code:"AES-256",   label:"Encryption",  val:"GCM at rest. All fields.",          icon:"🔒" },
  { code:"HIVE_AI",   label:"Fake detect", val:"94% AI-image accuracy.",            icon:"🤖" },
  { code:"LEDGER",    label:"Evidence",    val:"Tamper-evident hash chain.",         icon:"⛓️" },
  { code:"WHISPER",   label:"Languages",   val:"11 Ethiopian languages.",            icon:"🗣️" },
  { code:"AUTOROUTE", label:"Routing",     val:"5 agencies. Zero delay.",            icon:"⚡" },
];

const AGENCIES = [
  { name:"FEACC",        am:"ፀረሙስና ኮሚሽን", phone:"959",  color:"#00e676", type:"All types"      },
  { name:"EHRC",         am:"ሰብዓዊ መብቶች",   phone:"1488", color:"#38bdf8", type:"Human rights"   },
  { name:"Ombudsman",    am:"ዕርቀ ሚካሄ",     phone:"6060", color:"#a78bfa", type:"Abuse of power" },
  { name:"Fed. Police",  am:"ፌደራል ፖሊስ",   phone:"911",  color:"#f87171", type:"Criminal"       },
  { name:"OFAG",         am:"ዋና ኦዲተር",     phone:"•••",  color:"#fb923c", type:"Public funds"   },
];

const FAQS = [
  { q:"Is reporting truly anonymous?",
    a:"Yes. SAFUU never stores your Telegram username, user ID, phone, or real name. One-way SHA-256 — impossible to reverse. Not even administrators can identify you." },
  { q:"What happens after I submit?",
    a:"Claude AI categorizes type and severity. Evidence is forensically verified. The tip is auto-routed to the correct agency. Reports cluster — at threshold, name is publicly disclosed and formally escalated." },
  { q:"How does name disclosure work?",
    a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed on the transparency wall and flagged for formal investigation." },
  { q:"No smartphone — can I still report?",
    a:"Yes. SMS 21000. Format: SAFUU [Name] | [Office] | [What happened]. Any mobile phone. No internet needed. Same AI pipeline as Telegram." },
  { q:"Which languages are supported?",
    a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages auto-transcribed by Whisper." },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function SafuuLanding() {
  const [statsActive, setStats] = useState(false);
  const [typingIdx,   setTIdx]  = useState(0);
  const [typedText,   setTyped] = useState("");
  const [typePhase,   setPhase] = useState("typing");
  const [openFaq,     setFaq]   = useState(null);
  const [navScrolled, setNav]   = useState(false);
  const statsRef = useRef();

  // Nav scroll state
  useEffect(() => {
    const fn = () => setNav(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Stats intersection
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStats(true); }, { threshold:0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Typewriter
  useEffect(() => {
    const word = TYPES[typingIdx];
    if (typePhase === "typing") {
      if (typedText.length < word.length) { const t = setTimeout(() => setTyped(word.slice(0, typedText.length+1)), 60); return ()=>clearTimeout(t); }
      else { const t = setTimeout(() => setPhase("pausing"), 2200); return ()=>clearTimeout(t); }
    } else if (typePhase === "pausing") {
      const t = setTimeout(() => setPhase("erasing"), 300); return ()=>clearTimeout(t);
    } else {
      if (typedText.length > 0) { const t = setTimeout(() => setTyped(typedText.slice(0,-1)), 25); return ()=>clearTimeout(t); }
      else { setTIdx(i=>(i+1)%TYPES.length); setPhase("typing"); }
    }
  }, [typedText, typePhase, typingIdx]);

  const date = new Date().toISOString().slice(0,10);

  return (
    <div style={{ background:"#020408", color:"rgba(255,255,255,0.85)", fontFamily:"var(--font-syne,serif)", overflowX:"hidden", scrollBehavior:"smooth" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        a { color:inherit; text-decoration:none; }
        @keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes scanline    { 0%{top:-4%} 100%{top:105%} }
        @keyframes drift       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes marquee     { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulseGreen  { 0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.4)} 60%{box-shadow:0 0 0 18px rgba(0,230,118,0)} }
        @keyframes pulseRed    { 0%,100%{box-shadow:0 0 0 0 rgba(220,30,30,0.4)} 60%{box-shadow:0 0 0 14px rgba(220,30,30,0)} }
        @keyframes flicker     { 0%,97%{opacity:1} 98%{opacity:0.96} 99%{opacity:1} 100%{opacity:0.98} }
        @keyframes borderGlow  { 0%,100%{border-color:rgba(220,30,30,0.12)} 50%{border-color:rgba(220,30,30,0.35)} }
        @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes countUp     { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }

        .btn-primary {
          background: transparent; color: #00e676; border: 1.5px solid #00e676;
          font-family: var(--font-mono,monospace); font-weight:700; letter-spacing:0.12em;
          padding:14px 32px; border-radius:2px; cursor:pointer; display:inline-flex;
          align-items:center; gap:10px; transition:all 0.25s; position:relative; overflow:hidden;
          font-size:12px;
        }
        .btn-primary::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(0,230,118,0.08),transparent);
          transform:translateX(-100%); transition:transform 0.4s;
        }
        .btn-primary:hover::before { transform:translateX(100%); }
        .btn-primary:hover {
          background:rgba(0,230,118,0.1);
          box-shadow:0 0 24px rgba(0,230,118,0.4), 0 0 48px rgba(0,230,118,0.15);
          transform:translateY(-2px);
        }
        .btn-ghost {
          background:transparent; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.1);
          font-family:var(--font-mono,monospace); font-weight:500; letter-spacing:0.1em;
          padding:14px 28px; border-radius:2px; cursor:pointer; display:inline-flex;
          align-items:center; gap:10px; transition:all 0.25s; font-size:12px;
        }
        .btn-ghost:hover { border-color:rgba(0,230,118,0.3); color:rgba(255,255,255,0.8); transform:translateY(-2px); }

        .nav-link { font-size:10px; color:rgba(0,230,118,0.4); font-family:var(--font-mono,monospace); letter-spacing:0.14em; transition:color 0.2s; position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:1px; background:#00e676; transform:scaleX(0); transition:transform 0.2s; }
        .nav-link:hover { color:#00e676; }
        .nav-link:hover::after { transform:scaleX(1); }

        .card { transition:all 0.25s; }
        .card:hover { border-color:rgba(0,230,118,0.25) !important; transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,230,118,0.06); }

        .faq-row { transition:background 0.15s, border-color 0.15s; cursor:pointer; }
        .faq-row:hover { background:rgba(0,230,118,0.03) !important; }

        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,230,118,0.3); border-radius:2px; }
        ::-webkit-scrollbar-track { background:#000; }
        @media(max-width:640px) { .hide-mob{display:none!important} }
      `}</style>

      {/* ── BG ── */}
      <GeezRain/>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(0,230,118,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.015) 1px,transparent 1px)",
        backgroundSize:"52px 52px" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 30% 20%,rgba(0,230,118,0.03) 0%,transparent 60%), radial-gradient(ellipse at 70% 80%,rgba(220,30,30,0.02) 0%,transparent 60%)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 30%,rgba(2,4,8,0.7) 100%)" }}/>
      <div style={{ position:"fixed", left:0, right:0, height:"2px", zIndex:2, pointerEvents:"none",
        background:"linear-gradient(transparent,rgba(0,230,118,0.04),transparent)",
        animation:"scanline 10s linear infinite" }}/>

      {/* ── TICKER ── */}
      <div style={{ position:"relative", zIndex:10, background:"rgba(0,0,0,0.98)", height:"28px",
        borderBottom:"1px solid rgba(0,230,118,0.08)", overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div style={{ background:"#dc1e1e", color:"#fff", fontSize:"8px", fontWeight:"800",
          padding:"0 14px", height:"100%", display:"flex", alignItems:"center",
          fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.2em", flexShrink:0 }}>
          ⚠ LIVE
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <div style={{ display:"flex", animation:"marquee 40s linear infinite", whiteSpace:"nowrap" }}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{ display:"inline-flex" }}>
                {[
                  "⬤ SYSTEM :: ONLINE // ANONYMOUS // ENCRYPTED",
                  "⬤ ሙስና ይጥፋእ — JUSTICE WILL PREVAIL",
                  "⬤ IDENTITY_STORAGE :: NULL — NEVER RECORDED",
                  "⬤ ሙስናን ሪፖርት አድርጉ — REPORT NOW",
                  "⬤ AES-256-GCM :: ACTIVE",
                  "⬤ Malaanmmaltummaa Dhabamu — OROMIFFA",
                  `⬤ SAFUU.NET // ${date}`,
                ].map((t,j)=>(
                  <span key={j} style={{ fontSize:"9px", fontFamily:"var(--font-mono,monospace)", padding:"0 24px",
                    color: j%3===0 ? "rgba(220,70,70,0.7)" : "rgba(0,230,118,0.55)" }}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background: navScrolled ? "rgba(2,4,8,0.98)" : "rgba(2,4,8,0.85)",
        backdropFilter:"blur(24px) saturate(1.8)",
        borderBottom:`1px solid ${navScrolled?"rgba(0,230,118,0.12)":"rgba(0,230,118,0.06)"}`,
        padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between",
        height:"62px", transition:"all 0.3s",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"4px", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:"20px",
            background:"rgba(0,230,118,0.06)", border:"1px solid rgba(0,230,118,0.18)",
            boxShadow:"0 0 16px rgba(0,230,118,0.12)" }}>
            ⚖️
          </div>
          <div>
            <div style={{ fontSize:"17px", fontWeight:"800", color:"#00e676", letterSpacing:"0.2em",
              fontFamily:"var(--font-syne,serif)", lineHeight:1,
              textShadow:"0 0 24px rgba(0,230,118,0.5)" }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:"rgba(0,230,118,0.35)", letterSpacing:"0.25em",
              fontFamily:"var(--font-mono,monospace)", marginTop:"1px" }}>INTEL v2.0 · SAFUU.NET</div>
          </div>
        </div>

        <div className="hide-mob" style={{ display:"flex", gap:"32px", alignItems:"center" }}>
          {[["#how","PROCESS"],["#impact","IMPACT"],["#agencies","AGENCIES"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={l} href={h} className="nav-link">{l}</a>
          ))}
        </div>

        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary">
          <span style={{ animation:"blink 2s infinite" }}>█</span> REPORT_NOW()
        </a>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section style={{ minHeight:"96vh", display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", padding:"80px 40px 60px", position:"relative", zIndex:5, overflow:"hidden" }}>

        <div style={{ maxWidth:"960px", textAlign:"center" }}>

          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", marginBottom:"36px",
            background:"rgba(0,0,0,0.7)", border:"1px solid rgba(220,30,30,0.35)",
            borderRadius:"2px", padding:"8px 22px", backdropFilter:"blur(8px)",
            animation:"borderGlow 4s ease-in-out infinite" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#dc1e1e",
              animation:"pulseRed 2s infinite", display:"inline-block" }}/>
            <span style={{ fontSize:"10px", color:"rgba(200,70,70,0.9)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.22em" }}>
              SYSTEM :: ONLINE // ANONYMOUS // COURT-READY
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:"clamp(44px,8vw,96px)", fontWeight:"900", lineHeight:1.04,
            letterSpacing:"-0.02em", marginBottom:"24px", fontFamily:"'Georgia','Palatino Linotype',serif" }}>
            <span style={{ color:"rgba(255,255,255,0.95)", display:"block" }}>Corruption ends</span>
            <span style={{ color:"#00e676", display:"block",
              textShadow:"0 0 60px rgba(0,230,118,0.4), 0 0 120px rgba(0,230,118,0.15)" }}>when people refuse to be silent.</span>
          </h1>

          {/* Typewriter */}
          <div style={{ height:"48px", display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:"40px", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(220,30,30,0.15)", borderRadius:"2px",
            padding:"0 28px", maxWidth:"540px", margin:"0 auto 40px" }}>
            <span style={{ fontSize:"11px", color:"rgba(200,80,80,0.6)", fontFamily:"var(--font-mono,monospace)", marginRight:"12px" }}>FLAGGED:</span>
            <span style={{ fontSize:"14px", color:"rgba(255,100,100,0.85)", fontFamily:"var(--font-mono,monospace)", flex:1, textAlign:"left",
              textShadow:"0 0 10px rgba(255,60,60,0.3)" }}>
              {typedText}<span style={{ animation:"blink 0.8s infinite" }}>_</span>
            </span>
          </div>

          {/* Terminal */}
          <div style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(12px)",
            border:"1px solid rgba(0,230,118,0.1)", borderRadius:"6px", padding:"24px 28px",
            maxWidth:"600px", margin:"0 auto 48px", textAlign:"left",
            boxShadow:"0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,230,118,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"18px",
              paddingBottom:"12px", borderBottom:"1px solid rgba(0,230,118,0.07)" }}>
              <span style={{ width:"11px",height:"11px",borderRadius:"50%",background:"#ff5f57" }}/>
              <span style={{ width:"11px",height:"11px",borderRadius:"50%",background:"#ffbd2e" }}/>
              <span style={{ width:"11px",height:"11px",borderRadius:"50%",background:"#28c840" }}/>
              <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.25)", fontFamily:"var(--font-mono,monospace)", marginLeft:"10px" }}>
                safuu-intel // anonymous-pipeline v2.0
              </span>
            </div>
            <TermLine prefix="$" text="safuu --mode=anonymous --encrypt=AES256 --lang=am" delay={300}/>
            <TermLine prefix="›" text="Initialising secure pipeline..." delay={1100} color="rgba(0,230,118,0.5)"/>
            <TermLine prefix="›" text="Identity: NOT_STORED [ SHA-256 → irreversible ]"  delay={1900} color="rgba(0,230,118,0.6)"/>
            <TermLine prefix="›" text="Encryption: AES-256-GCM ✓ Ledger: SEALED ✓"       delay={2700} color="#00e676"/>
            <TermLine prefix="›" text="Pipeline READY. ሙስናን ሪፖርት አድርጉ — Speak."         delay={3500} color="#e8c84b"/>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"44px" }}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary"
              style={{ fontSize:"13px", padding:"16px 40px", animation:"pulseGreen 3.5s infinite" }}>
              ⚖ REPORT ANONYMOUSLY
            </a>
            <a href="#how" className="btn-ghost" style={{ padding:"16px 32px", fontSize:"12px" }}>
              HOW IT WORKS ↓
            </a>
          </div>

          {/* Trust strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", maxWidth:"600px", margin:"0 auto",
            background:"rgba(0,0,0,0.5)", border:"1px solid rgba(0,230,118,0.07)", borderRadius:"2px",
            backdropFilter:"blur(8px)" }}>
            {[
              ["IDENTITY","NULL // SHA-256"],
              ["LEDGER","HASH CHAIN"],
              ["LANGUAGES","11 ETHIOPIAN"],
            ].map(([k,v],i)=>(
              <div key={i} style={{ padding:"14px 16px", borderRight:i<2?"1px solid rgba(0,230,118,0.07)":"none" }}>
                <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.3)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.18em", marginBottom:"3px" }}>{k}</div>
                <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.7)", fontFamily:"var(--font-mono,monospace)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section ref={statsRef} id="impact" style={{ position:"relative", zIndex:5,
        borderTop:"1px solid rgba(0,230,118,0.08)", borderBottom:"1px solid rgba(0,230,118,0.08)",
        background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <Reveal style={{ textAlign:"center", padding:"52px 40px 28px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.28em" }}>
              ▸ PLATFORM_METRICS // LIVE
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
            borderTop:"1px solid rgba(0,230,118,0.05)" }}>
            {STATS.map((s,i)=>(
              <div key={i} style={{ borderRight:i<3?"1px solid rgba(0,230,118,0.06)":"none" }}>
                <StatCard {...s} active={statsActive} delay={i * 0.1}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section id="how" style={{ position:"relative", zIndex:5, padding:"100px 40px", maxWidth:"1000px", margin:"0 auto" }}>
        <Reveal style={{ marginBottom:"60px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.28em", marginBottom:"14px" }}>▸ PROCESS_FLOW()</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:"800", color:"rgba(255,255,255,0.95)", lineHeight:1.15, fontFamily:"'Georgia','Palatino Linotype',serif" }}>
            From tip to investigation<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 40px rgba(0,230,118,0.3)" }}>in four functions.</span>
          </h2>
        </Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"12px" }}>
          {PROCESS.map((s,i)=><Step key={i} {...s} delay={i*0.1}/>)}
        </div>
      </section>

      {/* ════════════ QUOTE ════════════ */}
      <div style={{ position:"relative", zIndex:5, overflow:"hidden",
        background:"linear-gradient(135deg,rgba(220,30,30,0.06),rgba(0,0,0,0),rgba(0,230,118,0.04))",
        borderTop:"1px solid rgba(220,30,30,0.12)", borderBottom:"1px solid rgba(220,30,30,0.12)",
        padding:"80px 40px" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"repeating-linear-gradient(45deg,rgba(220,30,30,0.015) 0px,rgba(220,30,30,0.015) 1px,transparent 1px,transparent 10px)",
          pointerEvents:"none" }}/>
        <Reveal style={{ position:"relative", maxWidth:"740px", margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:"80px", color:"rgba(0,230,118,0.1)", fontFamily:"Georgia,serif", lineHeight:0.7, marginBottom:"24px" }}>"</div>
          <p style={{ fontSize:"clamp(20px,2.8vw,28px)", fontWeight:"700", color:"rgba(255,255,255,0.9)",
            lineHeight:"1.6", marginBottom:"20px", fontStyle:"italic", letterSpacing:"-0.01em" }}>
            Every birr stolen from public funds is a school unfunded,
            a hospital understaffed, a road unpaved.
          </p>
          <div style={{ width:"48px", height:"1px", background:"rgba(0,230,118,0.4)", margin:"0 auto 16px" }}/>
          <div style={{ fontSize:"10px", color:"rgba(0,230,118,0.45)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.22em" }}>
            // ሙስና = ስርቆት — Malaanmmaltummaa = Hatuu
          </div>
        </Reveal>
      </div>

      {/* ════════════ SECURITY ════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"100px 40px", maxWidth:"1000px", margin:"0 auto" }}>
        <Reveal style={{ marginBottom:"60px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.28em", marginBottom:"14px" }}>▸ SECURITY_SPECS()</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:"800", color:"rgba(255,255,255,0.95)", lineHeight:1.15 }}>
            Zero trust.<br/>
            <span style={{ color:"#00e676" }}>Zero identity.</span>
          </h2>
        </Reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:"10px" }}>
          {SHIELDS.map((s,i)=><Shield key={i} {...s} delay={i*0.08}/>)}
        </div>
      </section>

      {/* ════════════ AGENCIES ════════════ */}
      <section id="agencies" style={{ position:"relative", zIndex:5,
        background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)",
        borderTop:"1px solid rgba(0,230,118,0.07)", padding:"80px 40px" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <Reveal style={{ marginBottom:"52px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.28em", marginBottom:"14px" }}>▸ ROUTE_TABLE()</div>
            <h2 style={{ fontSize:"clamp(24px,3vw,36px)", fontWeight:"800", color:"rgba(255,255,255,0.95)" }}>Ethiopian accountability bodies</h2>
            <p style={{ fontSize:"11px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", marginTop:"10px" }}>// SAFUU auto-matches each tip to the correct authority — no manual steps</p>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"10px" }}>
            {AGENCIES.map((a,i)=>(
              <Reveal key={a.name} delay={i*0.08}>
                <div className="card" style={{ background:"rgba(0,0,0,0.7)", borderRadius:"2px", padding:"22px",
                  borderLeft:`2px solid ${a.color}`, border:`1px solid rgba(255,255,255,0.04)` }}>
                  <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.25)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.12em", marginBottom:"6px" }}>AGENCY::{a.name}</div>
                  <div style={{ fontSize:"14px", fontWeight:"700", color:"rgba(255,255,255,0.9)", marginBottom:"2px", fontFamily:"var(--font-syne,serif)" }}>{a.name}</div>
                  <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", fontFamily:"var(--font-mono,monospace)", marginBottom:"8px" }}>{a.am}</div>
                  <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.2)", marginBottom:"14px", fontFamily:"var(--font-mono,monospace)" }}>{a.type}</div>
                  <div style={{ fontSize:"22px", fontWeight:"900", color:a.color, fontFamily:"var(--font-mono,monospace)",
                    textShadow:`0 0 16px ${a.color}66` }}>
                    {a.phone!=="•••"?`📞 ${a.phone}`:"✉ Contact"}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section id="faq" style={{ position:"relative", zIndex:5, padding:"100px 40px", maxWidth:"760px", margin:"0 auto" }}>
        <Reveal style={{ marginBottom:"56px" }}>
          <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.4)", fontFamily:"var(--font-mono,monospace)", letterSpacing:"0.28em", marginBottom:"14px" }}>▸ FAQ.execute()</div>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:"800", color:"rgba(255,255,255,0.95)" }}>Your questions answered.</h2>
        </Reveal>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq-row" onClick={()=>setFaq(openFaq===i?null:i)}
              style={{ borderRadius:"2px", border:`1px solid ${openFaq===i?"rgba(0,230,118,0.18)":"rgba(0,230,118,0.06)"}`,
                background:openFaq===i?"rgba(0,230,118,0.03)":"transparent" }}>
              <div style={{ padding:"18px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"clamp(13px,1.8vw,15px)", fontWeight:"600", color:"rgba(255,255,255,0.88)", paddingRight:"20px", fontFamily:"var(--font-syne,serif)" }}>{f.q}</span>
                <span style={{ color:"#00e676", fontSize:"20px", flexShrink:0, fontFamily:"var(--font-mono,monospace)",
                  transition:"transform 0.25s", display:"inline-block", transform:openFaq===i?"rotate(45deg)":"none" }}>+</span>
              </div>
              {openFaq===i && (
                <div style={{ padding:"0 22px 20px" }}>
                  <div style={{ height:"1px", background:"rgba(0,230,118,0.08)", marginBottom:"16px" }}/>
                  <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", lineHeight:"1.9", fontFamily:"var(--font-syne,serif)" }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section style={{ position:"relative", zIndex:5, padding:"120px 40px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(0,230,118,0.05) 1px,transparent 1px)",
          backgroundSize:"30px 30px", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center,rgba(0,230,118,0.04) 0%,transparent 65%)",
          pointerEvents:"none" }}/>
        <Reveal style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ fontSize:"56px", marginBottom:"28px", animation:"drift 5s ease-in-out infinite" }}>⚖️</div>
          <h2 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:"800", color:"rgba(255,255,255,0.95)",
            marginBottom:"16px", lineHeight:"1.12", letterSpacing:"-0.01em" }}>
            Silence protects the corrupt.<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 40px rgba(0,230,118,0.4)" }}>
              Your voice protects Ethiopia.
            </span>
          </h2>
          <div style={{ width:"60px", height:"1px", background:"rgba(0,230,118,0.4)", margin:"24px auto" }}/>
          <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.35)", lineHeight:"1.9", marginBottom:"44px",
            fontFamily:"var(--font-mono,monospace)" }}>
            ሙስናን ሪፖርት አድርጉ · Gabaasa malaanmmaltummaa<br/>
            <span style={{ color:"rgba(0,230,118,0.4)" }}>// anonymous · encrypted · verified · court-ready</span>
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary"
            style={{ fontSize:"14px", padding:"18px 48px", animation:"pulseGreen 3s infinite" }}>
            <span style={{ animation:"blink 1.2s infinite" }}>█</span> START REPORTING NOW
          </a>
          <div style={{ marginTop:"18px", fontSize:"10px", color:"rgba(0,230,118,0.25)", fontFamily:"var(--font-mono,monospace)" }}>
            // no smartphone? → SMS <strong style={{ color:"rgba(0,230,118,0.45)" }}>21000</strong>
          </div>
        </Reveal>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ position:"relative", zIndex:5,
        borderTop:"1px solid rgba(0,230,118,0.08)", padding:"40px 40px 28px",
        background:"rgba(0,0,0,0.92)" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"24px", marginBottom:"24px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
                <span style={{ fontSize:"18px" }}>⚖️</span>
                <span style={{ fontSize:"15px", fontWeight:"800", color:"#00e676",
                  fontFamily:"var(--font-syne,serif)", letterSpacing:"0.15em",
                  textShadow:"0 0 20px rgba(0,230,118,0.4)" }}>SAFUU INTEL</span>
              </div>
              <div style={{ fontSize:"10px", color:"rgba(0,230,118,0.25)", fontFamily:"var(--font-mono,monospace)", lineHeight:"1.9" }}>
                ሳፉ // Oromo: "Moral order"<br/>
                Ethiopian Anti-Corruption Intelligence Platform
              </div>
            </div>
            <div style={{ display:"flex", gap:"32px", flexWrap:"wrap", alignItems:"flex-start" }}>
              {[["/transparency","Transparency Wall"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuEthBot","Telegram Bot"]].map(([href,label])=>(
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                  className="nav-link" style={{ fontSize:"10px", color:"rgba(0,230,118,0.3)" }}>
                  ./{label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(0,230,118,0.05)", paddingTop:"20px",
            display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.15)", fontFamily:"var(--font-mono,monospace)" }}>
              © 2026 SAFUU_INTEL · FEACC:959 · EHRC:1488 · POLICE:911
            </span>
            <span style={{ fontSize:"9px", color:"rgba(0,230,118,0.15)", fontFamily:"var(--font-mono,monospace)" }}>
              {date} · safuu.net
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
