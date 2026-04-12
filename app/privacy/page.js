'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

export default function Privacy() {
  const S = (p) => ({fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.9",marginBottom:"16px",...p});
  const H = (p) => ({fontSize:"13px",fontWeight:"700",color:"rgba(240,236,224,0.8)",marginBottom:"8px",marginTop:"24px",...p});

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>PRIVACY POLICY</div>
          </div>
        </a>
        <a href="/" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>← HOME</a>
      </nav>

      <div style={{maxWidth:"760px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>LEGAL · PRIVACY</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,48px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"12px",letterSpacing:"-0.02em"}}>
          Privacy Policy
        </h1>
        <div style={{fontSize:"11px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",marginBottom:"48px"}}>
          Last updated: April 2026 · Effective immediately
        </div>

        {/* Core principle highlighted */}
        <div style={{background:"rgba(201,168,76,0.06)",border:`2px solid rgba(201,168,76,0.3)`,padding:"24px 28px",marginBottom:"48px",borderRadius:"2px"}}>
          <div style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px",fontWeight:"700"}}>CORE PRINCIPLE</div>
          <p style={{fontSize:"16px",fontWeight:"700",color:"rgba(240,236,224,0.9)",lineHeight:"1.6",fontFamily:"'Playfair Display',serif"}}>
            SAFUU does not collect, store, or share your identity — ever. 
            Reporter anonymity is not a feature. It is the foundation.
          </p>
        </div>

        {[
          {title:"1. What We DO NOT Collect",
           content:[
             ["Telegram username or user ID","We never record these. The moment a report arrives, only a cryptographic hash is derived. The identifier is discarded."],
             ["Phone number","SMS reports go through Africa's Talking. Your number is one-way hashed. We cannot reverse it."],
             ["Real name","Never requested, never stored."],
             ["IP address","Our intake pipeline does not log IP addresses of reporters."],
             ["Device or browser data","The web form does not use analytics, cookies, or fingerprinting."],
           ]
          },
          {title:"2. What We DO Store",
           content:[
             ["SHA-256 hash of reporter identifier","A one-way mathematical fingerprint used only to prevent spam flooding from the same source. Cannot be reversed to reveal identity."],
             ["Report content","The text, audio transcription, or image of your report. Stored encrypted with AES-256-GCM."],
             ["Report metadata","Date, language, channel (Telegram/SMS/web). No personal data."],
             ["Evidence hash chain","Every report is sealed into a cryptographic ledger. The ledger records hashes of report content — not personal data."],
           ]
          },
          {title:"3. Encryption",
           content:[
             ["At-rest encryption","All stored report fields are encrypted with AES-256-GCM using PBKDF2 key derivation (SHA-512, 310,000 iterations)."],
             ["In-transit encryption","TLS 1.3 only. HSTS preload enabled. All connections encrypted."],
             ["Key management","Master encryption key is stored only in server environment variables. Not in the database, not in the codebase."],
           ]
          },
          {title:"4. Data Sharing",
           content:[
             ["Ethiopian accountability agencies","When a case is escalated, a case summary is shared with FEACC, Federal Police, EHRC, Ombudsman, or OFAG — as appropriate. This summary never includes reporter identity."],
             ["Civil society partners","Aggregate, anonymized statistics only. No individual report data."],
             ["Law enforcement","We may be compelled by valid Ethiopian court order. However, because reporter identity is never stored, there is nothing identifying to produce."],
             ["Third parties","We do not sell, share, or monetize any data. No advertising. No tracking."],
           ]
          },
          {title:"5. Your Rights",
           content:[
             ["Right to anonymity","Guaranteed by design. No account. No login. No history tied to you."],
             ["Right to erasure","Since we cannot identify you, we cannot erase your specific reports. However, all report content is AES-encrypted and hash-chained — accessible only to authorized administrators."],
             ["Right to information","This document constitutes full disclosure of our data practices."],
           ]
          },
          {title:"6. Security",
           content:[
             ["76 automated security tests","Run on every code deployment. Results published on GitHub."],
             ["Tamper-evident ledger","Any modification to stored reports is mathematically detectable."],
             ["RBAC access controls","Administrator roles are strictly scoped. No single administrator has unrestricted access."],
             ["No third-party analytics","No Google Analytics, no tracking pixels, no CDN-level logging of reporter behavior."],
           ]
          },
          {title:"7. Changes to This Policy",
           body:"We will post any changes to this page with an updated date. Material changes will be noted in the platform changelog on GitHub."},
          {title:"8. Contact",
           body:"Questions about this privacy policy can be sent via the SAFUU Telegram bot or filed as a GitHub issue at github.com/sifgamachu/safuu-intel."},
        ].map((section,i)=>(
          <div key={i} style={{marginBottom:"40px",paddingBottom:"40px",borderBottom:`1px solid rgba(0,212,255,0.06)`}}>
            <h2 style={{fontSize:"18px",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.88)",marginBottom:"20px"}}>{section.title}</h2>
            {section.body && <p style={S()}>{section.body}</p>}
            {section.content && (
              <div style={{display:"flex",flexDirection:"column",gap:"0",border:`1px solid rgba(0,212,255,0.08)`,overflow:"hidden"}}>
                {section.content.map(([k,v],j)=>(
                  <div key={j} style={{display:"grid",gridTemplateColumns:"220px 1fr",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.05)`,background:j%2===0?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.1)"}}>
                    <div style={{fontSize:"11px",fontWeight:"600",color:G,fontFamily:"'Courier New',monospace",paddingRight:"16px",lineHeight:"1.6"}}>{k}</div>
                    <div style={{fontSize:"13px",color:"rgba(240,236,224,0.5)",lineHeight:"1.7"}}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid rgba(0,212,255,0.07)`,padding:"20px 24px",fontSize:"10px",color:"rgba(240,236,224,0.25)",fontFamily:"'Courier New',monospace",lineHeight:"1.9"}}>
          safuu.net · Privacy Policy · April 2026<br/>
          SAFUU Intel · ሳፉ · Oromo: "Moral order"<br/>
          github.com/sifgamachu/safuu-intel
        </div>
      </div>
    </div>
  );
}
