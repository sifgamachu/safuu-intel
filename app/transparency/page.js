'use client';
import { useState, useEffect, useRef } from "react";

const G = "#c9a84c"; const CY = "#00d4ff"; const R = "#b82020";

function useReveal(t=0.1){
  const ref=useRef();const [v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:t});
    if(ref.current)o.observe(ref.current);return()=>o.disconnect();
  },[]);return[ref,v];
}

// Mock data — structured like real progressive disclosure reports
const OFFICIALS = [
  { id:"ETH-001", name:"T••••••• B•••••",  office:"Ministry of Transport", city:"Addis Ababa",
    region:"Oromia", type:"Procurement Bribery", reports:22, threshold:15,
    disclosed:true, amount:"ETB 2.4M", date:"2026-03-14", status:"FEACC" },
  { id:"ETH-002", name:"A••••• G•••••••",  office:"Customs Authority",      city:"Dire Dawa",
    region:"Dire Dawa", type:"Customs Extortion", reports:19, threshold:15,
    disclosed:true, amount:"ETB 850K", date:"2026-03-28", status:"Federal Police" },
  { id:"ETH-003", name:"M••••••• K•••",    office:"Land Administration",    city:"Bahir Dar",
    region:"Amhara", type:"Land Fraud", reports:17, threshold:15,
    disclosed:true, amount:"ETB 4.1M", date:"2026-04-01", status:"FEACC" },
  { id:"ETH-004", name:"[MASKED]",         office:"Regional Health Bureau",  city:"Hawassa",
    region:"Sidama", type:"Healthcare Theft", reports:9,  threshold:15,
    disclosed:false, amount:"—", date:"2026-04-08", status:"PENDING" },
  { id:"ETH-005", name:"[MASKED]",         office:"Education Department",    city:"Jimma",
    region:"Oromia", type:"Education Bribery", reports:6, threshold:15,
    disclosed:false, amount:"—", date:"2026-04-10", status:"PENDING" },
  { id:"ETH-006", name:"[MASKED]",         office:"Federal Police Station",  city:"Mekelle",
    region:"Tigray", type:"Police Extortion", reports:4, threshold:15,
    disclosed:false, amount:"—", date:"2026-04-11", status:"PENDING" },
];

const RECENT = [
  { time:"04:12", lang:"AM", type:"Land Fraud",      region:"Addis Ababa", verified:true  },
  { time:"04:08", lang:"OR", type:"Bribery",          region:"Oromia",     verified:true  },
  { time:"03:55", lang:"TI", type:"Procurement",     region:"Tigray",     verified:false },
  { time:"03:41", lang:"AM", type:"Tax Evasion",     region:"Amhara",     verified:true  },
  { time:"03:22", lang:"SO", type:"Extortion",       region:"Somali",     verified:true  },
  { time:"02:58", lang:"AM", type:"Nepotism",        region:"Addis Ababa", verified:false },
];

function ProgressBar({ val, max, color }) {
  const pct = Math.min((val/max)*100, 100);
  return (
    <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden",marginTop:"8px"}}>
      <div style={{height:"100%",width:`${pct}%`,background:pct>=100?R:color,
        transition:"width 1s ease",borderRadius:"2px"}}/>
    </div>
  );
}

export default function TransparencyWall() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tick,   setTick]   = useState(0);

  useEffect(()=>{ const t=setInterval(()=>setTick(v=>v+1),1000); return()=>clearInterval(t); },[]);

  const now = new Date();
  const timeStr = now.toTimeString().slice(0,8);
  const dateStr = now.toISOString().slice(0,10);

  const filtered = OFFICIALS.filter(o => {
    if (filter === "disclosed" && !o.disclosed) return false;
    if (filter === "pending"   &&  o.disclosed) return false;
    if (search && !o.office.toLowerCase().includes(search.toLowerCase()) &&
        !o.city.toLowerCase().includes(search.toLowerCase()) &&
        !o.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",minHeight:"100vh"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .pill{padding:7px 16px;border:1px solid rgba(0,212,255,0.2);background:transparent;color:rgba(0,212,255,0.5);font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;cursor:pointer;transition:all 0.2s;text-transform:uppercase}
        .pill.active{background:rgba(0,212,255,0.1);border-color:${CY};color:${CY}}
        .pill:hover{border-color:${CY};color:${CY}}
        .row:hover{background:rgba(0,212,255,0.03)!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:700px){.table-hide{display:none!important}}
      `}</style>

      {/* Ticker */}
      <div style={{background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 36s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● ${dateStr} ${timeStr}`,"● 233 TIPS FILED · 139 VERIFIED","● 3 OFFICIALS DISCLOSED THIS MONTH","● LEDGER INTEGRITY: ✓ VERIFIED","● IDENTITY: NULL — NEVER STORED","● FEACC HOTLINE: 959"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?`rgba(0,212,255,0.65)`:`rgba(201,168,76,0.55)`}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.95)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>TRANSPARENCY WALL</div>
          </div>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:"24px"}}>
          <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← BACK TO SAFUU.NET</a>
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer"
            style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em",textTransform:"uppercase"}}>
            ⚖ REPORT
          </a>
        </div>
      </nav>

      {/* Header */}
      <div style={{padding:"60px 40px 0",maxWidth:"1200px",margin:"0 auto",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>PUBLIC ACCOUNTABILITY · PROGRESSIVE DISCLOSURE</span>
          <div style={{flex:1,height:"1px",background:`rgba(184,32,32,0.2)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Accountability Wall
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",maxWidth:"640px",lineHeight:"1.8",marginBottom:"20px"}}>
          This wall shows offices and individuals against whom anonymous reports have been filed.
          <strong style={{color:"rgba(240,236,224,0.7)"}}> Appearance here is not a finding of guilt.</strong>{" "}
          All cases are forwarded to the appropriate Ethiopian authority for independent investigation.
        </p>

        {/* Legal disclaimer banner */}
        <div style={{background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.2)",padding:"14px 20px",marginBottom:"32px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
          <span style={{fontSize:"16px",flexShrink:0}}>⚖️</span>
          <div style={{fontSize:"11px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85",fontFamily:"'Courier New',monospace"}}>
            <strong style={{color:"rgba(201,168,76,0.7)"}}>IMPORTANT:</strong> SAFUU Intel is an anonymous reporting aggregator — not an investigative authority and not a court.
            The information on this wall represents anonymous public submissions and does not constitute a finding of guilt, wrongdoing, or any legal determination.
            Every disclosed case is formally referred to FEACC, Federal Police, EHRC, Ombudsman, or OFAG for independent investigation.
            Officials retain all rights under Ethiopian law.
          </div>
        </div>

        {/* Summary stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"40px",borderRadius:"2px",overflow:"hidden"}}>
          {[
            {v:"233+",l:"Tips Filed",   c:G},
            {v:"139",  l:"Verified",     c:CY},
            {v:"3",    l:"Disclosed",    c:R},
            {v:"15",   l:"Threshold",    c:G},
            {v:"6",    l:"Regions",      c:CY},
          ].map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"20px 24px",textAlign:"center"}}>
              <div style={{fontSize:"clamp(24px,3vw,36px)",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"5px"}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.35)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center",marginBottom:"32px"}}>
          {["all","disclosed","pending"].map(f=>(
            <button key={f} className={`pill${filter===f?" active":""}`} onClick={()=>setFilter(f)}>
              {f==="all"?"All Cases":f==="disclosed"?"● Referred to Agency":"○ Building Case"}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"0",
            border:`1px solid rgba(0,212,255,0.15)`,background:"rgba(0,0,0,0.4)"}}>
            <span style={{padding:"0 12px",fontSize:"11px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search office, city, type..."
              style={{background:"transparent",border:"none",outline:"none",color:"rgba(240,236,224,0.7)",
                fontFamily:"'Courier New',monospace",fontSize:"11px",padding:"9px 12px 9px 0",width:"220px",
                "::placeholder":{color:"rgba(0,212,255,0.25)"}}}/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 40px 80px"}}>
        {/* Table header */}
        <div style={{display:"grid",gridTemplateColumns:"80px 1fr 160px 110px 100px 120px 100px",gap:"0",
          padding:"10px 20px",borderBottom:`1px solid rgba(0,212,255,0.15)`,
          fontSize:"8px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>
          <div>CASE ID</div>
          <div>OFFICIAL / OFFICE</div>
          <div className="table-hide">TYPE</div>
          <div className="table-hide">CITY</div>
          <div>REPORTS</div>
          <div>STATUS</div>
          <div>AGENCY</div>
        </div>

        {filtered.map((o,i)=>{
          const [ref,vis]=useReveal();
          return(
          <a key={o.id} ref={ref} href={`/transparency/${o.id}`} className="row"
            style={{display:"grid",gridTemplateColumns:"80px 1fr 160px 110px 100px 120px 100px",gap:"0",
              padding:"18px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`,
              alignItems:"center",cursor:"pointer",transition:"background 0.15s",textDecoration:"none",color:"inherit",
              opacity:vis?1:0,transform:vis?"none":"translateY(10px)",
              transition:`all 0.4s ${i*0.06}s ease, background 0.15s`}}>

            {/* Case ID */}
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace"}}>{o.id}</div>

            {/* Name + Office */}
            <div>
              <div style={{fontSize:"14px",fontWeight:"700",
                color:o.disclosed?"rgba(220,120,120,0.85)":"rgba(240,236,224,0.5)",
                fontFamily:"'Playfair Display',serif",marginBottom:"3px",
                letterSpacing:o.disclosed?"0":"-0.01em"}}>
                {o.name}
              </div>
              <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)"}}>{o.office}</div>
            </div>

            {/* Type */}
            <div className="table-hide" style={{fontSize:"10px",color:"rgba(240,236,224,0.45)",fontFamily:"'Courier New',monospace"}}>{o.type}</div>

            {/* City */}
            <div className="table-hide" style={{fontSize:"11px",color:"rgba(240,236,224,0.45)"}}>{o.city}</div>

            {/* Reports / threshold */}
            <div>
              <div style={{fontSize:"13px",fontWeight:"700",color:o.disclosed?R:G,fontFamily:"'Courier New',monospace"}}>
                {o.reports}/{o.threshold}
              </div>
              <ProgressBar val={o.reports} max={o.threshold} color={G}/>
            </div>

            {/* Status badge */}
            <div>
              <span style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",
                padding:"4px 10px",
                background:o.disclosed?"rgba(184,32,32,0.15)":"rgba(201,168,76,0.08)",
                border:`1px solid ${o.disclosed?"rgba(184,32,32,0.4)":"rgba(201,168,76,0.2)"}`,
                color:o.disclosed?R:G}}>
                {o.disclosed?"● REFERRED TO AGENCY":"○ BUILDING CASE"}
              </span>
            </div>

            {/* Agency */}
            <div style={{fontSize:"10px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace"}}>{o.status}</div>
          </a>
        );})}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",fontSize:"12px"}}>
            No records match your filter.
          </div>
        )}

        {/* Disclosure explanation */}
        <div style={{marginTop:"48px",padding:"28px 32px",background:"rgba(0,212,255,0.03)",
          border:`1px solid rgba(0,212,255,0.12)`,display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"24px"}}>
          {[
            {icon:"○",color:G,title:"Building case",text:"Only office and city are shown. The name is masked — protecting against coordinated false reporting until independently verified reports build a consistent pattern."},
            {icon:"●",color:R,title:"Referred to agency",text:"When the threshold is reached, the case is formally forwarded to FEACC or the relevant authority. Appearance here is NOT a verdict — it is a referral for independent investigation."},
            {icon:"🔐",color:CY,title:"Zero identity stored",text:"Reporter identity is never recorded. One-way SHA-256 hashing makes identification mathematically impossible — even for Safuu administrators."},
          ].map((b,i)=>(
            <div key={i} style={{display:"flex",gap:"14px"}}>
              <div style={{fontSize:"16px",color:b.color,flexShrink:0,marginTop:"2px"}}>{b.icon}</div>
              <div>
                <div style={{fontSize:"12px",fontWeight:"700",color:b.color,marginBottom:"6px",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em"}}>{b.title}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.75"}}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live feed */}
        <div style={{marginTop:"40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#4ade80",animation:"blink 1.5s infinite",display:"inline-block"}}/>
            <span style={{fontSize:"9px",color:"rgba(74,222,128,0.7)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>LIVE INTAKE FEED // LAST 2 HOURS</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>
            {RECENT.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:"16px",alignItems:"center",
                padding:"10px 16px",background:"rgba(0,0,0,0.4)",
                borderLeft:`2px solid ${r.verified?"rgba(0,212,255,0.3)":"rgba(201,168,76,0.2)"}`}}>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",flexShrink:0}}>{r.time}</div>
                <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",padding:"2px 8px",background:"rgba(0,212,255,0.08)",flexShrink:0}}>{r.lang}</div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.6)",flex:1}}>{r.type}</div>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)"}}>{r.region}</div>
                <div style={{fontSize:"8px",fontFamily:"'Courier New',monospace",
                  color:r.verified?"#4ade80":"rgba(201,168,76,0.5)",flexShrink:0}}>
                  {r.verified?"✓ VERIFIED":"PENDING"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"24px 40px",
        background:"rgba(0,0,0,0.9)",display:"flex",justifyContent:"space-between",
        flexWrap:"wrap",gap:"12px"}}>
        <span style={{fontSize:"9px",color:`rgba(0,212,255,0.2)`,fontFamily:"'Courier New',monospace"}}>
          SAFUU INTEL · FEACC:959 · EHRC:1488 · POLICE:911
        </span>
        <span style={{fontSize:"9px",color:`rgba(201,168,76,0.2)`,fontFamily:"'Courier New',monospace"}}>
          {dateStr} · safuu.net/transparency
        </span>
      </div>
    </div>
  );
}
