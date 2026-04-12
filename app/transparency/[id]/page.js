'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

// Mock case data — in production this pulls from /api/public/transparency/:id
const CASES = {
  "ETH-001": {
    id:"ETH-001", disclosed:true,
    name:"T••••••• B•••••",
    office:"Ministry of Transport", city:"Addis Ababa", region:"Oromia",
    type:"Procurement Bribery", amount:"ETB 2,400,000",
    firstReport:"2025-11-14", lastReport:"2026-03-14",
    reports:22, threshold:15, verified:19,
    status:"FEACC", escalated:"2026-03-16",
    timeline:[
      {date:"2025-11-14",event:"First report received",lang:"AM",verified:true},
      {date:"2025-12-02",event:"Second verified report",lang:"OR",verified:true},
      {date:"2026-01-08",event:"Photo evidence submitted — EXIF verified",lang:"AM",verified:true},
      {date:"2026-02-14",event:"Reports reached 10 — pattern flagged",lang:"AM",verified:true},
      {date:"2026-03-01",event:"FEACC pre-notification issued",lang:"TI",verified:true},
      {date:"2026-03-14",event:"Threshold reached (22 reports) — name disclosed",lang:"AM",verified:true},
      {date:"2026-03-16",event:"Case formally escalated to FEACC",lang:"EN",verified:true},
    ],
  },
  "ETH-002": {
    id:"ETH-002", disclosed:true,
    name:"A••••• G•••••••",
    office:"Customs Authority", city:"Dire Dawa", region:"Dire Dawa",
    type:"Customs Extortion", amount:"ETB 850,000",
    firstReport:"2025-12-18", lastReport:"2026-03-28",
    reports:19, threshold:15, verified:17,
    status:"Federal Police", escalated:"2026-03-30",
    timeline:[
      {date:"2025-12-18",event:"First report received",lang:"OR",verified:true},
      {date:"2026-01-22",event:"SMS report from feature phone",lang:"SO",verified:true},
      {date:"2026-02-09",event:"Voice report — Whisper transcribed",lang:"OR",verified:true},
      {date:"2026-02-28",event:"Photo evidence — EXIF date matches incident",lang:"OR",verified:true},
      {date:"2026-03-28",event:"Threshold reached — name disclosed",lang:"OR",verified:true},
      {date:"2026-03-30",event:"Routed to Federal Police",lang:"EN",verified:true},
    ],
  },
  "ETH-003": {
    id:"ETH-003", disclosed:true,
    name:"M••••••• K•••",
    office:"Land Administration", city:"Bahir Dar", region:"Amhara",
    type:"Land Fraud", amount:"ETB 4,100,000",
    firstReport:"2025-10-29", lastReport:"2026-04-01",
    reports:17, threshold:15, verified:15,
    status:"FEACC", escalated:"2026-04-03",
    timeline:[
      {date:"2025-10-29",event:"First report received",lang:"AM",verified:true},
      {date:"2025-12-11",event:"Community tip — two reporters same incident",lang:"AM",verified:true},
      {date:"2026-01-19",event:"Land registry document submitted",lang:"AM",verified:true},
      {date:"2026-03-04",event:"Third-party corroboration",lang:"AM",verified:true},
      {date:"2026-04-01",event:"Threshold reached — name disclosed",lang:"AM",verified:true},
      {date:"2026-04-03",event:"FEACC case opened",lang:"EN",verified:true},
    ],
  },
  "ETH-004": { id:"ETH-004", disclosed:false, name:"[MASKED]", office:"Regional Health Bureau", city:"Hawassa", region:"Sidama", type:"Healthcare Theft", amount:"—", firstReport:"2026-02-10", lastReport:"2026-04-08", reports:9, threshold:15, verified:7, status:"PENDING", escalated:null, timeline:[] },
  "ETH-005": { id:"ETH-005", disclosed:false, name:"[MASKED]", office:"Education Department", city:"Jimma", region:"Oromia", type:"Education Bribery", amount:"—", firstReport:"2026-03-01", lastReport:"2026-04-10", reports:6, threshold:15, verified:5, status:"PENDING", escalated:null, timeline:[] },
};

const LANG_MAP = {AM:"አማርኛ",OR:"Oromiffa",TI:"ትግርኛ",SO:"Soomaali",AF:"Qafar",EN:"English"};

function ProgressRing({val, max}) {
  const pct = Math.min(val/max, 1);
  const r = 44; const c = 2*Math.PI*r;
  const dash = pct * c;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
      <circle cx="52" cy="52" r={r} fill="none" stroke={pct>=1?R:G} strokeWidth="8"
        strokeDasharray={`${dash} ${c}`} strokeDashoffset={c/4}
        strokeLinecap="round" style={{transition:"stroke-dasharray 1s ease"}}/>
      <text x="52" y="48" textAnchor="middle" fill={pct>=1?R:G} fontSize="18" fontWeight="900" fontFamily="'Playfair Display',serif">{val}</text>
      <text x="52" y="62" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">/{max}</text>
    </svg>
  );
}

export default function CaseDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [notFound, setNF] = useState(false);

  useEffect(() => {
    const data = CASES[id];
    if (data) setC(data);
    else setNF(true);
  }, [id]);

  if (notFound) return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,letterSpacing:"0.25em",marginBottom:"16px"}}>CASE NOT FOUND</div>
        <div style={{fontSize:"14px",color:"rgba(240,236,224,0.4)",marginBottom:"24px"}}>{id} — No case record found.</div>
        <a href="/transparency" style={{color:G,fontFamily:"'Courier New',monospace",fontSize:"10px",letterSpacing:"0.15em"}}>← TRANSPARENCY WALL</a>
      </div>
    </div>
  );

  if (!c) return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em"}}>LOADING CASE...</div>
    </div>
  );

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/transparency" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>CASE RECORD</div>
          </div>
        </a>
        <a href="/transparency" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>← TRANSPARENCY WALL</a>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"60px 40px 100px",animation:"fadeUp 0.7s ease-out"}}>

        {/* Case header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
          <div style={{width:"6px",height:"6px",background:c.disclosed?R:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:c.disclosed?R:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>
            {c.id} · {c.disclosed?"● DISCLOSED":"○ PENDING THRESHOLD"}
          </span>
          <div style={{flex:1,height:"1px",background:c.disclosed?"rgba(184,32,32,0.2)":"rgba(201,168,76,0.15)"}}/>
        </div>

        <h1 style={{fontSize:"clamp(28px,4vw,48px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:c.disclosed?R:"rgba(240,236,224,0.4)",lineHeight:1.05,marginBottom:"8px",letterSpacing:"-0.01em"}}>
          {c.name}
        </h1>
        <div style={{fontSize:"16px",color:"rgba(240,236,224,0.6)",marginBottom:"32px"}}>{c.office} · {c.city}, {c.region}</div>

        {!c.disclosed && (
          <div style={{background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.2)`,padding:"16px 20px",marginBottom:"32px",fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8"}}>
            <strong style={{color:G}}>Identity protected.</strong> This official has not yet reached the disclosure threshold ({c.reports}/{c.threshold} verified reports). Name and personal details are not shown until sufficient evidence accumulates.
          </div>
        )}

        {/* Stats grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"40px",borderRadius:"2px",overflow:"hidden"}}>
          {[
            {v:c.reports,  l:"Total reports",  c:c.disclosed?R:G},
            {v:c.verified, l:"AI-verified",     c:CY},
            {v:c.threshold,l:"Threshold",        c:"rgba(240,236,224,0.4)"},
            {v:c.type,     l:"Type",             c:G, small:true},
            {v:c.amount,   l:"Estimated amount", c:c.disclosed?R:"rgba(240,236,224,0.25)", small:true},
          ].map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"22px 18px",textAlign:"center"}}>
              <div style={{fontSize:s.small?"14px":"clamp(22px,3vw,34px)",fontWeight:"900",color:s.c,fontFamily:s.small?"'Courier New',monospace":"'Playfair Display',serif",lineHeight:1,marginBottom:"6px",wordBreak:"break-word"}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Progress ring + key dates */}
        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"32px",alignItems:"center",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px 32px",marginBottom:"32px"}}>
          <ProgressRing val={c.reports} max={c.threshold}/>
          <div>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"12px"}}>EVIDENCE PROGRESS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {[
                ["First report",    c.firstReport],
                ["Latest report",   c.lastReport],
                ["Escalated to",    c.escalated?`${c.status} on ${c.escalated}`:"Pending threshold"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:"16px",fontSize:"12px"}}>
                  <span style={{color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",minWidth:"110px",flexShrink:0}}>{k}</span>
                  <span style={{color:"rgba(240,236,224,0.6)"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {c.timeline.length > 0 && (
          <div style={{marginBottom:"40px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
              <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>EVIDENCE TIMELINE</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"0",position:"relative"}}>
              <div style={{position:"absolute",left:"84px",top:0,bottom:0,width:"1px",background:"rgba(0,212,255,0.08)"}}/>
              {c.timeline.map((t,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr",gap:"0",marginBottom:"4px"}}>
                  <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",padding:"14px 12px 14px 0",textAlign:"right",lineHeight:"1.4"}}>{t.date.slice(5)}</div>
                  <div style={{display:"flex",alignItems:"flex-start",gap:"12px",padding:"12px 0 12px 20px",borderLeft:`1px solid rgba(0,212,255,0.08)`,position:"relative"}}>
                    <div style={{position:"absolute",left:"-4px",top:"18px",width:"8px",height:"8px",borderRadius:"50%",background:t.verified?"#4ade80":"rgba(201,168,76,0.4)",border:`1px solid ${t.verified?"#4ade80":G}`,flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:"13px",color:"rgba(240,236,224,0.7)",lineHeight:"1.6",marginBottom:"4px"}}>{t.event}</div>
                      <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                        <span style={{fontSize:"8px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",padding:"2px 8px",background:"rgba(0,212,255,0.06)",border:`1px solid rgba(0,212,255,0.15)`}}>{t.lang} · {LANG_MAP[t.lang]||t.lang}</span>
                        {t.verified&&<span style={{fontSize:"8px",color:"rgba(74,222,128,0.6)",fontFamily:"'Courier New',monospace"}}>✓ VERIFIED</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.07)`,padding:"20px 24px",fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
          // Reporter identities are SHA-256 hashed — never stored, never recoverable<br/>
          // Timeline events show aggregated intake data — no personal information<br/>
          // All evidence sealed in tamper-evident cryptographic ledger
        </div>

        {/* Actions */}
        <div style={{marginTop:"32px",display:"flex",gap:"12px",flexWrap:"wrap"}}>
          <a href="/transparency" style={{background:"transparent",color:`rgba(0,212,255,0.6)`,border:`1px solid rgba(0,212,255,0.25)`,fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
            ← ALL CASES
          </a>
          <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
            ⚖ ADD A REPORT
          </a>
        </div>
      </div>
    </div>
  );
}
