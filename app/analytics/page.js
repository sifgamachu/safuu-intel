'use client';
import { useState, useEffect, useRef } from "react";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

// ── Reveal ─────────────────────────────────────────────────────────────────────
function useReveal(t=0.1){
  const ref=useRef();const[v,setV]=useState(false);
  useEffect(()=>{
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.disconnect();}},{threshold:t});
    if(ref.current)o.observe(ref.current);return()=>o.disconnect();
  },[]);return[ref,v];
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
function Bar({ label, val, max, color, delay=0 }) {
  const [w, setW] = useState(0);
  const [ref,vis] = useReveal();
  useEffect(()=>{ if(vis) setTimeout(()=>setW((val/max)*100), delay); },[vis]);
  return (
    <div ref={ref} style={{marginBottom:"16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
        <span style={{fontSize:"12px",color:"rgba(240,236,224,0.6)"}}>{label}</span>
        <span style={{fontSize:"12px",fontWeight:"700",color,fontFamily:"'Courier New',monospace"}}>{val}</span>
      </div>
      <div style={{height:"6px",background:"rgba(255,255,255,0.05)",borderRadius:"1px",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${w}%`,background:color,transition:"width 0.9s ease",borderRadius:"1px"}}/>
      </div>
    </div>
  );
}

// ── Donut chart ────────────────────────────────────────────────────────────────
function DonutChart({ data, size=160 }) {
  const [mounted, setMounted] = useState(false);
  const [ref,vis] = useReveal();
  useEffect(()=>{ if(vis) setTimeout(()=>setMounted(true),200); },[vis]);
  const total = data.reduce((s,d)=>s+d.val,0);
  let cum = 0;
  const r = 60; const cx = size/2; const cy = size/2;
  const segments = data.map(d=>{
    const pct = d.val/total;
    const start = cum * 360;
    const end = (cum + pct) * 360;
    cum += pct;
    const toRad = a => (a-90)*Math.PI/180;
    const x1 = cx + r*Math.cos(toRad(start));
    const y1 = cy + r*Math.sin(toRad(start));
    const x2 = cx + r*Math.cos(toRad(mounted?end:start));
    const y2 = cy + r*Math.sin(toRad(mounted?end:start));
    const large = (end-start) > 180 ? 1 : 0;
    return { ...d, path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z` };
  });
  return (
    <div ref={ref} style={{display:"flex",gap:"24px",alignItems:"center",flexWrap:"wrap"}}>
      <svg width={size} height={size} style={{flexShrink:0,transition:"all 0.9s ease"}}>
        {segments.map((s,i)=>(
          <path key={i} d={s.path} fill={s.color} opacity={0.85}/>
        ))}
        <circle cx={cx} cy={cy} r={r*0.55} fill="#030507"/>
        <text x={cx} y={cy-8} textAnchor="middle" fill="rgba(240,236,224,0.5)" fontSize="9" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy+6} textAnchor="middle" fill="rgba(240,236,224,0.3)" fontSize="7" fontFamily="monospace">TOTAL</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {data.map(d=>(
          <div key={d.label} style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"11px"}}>
            <div style={{width:"8px",height:"8px",background:d.color,flexShrink:0}}/>
            <span style={{color:"rgba(240,236,224,0.6)"}}>{d.label}</span>
            <span style={{color:d.color,fontFamily:"'Courier New',monospace",fontWeight:"700",marginLeft:"auto",paddingLeft:"12px"}}>{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const REGIONS = [
  {label:"Addis Ababa", val:78, color:R},
  {label:"Oromia",      val:52, color:G},
  {label:"Amhara",      val:34, color:CY},
  {label:"SNNPR",       val:28, color:"#a78bfa"},
  {label:"Tigray",      val:21, color:"#4ade80"},
  {label:"Dire Dawa",   val:12, color:"#fb923c"},
  {label:"Somali",      val:8,  color:"#60a5fa"},
];

const TYPES = [
  {label:"Procurement Bribery", val:67, color:R},
  {label:"Land Fraud",          val:48, color:G},
  {label:"Customs Extortion",   val:34, color:CY},
  {label:"Tax Evasion",         val:28, color:"#a78bfa"},
  {label:"Court Corruption",    val:22, color:"#fb923c"},
  {label:"Police Extortion",    val:19, color:"#60a5fa"},
  {label:"Healthcare Theft",    val:15, color:"#4ade80"},
];

const MONTHLY = [
  {m:"Oct", n:12},{m:"Nov",n:18},{m:"Dec",n:24},{m:"Jan",n:31},
  {m:"Feb",n:38},{m:"Mar",n:45},{m:"Apr",n:65},
];

const AGENCIES = [
  {name:"FEACC",         routed:89, verified:72, color:"#4ade80"},
  {name:"Federal Police",routed:41, verified:31, color:"#f87171"},
  {name:"EHRC",          routed:28, verified:22, color:"#60a5fa"},
  {name:"Ombudsman",     routed:19, verified:14, color:"#a78bfa"},
  {name:"OFAG",          routed:12, verified:8,  color:"#fb923c"},
];

export default function Analytics() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .lnk:hover{color:${CY}!important}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}
        @media(max-width:700px){.two-col{grid-template-columns:1fr!important}}
      `}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>ANALYTICS</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>WALL</a>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
        </div>
      </nav>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"60px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>PLATFORM ANALYTICS · PUBLIC</span>
          <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"12px",letterSpacing:"-0.02em"}}>
          Intelligence Overview
        </h1>
        <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",marginBottom:"52px",fontFamily:"'Courier New',monospace"}}>
          Aggregated, anonymous data. No personally identifying information is included.
        </p>

        {/* Top stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"48px",borderRadius:"2px",overflow:"hidden"}}>
          {[
            {v:"233+",l:"Total Tips",  c:G},
            {v:"139", l:"Verified",    c:CY},
            {v:"59%", l:"Verify Rate", c:CY},
            {v:"3",   l:"Disclosed",   c:R},
            {v:"15",  l:"Threshold",   c:G},
            {v:"6",   l:"Regions",     c:CY},
            {v:"11",  l:"Languages",   c:G},
            {v:"5",   l:"Agencies",    c:CY},
          ].map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"24px 20px",textAlign:"center"}}>
              <div style={{fontSize:"clamp(22px,3vw,34px)",fontWeight:"900",color:s.c,fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"6px"}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"24px"}}>
          {/* Reports by region */}
          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px"}}>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"20px"}}>REPORTS BY REGION</div>
            {REGIONS.map((r,i)=><Bar key={r.label} {...r} max={78} delay={i*80}/>)}
          </div>

          {/* Reports by type */}
          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px"}}>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"20px"}}>REPORTS BY TYPE</div>
            {TYPES.map((t,i)=><Bar key={t.label} {...t} max={67} delay={i*80}/>)}
          </div>
        </div>

        {/* Monthly trend */}
        <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px",marginBottom:"24px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"24px"}}>MONTHLY INTAKE TREND (Oct 2025 – Apr 2026)</div>
          <div style={{display:"flex",gap:"12px",alignItems:"flex-end",height:"120px",borderBottom:`1px solid rgba(0,212,255,0.1)`,paddingBottom:"8px"}}>
            {MONTHLY.map((m,i)=>{
              const [ref,vis]=useReveal();
              return(
              <div key={m.m} ref={ref} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",justifyContent:"flex-end"}}>
                <div style={{fontSize:"9px",fontFamily:"'Courier New',monospace",color:G,opacity:vis?1:0,transition:"opacity 0.3s"}}>{m.n}</div>
                <div style={{width:"100%",background:`linear-gradient(to top,${G},${CY})`,borderRadius:"1px 1px 0 0",
                  height:vis?`${(m.n/65)*100}%`:"0%",transition:`height 0.8s ${i*0.1}s ease`,minHeight:vis?"4px":"0"}}/>
                <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>{m.m}</div>
              </div>
            );})}
          </div>
        </div>

        {/* Agency routing */}
        <div className="two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px"}}>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"20px"}}>AGENCY ROUTING</div>
            <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>
              {AGENCIES.map(a=>(
                <div key={a.name} style={{display:"flex",gap:"12px",alignItems:"center",padding:"12px 16px",background:"rgba(255,255,255,0.02)",borderLeft:`3px solid ${a.color}`}}>
                  <div style={{flex:1,fontSize:"12px",color:"rgba(240,236,224,0.7)"}}>{a.name}</div>
                  <div style={{fontSize:"11px",color:a.color,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{a.routed}</div>
                  <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace"}}>→ {a.verified} verified</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px"}}>
            <div style={{fontSize:"9px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"24px"}}>CORRUPTION TYPE DISTRIBUTION</div>
            <DonutChart data={[
              {label:"Procurement",  val:67, color:R},
              {label:"Land Fraud",   val:48, color:G},
              {label:"Customs",      val:34, color:CY},
              {label:"Tax",          val:28, color:"#a78bfa"},
              {label:"Other",        val:56, color:"rgba(255,255,255,0.15)"},
            ]}/>
          </div>
        </div>

        <div style={{marginTop:"40px",padding:"20px 24px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.08)`,fontSize:"11px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
          // All data is aggregated and anonymized · No personally identifying information included<br/>
          // Reporter identities are SHA-256 hashed and cannot be derived from this data<br/>
          // Statistics updated as reports are received and verified
        </div>
      </div>
    </div>
  );
}
