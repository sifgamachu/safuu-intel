'use client';
export default function NotFound() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"80px",fontWeight:"900",color:"rgba(0,212,255,0.15)",lineHeight:1,marginBottom:"16px"}}>404</div>
        <div style={{fontSize:"11px",color:"rgba(0,212,255,0.5)",letterSpacing:"0.2em",marginBottom:"24px"}}>PAGE NOT FOUND // SAFUU INTEL</div>
        <a href="/" style={{fontSize:"10px",color:"#c9a84c",letterSpacing:"0.15em",border:"1px solid rgba(201,168,76,0.3)",padding:"10px 24px"}}>
          ← RETURN TO SAFUU.NET
        </a>
      </div>
    </div>
  );
}
