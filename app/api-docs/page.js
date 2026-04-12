'use client';
import { useState } from "react";
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const ENDPOINTS = [
  {
    method:"GET", path:"/health", auth:"none", tag:"System",
    desc:"System health check. Returns status, uptime, version.",
    response:`{"status":"ok","uptime":86400,"version":"2.0.0","ledger_integrity":true}`,
  },
  {
    method:"POST", path:"/api/auth/login", auth:"none", tag:"Auth",
    desc:"Authenticate and receive a JWT token for admin access.",
    body:`{"username":"admin","password":"your-password"}`,
    response:`{"token":"eyJ...","expires":"8h","role":"admin"}`,
  },
  {
    method:"GET", path:"/api/public/stats", auth:"none", tag:"Public",
    desc:"Aggregate platform statistics. No PII included.",
    response:`{"total_tips":233,"verified":139,"disclosed":3,"threshold":15,"regions":6,"last_updated":"2026-04-12T05:00:00Z"}`,
  },
  {
    method:"GET", path:"/api/public/transparency", auth:"none", tag:"Public",
    desc:"Transparency wall data. Names masked below threshold.",
    response:`{"officials":[{"id":"ETH-001","masked_name":"T••••••• B•••••","office":"Ministry of Transport","city":"Addis Ababa","reports":22,"disclosed":true},...]}`,
  },
  {
    method:"GET", path:"/api/persons", auth:"API Key", tag:"Admin",
    desc:"Full person registry with report counts. Requires X-Api-Key header.",
    response:`{"persons":[{"id":"ETH-001","name":"Tesfaye Bekele","reports":22,"verified":19,"status":"FEACC"},...]}`,
  },
  {
    method:"POST", path:"/api/persons/:id/escalate", auth:"Analyst+", tag:"Admin",
    desc:"Change investigation status for a disclosed official.",
    body:`{"status":"FEACC","notes":"Formal complaint filed 2026-04-16"}`,
    response:`{"success":true,"id":"ETH-001","status":"FEACC","updated_at":"2026-04-12T06:00:00Z"}`,
  },
  {
    method:"GET", path:"/api/analytics", auth:"API Key", tag:"Admin",
    desc:"Full analytics: region breakdown, type breakdown, monthly trend.",
    response:`{"by_region":[{"region":"Addis Ababa","count":78},...],"by_type":[...],"monthly":[...]}`,
  },
  {
    method:"GET", path:"/api/ledger", auth:"API Key", tag:"Security",
    desc:"Evidence ledger with integrity verification. Returns chain status.",
    response:`{"integrity":"VALID","blocks":233,"last_hash":"a3f8...","verified_at":"2026-04-12T06:00:00Z"}`,
  },
  {
    method:"POST", path:"/api/admin/threshold", auth:"Analyst+", tag:"Admin",
    desc:"Set the disclosure threshold for public name disclosure.",
    body:`{"threshold":15}`,
    response:`{"success":true,"threshold":15,"previous":10}`,
  },
  {
    method:"GET", path:"/api/security/audit", auth:"Admin", tag:"Security",
    desc:"Tamper-evident audit log. Hash chain, no PII.",
    response:`{"events":[{"timestamp":"2026-04-12T05:00:00Z","action":"LOGIN","hash":"b4d2..."},...]}`,
  },
  {
    method:"WebSocket", path:"/ws?key=<api-key>", auth:"API Key", tag:"Realtime",
    desc:"Live event stream. Fires on new tips, verifications, disclosures.",
    response:`{"event":"new_tip","region":"Oromia","type":"Land Fraud","language":"OR","timestamp":"..."}`,
  },
];

const TAG_COLORS = { System:CY, Auth:G, Public:"#4ade80", Admin:R, Security:"#a78bfa", Realtime:"#fb923c" };
const METHOD_COLORS = { GET:"#4ade80", POST:G, WebSocket:CY };

export default function ApiDocs() {
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(null);
  const copy = (text, id) => { navigator.clipboard?.writeText(text); setCopied(id); setTimeout(()=>setCopied(null),1800); };
  const tags = [...new Set(ENDPOINTS.map(e=>e.tag))];

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}.ep:hover{background:rgba(0,212,255,0.04)!important}.copy-btn:hover{background:rgba(0,212,255,0.12)!important;color:${CY}!important}pre{white-space:pre-wrap;word-break:break-all}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>API REFERENCE</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/backend" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>SETUP</a>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
        </div>
      </nav>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>REST API v2.0</span>
          <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          API Reference
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"16px",maxWidth:"620px"}}>
          The SAFUU Intel backend exposes a REST API + WebSocket. All endpoints except public ones require authentication.
        </p>

        {/* Base URL */}
        <div style={{background:"rgba(0,0,0,0.6)",border:`1px solid rgba(0,212,255,0.15)`,padding:"14px 20px",marginBottom:"48px",fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:"16px"}}>
          <span style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,letterSpacing:"0.15em"}}>BASE URL</span>
          <span style={{fontSize:"13px",color:G}}>https://api.your-server.com</span>
          <span style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",marginLeft:"auto"}}>Configure in .env → API_BASE_URL</span>
        </div>

        {/* Auth */}
        <div style={{marginBottom:"48px",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.15)`,padding:"24px 28px"}}>
          <div style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"16px",fontWeight:"700"}}>AUTHENTICATION</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              ["API Key","X-Api-Key: your-DASHBOARD_API_KEY","Admin/Analyst endpoints"],
              ["JWT Token","Authorization: Bearer <token> (from POST /api/auth/login)","Admin dashboard"],
              ["None","No header required","Public endpoints only"],
            ].map(([type,header,use])=>(
              <div key={type} style={{display:"grid",gridTemplateColumns:"100px 1fr 200px",gap:"16px",padding:"10px 0",borderBottom:`1px solid rgba(0,212,255,0.05)`,alignItems:"center"}}>
                <span style={{fontSize:"11px",fontWeight:"700",color:G,fontFamily:"'Courier New',monospace"}}>{type}</span>
                <code style={{fontSize:"11px",color:CY,fontFamily:"'Courier New',monospace"}}>{header}</code>
                <span style={{fontSize:"10px",color:"rgba(240,236,224,0.35)"}}>{use}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"28px"}}>
          {tags.map(tag=>(
            <span key={tag} style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",padding:"4px 12px",background:`${TAG_COLORS[tag]}15`,border:`1px solid ${TAG_COLORS[tag]}40`,color:TAG_COLORS[tag]}}>
              {tag}
            </span>
          ))}
        </div>

        {/* Endpoints */}
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {ENDPOINTS.map((ep,i)=>(
            <div key={i} className="ep" onClick={()=>setActive(active===i?null:i)}
              style={{border:`1px solid ${active===i?"rgba(0,212,255,0.2)":"rgba(0,212,255,0.08)"}`,background:active===i?"rgba(0,212,255,0.03)":"rgba(0,0,0,0.3)",cursor:"pointer",transition:"all 0.15s",overflow:"hidden"}}>
              
              {/* Endpoint header */}
              <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 20px"}}>
                <span style={{fontSize:"9px",fontWeight:"700",fontFamily:"'Courier New',monospace",padding:"3px 10px",background:`${METHOD_COLORS[ep.method]||G}15`,border:`1px solid ${METHOD_COLORS[ep.method]||G}40`,color:METHOD_COLORS[ep.method]||G,flexShrink:0,minWidth:"60px",textAlign:"center"}}>
                  {ep.method}
                </span>
                <code style={{fontSize:"13px",color:"rgba(240,236,224,0.8)",fontFamily:"'Courier New',monospace",flex:1}}>{ep.path}</code>
                <span style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",padding:"3px 10px",background:`${TAG_COLORS[ep.tag]}10`,color:TAG_COLORS[ep.tag],flexShrink:0}}>{ep.tag}</span>
                <span style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",flexShrink:0}}>{ep.auth}</span>
                <span style={{color:active===i?CY:`rgba(0,212,255,0.3)`,fontSize:"16px",transition:"transform 0.2s",display:"inline-block",transform:active===i?"rotate(90deg)":"none"}}>›</span>
              </div>

              {/* Expanded detail */}
              {active===i && (
                <div style={{borderTop:`1px solid rgba(0,212,255,0.1)`,padding:"20px 20px 20px 20px"}}>
                  <p style={{fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8",marginBottom:"20px"}}>{ep.desc}</p>
                  
                  {ep.body && (
                    <div style={{marginBottom:"16px"}}>
                      <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",marginBottom:"8px"}}>REQUEST BODY</div>
                      <div style={{position:"relative"}}>
                        <pre style={{background:"rgba(0,0,0,0.6)",border:`1px solid rgba(0,212,255,0.1)`,padding:"14px 16px",fontSize:"11px",color:"rgba(240,236,224,0.65)",fontFamily:"'Courier New',monospace",lineHeight:"1.7"}}>
                          {ep.body}
                        </pre>
                        <button className="copy-btn" onClick={(e)=>{e.stopPropagation();copy(ep.body,`body-${i}`);}}
                          style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,212,255,0.05)",border:`1px solid rgba(0,212,255,0.2)`,color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",fontSize:"8px",padding:"3px 10px",cursor:"pointer",letterSpacing:"0.1em",transition:"all 0.2s"}}>
                          {copied===`body-${i}`?"✓":"COPY"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{fontSize:"9px",color:"rgba(74,222,128,0.5)",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",marginBottom:"8px"}}>RESPONSE</div>
                    <div style={{position:"relative"}}>
                      <pre style={{background:"rgba(0,0,0,0.6)",border:`1px solid rgba(74,222,128,0.1)`,padding:"14px 16px",fontSize:"11px",color:"rgba(240,236,224,0.65)",fontFamily:"'Courier New',monospace",lineHeight:"1.7"}}>
                        {ep.response}
                      </pre>
                      <button className="copy-btn" onClick={(e)=>{e.stopPropagation();copy(ep.response,`res-${i}`);}}
                        style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,212,255,0.05)",border:`1px solid rgba(0,212,255,0.2)`,color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",fontSize:"8px",padding:"3px 10px",cursor:"pointer",letterSpacing:"0.1em",transition:"all 0.2s"}}>
                        {copied===`res-${i}`?"✓":"COPY"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{marginTop:"48px",padding:"20px 24px",background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.07)`,fontSize:"11px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",lineHeight:"1.9"}}>
          // API binds to 127.0.0.1:3001 by default — Nginx proxies externally<br/>
          // All endpoints require TLS in production — see safuu-nginx.conf<br/>
          // Rate limits: 100 req/min per API key · Sliding window, SQLite-backed
        </div>
      </div>
    </div>
  );
}
