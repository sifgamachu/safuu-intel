export default function Loading() {
  return (
    <div style={{background:"#030507",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"28px",marginBottom:"20px",opacity:0.4}}>⚖️</div>
        <div style={{fontSize:"9px",color:"rgba(0,212,255,0.5)",letterSpacing:"0.25em"}}>
          LOADING...
        </div>
        <div style={{width:"120px",height:"1px",background:"rgba(0,212,255,0.1)",margin:"16px auto",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",height:"100%",width:"40%",background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",animation:"loading 1.5s infinite"}}/>
        </div>
        <style>{`@keyframes loading{0%{left:-40%}100%{left:140%}}`}</style>
      </div>
    </div>
  );
}
