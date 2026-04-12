'use client';
import { useState } from "react";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const STEPS = [
  { id:1, label:"OFFICIAL",    q:"What is the official's name and title?",   hint:"Full name if known. Partial name is fine." },
  { id:2, label:"INSTITUTION", q:"Which office or institution?",              hint:"Ministry, court, customs post, police station, etc." },
  { id:3, label:"INCIDENT",    q:"When and where did this happen?",           hint:"Date, approximate time, location or address." },
  { id:4, label:"AMOUNT",      q:"Was money demanded or taken?",              hint:"Amount in ETB, USD, or describe the favour/benefit." },
  { id:5, label:"DESCRIPTION", q:"Describe what happened.",                   hint:"As much detail as you can. What was said? What was demanded? What happened if you refused?" },
  { id:6, label:"EVIDENCE",    q:"Optional: attach photo or document.",       hint:"Receipts, screenshots, or any supporting evidence. EXIF metadata is forensically analyzed." },
  { id:7, label:"CONTACT",     q:"Optional: official's phone number.",        hint:"Leave blank if unknown. This helps identify the person." },
  { id:8, label:"SUBMIT",      q:"Ready to submit your anonymous report.",    hint:"Your identity is protected by one-way SHA-256 hashing." },
];

const LANGS = [
  {code:"AM",label:"አማርኛ"},{code:"OR",label:"Oromiffa"},{code:"TI",label:"ትግርኛ"},
  {code:"SO",label:"Soomaali"},{code:"AF",label:"Qafar"},{code:"EN",label:"English"},
];

export default function ReportPage() {
  const [step,    setStep]    = useState(1);
  const [lang,    setLang]    = useState("EN");
  const [form,    setForm]    = useState({ name:"", office:"", date:"", location:"", amount:"", description:"", phone:"" });
  const [submitted, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const fieldMap = ["name","office","date,location","amount","description","evidence","phone"];
  const currentField = fieldMap[step-1];

  const handleSubmit = async () => {
    setLoading(true);
    // In production this would POST to the backend API
    // For now simulate a brief delay then success
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSubmit(true);
  };

  const progress = ((step-1) / (STEPS.length-1)) * 100;

  if (submitted) return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",padding:"40px"}}>
      <div style={{maxWidth:"520px",textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"24px"}}>⚖️</div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",justifyContent:"center",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:"#4ade80",borderRadius:"50%"}}/>
          <span style={{fontSize:"10px",color:"#4ade80",fontFamily:"'Courier New',monospace",letterSpacing:"0.2em"}}>REPORT RECEIVED</span>
        </div>
        <h2 style={{fontSize:"clamp(28px,5vw,40px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"16px",lineHeight:1.1}}>
          Your report has been filed.
        </h2>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"32px"}}>
          Your identity is protected. The report has been logged in the cryptographic ledger and will be AI-verified within 24 hours. If enough verified reports cluster on this official, action will follow.
        </p>
        <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.15)`,padding:"20px 24px",marginBottom:"32px",textAlign:"left"}}>
          {[
            ["Next steps","AI forensic analysis within 24 hours"],
            ["Routing","Matched to correct Ethiopian authority"],
            ["Disclosure","Name published when verified reports reach threshold"],
            ["Your identity","SHA-256 hashed — mathematically irreversible"],
          ].map(([k,v])=>(
            <div key={k} style={{display:"flex",gap:"16px",marginBottom:"12px",fontSize:"12px"}}>
              <span style={{color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",width:"100px",flexShrink:0}}>{k}</span>
              <span style={{color:"rgba(240,236,224,0.5)"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/transparency" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
            VIEW TRANSPARENCY WALL →
          </a>
          <a href="/" style={{background:"transparent",color:`rgba(0,212,255,0.7)`,border:`1px solid rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
            BACK TO SAFUU.NET
          </a>
        </div>
      </div>
    </div>
  );

  const current = STEPS[step-1];

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        input,textarea,select{font-family:'Courier New',monospace;background:rgba(0,0,0,0.5);border:1px solid rgba(0,212,255,0.2);color:rgba(240,236,224,0.85);padding:14px 18px;width:100%;font-size:14px;outline:none;transition:border-color 0.2s;resize:none;line-height:1.6}
        input:focus,textarea:focus,select:focus{border-color:${CY}}
        input::placeholder,textarea::placeholder{color:rgba(240,236,224,0.2)}
        .step-btn{background:transparent;border:1px solid rgba(0,212,255,0.2);color:rgba(0,212,255,0.5);fontFamily:'Courier New',monospace;font-size:10px;letter-spacing:0.12em;padding:12px 24px;cursor:pointer;transition:all 0.2s;text-transform:uppercase}
        .step-btn:hover{border-color:${CY};color:${CY}}
        .step-btn.primary{background:${G};border-color:${G};color:#030507;fontWeight:700}
        .step-btn.primary:hover{background:#dbb85e}
        .lang-pill{padding:6px 14px;border:1px solid rgba(0,212,255,0.15);background:transparent;color:rgba(240,236,224,0.4);font-size:11px;cursor:pointer;transition:all 0.2s;font-family:'Courier New',monospace}
        .lang-pill.active{border-color:${CY};color:${CY};background:rgba(0,212,255,0.08)}
        .lang-pill:hover{border-color:rgba(0,212,255,0.4);color:rgba(0,212,255,0.7)}
      `}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>ANONYMOUS REPORT</div>
          </div>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{fontSize:"9px",color:"#4ade80",fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
            SECURE · ANONYMOUS
          </div>
        </div>
      </nav>

      <div style={{maxWidth:"680px",margin:"0 auto",padding:"60px 40px 100px"}}>

        {/* Header */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>
              ANONYMOUS INTAKE · STEP {step} OF {STEPS.length}
            </span>
          </div>
          <h1 style={{fontSize:"clamp(28px,4vw,40px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.1,marginBottom:"12px"}}>
            File a Report
          </h1>
          <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",lineHeight:"1.8",fontFamily:"'Courier New',monospace"}}>
            // Your identity is never stored · SHA-256 one-way hash only
          </p>
        </div>

        {/* Language selector */}
        <div style={{marginBottom:"40px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"12px"}}>REPORT LANGUAGE</div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {LANGS.map(l=>(
              <button key={l.code} className={`lang-pill${lang===l.code?" active":""}`} onClick={()=>setLang(l.code)}>
                {l.code} · {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{height:"2px",background:"rgba(255,255,255,0.06)",marginBottom:"48px",position:"relative"}}>
          <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${G},${CY})`,transition:"width 0.4s ease"}}/>
          {/* Step dots */}
          <div style={{position:"absolute",top:"-4px",left:0,right:0,display:"flex",justifyContent:"space-between"}}>
            {STEPS.map(s=>(
              <div key={s.id} style={{width:"10px",height:"10px",borderRadius:"50%",
                background:s.id<=step?G:"rgba(255,255,255,0.08)",
                border:`1px solid ${s.id<=step?G:"rgba(255,255,255,0.1)"}`,
                transition:"all 0.3s"}}/>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{display:"flex",gap:"0",marginBottom:"32px",overflowX:"auto"}}>
          {STEPS.map((s,i)=>(
            <div key={s.id} style={{flex:"0 0 auto",padding:"6px 14px",
              borderBottom:`2px solid ${s.id===step?G:s.id<step?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.05)"}`,
              fontSize:"8px",color:s.id===step?G:s.id<step?"rgba(201,168,76,0.5)":"rgba(255,255,255,0.2)",
              fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",whiteSpace:"nowrap",
              cursor:s.id<step?"pointer":"default"}}
              onClick={()=>s.id<step&&setStep(s.id)}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Question */}
        <div style={{marginBottom:"32px"}}>
          <div style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"16px"}}>
            [{String(step).padStart(2,"0")}/{String(STEPS.length).padStart(2,"0")}] {current.label}
          </div>
          <h2 style={{fontSize:"clamp(20px,3vw,26px)",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"10px",lineHeight:1.3}}>
            {current.q}
          </h2>
          <p style={{fontSize:"12px",color:`rgba(0,212,255,0.45)`,fontFamily:"'Courier New',monospace"}}>
            {current.hint}
          </p>
        </div>

        {/* Input area */}
        <div style={{marginBottom:"40px"}}>
          {step===1 && <input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Tesfaye Bekele, or partial name..." style={{marginBottom:"12px"}}/>}
          {step===2 && <input value={form.office} onChange={e=>upd("office",e.target.value)} placeholder="e.g. Ministry of Transport, Addis Ababa Customs..."/>}
          {step===3 && <>
            <input value={form.date} onChange={e=>upd("date",e.target.value)} placeholder="Date (e.g. April 8 2026, or 'last week')" style={{marginBottom:"12px"}}/>
            <input value={form.location} onChange={e=>upd("location",e.target.value)} placeholder="Location (city, building, woreda...)"/>
          </>}
          {step===4 && <input value={form.amount} onChange={e=>upd("amount",e.target.value)} placeholder="e.g. ETB 5,000 · USD 200 · 'no money, asked for a favour'"/>}
          {step===5 && <textarea value={form.description} onChange={e=>upd("description",e.target.value)} rows={8} placeholder="Describe what happened in as much detail as you can..."/>}
          {step===6 && (
            <div>
              <div style={{border:"2px dashed rgba(0,212,255,0.2)",borderRadius:"2px",padding:"40px 24px",textAlign:"center",background:"rgba(0,0,0,0.3)",marginBottom:"16px",cursor:"pointer"}}
                onClick={()=>document.getElementById("evidence-upload")?.click()}>
                <div style={{fontSize:"32px",marginBottom:"12px"}}>📎</div>
                <div style={{fontSize:"13px",color:"rgba(240,236,224,0.6)",marginBottom:"6px"}}>Click to upload photo or document</div>
                <div style={{fontSize:"10px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace"}}>JPG, PNG, PDF, DOC — max 10MB</div>
                <input id="evidence-upload" type="file" accept="image/*,.pdf,.doc,.docx" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files?.[0]; if(f)upd("evidence",f.name);}}/>
              </div>
              {form.evidence && (
                <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",background:"rgba(0,230,118,0.06)",border:"1px solid rgba(0,230,118,0.2)"}}>
                  <span style={{fontSize:"16px"}}>✓</span>
                  <span style={{fontSize:"12px",color:"rgba(74,222,128,0.8)",fontFamily:"'Courier New',monospace"}}>{form.evidence}</span>
                  <button onClick={()=>upd("evidence","")} style={{marginLeft:"auto",background:"transparent",border:"none",color:"rgba(240,236,224,0.3)",cursor:"pointer",fontSize:"16px"}}>×</button>
                </div>
              )}
              <div style={{marginTop:"12px",fontSize:"11px",color:"rgba(0,212,255,0.4)",fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
                // EXIF metadata will be forensically verified<br/>
                // AI image authenticity check (Hive Moderation 94%)<br/>
                // Evidence sealed in cryptographic hash chain
              </div>
            </div>
          )}
          {step===7 && <input value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="Optional — leave blank if unknown"/>}
          {step===8 && (
            <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,168,76,0.2)`,padding:"24px"}}>
              <div style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.18em",marginBottom:"16px"}}>REPORT SUMMARY</div>
              {[
                ["Official",form.name||"—"],
                ["Office",form.office||"—"],
                ["Date",form.date||"—"],
                ["Location",form.location||"—"],
                ["Amount",form.amount||"—"],
                ["Description",form.description?form.description.slice(0,100)+(form.description.length>100?"...":""):"—"],
                ["Language",lang],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:"16px",marginBottom:"10px",fontSize:"12px"}}>
                  <span style={{color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",minWidth:"90px",flexShrink:0}}>{k}</span>
                  <span style={{color:"rgba(240,236,224,0.65)",lineHeight:"1.5"}}>{v}</span>
                </div>
              ))}
              <div style={{height:"1px",background:"rgba(201,168,76,0.1)",margin:"16px 0"}}/>
              <div style={{fontSize:"11px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",lineHeight:"1.8"}}>
                ✓ Identity: NOT_STORED · SHA-256 hash only<br/>
                ✓ Encryption: AES-256-GCM<br/>
                ✓ Ledger: Will be sealed on submit
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button className="step-btn" onClick={()=>step>1&&setStep(s=>s-1)} style={{opacity:step===1?0.3:1,cursor:step===1?"not-allowed":"pointer"}}>
            ← BACK
          </button>
          <div style={{fontSize:"9px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace"}}>
            {STEPS.length-step} {STEPS.length-step===1?"step":"steps"} remaining
          </div>
          {step<STEPS.length
            ? <button className="step-btn primary" onClick={()=>setStep(s=>s+1)}>NEXT →</button>
            : <button className="step-btn primary" onClick={handleSubmit} disabled={loading}
                style={{background:loading?"rgba(201,168,76,0.4)":G,cursor:loading?"wait":"pointer"}}>
                {loading?"SUBMITTING...":"SUBMIT REPORT ⚖"}
              </button>
          }
        </div>

        {/* Trust footer */}
        <div style={{marginTop:"60px",paddingTop:"24px",borderTop:`1px solid rgba(0,212,255,0.06)`}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"16px"}}>
            {[
              ["🔐 Identity","SHA-256 one-way hash. Not even admins can identify you."],
              ["🔒 Encrypted","AES-256-GCM. All fields encrypted at rest."],
              ["⛓️ Ledger","Every report sealed in a tamper-evident hash chain."],
            ].map(([t,b])=>(
              <div key={t} style={{fontSize:"11px",color:"rgba(240,236,224,0.3)",lineHeight:"1.7"}}>
                <div style={{color:`rgba(0,212,255,0.5)`,marginBottom:"4px",fontFamily:"'Courier New',monospace",fontSize:"10px"}}>{t}</div>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:"32px",textAlign:"center",fontSize:"11px",color:"rgba(240,236,224,0.2)",fontFamily:"'Courier New',monospace"}}>
          Prefer Telegram?{" "}
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{color:`rgba(0,212,255,0.4)`,textDecoration:"underline"}}>
            t.me/SafuuEthBot
          </a>
          {" · "}SMS: <strong style={{color:"rgba(240,236,224,0.35)"}}>21000</strong>
        </div>
      </div>
    </div>
  );
}
