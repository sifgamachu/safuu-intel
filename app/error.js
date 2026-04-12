'use client';
import { useEffect } from "react";
export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",padding:"40px"}}>
      <div style={{textAlign:"center",maxWidth:"480px"}}>
        <div style={{fontSize:"48px",marginBottom:"16px",opacity:0.3}}>⚠</div>
        <div style={{fontSize:"9px",color:"rgba(184,32,32,0.8)",letterSpacing:"0.25em",marginBottom:"16px"}}>SYSTEM ERROR</div>
        <div style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",marginBottom:"32px",lineHeight:"1.8"}}>
          Something went wrong loading this page.<br/>
          Your report data is safe — all reports are sealed in the cryptographic ledger.
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={reset} style={{background:"#c9a84c",color:"#030507",border:"none",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"10px 24px",letterSpacing:"0.12em",cursor:"pointer"}}>
            TRY AGAIN
          </button>
          <a href="/" style={{background:"transparent",color:"rgba(0,212,255,0.6)",border:"1px solid rgba(0,212,255,0.3)",fontFamily:"'Courier New',monospace",fontSize:"10px",padding:"10px 24px",letterSpacing:"0.12em"}}>
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}
