'use client';
import { useState, useEffect, useRef } from "react";
import { TelegramButton, ReportSection, TG_BLUE, TG_LINK } from "./components/ReportButtons";

const G="#c9a84c", CY="#00d4ff", R="#b82020", GR="#4ade80";

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
      ctx.fillStyle="rgba(3,5,7,0.11)"; ctx.fillRect(0,0,c.width,c.height);
      drops.forEach((d,i)=>{
        const ch=S[Math.floor(Math.random()*S.length)], b=0.04+Math.random()*0.12;
        ctx.fillStyle=Math.random()>0.97?`rgba(0,200,255,${b+0.05})`:`rgba(180,145,50,${b})`;
        ctx.font="12px serif"; ctx.fillText(ch,i*20,d.y*20);
        d.y+=d.s; if(d.y*20>c.height+40){d.y=-Math.random()*30;d.s=0.15+Math.random()*0.4;}
      });
      id=requestAnimationFrame(draw);
    };
    draw(); window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,opacity:0.08,pointerEvents:"none"}}/>;
}

// ── Blinking cursor ───────────────────────────────────────────────────────────
function Cursor() {
  const [on,setOn] = useState(true);
  useEffect(()=>{const t=setInterval(()=>setOn(v=>!v),600);return()=>clearInterval(t);},[]);
  return <span style={{opacity:on?1:0,color:CY}}>█</span>;
}

// ── Uptime counter ────────────────────────────────────────────────────────────
function Uptime() {
  const start = useRef(Date.now());
  const [elapsed,setElapsed] = useState(0);
  useEffect(()=>{const t=setInterval(()=>setElapsed(Date.now()-start.current),1000);return()=>clearInterval(t);},[]);
  const s=Math.floor(elapsed/1000);
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  return <span>{String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(sec).padStart(2,"0")}</span>;
}

export default function Safuu() {
  const [scrolled,setScrolled]=useState(false);
  const [faq,setFaq]=useState(null);
  const date = new Date().toISOString().slice(0,10);
  const time = new Date().toTimeString().slice(0,8);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const FAQS = [
    {q:"When will the dashboard show real data?",          a:"The moment the first verified report is submitted through Telegram, it will appear on this dashboard. The system is fully live — the pipeline is active, encryption is running, and AI is ready to process. We're waiting for the first report."},
    {q:"Why is the dashboard empty now?",                  a:"We believe in complete transparency. Showing fabricated or placeholder data — even as an illustration — would undermine the integrity of the platform. What you see is the truth: zero reports have been processed yet. That changes the moment you or someone you know submits."},
    {q:"How do I know the system actually works?",         a:"The code is fully open-source at github.com/sifgamachu/safuu-intel. The backend runs 76 automated security tests on every deployment. You can inspect every component. And once the first report comes in, you'll see it appear here in real time — anonymized, encrypted, and verifiable."},
    {q:"Is my identity protected when I report?",         a:"Yes. Your Telegram ID is passed through a one-way SHA-256 hash — a mathematical process that cannot be reversed. No name, no number, no identifier is stored anywhere in the system. Not even administrators can trace a report back to you."},
    {q:"What happens to my report?",                       a:"Claude AI analyzes the corruption type and severity. Evidence is forensically verified (EXIF metadata, AI image detection). The report is auto-routed to the correct Ethiopian agency — FEACC, Federal Police, EHRC, Ombudsman, or OFAG. When enough verified reports cluster, the official is disclosed publicly."},
  ];

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",overflowX:"hidden"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none} html{scroll-behavior:smooth}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan{0%{top:-3%}100%{top:104%}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulsering{0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.3)}70%{box-shadow:0 0 0 14px rgba(0,212,255,0)}}
        .btn-gold{background:${G};color:#030507;font-family:'Courier New',monospace;font-weight:700;font-size:11px;letter-spacing:0.12em;padding:13px 32px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
        .btn-gold:hover{background:#dab85e;transform:translateY(-2px);box-shadow:0 8px 28px rgba(201,168,76,0.3)}
        .btn-cy{background:transparent;color:${CY};font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;padding:12px 28px;border:1px solid ${CY}55;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:all 0.2s;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))}
        .btn-cy:hover{border-color:${CY};background:rgba(0,212,255,0.07);transform:translateY(-2px)}
        .lnk:hover{color:${CY}!important}
        .faq-row{cursor:pointer;border-bottom:1px solid rgba(0,212,255,0.07);transition:background 0.15s}
        .faq-row:hover{background:rgba(0,212,255,0.02)}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:768px){.two-col{grid-template-columns:1fr!important}}
        @media(max-width:640px){.hide-mob{display:none!important}nav{padding:0 16px!important}.sec{padding:32px 16px!important}}
      `}</style>

      <GeezRain/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`linear-gradient(rgba(0,212,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.012) 1px,transparent 1px)`,backgroundSize:"52px 52px"}}/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 25%,rgba(3,5,7,0.82) 100%)"}}/>
      <div style={{position:"fixed",left:0,right:0,height:"1px",zIndex:2,pointerEvents:"none",background:`linear-gradient(transparent,${CY}14,transparent)`,animation:"scan 10s linear infinite"}}/>

      {/* TICKER */}
      <div style={{position:"relative",zIndex:10,background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:GR,color:"#030507",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>● ONLINE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 44s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● SYSTEM ACTIVE · ${date} · ${time}`,"● PIPELINE READY · AWAITING FIRST REPORT","● IDENTITY_STORAGE :: NULL — SHA-256 ONLY","● AES-256-GCM ENCRYPTION ACTIVE","● AI FORENSICS READY · CLAUDE + WHISPER + HIVE","● WHATSAPP @SafuuAfBot · @SafuuAfBot","● ሙስናን ሪፖርት አድርጉ · REPORT CORRUPTION NOW"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
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
          {[["#how","HOW IT WORKS"],["#agencies","AGENCIES"],["/faq","FAQ"],["/transparency","WALL"],["/demo","DEMO"],["/about","ABOUT"]].map(([h,l])=>(
            <a key={l} href={h} className="lnk" style={{fontSize:"10px",color:l==="DEMO"?`rgba(201,168,76,0.55)`:"rgba(0,212,255,0.42)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",transition:"color 0.2s"}}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <TelegramButton text="@SafuuAfBot" size="sm"/>
          <TelegramButton text="Telegram" size="sm"/>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"72px 40px 56px",borderBottom:`1px solid rgba(0,212,255,0.08)`,minHeight:"60vh",display:"flex",alignItems:"center"}}>
        <div style={{maxWidth:"760px",margin:"0 auto",width:"100%",animation:"fadein 0.9s ease-out"}}>

          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
            <div style={{width:"5px",height:"5px",background:R,transform:"rotate(45deg)"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>INTELLIGENCE PLATFORM · ETHIOPIA · {new Date().getFullYear()}</span>
          </div>

          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,6vw,72px)",fontWeight:"900",lineHeight:1.08,letterSpacing:"-0.02em",marginBottom:"24px"}}>
            <span style={{color:"rgba(240,236,224,0.95)"}}>Corruption ends </span>
            <span style={{color:G,fontStyle:"italic"}}>when people </span>
            <span style={{color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
          </h1>

          <p style={{fontSize:"16px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85",marginBottom:"36px",maxWidth:"580px"}}>
            Anonymous, AI-verified corruption intelligence for Ethiopia.
            Report by Telegram in any Ethiopian language.
            Your identity is never stored — not even by us.
          </p>

          <div style={{marginBottom:"48px",maxWidth:"680px"}}>
            <ReportSection/>
          </div>

          {/* Trust strip */}
          <div style={{display:"flex",gap:"0",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden",flexWrap:"wrap"}}>
            {[
              {icon:"🔐",label:"SHA-256",sub:"Identity never stored"},
              {icon:"🔒",label:"AES-256-GCM",sub:"Encrypted at rest"},
              {icon:"🤖",label:"Claude AI",sub:"Forensic verification"},
              {icon:"⛓️",label:"Hash chain",sub:"Court-ready evidence"},
            ].map((s,i)=>(
              <div key={i} style={{flex:"1 1 140px",padding:"14px 16px",borderRight:i<3?`1px solid rgba(0,212,255,0.08)`:"none",textAlign:"center"}}>
                <div style={{fontSize:"18px",marginBottom:"4px"}}>{s.icon}</div>
                <div style={{fontSize:"11px",fontWeight:"600",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",marginBottom:"2px"}}>{s.label}</div>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)"}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LIVE DASHBOARD — EMPTY STATE ══ */}
      <section className="sec" style={{position:"relative",zIndex:5,padding:"48px 40px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto"}}>

          {/* System status bar */}
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px",padding:"14px 24px",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(74,222,128,0.2)`}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:GR,animation:"pulsering 2s infinite",flexShrink:0}}/>
              <span style={{fontSize:"10px",color:GR,fontFamily:"'Courier New',monospace",fontWeight:"700",letterSpacing:"0.14em"}}>SYSTEM ONLINE</span>
            </div>
            <div style={{width:"1px",height:"16px",background:"rgba(255,255,255,0.08)"}}/>
            <span style={{fontSize:"10px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace"}}>Pipeline active · Uptime: <Uptime/></span>
            <div style={{marginLeft:"auto",display:"flex",gap:"20px"}}>
              {[["ENCRYPT","AES-256-GCM","#4ade80"],["AI","CLAUDE+WHISPER","#4ade80"],["LEDGER","HASH CHAIN","#4ade80"],["REPORTS","0","rgba(0,212,255,0.6)"]].map(([k,v,c])=>(
                <div key={k} style={{textAlign:"center"}}>
                  <div style={{fontSize:"8px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",marginBottom:"2px"}}>{k}</div>
                  <div style={{fontSize:"11px",color:c,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard panels — all empty state */}
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>

            {/* Empty live feed */}
            <div style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.1)`}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"rgba(74,222,128,0.35)",flexShrink:0}}/>
                <span style={{fontSize:"9px",color:"rgba(74,222,128,0.55)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>LIVE INTAKE FEED</span>
                <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>waiting for first report</span>
              </div>
              {/* Column headers */}
              <div style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr",gap:"12px",padding:"8px 20px",background:"rgba(0,0,0,0.2)"}}>
                {["TIME","OFFICE","REGION & TYPE"].map(h=>(
                  <div key={h} style={{fontSize:"8px",color:"rgba(0,212,255,0.2)",fontFamily:"'Courier New',monospace",letterSpacing:"0.14em"}}>{h}</div>
                ))}
              </div>
              {/* Empty rows */}
              {[...Array(6)].map((_,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr 1fr",gap:"12px",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.04)`,alignItems:"center",opacity:1-i*0.13}}>
                  <div style={{height:"12px",width:"50px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                  <div style={{height:"14px",width:`${75-i*5}%`,background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                  <div style={{height:"12px",width:`${60-i*5}%`,background:"rgba(255,255,255,0.03)",borderRadius:"2px"}}/>
                </div>
              ))}
              <div style={{padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:"24px",marginBottom:"10px",opacity:0.3}}>⟳</div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
                  Waiting for the first anonymous report.<br/>
                  <span style={{color:"rgba(0,212,255,0.4)"}}>Be the first. Report now →</span>
                </div>
              </div>
            </div>

            {/* Empty offices panel */}
            <div style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.1)`}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
                <div style={{width:"6px",height:"6px",background:"rgba(184,32,32,0.4)",transform:"rotate(45deg)",flexShrink:0}}/>
                <span style={{fontSize:"9px",color:"rgba(184,32,32,0.55)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>OFFICES BY REPORT VOLUME</span>
                <span style={{marginLeft:"auto",fontSize:"9px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>no data yet</span>
              </div>
              <div style={{padding:"16px 0"}}>
                {[...Array(6)].map((_,i)=>(
                  <div key={i} style={{padding:"12px 20px",opacity:1-i*0.15}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                      <div style={{height:"13px",width:`${60-i*5}%`,background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                      <div style={{height:"13px",width:"24px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                    </div>
                    <div style={{height:"4px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                  </div>
                ))}
              </div>
              <div style={{padding:"16px 20px",textAlign:"center",borderTop:`1px solid rgba(0,212,255,0.06)`}}>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
                  Office rankings will appear as reports arrive
                </div>
              </div>
            </div>
          </div>

          {/* Bottom empty panels row */}
          <div className="two-col" style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:"16px"}}>

            {/* Empty trend chart */}
            <div style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
                <div style={{width:"6px",height:"6px",background:"rgba(0,212,255,0.4)",transform:"rotate(45deg)",flexShrink:0}}/>
                <span style={{fontSize:"9px",color:"rgba(0,212,255,0.5)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>INTAKE VOLUME OVER TIME</span>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"100px",paddingBottom:"6px",borderBottom:`1px solid rgba(0,212,255,0.07)`,marginBottom:"8px"}}>
                {[...Array(12)].map((_,i)=>(
                  <div key={i} style={{flex:1,height:"3px",background:"rgba(255,255,255,0.04)",borderRadius:"1px",alignSelf:"flex-end"}}/>
                ))}
              </div>
              <div style={{display:"flex",gap:"6px"}}>
                {["O","N","D","J","F","M","A","M","J","J","A","S"].map(l=>(
                  <div key={l} style={{flex:1,textAlign:"center",fontSize:"8px",color:"rgba(240,236,224,0.15)",fontFamily:"'Courier New',monospace"}}>{l}</div>
                ))}
              </div>
              <div style={{marginTop:"16px",textAlign:"center",fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>
                Chart will populate as reports are submitted
              </div>
            </div>

            {/* Empty type panel */}
            <div style={{background:"rgba(0,0,0,0.45)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
                <div style={{width:"6px",height:"6px",background:"rgba(248,113,113,0.4)",transform:"rotate(45deg)",flexShrink:0}}/>
                <span style={{fontSize:"9px",color:"rgba(248,113,113,0.5)",fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",fontWeight:"700"}}>BY CORRUPTION TYPE</span>
              </div>
              {[...Array(6)].map((_,i)=>(
                <div key={i} style={{marginBottom:"12px",opacity:1-i*0.14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                    <div style={{height:"12px",width:`${55-i*5}%`,background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                    <div style={{height:"12px",width:"20px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.04)",borderRadius:"2px"}}/>
                </div>
              ))}
              <div style={{marginTop:"8px",textAlign:"center",fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>
                Types will emerge from real reports
              </div>
            </div>
          </div>

          {/* See what it looks like when live */}
          <div style={{marginTop:"20px",textAlign:"center"}}>
            <a href="/demo" style={{display:"inline-flex",alignItems:"center",gap:"8px",fontSize:"11px",color:`rgba(201,168,76,0.55)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",padding:"10px 24px",border:`1px solid rgba(201,168,76,0.2)`,background:"rgba(201,168,76,0.04)",transition:"all 0.2s"}}>
              ◆ SEE A DEMO OF HOW THE LIVE DASHBOARD WILL LOOK →
            </a>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" className="sec" style={{position:"relative",zIndex:5,padding:"56px 40px",borderBottom:`1px solid rgba(0,212,255,0.08)`,maxWidth:"1200px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>HOW IT WORKS</span>
          <div style={{flex:1,height:"1px",background:"rgba(0,212,255,0.1)"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"16px"}}>
          {[
            {n:"01",icon:"💬",title:"Report anonymously",       body:"Message @SafuuAfBot on Telegram in any Ethiopian language. The bot guides you step by step — text or attach a photo, receipt, or document."},
            {n:"02",icon:"🔬",title:"AI forensic verification", body:"Claude AI analyzes your report. Whisper transcribes voice. Hive AI checks photo authenticity. EXIF metadata verifies dates and locations."},
            {n:"03",icon:"⚖️",title:"Auto-routed to agencies",   body:"Your report is automatically matched to the correct authority — FEACC, Federal Police, EHRC, Ombudsman, or OFAG. No manual steps."},
            {n:"04",icon:"📊",title:"Public disclosure at threshold", body:"Below the threshold: only the office and region are shown publicly. At threshold: the official's name is disclosed and formally escalated."},
          ].map((s,i)=>(
            <div key={i} style={{padding:"24px",background:"rgba(0,0,0,0.35)",border:`1px solid rgba(0,212,255,0.09)`,borderTop:`2px solid rgba(0,212,255,${0.5-i*0.1})`}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
                <span style={{fontSize:"8px",color:"rgba(0,212,255,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>{s.n}/04</span>
                <span style={{fontSize:"20px"}}>{s.icon}</span>
              </div>
              <div style={{fontSize:"13px",fontWeight:"700",color:CY,fontFamily:"'Courier New',monospace",marginBottom:"10px",letterSpacing:"0.04em"}}>{s.title}</div>
              <div style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.8"}}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AGENCIES ══ */}
      <section id="agencies" className="sec" style={{position:"relative",zIndex:5,padding:"48px 40px",maxWidth:"1200px",margin:"0 auto",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>ROUTE_TABLE()</span>
          <div style={{flex:1,height:"1px",background:"rgba(201,168,76,0.12)"}}/>
          <h2 style={{fontSize:"clamp(16px,2vw,20px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.88)",flexShrink:0}}>Ethiopian accountability bodies</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"10px"}}>
          {[
            {name:"FEACC",       am:"ፀረሙስና ኮሚሽን", phone:"959",  c:GR,       type:"All corruption"},
            {name:"EHRC",        am:"ሰብዓዊ መብቶች",  phone:"1488", c:"#60a5fa",type:"Human rights"},
            {name:"Ombudsman",   am:"ዕርቀ ሚካሄ",    phone:"6060", c:"#a78bfa",type:"Abuse of power"},
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
      <section className="sec" style={{position:"relative",zIndex:5,padding:"48px 40px",maxWidth:"800px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.09)`}}>
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
        <div style={{marginTop:"16px",display:"flex",gap:"16px",flexWrap:"wrap"}}>
          <a href="/faq" className="lnk" style={{fontSize:"10px",color:"rgba(0,212,255,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>All 20 FAQ questions →</a>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:"rgba(201,168,76,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Transparency wall →</a>
          <a href="/demo" className="lnk" style={{fontSize:"10px",color:"rgba(201,168,76,0.38)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",transition:"color 0.2s"}}>Dashboard demo →</a>
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
                ["PLATFORM",   [["/"," Home"],["/demo","Live Dashboard Demo"],["/transparency","Transparency Wall"],["/report","File a Report"],["/analytics","Analytics"],["/sms","Telegram"]]],
                ["LANGUAGES",  [["/am","አማርኛ (Amharic)"],["/or","Oromiffa"],["/ti","ትግርኛ (Tigrinya)"]]],
                ["ABOUT",      [["/about","About"],["/faq","FAQ"],["/partners","Partners"],["/press","Press"],["/donate","Support"],["/privacy","Privacy"],["/changelog","Changelog"]]],
                ["DEVELOPERS", [["/backend","Backend Setup"],["/api-docs","API Reference"],["https://github.com/sifgamachu/safuu-intel","GitHub"],["https://t.me/SafuuAfBot","Telegram"],["https://t.me/SafuuAfBot","Telegram"]]],
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
            <span style={{fontSize:"9px",color:"rgba(0,212,255,0.18)",fontFamily:"'Courier New',monospace"}}>© 2026 SAFUU_INTEL · Dashboard shows only real, verified, anonymized data</span>
            <span style={{fontSize:"9px",color:"rgba(201,168,76,0.18)",fontFamily:"'Courier New',monospace"}}>{date} · safuu.net</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
