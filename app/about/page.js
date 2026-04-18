'use client';
import { useState } from "react";

const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

function Section({label,color=G,children}){
  return(
    <div style={{marginBottom:"72px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px",paddingBottom:"16px",borderBottom:`1px solid rgba(201,168,76,0.12)`}}>
        <div style={{width:"6px",height:"6px",background:color,transform:"rotate(45deg)",flexShrink:0}}/>
        <span style={{fontSize:"9px",color,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div style={{background:"#030507",color:"rgba(240,236,224,0.9)",fontFamily:"'Space Grotesk',sans-serif",minHeight:"100vh"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .lnk:hover{color:${CY}!important}
      `}</style>

      {/* Nav */}
      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>ABOUT THE PLATFORM</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
          <a href="/transparency" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>TRANSPARENCY</a>
          <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer"
            style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em"}}>⚖ REPORT</a>
        </div>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"80px 40px",animation:"fadeUp 0.8s ease-out"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>ABOUT THE PLATFORM</span>
          <div style={{flex:1,height:"1px",background:`rgba(184,32,32,0.2)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"20px",letterSpacing:"-0.02em"}}>
          What is Safuu?
        </h1>
        <p style={{fontSize:"16px",color:"rgba(240,236,224,0.5)",lineHeight:"1.85",marginBottom:"64px",maxWidth:"600px"}}>
          <strong style={{color:G}}>Safuu</strong> (ሳፉ) is an Oromo word meaning <em style={{color:"rgba(240,236,224,0.7)"}}>the moral order that holds society together</em> — the ethical framework that governs right conduct. We named this platform after that principle.
        </p>

        <Section label="THE MISSION">
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9",marginBottom:"20px"}}>
            Safuu Intel is Ethiopia's anonymous anti-corruption intelligence platform. It exists to give ordinary citizens a safe, powerful, and technically sophisticated way to report corruption — without fear of identification, retaliation, or bureaucratic obstruction.
          </p>
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9"}}>
            Corruption in Ethiopia steals from schools, hospitals, roads, and futures. Every birr misappropriated is a child's education unfunded, a patient untreated, a community left behind. Safuu exists because silence is complicity — and because the tools now exist to break that silence safely.
          </p>
        </Section>

        <Section label="HOW ANONYMITY IS GUARANTEED" color={CY}>
          <div style={{display:"grid",gap:"20px"}}>
            {[
              {title:"No identity stored — ever", body:"SAFUU never records your Telegram ID, username, or any personal identifier. The moment a tip is received, only a one-way SHA-256 cryptographic hash is created — a mathematical fingerprint that cannot be reversed into your identity."},
              {title:"Duplicate prevention without tracking", body:"The SHA-256 hash prevents the same reporter from flooding reports on one person, but cannot be used to identify who the reporter is. It is mathematically impossible to reverse."},
              {title:"Sessions expire automatically", body:"Telegram bot sessions expire automatically after inactivity. There is no persistent user record."},
              {title:"Audit logs contain zero PII", body:"The tamper-evident audit log records system events but never any personally identifying information. Even in a worst-case security breach, no reporter identities would be exposed."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:"16px",padding:"20px",background:"rgba(0,212,255,0.03)",border:`1px solid rgba(0,212,255,0.1)`}}>
                <div style={{width:"28px",height:"28px",background:`rgba(0,212,255,0.1)`,border:`1px solid rgba(0,212,255,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",flexShrink:0,color:CY,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{i+1}</div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"6px"}}>{s.title}</div>
                  <div style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.8"}}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="PROGRESSIVE DISCLOSURE" color={R}>
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9",marginBottom:"20px"}}>
            One of SAFUU's most important protections is the <strong style={{color:"rgba(240,236,224,0.8)"}}>progressive disclosure system</strong>. No official's name is immediately published — doing so could enable false accusations or targeted harassment.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
            <div style={{padding:"20px",background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.12)`}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:G,fontFamily:"'Courier New',monospace",marginBottom:"10px",letterSpacing:"0.08em"}}>BELOW THRESHOLD</div>
              <div style={{fontSize:"22px",fontWeight:"900",color:"rgba(240,236,224,0.4)",fontFamily:"'Playfair Display',serif",marginBottom:"8px"}}>T••••••• B•••••</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",marginBottom:"4px"}}>Ministry of Transport</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.35)"}}>Addis Ababa</div>
            </div>
            <div style={{padding:"20px",background:"rgba(184,32,32,0.05)",border:`1px solid rgba(184,32,32,0.2)`}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:R,fontFamily:"'Courier New',monospace",marginBottom:"10px",letterSpacing:"0.08em"}}>● AT THRESHOLD</div>
              <div style={{fontSize:"22px",fontWeight:"900",color:R,fontFamily:"'Playfair Display',serif",marginBottom:"8px"}}>Tesfaye Bekele</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",marginBottom:"4px"}}>Ministry of Transport</div>
              <div style={{fontSize:"11px",color:R,fontFamily:"'Courier New',monospace"}}>→ FEACC ESCALATED</div>
            </div>
          </div>
          <p style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",lineHeight:"1.8",fontFamily:"'Courier New',monospace"}}>
            Default threshold: 15 verified reports. Admin-configurable per case.
          </p>
        </Section>

        <Section label="THE TECHNOLOGY">
          <div style={{display:"grid",gap:"12px"}}>
            {[
              ["Claude AI (Anthropic)","Analyzes each tip for corruption type, severity, and auto-routing to the correct Ethiopian authority."],
              ["OpenAI Whisper","Transcribes voice messages in all 11 supported Ethiopian languages with high accuracy."],
              ["Hive Moderation AI","Detects AI-generated images submitted as fake evidence, at 94% accuracy."],
              ["EXIF Forensics","Verifies photo metadata — comparing the date a photo was taken against the reported incident date."],
              ["Cryptographic Hash Chain","Every tip is sealed into a tamper-evident ledger. Any alteration is mathematically detectable."],
              ["Africa's Talking","Powers SMS intake from any mobile phone in Ethiopia — no internet required."],
            ].map(([title,body])=>(
              <div key={title} style={{display:"flex",gap:"16px",padding:"16px 20px",borderBottom:`1px solid rgba(0,212,255,0.06)`}}>
                <div style={{minWidth:"180px",fontSize:"12px",fontWeight:"700",color:CY,fontFamily:"'Courier New',monospace",paddingRight:"16px"}}>{title}</div>
                <div style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.75"}}>{body}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="INSPIRATION">
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9",marginBottom:"20px"}}>
            Safuu draws from a long tradition of civic accountability journalism. Ida B. Wells used the press to expose injustice when no institution would. The Green Book gave Black Americans safe passage through hostile territory. The Black press documented what mainstream media ignored.
          </p>
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9"}}>
            Safuu applies this tradition to Ethiopia — combining the investigative spirit of Ida B. Wells with modern cryptography, AI forensics, and collaborative intelligence. The goal is not to replace institutions, but to give citizens the tools to hold them accountable.
          </p>
        </Section>

        <Section label="SAFEGUARDS AGAINST ABUSE" color={"#fb923c"}>
          <p style={{fontSize:"15px",color:"rgba(240,236,224,0.55)",lineHeight:"1.9",marginBottom:"20px"}}>
            SAFUU is designed to protect both reporters and the officials they report on. Several layers prevent coordinated false reporting:
          </p>
          <div style={{display:"grid",gap:"16px"}}>
            {[
              {n:"01", title:"AI-weighted verification", body:"Reports without supporting evidence — no photo, no document, no verifiable details — receive a lower weight in the system. Reaching the threshold requires a meaningful number of independently verifiable reports, not just volume."},
              {n:"02", title:"Coordination detection", body:"The system flags reports that appear coordinated: multiple near-identical submissions in a short window, clustering from a single region, or patterns suggesting organized targeting. Flagged cases go to manual analyst review before disclosure."},
              {n:"03", title:"Referral, not verdict", body:"Reaching the threshold does not mean SAFUU declares guilt. The case is forwarded to FEACC, Federal Police, or the relevant agency. The public transparency wall explicitly labels every case as a referral, not a determination."},
              {n:"04", title:"Legal disclaimer on every case", body:"Every entry on the transparency wall carries a clear legal notice: 'This represents anonymous public submissions — not a finding of guilt.' Officials retain all rights under Ethiopian law."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:"16px",padding:"18px 20px",background:"rgba(251,146,60,0.04)",border:"1px solid rgba(251,146,60,0.12)"}}>
                <div style={{width:"28px",height:"28px",background:"rgba(251,146,60,0.1)",border:"1px solid rgba(251,146,60,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontFamily:"'Courier New',monospace",fontWeight:"700",color:"#fb923c",flexShrink:0}}>{s.n}</div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"6px"}}>{s.title}</div>
                  <div style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.8"}}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="REPORT NOW" color={R}>
          <div style={{background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.2)`,padding:"32px"}}>
            <h3 style={{fontSize:"22px",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"16px"}}>Two ways to report anonymously</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
              <div>
                <div style={{fontSize:"11px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",marginBottom:"8px",fontWeight:"700"}}>TELEGRAM (SMARTPHONE)</div>
                <p style={{fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8",marginBottom:"12px"}}>Voice or text. 11 languages. Step-by-step guidance. Evidence upload.</p>
                <a href="https://t.me/SafuuIntelBot" target="_blank" rel="noreferrer"
                  style={{display:"inline-block",background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"10px 20px",letterSpacing:"0.12em"}}>
                  OPEN WHATSAPP →
                </a>
              </div>
              <div>
                <div style={{fontSize:"11px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",marginBottom:"8px",fontWeight:"700"}}>SMS (ANY PHONE)</div>
                <p style={{fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8",marginBottom:"12px"}}>Send to <strong style={{color:"rgba(240,236,224,0.7)"}}>21000</strong>. No internet. No smartphone needed.</p>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",fontFamily:"'Courier New',monospace",background:"rgba(0,0,0,0.4)",padding:"10px 14px",lineHeight:"1.6"}}>
                  SAFUU [Name] | [Office] | [What happened]
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={{borderTop:`1px solid rgba(0,212,255,0.08)`,paddingTop:"24px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
          <span style={{fontSize:"9px",color:"rgba(0,212,255,0.2)",fontFamily:"'Courier New',monospace"}}>SAFUU INTEL · FEACC:959 · EHRC:1488 · POLICE:911</span>
          <a href="/" style={{fontSize:"9px",color:`rgba(201,168,76,0.3)`,fontFamily:"'Courier New',monospace"}}>← BACK TO SAFUU.NET</a>
        </div>
      </div>
    </div>
  );
}
