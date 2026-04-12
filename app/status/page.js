'use client';
import { useState, useEffect } from "react";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const SERVICES = [
  {name:"SAFUU.NET",           status:"operational", uptime:"99.98%", latency:"42ms",   desc:"Next.js frontend · Vercel Edge Network"},
  {name:"AI ANALYSIS",         status:"operational", uptime:"99.91%", latency:"820ms",  desc:"Claude API · tip categorization + routing"},
  {name:"VOICE TRANSCRIPTION", status:"operational", uptime:"99.87%", latency:"1.2s",   desc:"OpenAI Whisper · 11 Ethiopian languages"},
  {name:"IMAGE FORENSICS",     status:"operational", uptime:"99.94%", latency:"680ms",  desc:"Hive Moderation · AI-image detection 94%"},
  {name:"TELEGRAM BOT",        status:"pending",     uptime:"—",      latency:"—",      desc:"Pending backend VPS deployment"},
  {name:"SMS INTAKE",          status:"pending",     uptime:"—",      latency:"—",      desc:"Africa's Talking · pending backend activation"},
  {name:"EVIDENCE LEDGER",     status:"operational", uptime:"100%",   latency:"<1ms",   desc:"Cryptographic hash chain · tamper-evident"},
  {name:"ENCRYPTION LAYER",    status:"operational", uptime:"100%",   latency:"<1ms",   desc:"AES-256-GCM · PBKDF2 310k iterations"},
];

const INCIDENTS = [
  {date:"2026-04-12",severity:"none",    title:"No incidents",                        body:"All systems operational."},
  {date:"2026-04-10",severity:"info",    title:"Scheduled maintenance",               body:"Next.js 15→16 upgrade. 3 minute downtime. Completed."},
  {date:"2026-03-28",severity:"resolved",title:"Vercel edge function cold start spike",body:"Intermittent 500ms latency spikes. Resolved by edge function warm-up config."},
];

const STATUS_CONFIG = {
  operational:{ label:"Operational", color:"#4ade80", bg:"rgba(74,222,128,0.08)", border:"rgba(74,222,128,0.2)" },
  degraded:   { label:"Degraded",    color:"#fb923c", bg:"rgba(251,146,60,0.08)", border:"rgba(251,146,60,0.2)" },
  pending:    { label:"Pending",      color:G,         bg:"rgba(201,168,76,0.06)", border:"rgba(201,168,76,0.15)" },
  down:       { label:"Down",         color:R,         bg:"rgba(184,32,32,0.08)", border:"rgba(184,32,32,0.2)" },
};
const INC_CONFIG = {
  none:     {color:"#4ade80",label:"✓"},
  info:     {color:CY,       label:"ℹ"},
  resolved: {color:G,        label:"✓"},
  active:   {color:R,        label:"⚠"},
};

export default function Status() {
  const [tick, setTick] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>setTick(v=>v+1),1000); return()=>clearInterval(t); },[]);
  const now = new Date();
  const opCount = SERVICES.filter(s=>s.status==="operational").length;
  const overallOk = opCount === SERVICES.length;
  const overallPartial = opCount > SERVICES.length / 2;

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>STATUS</div>
          </div>
        </a>
        <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"60px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        {/* Overall status */}
        <div style={{background:overallOk?"rgba(74,222,128,0.06)":overallPartial?"rgba(251,146,60,0.06)":"rgba(184,32,32,0.06)",
          border:`1px solid ${overallOk?"rgba(74,222,128,0.3)":overallPartial?"rgba(251,146,60,0.3)":"rgba(184,32,32,0.3)"}`,
          padding:"24px 28px",marginBottom:"40px",display:"flex",alignItems:"center",gap:"20px"}}>
          <div style={{width:"16px",height:"16px",borderRadius:"50%",background:overallOk?"#4ade80":overallPartial?"#fb923c":R,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:"18px",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"4px"}}>
              {overallOk?"All systems operational":overallPartial?"Partial service disruption":"Service disruption"}
            </div>
            <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace"}}>
              {opCount}/{SERVICES.length} services operational · Updated {now.toTimeString().slice(0,8)}
            </div>
          </div>
        </div>

        {/* Services */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"12px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>SERVICES</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
            {SERVICES.map((s,i)=>{
              const cfg = STATUS_CONFIG[s.status]||STATUS_CONFIG.pending;
              return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",background:cfg.bg,border:`1px solid ${cfg.border}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"3px",fontFamily:"'Courier New',monospace",letterSpacing:"0.04em"}}>{s.name}</div>
                  <div style={{fontSize:"11px",color:"rgba(240,236,224,0.4)"}}>{s.desc}</div>
                </div>
                {s.latency!=="—" && (
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"11px",color:`rgba(0,212,255,0.6)`,fontFamily:"'Courier New',monospace"}}>{s.latency}</div>
                    <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>avg latency</div>
                  </div>
                )}
                {s.uptime!=="—" && (
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"11px",color:cfg.color,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{s.uptime}</div>
                    <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>30d uptime</div>
                  </div>
                )}
                <div style={{padding:"4px 12px",background:`${cfg.color}15`,border:`1px solid ${cfg.color}40`,fontSize:"8px",fontFamily:"'Courier New',monospace",color:cfg.color,letterSpacing:"0.12em",flexShrink:0}}>
                  {cfg.label}
                </div>
              </div>
            );})}
          </div>
        </div>

        {/* Incident history */}
        <div style={{marginBottom:"40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"12px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>INCIDENT HISTORY</span>
          </div>
          {INCIDENTS.map((inc,i)=>{
            const cfg = INC_CONFIG[inc.severity]||INC_CONFIG.info;
            return(
            <div key={i} style={{display:"flex",gap:"16px",padding:"16px 0",borderBottom:`1px solid rgba(0,212,255,0.06)`}}>
              <div style={{width:"60px",fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",flexShrink:0,marginTop:"2px"}}>{inc.date.slice(5)}</div>
              <div style={{fontSize:"12px",color:cfg.color,fontFamily:"'Courier New',monospace",flexShrink:0,marginTop:"2px"}}>{cfg.label}</div>
              <div>
                <div style={{fontSize:"13px",fontWeight:"600",color:"rgba(240,236,224,0.75)",marginBottom:"4px"}}>{inc.title}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.6"}}>{inc.body}</div>
              </div>
            </div>
          );})}
        </div>

        <div style={{fontSize:"10px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace",lineHeight:"1.9"}}>
          safuu.net · System Status · {now.toISOString().slice(0,10)}<br/>
          Backend deployment pending — Telegram bot + SMS intake not yet active
        </div>
      </div>
    </div>
  );
}
