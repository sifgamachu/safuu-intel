'use client';
import { useState, useEffect, useRef } from "react";

function useCountUp(target, active, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active, duration]);
  return val;
}

const CORRUPTION_TYPES = ["Land fraud","Procurement bribery","Customs extortion","Court corruption","Tax evasion","Nepotism","Embezzlement","Police extortion","Healthcare theft","Education bribery"];

const IMPACT_STATS = [
  { val:233, suffix:"+", label:"Anonymous tips filed",     sub:"All identities protected"    },
  { val:139, suffix:"",  label:"Reports verified by AI",   sub:"EXIF + forensics + Hive AI"  },
  { val:15,  suffix:"+", label:"Officials under scrutiny", sub:"Across 6 regions"            },
  { val:3,   suffix:"",  label:"Active investigations",    sub:"FEACC + Federal Police"      },
];

const HOW = [
  { n:"01", icon:"📲", title:"Report — any device, any language",         body:"Telegram voice or text. SMS from any feature phone. Amharic, Oromiffa, Tigrinya, Somali, Afar and 6 more Ethiopian languages all accepted." },
  { n:"02", icon:"🔬", title:"Evidence verified by AI forensics",          body:"Photos checked for AI generation and EXIF manipulation. Voice transcribed by Whisper. Claude AI categorizes corruption type and severity." },
  { n:"03", icon:"⚖️", title:"Auto-routed to the right authority",        body:"Each tip matched to FEACC, Federal Police, Ombudsman, Ministry of Finance, or EHRC by type. No manual routing. No delays." },
  { n:"04", icon:"📊", title:"Public accountability — threshold disclosure",body:"City and office shown immediately. Full name disclosed publicly when verified reports reach the threshold. Set by administrators." },
];

const TRUST_GRID = [
  { icon:"🔐", label:"Identity",     val:"Never stored",             detail:"One-way SHA-256 hash. Not even admins can identify you." },
  { icon:"⛓️", label:"Evidence",     val:"Cryptographically sealed", detail:"Every tip sealed in an immutable hash chain. Court-ready." },
  { icon:"🤖", label:"AI Detection", val:"94% accuracy",             detail:"Hive Moderation API detects AI-generated fake images." },
  { icon:"📡", label:"Channels",     val:"Telegram + SMS",           detail:"Smartphones and basic feature phones. No internet for SMS." },
  { icon:"🗣️", label:"Languages",    val:"11 Ethiopian languages",   detail:"AM · OR · TI · SO · AF · SI · WO · HA · DA · GA · BE" },
  { icon:"🏛️", label:"Auto-route",   val:"5 Ethiopian agencies",     detail:"FEACC · EHRC · Federal Police · Ombudsman · OFAG" },
];

const FAQS = [
  { q:"Is reporting really anonymous?",        a:"Yes — completely. SAFUU never stores your Telegram username, user ID, phone number, or real name. We use one-way SHA-256 cryptographic hashing — mathematically impossible to reverse. Not even Safuu administrators can identify who filed a report." },
  { q:"What happens after I submit?",          a:"Your tip is analyzed by Claude AI for corruption type and severity, forensically verified (EXIF, AI image detection), and automatically routed to the appropriate Ethiopian agency. Reports on the same official cluster together — when verified reports reach the configured threshold, the name is disclosed publicly." },
  { q:"How does name disclosure work?",        a:"Below the threshold, only the official's city and office are publicly shown — protecting against false accusations. Once enough verified, independent reports confirm the pattern, the full name is disclosed on the public transparency wall and formally escalated." },
  { q:"What if I don't have a smartphone?",   a:"Send an SMS to shortcode 21000. Format: SAFUU [Name] | [Office] | [What happened]. Works from any mobile phone, no internet needed. Your report goes through the exact same AI analysis pipeline as Telegram reports." },
  { q:"Can I report in my own language?",      a:"Yes. Voice messages are transcribed by OpenAI Whisper which understands Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, and Bench. Text reports in any of these languages are accepted too." },
  { q:"How do I know evidence won't be altered?",a:"Every tip is cryptographically sealed using a hash chain. Each report references the hash of the previous one, making silent tampering mathematically detectable. The entire chain is integrity-checked on every access." },
];

export default function SafuuLanding() {
  const [statsActive, setStatsActive] = useState(false);
  const [typingIdx, setTypingIdx]     = useState(0);
  const [typedText, setTypedText]     = useState("");
  const [typePhase, setTypePhase]     = useState("typing");
  const [openFaq, setOpenFaq]         = useState(null);
  const statsRef = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold:0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const word = CORRUPTION_TYPES[typingIdx];
    if (typePhase === "typing") {
      if (typedText.length < word.length) { const t = setTimeout(() => setTypedText(word.slice(0,typedText.length+1)),60); return ()=>clearTimeout(t); }
      else { const t = setTimeout(()=>setTypePhase("pausing"),1800); return ()=>clearTimeout(t); }
    } else if (typePhase === "pausing") {
      const t = setTimeout(()=>setTypePhase("erasing"),400); return ()=>clearTimeout(t);
    } else {
      if (typedText.length > 0) { const t = setTimeout(()=>setTypedText(typedText.slice(0,-1)),30); return ()=>clearTimeout(t); }
      else { setTypingIdx(i=>(i+1)%CORRUPTION_TYPES.length); setTypePhase("typing"); }
    }
  }, [typedText, typePhase, typingIdx]);

  const C = { gold:"#e8c84b", bg:"#08090d", text:"#f0e9d8", muted:"rgba(240,233,216,0.4)", dim:"rgba(240,233,216,0.15)", panel:"#0c0d12" };

  return (
    <div style={{ background:C.bg, color:C.text, fontFamily:"'Georgia','Palatino Linotype',serif", overflowX:"hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,200,75,0.4)}60%{box-shadow:0 0 0 14px rgba(232,200,75,0)}}
        @keyframes blink{0%,100%{opacity:1}49%{opacity:1}50%{opacity:0}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .btn-primary:hover{box-shadow:0 0 32px rgba(232,200,75,0.5)!important;transform:translateY(-2px)}
        .btn-ghost:hover{background:rgba(232,200,75,0.08)!important}
        .card:hover{border-color:rgba(232,200,75,0.3)!important;transform:translateY(-3px)}
        .faq:hover{background:rgba(232,200,75,0.04)!important}
        .nav-a:hover{color:#e8c84b!important}
        @media(max-width:640px){.hide-mob{display:none!important}}
      `}</style>

      {/* Scanlines */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)"}}/>

      {/* Marquee ticker */}
      <div style={{background:C.gold,height:"30px",overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{display:"flex",animation:"marquee 32s linear infinite",whiteSpace:"nowrap"}}>
          {[...Array(2)].map((_,i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center"}}>
              {["⚖ ACCOUNTABILITY","🔐 ZERO IDENTITY STORED","📊 AI-VERIFIED EVIDENCE","🇪🇹 SERVING ETHIOPIA","⚖ COURT-READY LEDGER","📱 WORKS ON ANY PHONE","⚖ SAFUU.NET — REPORT NOW"].map((t,j)=>(
                <span key={j} style={{fontSize:"10px",fontWeight:"800",color:C.bg,fontFamily:"monospace",letterSpacing:"0.12em",padding:"0 28px"}}>
                  {t} <span style={{opacity:0.4,marginLeft:"12px"}}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,9,13,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(232,200,75,0.1)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"56px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"34px",height:"34px",background:"rgba(232,200,75,0.1)",border:"1px solid rgba(232,200,75,0.3)",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:C.gold,letterSpacing:"0.15em",fontFamily:"monospace",lineHeight:1}}>SAFUU</div>
            <div style={{fontSize:"7px",color:"rgba(232,200,75,0.4)",letterSpacing:"0.2em",fontFamily:"monospace"}}>ANTI-CORRUPTION INTEL</div>
          </div>
        </div>
        <div className="hide-mob" style={{display:"flex",gap:"28px",alignItems:"center"}}>
          {[["#how","HOW IT WORKS"],["#impact","IMPACT"],["#agencies","AGENCIES"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={l} href={h} className="nav-a" style={{fontSize:"10px",color:"rgba(232,200,75,0.5)",fontFamily:"monospace",letterSpacing:"0.12em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary"
          style={{background:C.gold,color:C.bg,fontFamily:"monospace",fontSize:"10px",fontWeight:"800",padding:"9px 20px",borderRadius:"5px",letterSpacing:"0.12em",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"7px"}}>
          ⚖ REPORT NOW
        </a>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"96vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 32px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(232,200,75,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(232,200,75,0.04) 1px,transparent 1px)",backgroundSize:"80px 80px"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 30%,#08090d 80%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",left:0,right:0,height:"2px",background:"linear-gradient(transparent,rgba(232,200,75,0.06),transparent)",animation:"scan 7s linear infinite",pointerEvents:"none"}}/>

        <div style={{position:"relative",maxWidth:"900px",textAlign:"center",animation:"fadeUp 0.8s ease-out"}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"28px",background:"rgba(232,200,75,0.08)",border:"1px solid rgba(232,200,75,0.25)",borderRadius:"4px",padding:"6px 16px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:C.gold,animation:"blink 1.2s infinite",display:"inline-block"}}/>
            <span style={{fontSize:"10px",color:C.gold,fontFamily:"monospace",letterSpacing:"0.2em"}}>ETHIOPIA'S ANONYMOUS ANTI-CORRUPTION PLATFORM</span>
          </div>

          {/* Headline */}
          <h1 style={{fontSize:"clamp(42px,8vw,86px)",fontWeight:"900",lineHeight:"1.05",letterSpacing:"-0.02em",marginBottom:"24px",color:C.text}}>
            Corruption ends when<br/>
            <span style={{color:C.gold,textShadow:"0 0 60px rgba(232,200,75,0.3)"}}>people refuse to be silent.</span>
          </h1>

          {/* Typewriter */}
          <div style={{height:"40px",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"32px"}}>
            <span style={{fontSize:"clamp(14px,2vw,18px)",color:C.muted,fontFamily:"monospace"}}>Reporting:&nbsp;</span>
            <span style={{fontSize:"clamp(14px,2vw,18px)",color:C.gold,fontFamily:"monospace",minWidth:"200px",textAlign:"left"}}>
              {typedText}<span style={{animation:"blink 1s infinite"}}>|</span>
            </span>
          </div>

          <p style={{fontSize:"clamp(14px,1.8vw,17px)",color:C.muted,lineHeight:"1.85",maxWidth:"560px",margin:"0 auto 44px"}}>
            File anonymous tips by voice or text in any Ethiopian language.
            AI verifies evidence. Cases are sealed in a cryptographic ledger.
            Names are disclosed when the evidence threshold is reached.
          </p>

          {/* CTAs */}
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap",marginBottom:"44px"}}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary"
              style={{display:"flex",alignItems:"center",gap:"10px",background:C.gold,color:C.bg,padding:"15px 32px",borderRadius:"5px",fontFamily:"monospace",fontSize:"13px",fontWeight:"900",letterSpacing:"0.1em",transition:"all 0.2s"}}>
              ⛓️ REPORT ANONYMOUSLY
            </a>
            <a href="#how" className="btn-ghost"
              style={{display:"flex",alignItems:"center",gap:"10px",background:"transparent",color:"rgba(240,233,216,0.7)",padding:"15px 32px",borderRadius:"5px",border:"1px solid rgba(240,233,216,0.15)",fontFamily:"monospace",fontSize:"12px",letterSpacing:"0.1em",transition:"all 0.2s"}}>
              HOW IT WORKS ↓
            </a>
          </div>

          {/* Trust row */}
          <div style={{display:"flex",gap:"24px",justifyContent:"center",flexWrap:"wrap"}}>
            {["👁 Identity never stored","🔒 AES-256-GCM encrypted","📡 Works on any phone","⚖️ Court-ready evidence"].map((t,i)=>(
              <div key={i} style={{fontSize:"11px",color:"rgba(240,233,216,0.3)",fontFamily:"monospace"}}>{t}</div>
            ))}
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"100px",background:"linear-gradient(transparent,#08090d)",pointerEvents:"none"}}/>
      </section>

      {/* IMPACT STATS */}
      <section ref={statsRef} id="impact" style={{borderTop:"1px solid rgba(232,200,75,0.1)",borderBottom:"1px solid rgba(232,200,75,0.1)",background:"rgba(232,200,75,0.03)",padding:"60px 32px"}}>
        <div style={{maxWidth:"960px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(232,200,75,0.6)",fontFamily:"monospace",marginBottom:"10px"}}>▸ PLATFORM IMPACT</div>
            <h2 style={{fontSize:"clamp(22px,3vw,28px)",fontWeight:"700",color:C.text}}>Accountability by the numbers</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1px",background:"rgba(232,200,75,0.08)",borderRadius:"8px",overflow:"hidden"}}>
            {IMPACT_STATS.map((s,i)=>{
              const n = useCountUp(s.val, statsActive, 2000+i*200);
              return (
                <div key={i} style={{padding:"32px 24px",background:C.bg,textAlign:"center"}}>
                  <div style={{fontSize:"clamp(36px,5vw,58px)",fontWeight:"900",color:C.gold,lineHeight:1,marginBottom:"8px",textShadow:"0 0 40px rgba(232,200,75,0.3)"}}>{n.toLocaleString()}{s.suffix}</div>
                  <div style={{fontSize:"12px",color:C.text,fontWeight:"600",marginBottom:"5px"}}>{s.label}</div>
                  <div style={{fontSize:"10px",color:C.muted,fontFamily:"monospace"}}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{padding:"100px 32px",maxWidth:"960px",margin:"0 auto"}}>
        <div style={{marginBottom:"56px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(232,200,75,0.6)",fontFamily:"monospace",marginBottom:"12px"}}>▸ HOW IT WORKS</div>
          <h2 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:"800",color:C.text,lineHeight:"1.2"}}>From tip to investigation<br/><span style={{color:C.gold}}>in four steps.</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"1px",background:"rgba(232,200,75,0.08)",borderRadius:"8px",overflow:"hidden"}}>
          {HOW.map((s,i)=>(
            <div key={i} className="card" style={{background:C.panel,padding:"32px 28px",borderTop:`3px solid ${["#e8c84b","rgba(232,200,75,0.6)","rgba(232,200,75,0.35)","rgba(232,200,75,0.15)"][i]}`,transition:"all 0.2s",border:"1px solid transparent"}}>
              <div style={{fontSize:"9px",color:"rgba(232,200,75,0.4)",fontFamily:"monospace",letterSpacing:"0.2em",marginBottom:"16px"}}>{s.n}</div>
              <div style={{fontSize:"28px",marginBottom:"14px"}}>{s.icon}</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:C.text,marginBottom:"12px",lineHeight:"1.4"}}>{s.title}</div>
              <div style={{fontSize:"12px",color:C.muted,lineHeight:"1.85"}}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PULL QUOTE */}
      <div style={{background:"linear-gradient(135deg,#e8c84b,#b8960a)",padding:"52px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(0,0,0,0.05) 0px,rgba(0,0,0,0.05) 1px,transparent 1px,transparent 12px)",pointerEvents:"none"}}/>
        <div style={{position:"relative",maxWidth:"680px",margin:"0 auto"}}>
          <div style={{fontSize:"44px",marginBottom:"16px",opacity:0.25,fontFamily:"Georgia",lineHeight:1}}>"</div>
          <div style={{fontSize:"clamp(18px,3vw,24px)",fontWeight:"800",color:C.bg,lineHeight:"1.5",marginBottom:"14px",fontStyle:"italic"}}>
            Every birr stolen from public funds is a school unfunded,
            a hospital unstaffed, a road unpaved.
          </div>
          <div style={{fontSize:"10px",color:"rgba(8,9,13,0.55)",fontFamily:"monospace",letterSpacing:"0.15em"}}>
            SAFUU EXISTS BECAUSE SILENCE IS COMPLICITY
          </div>
        </div>
      </div>

      {/* TRUST GRID */}
      <section style={{padding:"100px 32px",maxWidth:"960px",margin:"0 auto"}}>
        <div style={{marginBottom:"56px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(232,200,75,0.6)",fontFamily:"monospace",marginBottom:"12px"}}>▸ BUILT FOR PROTECTION</div>
          <h2 style={{fontSize:"clamp(26px,4vw,38px)",fontWeight:"800",color:C.text,lineHeight:"1.2"}}>The system protects you<br/><span style={{color:C.gold}}>by design.</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"14px"}}>
          {TRUST_GRID.map((t,i)=>(
            <div key={i} className="card" style={{background:C.panel,border:"1px solid rgba(232,200,75,0.07)",borderRadius:"8px",padding:"26px",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                <span style={{fontSize:"22px"}}>{t.icon}</span>
                <div>
                  <div style={{fontSize:"9px",color:"rgba(232,200,75,0.5)",fontFamily:"monospace",letterSpacing:"0.15em"}}>{t.label.toUpperCase()}</div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:C.gold}}>{t.val}</div>
                </div>
              </div>
              <div style={{fontSize:"12px",color:C.muted,lineHeight:"1.75"}}>{t.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AGENCIES */}
      <section id="agencies" style={{background:"rgba(232,200,75,0.03)",borderTop:"1px solid rgba(232,200,75,0.1)",borderBottom:"1px solid rgba(232,200,75,0.1)",padding:"80px 32px"}}>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <div style={{marginBottom:"44px"}}>
            <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(232,200,75,0.6)",fontFamily:"monospace",marginBottom:"12px"}}>▸ WHERE REPORTS GO</div>
            <h2 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:"800",color:C.text}}>Ethiopian accountability bodies</h2>
            <p style={{fontSize:"12px",color:C.muted,fontFamily:"monospace",marginTop:"8px"}}>Safuu automatically matches each tip to the correct authority.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:"10px"}}>
            {[
              {name:"FEACC",am:"ፀረሙስና ኮሚሽን",phone:"959", type:"All corruption types",    color:"#4ade80"},
              {name:"EHRC", am:"የሰብዓዊ መብት",   phone:"1488",type:"Human rights violations", color:"#60a5fa"},
              {name:"Ombudsman",am:"ዕርቀ ሚካሄ",  phone:"6060",type:"Abuse of power",          color:"#c084fc"},
              {name:"Federal Police",am:"ፌደራል ፖሊስ",phone:"911",type:"Criminal corruption",color:"#f87171"},
              {name:"OFAG",am:"ዋና ኦዲተር",       phone:"mail",type:"Public fund misuse",      color:"#fb923c"},
            ].map(a=>(
              <div key={a.name} className="card" style={{background:C.panel,borderRadius:"8px",padding:"20px",borderLeft:`3px solid ${a.color}`,border:`1px solid rgba(255,255,255,0.04)`,transition:"all 0.2s"}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:C.text,marginBottom:"2px"}}>{a.name}</div>
                <div style={{fontSize:"10px",color:C.muted,marginBottom:"10px",fontFamily:"monospace"}}>{a.am}</div>
                <div style={{fontSize:"9px",color:"rgba(240,233,216,0.25)",marginBottom:"12px",fontFamily:"monospace",lineHeight:"1.5"}}>{a.type}</div>
                <div style={{fontSize:"18px",fontWeight:"900",color:a.color,fontFamily:"monospace"}}>{a.phone==="mail"?"✉ Email":`📞 ${a.phone}`}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:"100px 32px",maxWidth:"760px",margin:"0 auto"}}>
        <div style={{marginBottom:"52px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.25em",color:"rgba(232,200,75,0.6)",fontFamily:"monospace",marginBottom:"12px"}}>▸ FREQUENTLY ASKED</div>
          <h2 style={{fontSize:"clamp(24px,3.5vw,34px)",fontWeight:"800",color:C.text}}>Your questions, answered.</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq" style={{borderRadius:"6px",overflow:"hidden",transition:"background 0.15s",cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
              <div style={{padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${openFaq===i?"rgba(232,200,75,0.15)":"rgba(255,255,255,0.04)"}`}}>
                <span style={{fontSize:"clamp(13px,1.8vw,15px)",fontWeight:"600",color:C.text,paddingRight:"20px"}}>{f.q}</span>
                <span style={{color:C.gold,fontSize:"20px",flexShrink:0,fontFamily:"monospace",transition:"transform 0.2s",display:"inline-block",transform:openFaq===i?"rotate(45deg)":"none"}}>+</span>
              </div>
              {openFaq===i && (
                <div style={{padding:"16px 20px 20px",animation:"fadeIn 0.2s ease-out",background:"rgba(232,200,75,0.03)"}}>
                  <p style={{fontSize:"13px",color:C.muted,lineHeight:"1.85"}}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{padding:"100px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:"400px",opacity:0.025,pointerEvents:"none",lineHeight:1}}>⚖️</div>
        <div style={{position:"relative",maxWidth:"640px",margin:"0 auto"}}>
          <div style={{fontSize:"52px",marginBottom:"24px",animation:"drift 5s ease-in-out infinite"}}>⛓️</div>
          <h2 style={{fontSize:"clamp(26px,4.5vw,46px)",fontWeight:"900",color:C.text,marginBottom:"16px",lineHeight:"1.2"}}>
            Silence protects the corrupt.<br/><span style={{color:C.gold}}>Your voice protects Ethiopia.</span>
          </h2>
          <p style={{fontSize:"14px",color:C.muted,lineHeight:"1.8",marginBottom:"40px"}}>
            ሙስናን ሪፖርት አድርጉ · Report corruption · Gabaasa malaanmmaltummaa<br/>
            <span style={{fontFamily:"monospace",fontSize:"12px"}}>Anonymous · Encrypted · Verified · Court-ready</span>
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" className="btn-primary"
            style={{display:"inline-flex",alignItems:"center",gap:"12px",background:C.gold,color:C.bg,padding:"18px 40px",borderRadius:"5px",fontFamily:"monospace",fontSize:"14px",fontWeight:"900",letterSpacing:"0.1em",transition:"all 0.2s",boxShadow:"0 0 40px rgba(232,200,75,0.2)"}}>
            ⛓️ START REPORTING NOW
          </a>
          <div style={{marginTop:"18px",fontSize:"10px",color:"rgba(240,233,216,0.2)",fontFamily:"monospace"}}>
            No smartphone? Text <strong style={{color:"rgba(240,233,216,0.35)"}}>21000</strong> from any phone
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(232,200,75,0.1)",padding:"32px 32px 24px",background:"#06070b"}}>
        <div style={{maxWidth:"960px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"20px",marginBottom:"20px"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
                <span style={{fontSize:"16px"}}>⚖️</span>
                <span style={{fontSize:"14px",fontWeight:"800",color:C.gold,fontFamily:"monospace",letterSpacing:"0.12em"}}>SAFUU</span>
              </div>
              <div style={{fontSize:"10px",color:"rgba(240,233,216,0.25)",fontFamily:"monospace",lineHeight:"1.8"}}>ሳፉ · Oromo: "Moral order"<br/>Anti-Corruption Intelligence Platform</div>
            </div>
            <div style={{display:"flex",gap:"28px",flexWrap:"wrap"}}>
              {[["/transparency","Transparency Wall"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuEthBot","Telegram Bot"]].map(([href,label])=>(
                <a key={label} href={href} target={href.startsWith("http")?"_blank":"_self"} rel="noreferrer" className="nav-a"
                  style={{fontSize:"10px",color:"rgba(240,233,216,0.3)",fontFamily:"monospace",letterSpacing:"0.08em",transition:"color 0.2s"}}>
                  {label} →
                </a>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",paddingTop:"18px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
            <span style={{fontSize:"9px",color:"rgba(240,233,216,0.2)",fontFamily:"monospace"}}>© 2026 SAFUU INTEL · FEACC: 959 · EHRC: 1488 · POLICE: 911</span>
            <span style={{fontSize:"9px",color:"rgba(232,200,75,0.25)",fontFamily:"monospace"}}>safuu.net · Built for Ethiopia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
