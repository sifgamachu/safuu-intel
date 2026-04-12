import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SAFUU — Ethiopian Anti-Corruption Intelligence Platform";
export const size = { width:1200, height:630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div style={{
      background:"#030507", width:"100%", height:"100%",
      display:"flex", flexDirection:"column", position:"relative",
      fontFamily:"serif",
    }}>
      {/* Grid pattern */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)",
        backgroundSize:"60px 60px",
      }}/>

      {/* Left red stripe */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"5px",background:"linear-gradient(#b82020,#030507,#b82020)",display:"flex"}}/>

      {/* Top gold rule */}
      <div style={{height:"3px",background:"linear-gradient(90deg,transparent,#c9a84c,#00d4ff,transparent)",display:"flex"}}/>

      {/* Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"60px 80px",position:"relative"}}>
        {/* Overline */}
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"36px"}}>
          <div style={{width:"8px",height:"8px",background:"#b82020",transform:"rotate(45deg)",display:"flex"}}/>
          <span style={{fontSize:"14px",color:"#b82020",fontFamily:"monospace",letterSpacing:"0.2em",fontWeight:"700"}}>
            INTELLIGENCE REPORT · ETHIOPIA · 2026
          </span>
        </div>

        {/* Headline */}
        <div style={{fontSize:"72px",fontWeight:"900",lineHeight:1.05,marginBottom:"32px",display:"flex",flexDirection:"column"}}>
          <span style={{color:"rgba(240,236,224,0.95)"}}>Corruption ends</span>
          <span style={{color:"#c9a84c",fontStyle:"italic"}}>when people</span>
          <span style={{color:"rgba(240,236,224,0.95)"}}>refuse to be silent.</span>
        </div>

        {/* Bottom row */}
        <div style={{marginTop:"auto",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <span style={{fontSize:"28px",fontWeight:"900",color:"rgba(240,236,224,0.95)"}}>SAFUU</span>
            <div style={{width:"2px",height:"28px",background:"#c9a84c",display:"flex"}}/>
            <span style={{fontSize:"14px",color:"rgba(0,212,255,0.7)",fontFamily:"monospace",letterSpacing:"0.15em"}}>safuu.net</span>
          </div>
          <div style={{display:"flex",gap:"24px"}}>
            {[["233+","Tips Filed"],["139","Verified"],["3","Disclosed"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center",display:"flex",flexDirection:"column"}}>
                <span style={{fontSize:"28px",fontWeight:"900",color:"#c9a84c"}}>{v}</span>
                <span style={{fontSize:"11px",color:"rgba(240,236,224,0.4)",fontFamily:"monospace",letterSpacing:"0.1em"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div style={{height:"3px",background:"linear-gradient(90deg,transparent,#00d4ff,#c9a84c,transparent)",display:"flex"}}/>
    </div>,
    { ...size }
  );
}
