'use client';
import { useState, useEffect, useRef } from "react";

// ── Ge'ez rain (unchanged — atmospheric only) ─────────────────────────────────
function GeezRain() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const G = "ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቐቑቒቓቔቕቖቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦኧከኩኪካኬክኮዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦዪያዬይዮደዱዲዳዴድዶዸዹዺዻዼዽዾጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ01";
    const cols = Math.floor(c.width / 20);
    const drops = Array.from({length:cols}, () => ({ y:Math.random()*-80, s:0.2+Math.random()*0.5 }));
    let id;
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.12)"; ctx.fillRect(0,0,c.width,c.height);
      drops.forEach((d,i) => {
        const ch = G[Math.floor(Math.random()*G.length)];
        const b = 0.05 + Math.random()*0.15;
        ctx.fillStyle = `rgba(180,150,60,${b})`; ctx.font = `12px serif`;
        ctx.fillText(ch, i*20, d.y*20);
        d.y += d.s; if (d.y*20 > c.height+40) { d.y = -Math.random()*30; d.s = 0.2+Math.random()*0.5; }
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, opacity:0.08, pointerEvents:"none" }}/>;
}

// ── Reveal on scroll ──────────────────────────────────────────────────────────
function useReveal(t=0.1) {
  const ref = useRef(); const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if(e.isIntersecting){setV(true);o.disconnect();} }, {threshold:t});
    if(ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

// ── Counter ───────────────────────────────────────────────────────────────────
function useCount(target, active, ms=2200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s = null;
    const f = ts => { if(!s)s=ts; const p=Math.min((ts-s)/ms,1); setV(Math.floor((1-Math.pow(1-p,4))*target)); if(p<1)requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }, [target, active]);
  return v;
}

// ── Terminal line ──────────────────────────────────────────────────────────────
function TLine({ text, delay=0, dim=false }) {
  const [s, setS] = useState(""); const [on, setOn] = useState(false);
  useEffect(() => { const t=setTimeout(()=>setOn(true),delay); return()=>clearTimeout(t); },[delay]);
  useEffect(() => {
    if(!on||s.length>=text.length) return;
    const t=setTimeout(()=>setS(text.slice(0,s.length+1)),25); return()=>clearTimeout(t);
  },[on,s,text]);
  return (
    <div style={{ fontSize:"11px", lineHeight:"1.9", color:dim?"rgba(201,168,76,0.45)":"rgba(201,168,76,0.8)", fontFamily:"'Courier New',monospace", opacity:on?1:0, transition:"opacity 0.3s" }}>
      <span style={{ color:"rgba(201,168,76,0.25)", marginRight:"10px" }}>›</span>{s}
      {s.length<text.length&&on&&<span style={{ animation:"cur 0.8s steps(1) infinite" }}>_</span>}
    </div>
  );
}

const TYPES = ["land fraud","procurement bribery","customs extortion","court corruption","tax evasion","nepotism","embezzlement","police extortion"];
const STATS = [
  {n:233,s:"+",l:"Tips filed",          d:"all anonymous"},
  {n:139,s:"", l:"AI-verified reports", d:"forensics confirmed"},
  {n:15, s:"+",l:"Officials on record", d:"6 regions"},
  {n:3,  s:"", l:"Active investigations",d:"FEACC escalated"},
];
const AGENCIES = [
  {name:"FEACC",     am:"ፀረሙስና",   phone:"959",  c:"#4ade80"},
  {name:"EHRC",      am:"ሰብዓዊ",    phone:"1488", c:"#60a5fa"},
  {name:"Ombudsman", am:"ዕርቀ ሚካሄ", phone:"6060", c:"#a78bfa"},
  {name:"Police",    am:"ፖሊስ",     phone:"911",  c:"#f87171"},
  {name:"OFAG",      am:"ኦዲተር",    phone:"—",    c:"#fb923c"},
];
const FAQS = [
  {q:"Is reporting truly anonymous?", a:"Yes. SAFUU never stores your Telegram username, user ID, phone, or real name. One-way SHA-256 — impossible to reverse. Not even administrators can identify you."},
  {q:"What happens after I submit?",  a:"Claude AI categorizes type and severity. Evidence is forensically verified. The tip is auto-routed to the correct agency. Reports cluster — at threshold, name is disclosed publicly and formally escalated."},
  {q:"How does name disclosure work?",a:"Below threshold: only city and office shown — protecting against false accusations. At threshold: full name disclosed on the transparency wall and flagged for investigation."},
  {q:"No smartphone — can I report?", a:"Yes. SMS 21000. Format: SAFUU [Name] | [Office] | [What happened]. Any mobile phone. No internet needed. Same AI pipeline as Telegram."},
  {q:"Which languages are supported?",a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages auto-transcribed by Whisper."},
];

// ── Colors ────────────────────────────────────────────────────────────────────
const C = { bg:"#030507", gold:"#c9a84c", red:"#b82020", paper:"#f0e8d6", dim:"rgba(240,232,214,0.45)", faint:"rgba(240,232,214,0.12)", rule:"rgba(201,168,76,0.15)" };

export default function Safuu() {
  const [statsOn,  setStats]  = useState(false);
  const [typeIdx,  setTIdx]   = useState(0);
  const [typed,    setTyped]  = useState("");
  const [phase,    setPhase]  = useState("typing");
  const [faq,      setFaq]    = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, {passive:true}); return () => window.removeEventListener("scroll", fn);
  },[]);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if(e.isIntersecting)setStats(true); }, {threshold:0.2});
    if(statsRef.current) o.observe(statsRef.current); return ()=>o.disconnect();
  },[]);

  useEffect(() => {
    const w = TYPES[typeIdx];
    if(phase==="typing"){
      if(typed.length<w.length){const t=setTimeout(()=>setTyped(w.slice(0,typed.length+1)),55);return()=>clearTimeout(t);}
      else{const t=setTimeout(()=>setPhase("pause"),2000);return()=>clearTimeout(t);}
    } else if(phase==="pause"){const t=setTimeout(()=>setPhase("erase"),300);return()=>clearTimeout(t);}
    else{
      if(typed.length>0){const t=setTimeout(()=>setTyped(typed.slice(0,-1)),22);return()=>clearTimeout(t);}
      else{setTIdx(i=>(i+1)%TYPES.length);setPhase("typing");}
    }
  },[typed,phase,typeIdx]);

  return (
    <div style={{ background:C.bg, color:C.paper, fontFamily:"var(--font-body,sans-serif)", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        html{scroll-behavior:smooth}
        @keyframes cur    {0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes drift  {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes scan   {0%{top:-3%}100%{top:104%}}
        @keyframes fadeUp {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}

        /* No glowing borders, no neon — clean lines instead */
        .lnk:hover{color:${C.gold}!important;text-decoration:underline;text-underline-offset:4px}
        .pill:hover{background:rgba(201,168,76,0.1)!important}
        .btn-solid{background:${C.gold};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:13px 32px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase}
        .btn-solid:hover{background:#dbb85c;transform:translateY(-1px)}
        .btn-line{background:transparent;color:${C.paper};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:12px 28px;border:1px solid rgba(240,232,214,0.2);cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all 0.2s;text-transform:uppercase}
        .btn-line:hover{border-color:${C.gold};color:${C.gold}}
        .card-plain{background:rgba(255,255,255,0.02);border:1px solid ${C.rule};transition:all 0.2s}
        .card-plain:hover{background:rgba(201,168,76,0.04);border-color:rgba(201,168,76,0.3);transform:translateY(-2px)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.3)}::-webkit-scrollbar-track{background:#000}
        @media(max-width:640px){.hide-mob{display:none!important}}
        @media(max-width:900px){.hero-grid{grid-template-columns:1fr!important}}
        @media(max-width:700px){.stats-row{grid-template-columns:1fr 1fr!important}}
      `}</style>

      <GeezRain/>

      {/* Scan line */}
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${C.gold}22,transparent)`,animation:"scan 12s linear infinite"}}/>

      {/* ── TICKER ── */}
      <div style={{position:"relative",zIndex:10,background:"#0a0600",height:"26px",borderBottom:`1px solid ${C.rule}`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:C.red,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>
          INTEL
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 42s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {["SYSTEM :: ONLINE · ANONYMOUS · ENCRYPTED","ሙስና ይጥፋእ · JUSTICE WILL PREVAIL","IDENTITY_STORAGE :: NULL","ሙስናን ሪፖርት አድርጉ","AES-256-GCM · ACTIVE","Malaanmmaltummaa Dhabamu · Oromiffa",`SAFUU.NET · ${new Date().toISOString().slice(0,10)}`].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 28px",color:j%2===0?"rgba(201,168,76,0.6)":"rgba(200,80,80,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV — asymmetric, case-file style ── */}
      <nav style={{position:"sticky",top:0,zIndex:100,borderBottom:`1px solid ${C.rule}`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:scrolled?"rgba(3,5,7,0.97)":"rgba(3,5,7,0.88)",backdropFilter:"blur(16px)",transition:"background 0.3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0"}}>
          {/* Vertical gold rule */}
          <div style={{width:"3px",height:"36px",background:C.gold,marginRight:"16px",flexShrink:0}}/>
          <div>
            <div style={{fontSize:"19px",fontWeight:"900",color:C.paper,fontFamily:"var(--font-display,serif)",lineHeight:1,letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:C.gold,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",marginTop:"1px",opacity:0.7}}>INTEL · SAFUU.NET</div>
          </div>
        </div>

        <div className="hide-mob" style={{display:"flex",gap:"36px",alignItems:"center"}}>
          {[["#how","PROCESS"],["#impact","IMPACT"],["#agencies","AGENCIES"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:"rgba(240,232,214,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>

        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-solid">
          ⚖ REPORT
        </a>
      </nav>

      {/* ════════════ HERO — asymmetric grid ════════════ */}
      <section style={{position:"relative",zIndex:5,minHeight:"94vh",display:"flex",alignItems:"center",padding:"80px 40px 60px"}}>
        {/* Left red stripe accent */}
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:"4px",background:`linear-gradient(${C.red},transparent,${C.red})`}}/>

        <div className="hero-grid" style={{maxWidth:"1100px",margin:"0 auto",width:"100%",display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:"80px",alignItems:"center"}}>
          {/* LEFT — headline */}
          <div style={{animation:"fadeUp 0.9s ease-out"}}>
            {/* OVERLINE */}
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
              <div style={{width:"32px",height:"1px",background:C.red}}/>
              <span style={{fontSize:"9px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>INTEL REPORT · ETHIOPIA · {new Date().getFullYear()}</span>
            </div>

            <h1 style={{fontFamily:"var(--font-display,serif)",fontSize:"clamp(46px,7vw,84px)",fontWeight:"900",lineHeight:1.02,letterSpacing:"-0.02em",marginBottom:"32px"}}>
              <span style={{display:"block",color:C.paper}}>Corruption ends</span>
              <span style={{display:"block",color:C.gold,fontStyle:"italic"}}>when people</span>
              <span style={{display:"block",color:C.paper}}>refuse to be silent.</span>
            </h1>

            {/* Typewriter case */}
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"36px",paddingBottom:"28px",borderBottom:`1px solid ${C.rule}`}}>
              <div style={{width:"8px",height:"8px",background:C.red,flexShrink:0}}/>
              <span style={{fontSize:"11px",color:"rgba(200,80,80,0.7)",fontFamily:"'Courier New',monospace",letterSpacing:"0.08em"}}>FLAGGED:</span>
              <span style={{fontSize:"14px",color:"rgba(220,120,120,0.85)",fontFamily:"'Courier New',monospace",flex:1}}>
                {typed}<span style={{animation:"cur 0.8s steps(1) infinite"}}>_</span>
              </span>
            </div>

            <p style={{fontSize:"15px",color:C.dim,lineHeight:"1.85",marginBottom:"40px",maxWidth:"480px"}}>
              File anonymous tips by voice or text in any Ethiopian language.
              AI verifies evidence. Every report is sealed in a cryptographic ledger.
              Names disclosed when verified evidence reaches the threshold.
            </p>

            <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
              <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-solid">
                ⚖ Report Anonymously
              </a>
              <a href="#how" className="btn-line">See How It Works</a>
            </div>

            <div style={{marginTop:"32px",display:"flex",gap:"28px",flexWrap:"wrap"}}>
              {["SHA-256 · Identity null","AES-256-GCM · Encrypted","11 Ethiopian languages"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <div style={{width:"4px",height:"4px",background:C.gold,flexShrink:0}}/>
                  <span style={{fontSize:"10px",color:"rgba(201,168,76,0.5)",fontFamily:"'Courier New',monospace"}}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — terminal case file */}
          <div style={{animation:"fadeUp 1.1s ease-out"}}>
            {/* Case file header */}
            <div style={{borderTop:`2px solid ${C.gold}`,borderLeft:`2px solid ${C.gold}`,padding:"20px 24px 0",marginBottom:"0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
                <div>
                  <div style={{fontSize:"8px",color:C.gold,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"4px"}}>CASE FILE</div>
                  <div style={{fontSize:"11px",color:C.paper,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>SAFUU-INTEL-v2.0</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"8px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>STATUS</div>
                  <div style={{fontSize:"10px",color:"#4ade80",fontFamily:"'Courier New',monospace",marginTop:"2px"}}>● ACTIVE</div>
                </div>
              </div>
              <div style={{height:"1px",background:C.rule,marginBottom:"16px"}}/>
              <TLine text="$ safuu --mode=anonymous --encrypt=AES256"  delay={400}/>
              <TLine text="› Initialising secure pipeline..."           delay={1100} dim/>
              <TLine text="› Identity: NOT_STORED [ SHA-256 → irreversible ]" delay={1800}/>
              <TLine text="› Encryption: AES-256-GCM ✓  Ledger: SEALED ✓" delay={2600}/>
              <TLine text="› ሙስናን ሪፖርት አድርጉ — Pipeline READY." delay={3400}/>
              <div style={{height:"20px"}}/>
            </div>
            <div style={{borderLeft:`2px solid ${C.gold}`,borderBottom:`2px solid ${C.gold}`,padding:"0 24px 20px"}}>
              <div style={{height:"1px",background:C.rule,marginBottom:"16px"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                {[["REPORTS","233+"],["VERIFIED","139"],["REGIONS","6"],["AGENCIES","5"]].map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontSize:"8px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",marginBottom:"3px"}}>{k}</div>
                    <div style={{fontSize:"22px",fontWeight:"700",color:C.gold,fontFamily:"var(--font-display,serif)"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ STATS — newspaper-style full bleed ════════════ */}
      <section ref={statsRef} id="impact" style={{position:"relative",zIndex:5,borderTop:`1px solid ${C.rule}`,borderBottom:`1px solid ${C.rule}`,background:"rgba(0,0,0,0.5)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 40px"}}>
          <div className="stats-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {STATS.map((s,i)=>{
              const [ref,vis] = useReveal();
              const n = useCount(s.n, vis);
              return (
                <div key={i} ref={ref} style={{padding:"48px 32px",borderRight:i<3?`1px solid ${C.rule}`:"none",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`all 0.6s ${i*0.1}s ease`}}>
                  <div style={{fontSize:"clamp(48px,5vw,68px)",fontWeight:"900",color:C.paper,fontFamily:"var(--font-display,serif)",lineHeight:1,marginBottom:"8px",letterSpacing:"-0.02em"}}>
                    {n.toLocaleString()}{s.s}
                  </div>
                  <div style={{fontSize:"12px",color:C.gold,marginBottom:"4px",fontWeight:"500"}}>{s.l}</div>
                  <div style={{fontSize:"10px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace"}}>{s.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS — editorial column layout ════════════ */}
      <section id="how" style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          {/* Section header — left aligned, underlined */}
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"64px",paddingBottom:"20px",borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <span style={{fontSize:"10px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>PROCESS_FLOW</span>
            <div style={{flex:1,height:"1px",background:C.rule}}/>
            <h2 style={{fontSize:"clamp(28px,3.5vw,40px)",fontWeight:"900",fontFamily:"var(--font-display,serif)",color:C.paper,letterSpacing:"-0.01em",flexShrink:0}}>
              Four steps to accountability
            </h2>
          </div>
          );})()}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"0",borderLeft:`1px solid ${C.rule}`}}>
            {[
              {n:"01",icon:"📲",title:"Anonymous Input",     body:"Telegram voice or text. SMS from any phone. 11 Ethiopian languages. Zero identity stored."},
              {n:"02",icon:"🔬",title:"AI Forensic Verify",  body:"EXIF date analysis. AI-image detection at 94%. Whisper voice transcription. Claude severity scoring."},
              {n:"03",icon:"⚖️",title:"Auto-route to Agency",body:"Matched to FEACC, Police, Ombudsman, OFAG, or EHRC automatically. No manual steps."},
              {n:"04",icon:"📊",title:"Threshold Disclosure", body:"City and office shown immediately. Full name disclosed publicly when verified reports hit the configured threshold."},
            ].map((s,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} style={{padding:"36px 32px",borderRight:`1px solid ${C.rule}`,borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(20px)",transition:`all 0.65s ${i*0.12}s ease`}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
                  <span style={{fontSize:"9px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>{s.n}</span>
                  <div style={{flex:1,height:"1px",background:C.rule}}/>
                  <span style={{fontSize:"20px"}}>{s.icon}</span>
                </div>
                <div style={{fontSize:"16px",fontWeight:"700",color:C.paper,fontFamily:"var(--font-display,serif)",marginBottom:"14px",lineHeight:1.3}}>{s.title}</div>
                <div style={{fontSize:"13px",color:C.dim,lineHeight:"1.8"}}>{s.body}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ════════════ PULL QUOTE ════════════ */}
      <div style={{position:"relative",zIndex:5,background:"rgba(201,168,76,0.05)",borderTop:`1px solid ${C.rule}`,borderBottom:`1px solid ${C.rule}`,padding:"72px 40px",overflow:"hidden"}}>
        <div style={{position:"absolute",left:"40px",top:"50%",transform:"translateY(-50%)",fontSize:"200px",color:"rgba(201,168,76,0.06)",fontFamily:"var(--font-display,serif)",lineHeight:1,pointerEvents:"none",userSelect:"none"}}>"</div>
        {(()=>{const [r,v]=useReveal();return(
        <div ref={r} style={{maxWidth:"760px",margin:"0 auto",position:"relative",opacity:v?1:0,transform:v?"none":"translateY(20px)",transition:"all 0.8s ease"}}>
          <p style={{fontSize:"clamp(20px,2.8vw,28px)",fontWeight:"700",fontFamily:"var(--font-display,serif)",fontStyle:"italic",color:C.paper,lineHeight:"1.55",marginBottom:"24px"}}>
            Every birr stolen from public funds is a school unfunded,
            a hospital understaffed, a road unpaved.
          </p>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <div style={{width:"40px",height:"1px",background:C.gold}}/>
            <span style={{fontSize:"10px",color:"rgba(201,168,76,0.5)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em"}}>ሙስና = ስርቆት · Malaanmmaltummaa = Hatuu</span>
          </div>
        </div>
        );})()}
      </div>

      {/* ════════════ SECURITY ════════════ */}
      <section style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"64px",paddingBottom:"20px",borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <span style={{fontSize:"10px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>SECURITY_SPECS</span>
            <div style={{flex:1,height:"1px",background:C.rule}}/>
            <h2 style={{fontSize:"clamp(28px,3.5vw,40px)",fontWeight:"900",fontFamily:"var(--font-display,serif)",color:C.paper,letterSpacing:"-0.01em",flexShrink:0}}>
              Zero trust. Zero identity.
            </h2>
          </div>
          );})()}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"0",borderLeft:`1px solid ${C.rule}`}}>
            {[
              {code:"SHA-256",  label:"Identity",    val:"One-way hash. Irreversible.",       icon:"🔐"},
              {code:"AES-256",  label:"Encryption",  val:"GCM at rest. All fields.",          icon:"🔒"},
              {code:"HIVE_AI",  label:"Fake detect", val:"94% AI-image accuracy.",            icon:"🤖"},
              {code:"LEDGER",   label:"Evidence",    val:"Tamper-evident hash chain.",         icon:"⛓️"},
              {code:"WHISPER",  label:"Languages",   val:"11 Ethiopian languages.",            icon:"🗣️"},
              {code:"AUTOROUTE",label:"Routing",     val:"5 agencies. Zero delay.",            icon:"⚡"},
            ].map((s,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} style={{display:"flex",gap:"16px",padding:"28px 32px",borderRight:`1px solid ${C.rule}`,borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:`all 0.55s ${i*0.07}s ease`}}>
                <span style={{fontSize:"22px",flexShrink:0}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:"8px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"4px"}}>[{s.code}]</div>
                  <div style={{fontSize:"14px",fontWeight:"700",color:C.paper,marginBottom:"3px"}}>{s.val}</div>
                  <div style={{fontSize:"10px",color:"rgba(201,168,76,0.4)",fontFamily:"'Courier New',monospace"}}>{s.label}</div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ════════════ AGENCIES ════════════ */}
      <section id="agencies" style={{position:"relative",zIndex:5,background:"rgba(0,0,0,0.5)",borderTop:`1px solid ${C.rule}`,padding:"80px 40px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{display:"flex",alignItems:"baseline",gap:"20px",marginBottom:"52px",paddingBottom:"20px",borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <span style={{fontSize:"10px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700",flexShrink:0}}>ROUTE_TABLE</span>
            <div style={{flex:1,height:"1px",background:C.rule}}/>
            <h2 style={{fontSize:"clamp(24px,3vw,36px)",fontWeight:"900",fontFamily:"var(--font-display,serif)",color:C.paper,letterSpacing:"-0.01em",flexShrink:0}}>Ethiopian accountability bodies</h2>
          </div>
          );})()}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:"12px"}}>
            {AGENCIES.map((a,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={a.name} ref={r} className="card-plain" style={{padding:"24px",borderLeft:`3px solid ${a.c}`,opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:`all 0.55s ${i*0.08}s ease`}}>
                <div style={{fontSize:"8px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",marginBottom:"6px"}}>AGENCY</div>
                <div style={{fontSize:"16px",fontWeight:"700",color:C.paper,fontFamily:"var(--font-display,serif)",marginBottom:"2px"}}>{a.name}</div>
                <div style={{fontSize:"11px",color:C.dim,fontFamily:"'Courier New',monospace",marginBottom:"14px"}}>{a.am}</div>
                <div style={{fontSize:"24px",fontWeight:"900",color:a.c,fontFamily:"var(--font-display,serif)"}}>{a.phone!=="—"?`📞 ${a.phone}`:"✉"}</div>
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ════════════ FAQ ════════════ */}
      <section id="faq" style={{position:"relative",zIndex:5,padding:"100px 40px"}}>
        <div style={{maxWidth:"760px",margin:"0 auto"}}>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{marginBottom:"52px",opacity:v?1:0,transform:v?"none":"translateY(16px)",transition:"all 0.6s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
              <div style={{width:"24px",height:"1px",background:C.red}}/>
              <span style={{fontSize:"9px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em"}}>FAQ.execute()</span>
            </div>
            <h2 style={{fontSize:"clamp(26px,3.5vw,38px)",fontWeight:"900",fontFamily:"var(--font-display,serif)",color:C.paper}}>Your questions answered.</h2>
          </div>
          );})()}
          <div style={{display:"flex",flexDirection:"column",gap:"0",borderTop:`1px solid ${C.rule}`}}>
            {FAQS.map((f,i)=>{
              const [r,v]=useReveal();
              return(
              <div key={i} ref={r} style={{borderBottom:`1px solid ${C.rule}`,opacity:v?1:0,transform:v?"none":"translateY(12px)",transition:`all 0.5s ${i*0.07}s ease`}} onClick={()=>setFaq(faq===i?null:i)}>
                <div style={{padding:"22px 0",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                  <span style={{fontSize:"clamp(14px,1.8vw,16px)",fontWeight:"700",color:faq===i?C.gold:C.paper,fontFamily:"var(--font-display,serif)",paddingRight:"20px",transition:"color 0.2s"}}>{f.q}</span>
                  <span style={{color:C.gold,fontSize:"22px",flexShrink:0,fontFamily:"var(--font-display,serif)",transition:"transform 0.25s",display:"inline-block",transform:faq===i?"rotate(45deg)":"none",fontWeight:"300"}}>+</span>
                </div>
                {faq===i&&<div style={{paddingBottom:"22px"}}>
                  <p style={{fontSize:"14px",color:C.dim,lineHeight:"1.85"}}>{f.a}</p>
                </div>}
              </div>
            );})}
          </div>
        </div>
      </section>

      {/* ════════════ CTA — stark, high contrast ════════════ */}
      <section style={{position:"relative",zIndex:5,overflow:"hidden"}}>
        {/* Full-width gold rule */}
        <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>
        <div style={{padding:"100px 40px 120px",position:"relative"}}>
          {/* Large background ⚖ */}
          <div style={{position:"absolute",right:"5%",top:"50%",transform:"translateY(-50%)",fontSize:"320px",color:"rgba(201,168,76,0.04)",fontFamily:"var(--font-display,serif)",lineHeight:1,pointerEvents:"none",userSelect:"none",animation:"drift 6s ease-in-out infinite"}}>⚖</div>
          {(()=>{const [r,v]=useReveal();return(
          <div ref={r} style={{maxWidth:"680px",position:"relative",opacity:v?1:0,transform:v?"none":"translateY(20px)",transition:"all 0.8s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px"}}>
              <div style={{width:"24px",height:"1px",background:C.red}}/>
              <span style={{fontSize:"9px",color:C.red,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em"}}>ACT NOW</span>
            </div>
            <h2 style={{fontFamily:"var(--font-display,serif)",fontSize:"clamp(36px,6vw,68px)",fontWeight:"900",lineHeight:1.05,letterSpacing:"-0.02em",marginBottom:"20px"}}>
              <span style={{color:C.paper}}>Silence protects</span>
              <span style={{color:C.red,fontStyle:"italic",display:"block"}}>the corrupt.</span>
              <span style={{color:C.gold}}>Speak up.</span>
            </h2>
            <div style={{width:"60px",height:"2px",background:C.gold,marginBottom:"24px"}}/>
            <p style={{fontSize:"14px",color:C.dim,lineHeight:"1.85",marginBottom:"44px",maxWidth:"480px"}}>
              ሙስናን ሪፖርት አድርጉ · Gabaasa malaanmmaltummaa<br/>
              Anonymous · Encrypted · Verified · Court-ready
            </p>
            <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
              <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-solid" style={{fontSize:"13px",padding:"16px 40px"}}>
                ⚖ Start Reporting Now
              </a>
            </div>
            <div style={{marginTop:"16px",fontSize:"10px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace"}}>
              No smartphone? · SMS <strong style={{color:"rgba(201,168,76,0.5)"}}>21000</strong>
            </div>
          </div>
          );})()}
        </div>
        <div style={{height:"2px",background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{position:"relative",zIndex:5,borderTop:`1px solid ${C.rule}`,padding:"40px 40px 32px",background:"rgba(0,0,0,0.9)"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"24px",marginBottom:"24px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0"}}>
              <div style={{width:"3px",height:"36px",background:C.gold,marginRight:"16px",flexShrink:0}}/>
              <div>
                <div style={{fontSize:"16px",fontWeight:"900",color:C.paper,fontFamily:"var(--font-display,serif)",letterSpacing:"0.05em"}}>SAFUU INTEL</div>
                <div style={{fontSize:"9px",color:"rgba(201,168,76,0.3)",fontFamily:"'Courier New',monospace",marginTop:"2px",letterSpacing:"0.15em"}}>ሳፉ · MORAL ORDER · ETHIOPIA</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"32px",flexWrap:"wrap"}}>
              {[["/transparency","Transparency Wall"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuEthBot","Telegram"]].map(([h,l])=>(
                <a key={l} href={h} target={h.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="lnk" style={{fontSize:"10px",color:"rgba(240,232,214,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${C.rule}`,paddingTop:"20px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.2)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · FEACC:959 · EHRC:1488 · POLICE:911</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.2)",fontFamily:"'Courier New',monospace"}}>{new Date().toISOString().slice(0,10)} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
