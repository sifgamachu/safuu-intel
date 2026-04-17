'use client';
import { useState, useEffect, useRef } from "react";

const G="#c9a84c", CY="#00d4ff", R="#b82020";

function useReveal(t=0.08){
  const ref=useRef();const[v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:t});
    if(ref.current)o.observe(ref.current);return()=>o.disconnect();
  },[]);return[ref,v];
}

// Evidence tier config — single source of truth
const TIERS = {
  TEXT:   { label:"Text only",          badge:"TEXT ONLY",         color:"rgba(255,255,255,0.35)", threshold:100, icon:"✏️",  weight:1 },
  PHOTO:  { label:"+ Photo evidence",   badge:"PHOTO EVIDENCE",    color:G,                       threshold:15,  icon:"📷",  weight:3 },
  DOCS:   { label:"+ Financial docs",   badge:"FINANCIAL DOCS",    color:G,                       threshold:15,  icon:"📄",  weight:3 },
  DEMAND: { label:"+ Demand documented",badge:"DEMAND DOCUMENTED", color:R,                       threshold:3,   icon:"🔴",  weight:10 },
};

// Mock officials — each has a tier showing evidence quality
const OFFICIALS = [
  { id:"ETH-001", name:"T••••••• B•••••",  office:"Ministry of Transport",   city:"Addis Ababa", region:"Oromia",
    type:"Procurement Bribery",   reports:22,  threshold:15, tier:"PHOTO",  verified:19, referred:true,  agency:"FEACC",    since:"Nov 2025",
    coordination:false, note:"Multiple independent photo submissions with consistent EXIF dates." },
  { id:"ETH-002", name:"A••••• G•••••••",  office:"Customs Authority",        city:"Dire Dawa",   region:"Dire Dawa",
    type:"Customs Extortion",     reports:19,  threshold:15, tier:"DOCS",   verified:17, referred:true,  agency:"Police",   since:"Dec 2025",
    coordination:false, note:"Financial receipts and payment records submitted as evidence." },
  { id:"ETH-003", name:"M••••••• K•••",    office:"Land Administration",      city:"Bahir Dar",   region:"Amhara",
    type:"Land Fraud",            reports:5,   threshold:3,  tier:"DEMAND", verified:5,  referred:true,  agency:"FEACC",    since:"Oct 2025",
    coordination:false, note:"Documented written demand for payment. Low threshold applied: demand on record." },
  { id:"ETH-004", name:"[MASKED]",         office:"Regional Health Bureau",   city:"Hawassa",     region:"Sidama",
    type:"Healthcare Theft",      reports:9,   threshold:100,tier:"TEXT",   verified:7,  referred:false, agency:"PENDING",  since:"Feb 2026",
    coordination:false, note:null },
  { id:"ETH-005", name:"[MASKED]",         office:"Education Department",     city:"Jimma",       region:"Oromia",
    type:"Education Bribery",     reports:6,   threshold:100,tier:"TEXT",   verified:5,  referred:false, agency:"PENDING",  since:"Mar 2026",
    coordination:false, note:null },
  { id:"ETH-006", name:"[MASKED]",         office:"Federal Police Station",   city:"Mekelle",     region:"Tigray",
    type:"Police Extortion",      reports:4,   threshold:15, tier:"PHOTO",  verified:3,  referred:false, agency:"PENDING",  since:"Apr 2026",
    coordination:false, note:null },
  { id:"ETH-007", name:"[MASKED]",         office:"Tax Authority",            city:"Adama",       region:"Oromia",
    type:"Tax Extortion",         reports:11,  threshold:15, tier:"PHOTO",  verified:9,  referred:false, agency:"PENDING",  since:"Jan 2026",
    coordination:false, note:null },
  { id:"ETH-008", name:"[MASKED]",         office:"Procurement Authority",    city:"Addis Ababa", region:"Addis Ababa",
    type:"Tender Fraud",          reports:3,   threshold:100,tier:"TEXT",   verified:2,  referred:false, agency:"PENDING",  since:"Apr 2026",
    coordination:true,  note:"⚠ Coordination flag: 3 near-identical reports in 2-hour window. Held for analyst review." },
];

const RECENT = [
  { time:"04:12", type:"Land Fraud",      office:"Land Administration",    region:"Addis Ababa", tier:"PHOTO",  verified:true  },
  { time:"04:08", type:"Bribery",         office:"Education Department",   region:"Oromia",      tier:"TEXT",   verified:true  },
  { time:"03:55", type:"Procurement",     office:"Procurement Authority",  region:"Tigray",      tier:"DOCS",   verified:false },
  { time:"03:41", type:"Tax Evasion",     office:"Tax Authority",          region:"Amhara",      tier:"PHOTO",  verified:true  },
  { time:"03:22", type:"Extortion",       office:"Federal Police Station", region:"Somali",      tier:"DEMAND", verified:true  },
  { time:"02:58", type:"Nepotism",        office:"Ministry of Transport",  region:"Addis Ababa", tier:"TEXT",   verified:false },
];

function ProgressBar({ val, max, color }) {
  const pct = Math.min((val/max)*100, 100);
  return (
    <div style={{height:"5px",background:"rgba(255,255,255,0.05)",borderRadius:"2px",overflow:"hidden",marginTop:"7px"}}>
      <div style={{height:"100%",width:`${pct}%`,background:pct>=100?R:color,transition:"width 1s ease",borderRadius:"2px"}}/>
    </div>
  );
}

function TierBadge({ tier, small }) {
  const t = TIERS[tier];
  return (
    <span style={{
      fontSize:small?"8px":"9px",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",
      padding:small?"2px 8px":"3px 10px",fontWeight:"700",
      background:`${t.color}18`,border:`1px solid ${t.color}55`,color:t.color,
      whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:"5px",
    }}>
      {t.icon} {t.badge}
    </span>
  );
}

export default function TransparencyWall() {
  const [filter, setFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [search, setSearch] = useState("");
  const date = new Date().toISOString().slice(0,10);

  const filtered = OFFICIALS.filter(o => {
    if (filter==="referred" && !o.referred) return false;
    if (filter==="building" && o.referred)  return false;
    if (filter==="flagged"  && !o.coordination) return false;
    if (tierFilter!=="all"  && o.tier!==tierFilter) return false;
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
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .pill{padding:7px 14px;border:1px solid rgba(0,212,255,0.18);background:transparent;color:rgba(0,212,255,0.45);font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.12em;cursor:pointer;transition:all 0.15s;text-transform:uppercase}
        .pill.on{background:rgba(0,212,255,0.1);border-color:#00d4ff;color:#00d4ff}
        .pill:hover{border-color:#00d4ff;color:#00d4ff}
        .row{transition:background 0.12s}
        .row:hover{background:rgba(0,212,255,0.03)!important}
        .lnk:hover{color:#00d4ff!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:700px){.hide-mob{display:none!important}}
        @media(max-width:500px){.pad{padding:0 16px!important}}
      `}</style>

      {/* Ticker */}
      <div style={{background:"#010204",height:"26px",borderBottom:`1px solid rgba(0,212,255,0.12)`,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{background:R,color:"#fff",fontSize:"8px",fontWeight:"700",padding:"0 14px",height:"100%",display:"flex",alignItems:"center",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",flexShrink:0}}>LIVE</div>
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{display:"flex",animation:"marquee 40s linear infinite",whiteSpace:"nowrap"}}>
            {[...Array(2)].map((_,i)=>(
              <span key={i} style={{display:"inline-flex"}}>
                {[`● ${date}`,"● ALL CASES REFERRED — NOT VERDICTS","● IDENTITY :: NULL · SHA-256","● FEACC: 959 · EHRC: 1488","● EVIDENCE TIERS ACTIVE","● COORDINATION DETECTION RUNNING"].map((t,j)=>(
                  <span key={j} style={{fontSize:"9px",fontFamily:"'Courier New',monospace",padding:"0 24px",color:j%2===0?"rgba(0,212,255,0.65)":"rgba(201,168,76,0.55)"}}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.96)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>TRANSPARENCY WALL</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      {/* Page header */}
      <div className="pad" style={{padding:"52px 40px 0",maxWidth:"1200px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>PUBLIC ACCOUNTABILITY · REFERRAL ONLY — NOT VERDICTS</span>
          <div style={{flex:1,height:"1px",background:`rgba(184,32,32,0.2)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(28px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"14px",letterSpacing:"-0.02em"}}>
          Accountability Wall
        </h1>

        {/* LEGAL DISCLAIMER — always visible */}
        <div style={{background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.22)",borderLeft:"3px solid rgba(201,168,76,0.6)",padding:"14px 20px",marginBottom:"32px"}}>
          <div style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"7px",fontWeight:"700"}}>⚖ LEGAL NOTICE</div>
          <p style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85",fontFamily:"'Courier New',monospace"}}>
            SAFUU Intel is an anonymous reporting aggregator — not a court and not an investigative authority.
            <strong style={{color:"rgba(240,236,224,0.75)"}}> Appearance on this wall is not a finding of guilt, a legal determination, or a verdict.</strong>
            {" "}All cases represent public submissions forwarded to the relevant Ethiopian authority (FEACC, Federal Police, EHRC, Ombudsman, or OFAG) for independent investigation.
            Named individuals retain all rights under Ethiopian law.
          </p>
        </div>

        {/* Evidence tier explainer */}
        <div style={{marginBottom:"32px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"14px",fontWeight:"700"}}>EVIDENCE TIERS — DISCLOSURE THRESHOLDS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"10px"}}>
            {Object.entries(TIERS).map(([key,t])=>(
              <div key={key} style={{background:"rgba(0,0,0,0.45)",border:`1px solid ${t.color}22`,borderLeft:`3px solid ${t.color}`,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                  <span style={{fontSize:"16px"}}>{t.icon}</span>
                  <TierBadge tier={key} small/>
                </div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.55)",lineHeight:"1.7",marginBottom:"8px"}}>{t.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{fontSize:"22px",fontWeight:"900",color:t.color,fontFamily:"'Courier New',monospace"}}>{t.threshold}</div>
                  <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.5"}}>verified<br/>reports needed</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"12px",padding:"12px 16px",background:"rgba(0,0,0,0.3)",border:`1px solid rgba(0,212,255,0.08)`,fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
            // Voice submission intake built — disabled pending activation · Text + attachments (photo, document, screenshot) accepted now<br/>
            // Reports with documented payment demands reach threshold at 3–5 reports · Text-only cases require 100 to protect against coordination
          </div>
        </div>

        {/* Stats strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"32px",overflow:"hidden",borderRadius:"2px"}}>
          {[
            {v:"3",   l:"Referred to agency", c:R},
            {v:"5",   l:"Building case",      c:G},
            {v:"1",   l:"Flagged (review)",   c:"#fb923c"},
            {v:"100", l:"Text threshold",     c:"rgba(255,255,255,0.4)"},
            {v:"15",  l:"Photo threshold",    c:G},
            {v:"3",   l:"Demand threshold",   c:R},
          ].map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"18px 16px",textAlign:"center"}}>
              <div style={{fontSize:"clamp(20px,3vw,32px)",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"5px"}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",lineHeight:"1.4"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",marginBottom:"16px"}}>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {[["all","All cases"],["referred","Referred to agency"],["building","Building case"],["flagged","⚠ Flagged"]].map(([f,l])=>(
              <button key={f} className={`pill${filter===f?" on":""}`} onClick={()=>setFilter(f)}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginLeft:"8px",borderLeft:`1px solid rgba(0,212,255,0.12)`,paddingLeft:"14px"}}>
            {[["all","All tiers"],...Object.entries(TIERS).map(([k,t])=>[k,t.icon+" "+k])].map(([k,l])=>(
              <button key={k} className={`pill${tierFilter===k?" on":""}`} onClick={()=>setTierFilter(k)} style={{fontSize:"8px"}}>{l}</button>
            ))}
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"0",border:`1px solid rgba(0,212,255,0.15)`,background:"rgba(0,0,0,0.4)"}}>
            <span style={{padding:"0 12px",fontSize:"11px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search office, city, type..."
              style={{background:"transparent",border:"none",outline:"none",color:"rgba(240,236,224,0.7)",fontFamily:"'Courier New',monospace",fontSize:"11px",padding:"9px 12px 9px 0",width:"200px"}}/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pad" style={{maxWidth:"1200px",margin:"0 auto",padding:"0 40px 80px"}}>
        {/* Column headers */}
        <div style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 130px 120px 130px",gap:"0",padding:"10px 20px",borderBottom:`1px solid rgba(0,212,255,0.15)`,fontSize:"8px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>
          <div>CASE ID</div>
          <div>OFFICE / LOCATION</div>
          <div className="hide-mob">EVIDENCE TYPE</div>
          <div>PROGRESS</div>
          <div>STATUS</div>
          <div className="hide-mob">REFERRED TO</div>
        </div>

        {filtered.map((o,i)=>{
          const tier = TIERS[o.tier];
          const pct = Math.min((o.reports/o.threshold)*100,100);
          const [ref,vis]=useReveal();
          return(
          <div key={o.id} ref={ref} className="row"
            style={{display:"grid",gridTemplateColumns:"80px 1fr 140px 130px 120px 130px",gap:"0",
              padding:"18px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`,alignItems:"center",
              background:o.coordination?"rgba(251,146,60,0.04)":"transparent",
              opacity:vis?1:0,transform:vis?"none":"translateY(8px)",transition:`all 0.4s ${i*0.05}s ease`}}>

            {/* Case ID */}
            <div>
              <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",marginBottom:"3px"}}>{o.id}</div>
              {o.coordination&&<div style={{fontSize:"8px",color:"#fb923c",fontFamily:"'Courier New',monospace"}}>⚠ FLAGGED</div>}
            </div>

            {/* Office */}
            <div>
              <div style={{fontSize:"14px",fontWeight:"700",color:o.referred?"rgba(220,120,120,0.85)":"rgba(240,236,224,0.55)",fontFamily:"'Playfair Display',serif",marginBottom:"3px"}}>
                {o.name}
              </div>
              <div style={{fontSize:"11px",color:"rgba(240,236,224,0.45)",marginBottom:"2px"}}>{o.office}</div>
              <div style={{fontSize:"10px",color:"rgba(240,236,224,0.28)"}}>{o.city} · {o.region}</div>
              {o.coordination&&<div style={{fontSize:"9px",color:"#fb923c",marginTop:"4px",fontFamily:"'Courier New',monospace",lineHeight:"1.5"}}>{o.note}</div>}
            </div>

            {/* Evidence type */}
            <div className="hide-mob">
              <TierBadge tier={o.tier} small/>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",marginTop:"5px",fontFamily:"'Courier New',monospace"}}>threshold: {o.threshold}</div>
            </div>

            {/* Progress */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"11px",marginBottom:"3px"}}>
                <span style={{color:o.referred?R:tier.color,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{o.reports}<span style={{color:"rgba(240,236,224,0.3)",fontSize:"9px"}}>/{o.threshold}</span></span>
                <span style={{color:"rgba(240,236,224,0.3)",fontSize:"9px",fontFamily:"'Courier New',monospace"}}>{o.verified}v</span>
              </div>
              <ProgressBar val={o.reports} max={o.threshold} color={tier.color}/>
              <div style={{fontSize:"8px",color:"rgba(240,236,224,0.22)",fontFamily:"'Courier New',monospace",marginTop:"4px"}}>{o.threshold-Math.min(o.reports,o.threshold)} more needed</div>
            </div>

            {/* Status */}
            <div>
              <span style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em",padding:"4px 10px",
                background:o.referred?"rgba(184,32,32,0.12)":o.coordination?"rgba(251,146,60,0.1)":"rgba(201,168,76,0.06)",
                border:`1px solid ${o.referred?"rgba(184,32,32,0.35)":o.coordination?"rgba(251,146,60,0.3)":"rgba(201,168,76,0.2)"}`,
                color:o.referred?R:o.coordination?"#fb923c":G,display:"block",textAlign:"center"}}>
                {o.referred?"● REFERRED":o.coordination?"⚠ REVIEW":"○ BUILDING"}
              </span>
              <div style={{fontSize:"8px",color:"rgba(240,236,224,0.22)",fontFamily:"'Courier New',monospace",marginTop:"5px",textAlign:"center"}}>since {o.since}</div>
            </div>

            {/* Agency */}
            <div className="hide-mob" style={{fontSize:"11px",color:o.referred?"rgba(240,236,224,0.55)":"rgba(240,236,224,0.28)",fontFamily:"'Courier New',monospace"}}>
              {o.referred?o.agency:"—"}
              {o.referred&&o.note&&<div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",marginTop:"4px",lineHeight:"1.5"}}>{o.note}</div>}
            </div>
          </div>
        );})}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",fontSize:"12px"}}>
            No cases match your filter.
          </div>
        )}

        {/* Explainer boxes — 3 states */}
        <div style={{marginTop:"40px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px"}}>
          {[
            {icon:"○",color:G,   title:"Building case",        text:"Only office and city are shown. Name masked. Reports are accumulating — threshold not yet reached. Evidence type determines how many reports are needed."},
            {icon:"⚠",color:"#fb923c",title:"Flagged for review",text:"Coordination pattern detected — reports appear suspiciously similar or clustered in time. Case held for manual analyst review before any action."},
            {icon:"●",color:R,   title:"Referred to agency",   text:"Threshold reached. Case forwarded to FEACC, Police, or relevant authority for independent investigation. This is a referral — not a verdict. The authority determines guilt."},
          ].map((b,i)=>(
            <div key={i} style={{display:"flex",gap:"12px",padding:"18px 20px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.08)`,borderLeft:`3px solid ${b.color}`}}>
              <div style={{fontSize:"16px",color:b.color,flexShrink:0,marginTop:"2px"}}>{b.icon}</div>
              <div>
                <div style={{fontSize:"12px",fontWeight:"700",color:b.color,marginBottom:"6px",fontFamily:"'Courier New',monospace",letterSpacing:"0.06em"}}>{b.title}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.75"}}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live intake feed */}
        <div style={{marginTop:"40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
            <span style={{fontSize:"9px",color:"rgba(74,222,128,0.7)",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",fontWeight:"700"}}>RECENT SUBMISSIONS · ANONYMIZED</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr auto",gap:"0",padding:"8px 16px",fontSize:"8px",color:`rgba(0,212,255,0.35)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.14em",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div>TIME</div><div>OFFICE</div><div>REGION · TYPE</div><div>EVIDENCE</div>
          </div>
          {RECENT.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr auto",gap:"12px",padding:"12px 16px",borderBottom:`1px solid rgba(0,212,255,0.05)`,alignItems:"center",background:i===0?"rgba(0,212,255,0.03)":"transparent"}}>
              <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{r.time}</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.7)"}}>{r.office}</div>
              <div>
                <div style={{fontSize:"11px",color:"rgba(240,236,224,0.45)"}}>{r.region}</div>
                <div style={{fontSize:"10px",color:"rgba(240,236,224,0.3)"}}>{r.type}</div>
              </div>
              <div style={{display:"flex",gap:"6px",alignItems:"center",justifyContent:"flex-end"}}>
                <TierBadge tier={r.tier} small/>
                <span style={{fontSize:"8px",color:r.verified?"#4ade80":"rgba(201,168,76,0.5)",fontFamily:"'Courier New',monospace"}}>{r.verified?"✓":"pending"}</span>
              </div>
            </div>
          ))}
          <div style={{padding:"10px 16px",fontSize:"10px",color:"rgba(240,236,224,0.18)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
            // No reporter identifiers · No names below threshold · Evidence tier shown to demonstrate report quality
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,padding:"24px 40px",background:"rgba(0,0,0,0.9)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
        <span style={{fontSize:"9px",color:`rgba(0,212,255,0.2)`,fontFamily:"'Courier New',monospace"}}>SAFUU INTEL · FEACC:959 · EHRC:1488 · POLICE:911 · All appearances are referrals — not verdicts</span>
        <span style={{fontSize:"9px",color:`rgba(201,168,76,0.2)`,fontFamily:"'Courier New',monospace"}}>{date} · safuu.net/transparency</span>
      </div>
    </div>
  );
}
