'use client';
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const ORGS = [
  { type:"ADVOCACY",      icon:"⚖️",  name:"Civil Rights Organizations",  desc:"SAFUU provides raw anonymized data and case referrals to registered civil rights organizations working on accountability.",  cta:"Request Data Access" },
  { type:"EDUCATION",     icon:"🎓",  name:"HBCUs & Universities",        desc:"Academic researchers studying corruption patterns in Ethiopia can access aggregated datasets for peer-reviewed research.",        cta:"Research Partnership" },
  { type:"JOURNALISM",    icon:"📰",  name:"Investigative Journalists",    desc:"Verified journalists can request case dossiers on disclosed officials for investigative reporting. Identity of reporters always protected.", cta:"Media Access" },
  { type:"LEGAL",         icon:"🏛️",  name:"Legal Aid Organizations",      desc:"Lawyers and legal aid groups can access case files for building formal complaints to FEACC, courts, and oversight bodies.",    cta:"Legal Partnership" },
  { type:"COMMUNITY",     icon:"🤝",  name:"Community Organizations",      desc:"Grassroots organizations can use SAFUU to aggregate community-reported corruption for collective action and advocacy.",           cta:"Community Program" },
  { type:"TECH",          icon:"💻",  name:"Tech Partners",                desc:"Open-source contributors, security researchers, and AI developers can contribute to the platform's codebase on GitHub.",           cta:"View GitHub" },
];

const STATS = [
  { v:"233+", l:"Tips Processed" }, { v:"3",    l:"NGO Partners" },
  { v:"2",    l:"Universities"   }, { v:"4",    l:"Media Outlets" },
];

export default function Partners() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.lnk:hover{color:${CY}!important}.card:hover{border-color:rgba(0,212,255,0.3)!important;transform:translateY(-2px)}.card{transition:all 0.2s}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif",letterSpacing:"0.05em"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>PARTNERS</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="/about" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>ABOUT</a>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
        </div>
      </nav>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>CIVIL SOCIETY PARTNERSHIPS</span>
          <div style={{flex:1,height:"1px",background:`rgba(201,168,76,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Build accountability together.
        </h1>
        <p style={{fontSize:"15px",color:"rgba(240,236,224,0.45)",maxWidth:"620px",lineHeight:"1.85",marginBottom:"52px"}}>
          SAFUU is a collaborative intelligence platform. We work with civil rights organizations, journalists, legal aid groups, universities, and community organizations to turn anonymous tips into documented accountability.
        </p>

        {/* Partnership stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"1px",background:`rgba(0,212,255,0.08)`,marginBottom:"64px",borderRadius:"2px",overflow:"hidden"}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{background:"#030507",padding:"28px 24px",textAlign:"center"}}>
              <div style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:"900",color:G,fontFamily:"'Playfair Display',serif",lineHeight:1,marginBottom:"6px"}}>{s.v}</div>
              <div style={{fontSize:"9px",color:"rgba(240,236,224,0.3)",fontFamily:"'Courier New',monospace",letterSpacing:"0.12em"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Partnership types */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"12px",marginBottom:"64px"}}>
          {ORGS.map((o,i)=>(
            <div key={i} className="card" style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,padding:"28px",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
                <span style={{fontSize:"24px"}}>{o.icon}</span>
                <div>
                  <div style={{fontSize:"8px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",marginBottom:"3px"}}>{o.type}</div>
                  <div style={{fontSize:"14px",fontWeight:"700",color:"rgba(240,236,224,0.9)",fontFamily:"'Playfair Display',serif"}}>{o.name}</div>
                </div>
              </div>
              <p style={{fontSize:"13px",color:"rgba(240,236,224,0.45)",lineHeight:"1.8",marginBottom:"20px"}}>{o.desc}</p>
              <div style={{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"10px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.1em"}}>
                {o.cta} →
              </div>
            </div>
          ))}
        </div>

        {/* How it works for partners */}
        <div style={{marginBottom:"64px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px",paddingBottom:"16px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>HOW PARTNERSHIPS WORK</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"0",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
            {[
              {n:"01",title:"Apply",            body:"Contact us with your organization's details, accreditation, and intended use of SAFUU data or referrals."},
              {n:"02",title:"Verify",           body:"We verify the organization is registered, legitimate, and has a track record of civic accountability work."},
              {n:"03",title:"Data Agreement",  body:"Sign the data use agreement. No raw reporter data. Only aggregated or disclosed case data."},
              {n:"04",title:"Access + Collaborate",body:"Receive appropriate data access. Join the partner network for cross-referral and coordinated advocacy."},
            ].map((s,i)=>(
              <div key={i} style={{padding:"28px 24px",borderRight:i<3?`1px solid rgba(0,212,255,0.08)`:"none",background:i%2===0?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.1)"}}>
                <div style={{fontSize:"9px",color:`rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px"}}>{s.n}</div>
                <div style={{fontSize:"15px",fontWeight:"700",color:"rgba(240,236,224,0.85)",marginBottom:"10px",fontFamily:"'Playfair Display',serif"}}>{s.title}</div>
                <div style={{fontSize:"12px",color:"rgba(240,236,224,0.4)",lineHeight:"1.8"}}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{background:"rgba(201,168,76,0.04)",border:`1px solid rgba(201,168,76,0.18)`,padding:"40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)"}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>GET IN TOUCH</span>
          </div>
          <h3 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:"800",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",marginBottom:"12px"}}>
            Ready to partner with SAFUU?
          </h3>
          <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"28px",maxWidth:"520px"}}>
            If you represent a civil society organization, media outlet, academic institution, or legal aid group working on Ethiopian accountability, we'd like to hear from you.
          </p>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
            <a href="https://t.me/SafuuAfBot" target="_blank" rel="noreferrer"
              style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 28px",letterSpacing:"0.12em",textDecoration:"none"}}>
              CONTACT VIA WHATSAPP →
            </a>
            <a href="https://github.com/sifgamachu/safuu-intel" target="_blank" rel="noreferrer"
              style={{background:"transparent",color:`rgba(0,212,255,0.7)`,border:`1px solid rgba(0,212,255,0.3)`,fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none"}}>
              GITHUB / TECH PARTNERS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
