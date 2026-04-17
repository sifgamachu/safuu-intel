'use client';
import { useState } from "react";
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const CATEGORIES = [
  {
    label:"ANONYMITY",
    color:CY,
    questions:[
      {q:"Is my identity truly protected?",
       a:"Yes. SAFUU never stores your WhatsApp username, user ID, phone number, IP address, or real name. The only thing derived from your identifying information is a one-way SHA-256 cryptographic hash — a mathematical fingerprint that is computationally irreversible. Even if our servers were seized, there is no identifying information to find."},
      {q:"What is a SHA-256 hash and why does it matter?",
       a:"A SHA-256 hash is a fixed-length string of characters computed from an input. The process is one-way: you can compute the hash from the input, but you cannot reconstruct the input from the hash. This means even if someone had our database, they could not find out who reported. It's used in banking, blockchain, and government systems worldwide."},
      {q:"Can SAFUU administrators identify me?",
       a:"No. The system is designed so that no administrator can reverse the SHA-256 hash or cross-reference it with any external database. The anonymity guarantee is cryptographic — it doesn't depend on trusting SAFUU staff."},
      {q:"What if I report from a shared or public phone?",
       a:"The hash is derived per-session. If you use a public phone's WhatsApp, you still won't be identified — the hash is based on the WhatsApp user ID of that session, not your real identity. For SMS, the phone number is hashed and discarded."},
    ]
  },
  {
    label:"REPORTING",
    color:G,
    questions:[
      {q:"What types of corruption can I report?",
       a:"Any corruption involving an Ethiopian public official or institution: land fraud and illegal land transfers; procurement and tender bribery; customs and tax extortion; court corruption and bribery of judges or lawyers; police extortion; healthcare theft (medications, equipment, funds); education bribery; hiring nepotism; any demand for money or favors in exchange for government services."},
      {q:"Do I need evidence to report?",
       a:"No. A report without evidence is still valuable — it contributes to pattern-building. However, reports with corroborating evidence (photos, documents, audio) are weighted higher in the AI verification score and reach the disclosure threshold faster. Voice descriptions, dates, amounts, and witness details all help."},
      {q:"What happens if my report is false?",
       a:"Below threshold, names are not published. SAFUU's progressive disclosure is designed to prevent false accusations. Reports are AI-verified, deduplicated, and only published when a consistent pattern of verified reports reaches the threshold. Deliberately false reporting is tracked by hash — repeated false reports from the same source can be flagged."},
      {q:"Can I report someone who is no longer in office?",
       a:"Yes. Crimes committed during public service can still be prosecuted. FEACC accepts historical cases. The platform does not restrict by current employment status."},
      {q:"What languages can I use?",
       a:"Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, and English. Voice messages are automatically transcribed by OpenAI Whisper. Written messages are processed in the original language and also translated internally for analysis."},
    ]
  },
  {
    label:"AFTER YOU REPORT",
    color:"#a78bfa",
    questions:[
      {q:"What happens after I submit?",
       a:"Your report goes through the SAFUU pipeline: (1) Claude AI categorizes the type and severity, (2) evidence is forensically verified (EXIF dates, Hive AI image detection), (3) the report is deduplicated against existing records, (4) it is auto-routed to the correct Ethiopian agency, (5) it is sealed in the cryptographic evidence ledger. You receive a case reference number by WhatsApp or SMS."},
      {q:"How does the 15-report threshold work?",
       a:"15 is the default. Below threshold: only city and office are shown on the transparency wall — names remain masked. At threshold: the official's full name is published on the transparency wall and the case is formally escalated to the relevant agency. The threshold can be adjusted by administrators — sensitive cases may have a higher threshold."},
      {q:"Can I follow the progress of my report?",
       a:"Yes. Save your case reference number. You can track it on the transparency wall or ask the WhatsApp bot for a status update. Your identity is never linked to the case reference — it is a randomly generated identifier."},
      {q:"Which agencies receive my report?",
       a:"FEACC (Federal Ethics & Anti-Corruption Commission, 959) for general corruption; Federal Police (911) for criminal extortion or threats; EHRC (Ethiopian Human Rights Commission, 1488) for rights violations; Ombudsman (6060) for abuse of power; OFAG (Office of Federal Auditor General) for misuse of public funds. SAFUU auto-routes to the most appropriate agency."},
    ]
  },
  {
    label:"TECHNOLOGY",
    color:"#4ade80",
    questions:[
      {q:"What AI is used to analyze reports?",
       a:"Claude (Anthropic) analyzes each report for corruption type, severity, jurisdictional routing, and consistency with prior reports on the same official. OpenAI Whisper transcribes voice messages in all 11 Ethiopian languages. Hive Moderation AI detects AI-generated or manipulated images submitted as evidence (94% accuracy). All AI systems are used for analysis only — no AI makes final disclosure decisions."},
      {q:"How is evidence verified?",
       a:"Photo EXIF metadata is checked — the date a photo was taken is compared against the reported incident date. Image authenticity is checked with Hive Moderation AI. Voice messages are transcribed and cross-checked for consistency. Document text is extracted and analyzed. Reports are cross-referenced for pattern consistency."},
      {q:"Is the system open source?",
       a:"Yes. The full platform source code is on GitHub at github.com/sifgamachu/safuu-intel under the MIT license. Security researchers are encouraged to audit the code. 76 automated security tests run on every deployment."},
      {q:"What is the cryptographic evidence ledger?",
       a:"Every report creates a block in a hash chain. Each block contains: a hash of the report content, a timestamp, and the hash of the previous block. This makes any modification to any block detectable — the chain breaks. This ledger is suitable as evidence in legal proceedings because tampering is mathematically detectable."},
    ]
  },
  {
    label:"SAFETY",
    color:R,
    questions:[
      {q:"Is it safe to use SAFUU in Ethiopia?",
       a:"Cryptographically, yes. SAFUU does not create any logs that link your identity to your report. However, users should assess their own operational security: use WhatsApp's disappearing messages feature, avoid reporting on shared devices, use a VPN if concerned about traffic analysis. The platform protects your identity in the SAFUU system — external traffic analysis is beyond our control."},
      {q:"What if I receive threats after reporting?",
       a:"Contact EHRC (1488) immediately. Your report to SAFUU does not expose your identity, so threats cannot originate from our system. If you are threatened, document the threats and report them to SAFUU and EHRC — retaliation against witnesses is a separate criminal offense."},
      {q:"Can the government access my report?",
       a:"SAFUU may comply with valid Ethiopian court orders. However, because reporter identity is never stored, there is nothing identifying to produce. The evidence ledger can be provided for prosecuting officials — it contains report content and hashes, not reporter identities."},
      {q:"Can a named official take legal action against SAFUU?",
       a:"SAFUU operates as a reporting aggregator — similar to how a newspaper can report that 'police received 15 complaints about an official' without making a legal determination. The transparency wall explicitly states that all appearances are public submissions, not verdicts. Every disclosed case is labelled as 'Referred to [Agency] for investigation', not 'Found guilty of corruption'. Officials retain all rights under Ethiopian law, and the actual determination of wrongdoing is made by FEACC, the courts, or the relevant authority — not SAFUU."},
    ]
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState({});
  const toggle = (cat, qi) => setOpen(o => ({...o, [`${cat}-${qi}`]: !o[`${cat}-${qi}`]}));

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.faq-row{cursor:pointer;transition:background 0.15s}.faq-row:hover{background:rgba(0,212,255,0.03)!important}.lnk:hover{color:${CY}!important}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>FAQ</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/about" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>ABOUT</a>
          <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"8px 18px",letterSpacing:"0.12em"}}>⚖ REPORT</a>
        </div>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>FREQUENTLY ASKED QUESTIONS</span>
          <div style={{flex:1,height:"1px",background:`rgba(201,168,76,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"14px",letterSpacing:"-0.02em"}}>
          Your questions answered.
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.4)",lineHeight:"1.85",marginBottom:"56px",maxWidth:"560px"}}>
          {CATEGORIES.reduce((sum,c)=>sum+c.questions.length,0)} questions across {CATEGORIES.length} categories. 
          Can't find an answer?{" "}
          <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer" style={{color:G,textDecoration:"underline"}}>Ask via WhatsApp</a>.
        </p>

        {/* Category nav */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"48px"}}>
          {CATEGORIES.map(cat=>(
            <a key={cat.label} href={`#${cat.label.toLowerCase().replace(/ /g,"-")}`}
              style={{fontSize:"8px",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em",padding:"5px 14px",background:`${cat.color}10`,border:`1px solid ${cat.color}35`,color:cat.color,textDecoration:"none"}}>
              {cat.label}
            </a>
          ))}
        </div>

        {/* Categories */}
        {CATEGORIES.map((cat, ci) => (
          <div key={ci} id={cat.label.toLowerCase().replace(/ /g,"-")} style={{marginBottom:"48px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px",paddingBottom:"14px",borderBottom:`1px solid ${cat.color}20`}}>
              <div style={{width:"6px",height:"6px",background:cat.color,transform:"rotate(45deg)",flexShrink:0}}/>
              <span style={{fontSize:"9px",color:cat.color,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>{cat.label}</span>
            </div>

            <div style={{borderTop:`1px solid rgba(0,212,255,0.07)`}}>
              {cat.questions.map((faq, qi) => {
                const key = `${ci}-${qi}`;
                const isOpen = open[key];
                return (
                  <div key={qi} className="faq-row" style={{borderBottom:`1px solid rgba(0,212,255,0.06)`}}
                    onClick={()=>toggle(ci, qi)}>
                    <div style={{padding:"18px 4px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px"}}>
                      <span style={{fontSize:"clamp(13px,1.8vw,15px)",fontWeight:"600",
                        color:isOpen?cat.color:"rgba(240,236,224,0.85)",
                        fontFamily:"'Playfair Display',serif",lineHeight:"1.4",transition:"color 0.2s"}}>{faq.q}</span>
                      <span style={{color:isOpen?cat.color:G,fontSize:"20px",flexShrink:0,
                        fontFamily:"'Courier New',monospace",transition:"transform 0.2s",
                        display:"inline-block",transform:isOpen?"rotate(45deg)":"none",fontWeight:"300",marginTop:"2px"}}>+</span>
                    </div>
                    {isOpen && (
                      <div style={{paddingBottom:"20px",paddingRight:"4px"}}>
                        <div style={{height:"1px",background:`${cat.color}15`,marginBottom:"16px"}}/>
                        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.9"}}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div style={{background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.15)`,padding:"32px",display:"flex",gap:"24px",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:"200px"}}>
            <div style={{fontSize:"16px",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.9)",marginBottom:"6px"}}>Ready to report?</div>
            <div style={{fontSize:"13px",color:"rgba(240,236,224,0.4)",lineHeight:"1.7"}}>Your identity is never stored. Cryptographic anonymity guaranteed.</div>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <a href="/report" style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>⚖ REPORT ONLINE</a>
            <a href="https://wa.me/251911000000" target="_blank" rel="noreferrer"
              style={{background:"transparent",color:`rgba(0,212,255,0.7)`,border:`1px solid rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"12px 20px",letterSpacing:"0.12em",textDecoration:"none"}}>TELEGRAM BOT</a>
          </div>
        </div>
      </div>
    </div>
  );
}
