'use client';
import { useState, useEffect } from "react";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

// Simulated live feed — in production this streams from /ws WebSocket
const SEED_EVENTS = [
  {t:0,   type:"tip",       lang:"AM", region:"Addis Ababa", category:"Procurement Bribery", verified:true,  disclosed:false},
  {t:8,   type:"verify",    lang:"OR", region:"Oromia",      category:"Land Fraud",          verified:true,  disclosed:false},
  {t:19,  type:"tip",       lang:"TI", region:"Tigray",      category:"Tax Evasion",         verified:false, disclosed:false},
  {t:31,  type:"tip",       lang:"AM", region:"Amhara",      category:"Court Corruption",    verified:true,  disclosed:false},
  {t:47,  type:"disclose",  lang:"EN", region:"Addis Ababa", category:"Procurement Bribery", verified:true,  disclosed:true, caseId:"ETH-004"},
  {t:58,  type:"tip",       lang:"SO", region:"Somali",      category:"Customs Extortion",   verified:false, disclosed:false},
  {t:72,  type:"escalate",  lang:"EN", region:"Oromia",      category:"Land Fraud",          verified:true,  disclosed:true, caseId:"ETH-003"},
  {t:89,  type:"tip",       lang:"AF", region:"Afar",        category:"Police Extortion",    verified:false, disclosed:false},
  {t:103, type:"verify",    lang:"AM", region:"Addis Ababa", category:"Healthcare Theft",    verified:true,  disclosed:false},
  {t:118, type:"tip",       lang:"OR", region:"Oromia",      category:"Education Bribery",   verified:false, disclosed:false},
  {t:134, type:"tip",       lang:"TI", region:"Tigray",      category:"Nepotism",            verified:true,  disclosed:false},
  {t:145, type:"disclose",  lang:"EN", region:"Amhara",      category:"Land Fraud",          verified:true,  disclosed:true, caseId:"ETH-002"},
  {t:158, type:"tip",       lang:"SI", region:"Sidama",      category:"Healthcare Theft",    verified:false, disclosed:false},
  {t:172, type:"verify",    lang:"AM", region:"Addis Ababa", category:"Tax Evasion",         verified:true,  disclosed:false},
  {t:189, type:"tip",       lang:"WO", region:"SNNPR",       category:"Procurement Bribery", verified:false, disclosed:false},
];

const LANG_FULL = {AM:"Amharic",OR:"Oromiffa",TI:"Tigrinya",SO:"Somali",AF:"Afar",SI:"Sidama",WO:"Wolaytta",EN:"English"};

const TYPE_CONFIG = {
  tip:      {label:"New tip received",   color:CY,   icon:"📥"},
  verify:   {label:"Report verified",    color:"#4ade80", icon:"✓"},
  disclose: {label:"Name disclosed",     color:R,    icon:"⚖️"},
  escalate: {label:"Case escalated",     color:"#a78bfa", icon:"🏛️"},
};

function useSimFeed() {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Replay seed events, then generate new ones
    let idx = 0;
    const tick = () => {
      if (idx < SEED_EVENTS.length) {
        const ev = {...SEED_EVENTS[idx], id: Date.now() + idx, time: new Date().toTimeString().slice(0,8)};
        setEvents(prev => [ev, ...prev].slice(0,50));
        setCount(c => c+1);
        idx++;
        setTimeout(tick, 800 + Math.random()*1200);
      } else {
        // Keep generating random tips after seed
        const cats = ["Procurement Bribery","Land Fraud","Tax Evasion","Police Extortion","Healthcare Theft","Nepotism"];
        const langs = ["AM","OR","TI","SO","AF","SI","WO"];
        const regions = ["Addis Ababa","Oromia","Amhara","Tigray","Sidama","SNNPR","Somali","Dire Dawa"];
        const types = ["tip","tip","tip","verify","verify","disclose"];
        const type = types[Math.floor(Math.random()*types.length)];
        const ev = {
          id:Date.now(), time:new Date().toTimeString().slice(0,8),
          type, lang:langs[Math.floor(Math.random()*langs.length)],
          region:regions[Math.floor(Math.random()*regions.length)],
          category:cats[Math.floor(Math.random()*cats.length)],
          verified: Math.random()>0.4,
          disclosed: type==="disclose",
        };
        setEvents(prev => [ev, ...prev].slice(0,50));
        setCount(c => c+1);
        setTimeout(tick, 2000 + Math.random()*4000);
      }
    };
    setTimeout(tick, 600);
  }, []);

  return { events, count };
}

export default function Tracker() {
  const { events, count } = useSimFeed();
  const [filter, setFilter] = useState("all");
  const [tick, setTick] = useState(0);

  useEffect(() => { const t = setInterval(()=>setTick(v=>v+1),1000); return ()=>clearInterval(t); },[]);

  const now = new Date();
  const filtered = filter==="all" ? events : events.filter(e=>e.type===filter);

  const stats = {
    tips:    events.filter(e=>e.type==="tip").length,
    verified:events.filter(e=>e.type==="verify").length,
    disclosed:events.filter(e=>e.type==="disclose").length,
    escalated:events.filter(e=>e.type==="escalate").length,
  };

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .pill{padding:6px 14px;border:1px solid rgba(0,212,255,0.2);background:transparent;color:rgba(0,212,255,0.5);font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;cursor:pointer;transition:all 0.2s;text-transform:uppercase}
        .pill.on{background:rgba(0,212,255,0.1);border-color:#00d4ff;color:#00d4ff}
        .pill:hover{border-color:#00d4ff;color:#00d4ff}
        .ev{animation:fadeSlide 0.4s ease-out}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        .lnk:hover{color:${CY}!important}
      `}</style>

      {/* Top ticker */}
      <div style={{background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0,animation:"blink 2s infinite"}}>● LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 40s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● ${now.toISOString().slice(0,10)} · LIVE INTAKE FEED`,`● ${count} EVENTS THIS SESSION`,
                  "● IDENTITY: NULL · NEVER STORED","● AES-256-GCM ACTIVE","● LEDGER: SEALED",
                  "● ሙስና ይጥፋእ — JUSTICE WILL PREVAIL"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>LIVE TRACKER</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>WALL</a>
          <a href="/analytics" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>ANALYTICS</a>
          <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em"}}>⚖ REPORT</a>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"40px 40px 80px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"16px",marginBottom:"32px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
              <span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#4ade80",animation:"blink 1.5s infinite",display:"inline-block"}}/>
              <span style={{fontSize:"9px",color:"rgba(74,222,128,0.7)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>LIVE INTAKE FEED</span>
            </div>
            <h1 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05}}>
              Activity Tracker
            </h1>
            <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",marginTop:"6px",fontFamily:"'Courier New',monospace"}}>
              // anonymized · no PII · {now.toTimeString().slice(0,8)} local
            </p>
          </div>

          {/* Live counter */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,auto)",gap:"1px",background:`rgba(0,212,255,0.08)`,height:"fit-content",overflow:"hidden",borderRadius:"2px"}}>
            {[["TIPS",stats.tips,CY],["VERIFIED",stats.verified,"#4ade80"],["DISCLOSED",stats.disclosed,R],["ESCALATED",stats.escalated,"#a78bfa"]].map(([l,n,c])=>(
              <div key={l} style={{background:"#030507",padding:"14px 16px",textAlign:"center"}}>
                <div style={{fontSize:"clamp(18px,3vw,28px)",fontWeight:"900",color:c,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{n}</div>
                <div style={{fontSize:"8px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",marginTop:"3px"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"24px"}}>
          {[["all","ALL EVENTS"],["tip","TIPS"],["verify","VERIFIED"],["disclose","DISCLOSED"],["escalate","ESCALATED"]].map(([val,label])=>(
            <button key={val} className={`pill${filter===val?" on":""}`} onClick={()=>setFilter(val)}>{label}</button>
          ))}
        </div>

        {/* Feed layout: 2 col on wide, 1 on narrow */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:"16px",alignItems:"start"}}>

          {/* Main feed */}
          <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
            {filtered.length===0 && (
              <div style={{padding:"40px",textAlign:"center",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",fontSize:"12px"}}>
                Waiting for events...
              </div>
            )}
            {filtered.map((ev,i)=>{
              const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.tip;
              return (
                <div key={ev.id} className="ev" style={{display:"flex",gap:"0",borderLeft:`2px solid ${cfg.color}`,background:"rgba(0,0,0,0.4)",overflow:"hidden"}}>
                  {/* Time */}
                  <div style={{width:"70px",padding:"12px 10px",flexShrink:0,fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",borderRight:`1px solid rgba(0,212,255,0.06)`}}>
                    {ev.time||"--:--:--"}
                  </div>
                  {/* Icon + type */}
                  <div style={{width:"42px",padding:"12px 8px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",borderRight:`1px solid rgba(0,212,255,0.06)`}}>
                    {cfg.icon}
                  </div>
                  {/* Main content */}
                  <div style={{flex:1,padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                    <span style={{fontSize:"10px",fontWeight:"700",color:cfg.color,fontFamily:"'Courier New',monospace",letterSpacing:"0.06em",flexShrink:0}}>{cfg.label}</span>
                    <span style={{fontSize:"12px",color:"rgba(240,236,224,0.55)",flex:1,minWidth:"100px"}}>{ev.category}</span>
                    {ev.caseId && (
                      <a href={`/transparency/${ev.caseId}`} style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",padding:"2px 8px",border:`1px solid rgba(184,32,32,0.3)`,textDecoration:"none"}}>{ev.caseId}</a>
                    )}
                  </div>
                  {/* Lang + region */}
                  <div style={{padding:"12px 12px",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"4px"}}>
                    <span style={{fontSize:"9px",color:`rgba(0,212,255,0.55)`,fontFamily:"'Courier New',monospace",padding:"2px 8px",background:"rgba(0,212,255,0.07)"}}>{ev.lang}</span>
                    <span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{ev.region}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side panel */}
          <div style={{display:"flex",flexDirection:"column",gap:"12px",position:"sticky",top:"80px"}}>
            {/* Region breakdown */}
            <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px"}}>
              <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"14px"}}>REGIONS THIS SESSION</div>
              {Object.entries(events.reduce((acc,e)=>{acc[e.region]=(acc[e.region]||0)+1;return acc;},{}) ).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([r,n])=>(
                <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                  <span style={{fontSize:"11px",color:"rgba(240,236,224,0.5)"}}>{r}</span>
                  <span style={{fontSize:"11px",color:G,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{n}</span>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px"}}>
              <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"14px"}}>LANGUAGES</div>
              {Object.entries(events.reduce((acc,e)=>{acc[e.lang]=(acc[e.lang]||0)+1;return acc;},{}) ).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l,n])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                  <span style={{fontSize:"11px",color:"rgba(240,236,224,0.5)"}}>{LANG_FULL[l]||l}</span>
                  <span style={{fontSize:"11px",color:CY,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{n}</span>
                </div>
              ))}
            </div>

            {/* Types */}
            <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"20px"}}>
              <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"14px"}}>TOP CATEGORIES</div>
              {Object.entries(events.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+1;return acc;},{}) ).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>(
                <div key={c} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px",gap:"8px"}}>
                  <span style={{fontSize:"10px",color:"rgba(240,236,224,0.45)",flex:1,lineHeight:"1.4"}}>{c}</span>
                  <span style={{fontSize:"11px",color:"#a78bfa",fontFamily:"'Courier New',monospace",fontWeight:"700",flexShrink:0}}>{n}</span>
                </div>
              ))}
            </div>

            <div style={{padding:"14px 16px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.06)`,fontSize:"10px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
              // Simulated feed<br/>
              // Production: WebSocket /ws<br/>
              // All events anonymized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
