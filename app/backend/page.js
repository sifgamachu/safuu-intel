'use client';
import { useState } from "react";
const G="#c9a84c"; const CY="#00d4ff"; const R="#b82020";

const ENV_VARS = [
  {key:"TELEGRAM_BOT_TOKEN",       required:true,  source:"@BotFather on Telegram",          desc:"Create a bot with /newbot, copy the token"},
  {key:"ADMIN_CHANNEL_ID",         required:true,  source:"Telegram private channel",         desc:"Create a channel, add the bot as admin, get the -100xxxxxxxxx ID"},
  {key:"ANTHROPIC_API_KEY",        required:true,  source:"console.anthropic.com",            desc:"Generate at Anthropic console — used for Claude AI analysis"},
  {key:"OPENAI_API_KEY",           required:true,  source:"platform.openai.com",              desc:"Used for Whisper voice transcription — 11 Ethiopian languages"},
  {key:"HIVE_AI_KEY",              required:true,  source:"thehive.ai",                       desc:"Free trial available — AI-image detection (94% accuracy)"},
  {key:"ENCRYPTION_MASTER_KEY",    required:true,  source:"openssl rand -hex 32",             desc:"Run command on your server — never share this key"},
  {key:"DEDUP_SALT",               required:true,  source:"openssl rand -hex 32",             desc:"Used for SHA-256 reporter deduplication hashing"},
  {key:"JWT_SECRET",               required:true,  source:"openssl rand -hex 32",             desc:"For admin dashboard JWT authentication"},
  {key:"DASHBOARD_API_KEY",        required:true,  source:"openssl rand -hex 32",             desc:"API key for programmatic dashboard access"},
  {key:"HIVE_API_URL",             required:false, source:"thehive.ai docs",                  desc:"Default: https://api.thehive.ai/api/v2/task/sync"},
  {key:"SMS_USERNAME",             required:false, source:"Africa's Talking dashboard",       desc:"For SMS intake via Telegram @SafuuIntelBot"},
  {key:"SMS_API_KEY",              required:false, source:"Africa's Talking dashboard",       desc:"Africa's Talking API key for SMS"},
  {key:"DISCLOSURE_THRESHOLD",     required:false, source:"Your choice",                      desc:"Number of verified reports to trigger name disclosure (default: 15)"},
];

const SETUP_STEPS = [
  {n:"01", title:"Provision a server", cmd:"# Ubuntu 24.04 LTS recommended\n# Minimum: 2 vCPU · 2GB RAM · 20GB disk\n# Recommended: 4 vCPU · 4GB RAM\n# Any VPS provider: DigitalOcean, Linode, Hetzner, AWS, etc."},
  {n:"02", title:"Clone the repository", cmd:"git clone https://github.com/sifgamachu/safuu-intel\ncd safuu-intel/backend"},
  {n:"03", title:"Run the setup script", cmd:"bash setup.sh\n# This generates all secrets, installs deps\n# and runs the 76 automated security tests"},
  {n:"04", title:"Fill in environment variables", cmd:"cp safuu-security.env.example .env\nnano .env  # fill in all REPLACE_ME_ values\n# See the table above for each variable"},
  {n:"05", title:"Start with PM2", cmd:"pm2 start ecosystem.config.js\npm2 save && pm2 startup\n# This starts: safuu-server, safuu-bot, safuu-sms"},
  {n:"06", title:"Set up Nginx", cmd:"sudo cp safuu-nginx.conf /etc/nginx/sites-available/safuu-intel\nsudo ln -s /etc/nginx/sites-available/safuu-intel /etc/nginx/sites-enabled/\nsudo certbot --nginx -d your-api-domain.com\nsudo nginx -t && sudo nginx -s reload"},
  {n:"07", title:"Verify everything works", cmd:"node test.js           # 76 tests — all should pass\ncurl localhost:3001/health  # should return {status:'ok'}\npm2 status             # all processes should be 'online'"},
  {n:"08", title:"Activate the Telegram bot", cmd:"# In BotFather:\n# /setdescription — Add your bot description\n# /setcommands — Start the bot\n# Test: message your bot — should respond with step 1 of 11"},
];

export default function BackendGuide() {
  const [copied, setCopied] = useState(null);
  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{background:"#030507",minHeight:"100vh",fontFamily:"'Space Grotesk',sans-serif",color:"rgba(240,236,224,0.9)"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.copy-btn:hover{background:rgba(0,212,255,0.12)!important;color:${CY}!important}.lnk:hover{color:${CY}!important}pre{white-space:pre-wrap;word-break:break-all}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.3)}`}</style>

      <nav style={{borderBottom:`1px solid rgba(0,212,255,0.1)`,padding:"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"60px",background:"rgba(3,5,7,0.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"32px",border:`1px solid rgba(201,168,76,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>⚖️</div>
          <div>
            <div style={{fontSize:"15px",fontWeight:"900",color:"rgba(240,236,224,0.95)",fontFamily:"'Playfair Display',serif"}}>SAFUU</div>
            <div style={{fontSize:"7px",color:CY,letterSpacing:"0.3em",fontFamily:"'Courier New',monospace",opacity:0.6}}>BACKEND SETUP</div>
          </div>
        </a>
        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <a href="https://github.com/sifgamachu/safuu-intel" target="_blank" rel="noreferrer" className="lnk"
            style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>GITHUB →</a>
          <a href="/" className="lnk" style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",transition:"color 0.2s"}}>HOME</a>
        </div>
      </nav>

      <div style={{maxWidth:"960px",margin:"0 auto",padding:"72px 40px 100px",animation:"fadeUp 0.8s ease-out"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
          <div style={{width:"6px",height:"6px",background:CY,transform:"rotate(45deg)"}}/>
          <span style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.25em",fontWeight:"700"}}>BACKEND DEPLOYMENT GUIDE</span>
          <div style={{flex:1,height:"1px",background:`rgba(0,212,255,0.15)`}}/>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,52px)",fontWeight:"900",fontFamily:"'Playfair Display',serif",color:"rgba(240,236,224,0.95)",lineHeight:1.05,marginBottom:"16px",letterSpacing:"-0.02em"}}>
          Activate the Backend
        </h1>
        <p style={{fontSize:"14px",color:"rgba(240,236,224,0.45)",lineHeight:"1.85",marginBottom:"52px",maxWidth:"620px"}}>
          The website is already live on Vercel. To activate the Telegram bot, SMS intake, and AI forensics pipeline, you need a backend server. This guide walks through the full setup.
        </p>

        {/* Architecture reminder */}
        <div style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.12)`,padding:"24px 28px",marginBottom:"48px",fontFamily:"'Courier New',monospace",fontSize:"12px",lineHeight:"1.9",color:"rgba(240,236,224,0.5)"}}>
          <div style={{fontSize:"9px",color:CY,letterSpacing:"0.2em",marginBottom:"14px"}}>ARCHITECTURE</div>
          <div>
            <span style={{color:G}}>safuu.net</span> (Vercel — already live)<br/>
            <span style={{color:G}}>Backend API</span> (Your VPS — this guide)<br/>
            &nbsp;&nbsp;├── safuu-bot.js &nbsp;&nbsp;&nbsp;← Telegram intake<br/>
            &nbsp;&nbsp;├── safuu-server.js &nbsp;← REST API + WebSocket<br/>
            &nbsp;&nbsp;├── safuu-sms.js &nbsp;&nbsp;&nbsp;← SMS intake (21000)<br/>
            &nbsp;&nbsp;└── safuu-security.js ← Encryption, JWT, RBAC<br/>
          </div>
        </div>

        {/* Setup steps */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"28px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>SETUP STEPS</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {SETUP_STEPS.map((s,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,0.5)",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 20px",borderBottom:`1px solid rgba(0,212,255,0.08)`,background:"rgba(0,0,0,0.3)"}}>
                  <span style={{fontSize:"9px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",fontWeight:"700"}}>{s.n}</span>
                  <span style={{fontSize:"14px",fontWeight:"700",color:"rgba(240,236,224,0.85)",fontFamily:"'Playfair Display',serif"}}>{s.title}</span>
                </div>
                <div style={{position:"relative"}}>
                  <pre style={{padding:"16px 20px",fontSize:"12px",color:"rgba(240,236,224,0.65)",fontFamily:"'Courier New',monospace",lineHeight:"1.8",overflowX:"auto"}}>
                    {s.cmd}
                  </pre>
                  <button className="copy-btn" onClick={()=>copy(s.cmd, i)}
                    style={{position:"absolute",top:"10px",right:"12px",background:"rgba(0,212,255,0.06)",border:`1px solid rgba(0,212,255,0.2)`,color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",fontSize:"9px",padding:"5px 12px",cursor:"pointer",letterSpacing:"0.1em",transition:"all 0.2s"}}>
                    {copied===i?"✓ COPIED":"COPY"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment variables */}
        <div style={{marginBottom:"56px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:R,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:R,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>ENVIRONMENT VARIABLES</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0",border:`1px solid rgba(0,212,255,0.1)`,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"220px 80px 1fr",padding:"10px 20px",background:"rgba(0,0,0,0.4)",fontSize:"8px",color:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",letterSpacing:"0.15em"}}>
              <div>VARIABLE</div><div>REQUIRED</div><div>DESCRIPTION</div>
            </div>
            {ENV_VARS.map((v,i)=>(
              <div key={v.key} style={{display:"grid",gridTemplateColumns:"220px 80px 1fr",padding:"12px 20px",borderBottom:`1px solid rgba(0,212,255,0.05)`,background:i%2===0?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.1)",alignItems:"start",gap:"0"}}>
                <div style={{fontSize:"11px",fontWeight:"700",color:v.required?G:`rgba(0,212,255,0.5)`,fontFamily:"'Courier New',monospace",paddingRight:"12px",lineHeight:"1.5",wordBreak:"break-all"}}>{v.key}</div>
                <div style={{fontSize:"10px",color:v.required?R:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace",paddingTop:"1px"}}>{v.required?"required":"optional"}</div>
                <div>
                  <div style={{fontSize:"12px",color:"rgba(240,236,224,0.55)",lineHeight:"1.6",marginBottom:"3px"}}>{v.desc}</div>
                  <div style={{fontSize:"10px",color:`rgba(0,212,255,0.4)`,fontFamily:"'Courier New',monospace"}}>Source: {v.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common issues */}
        <div style={{marginBottom:"48px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px",paddingBottom:"14px",borderBottom:`1px solid rgba(0,212,255,0.08)`}}>
            <div style={{width:"6px",height:"6px",background:G,transform:"rotate(45deg)",flexShrink:0}}/>
            <span style={{fontSize:"9px",color:G,fontFamily:"'Courier New',monospace",letterSpacing:"0.22em",fontWeight:"700"}}>COMMON ISSUES</span>
          </div>
          {[
            {issue:"Bot not responding",fix:"Check TELEGRAM_BOT_TOKEN is correct. Run: curl https://api.telegram.org/bot{TOKEN}/getMe"},
            {issue:"Database errors on start",fix:"The setup.sh script creates the SQLite database. If it's missing, run setup.sh again."},
            {issue:"Tests failing",fix:"node test.js from the backend/ folder. Most failures are missing env vars — check your .env file."},
            {issue:"Port already in use",fix:"pm2 delete all && pm2 start ecosystem.config.js — or change PORT in .env"},
            {issue:"Nginx 502 Bad Gateway",fix:"The backend API isn't running. Check pm2 status and pm2 logs safuu-server"},
          ].map((e,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:"0",marginBottom:"1px",padding:"14px 20px",background:i%2===0?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.2)",border:`1px solid rgba(0,212,255,0.06)`,borderBottom:"none"}}>
              <div style={{fontSize:"12px",fontWeight:"600",color:R,paddingRight:"16px",lineHeight:"1.6",fontFamily:"'Courier New',monospace"}}>{e.issue}</div>
              <div style={{fontSize:"12px",color:"rgba(240,236,224,0.5)",lineHeight:"1.7"}}>{e.fix}</div>
            </div>
          ))}
        </div>

        {/* Support */}
        <div style={{background:"rgba(0,212,255,0.03)",border:`1px solid rgba(0,212,255,0.15)`,padding:"28px"}}>
          <div style={{fontSize:"9px",color:CY,fontFamily:"'Courier New',monospace",letterSpacing:"0.2em",marginBottom:"12px"}}>NEED HELP?</div>
          <p style={{fontSize:"14px",color:"rgba(240,236,224,0.5)",lineHeight:"1.8",marginBottom:"20px"}}>
            Open a GitHub issue with the error message, your server OS and Node.js version, and which step failed.
          </p>
          <a href="https://github.com/sifgamachu/safuu-intel/issues" target="_blank" rel="noreferrer"
            style={{background:G,color:"#030507",fontFamily:"'Courier New',monospace",fontSize:"10px",fontWeight:"700",padding:"12px 24px",letterSpacing:"0.12em",textDecoration:"none",display:"inline-block"}}>
            OPEN A GITHUB ISSUE →
          </a>
        </div>
      </div>
    </div>
  );
}
