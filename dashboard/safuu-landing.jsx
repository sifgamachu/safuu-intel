import { useState, useEffect, useRef } from "react";

const STATS = [
  { val: 233, label: "Anonymous Tips Filed",    suffix: "+" },
  { val: 139, label: "Reports Verified",        suffix: ""  },
  { val: 10,  label: "Officials on Record",     suffix: "+" },
  { val: 3,   label: "Active Investigations",   suffix: ""  },
];

const HOW_STEPS = [
  { n:"01", icon:"🎙️", title:"Send Anonymously",       body:"Open Telegram or send an SMS. No account needed. Your name, phone, and identity are never stored — only a one-way hash." },
  { n:"02", icon:"🔍", title:"AI Verifies Evidence",    body:"SAFUU checks image EXIF dates, detects AI-generated photos, transcribes voice in Amharic, Oromiffa, Tigrinya or English." },
  { n:"03", icon:"⚖️", title:"Routes to the Right Body",body:"Claude analyzes the tip and auto-routes it to FEACC, Federal Police, Ombudsman, or Ministry of Finance — whoever is correct." },
  { n:"04", icon:"📊", title:"Builds an Evidence File", body:"Multiple reports on the same official are clustered. When verified reports hit the threshold, an investigation is triggered." },
];

const TRUST = [
  { icon:"🔐", title:"Zero identity storage",      body:"No username, user ID, name or phone is ever logged. We use irreversible one-way hashing." },
  { icon:"⛓️", title:"Immutable evidence ledger",  body:"Every report is sealed in a cryptographic hash chain. Evidence cannot be altered or deleted." },
  { icon:"🤖", title:"AI image forensics",          body:"Photos are verified against reported dates using EXIF metadata and AI-generation detection (94% accuracy)." },
  { icon:"🛡️", title:"Duplicate prevention",       body:"The same reporter cannot flood reports on one person. Phonetic name matching catches spelling variants." },
  { icon:"🌍", title:"4 languages supported",       body:"Report in English, Amharic (አማርኛ), Oromiffa, or Tigrinya. Our AI understands all four." },
  { icon:"📱", title:"Works on any phone",          body:"Telegram for smartphones. SMS via shortcode 21000 for any mobile phone, even without internet." },
];

const AGENCIES = [
  { name:"FEACC",          am:"ፀረሙስና ኮሚሽን", phone:"959",  color:"#16a34a" },
  { name:"EHRC",           am:"የሰብዓዊ መብት",   phone:"1488", color:"#2563eb" },
  { name:"Ombudsman",      am:"የዕርቀ ሚካሂ",    phone:"6060", color:"#7c3aed" },
  { name:"Federal Police", am:"ፌደራል ፖሊስ",   phone:"911",  color:"#dc2626" },
];

function useCountUp(target, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, active]);
  return val;
}

function StatCard({ val, label, suffix, active }) {
  const animated = useCountUp(val, 1800, active);
  return (
    <div style={{ textAlign:"center", padding:"24px 16px" }}>
      <div style={{ fontSize:"42px", fontWeight:"900", color:"#fff", fontFamily:"'Georgia',serif", lineHeight:1, textShadow:"0 0 30px rgba(0,230,118,0.4)" }}>
        {animated.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginTop:"8px", fontFamily:"monospace", letterSpacing:"0.08em" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function FlagBar() {
  return (
    <div style={{ display:"flex", height:"4px", width:"100%" }}>
      <div style={{ flex:1, background:"#078930" }}/>
      <div style={{ flex:1, background:"#FCDD09" }}/>
      <div style={{ flex:1, background:"#DA121A" }}/>
    </div>
  );
}

// Ethiopian geometric border pattern SVG
function GeoBorder({ color = "rgba(255,255,255,0.06)", height = 24 }) {
  return (
    <svg width="100%" height={height} xmlns="http://www.w3.org/2000/svg">
      <pattern id="geo" x="0" y="0" width="40" height={height} patternUnits="userSpaceOnUse">
        <polygon points="0,0 20,0 10,12" fill="none" stroke={color} strokeWidth="1"/>
        <polygon points="20,0 40,0 30,12" fill="none" stroke={color} strokeWidth="1"/>
        <polygon points="10,12 30,12 20,24" fill="none" stroke={color} strokeWidth="1"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#geo)"/>
    </svg>
  );
}

export default function SafuuLanding() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [reportLang, setReportLang] = useState("en");
  const statsRef = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const FAQS = [
    { q:"Is my identity really protected?",                      a:"Yes. SAFUU never stores your Telegram username, user ID, name, or phone number. We use one-way SHA-256 hashing that cannot be reversed. Even our own team cannot identify you." },
    { q:"Can I be punished for reporting?",                      a:"Ethiopia's FEACC Proclamation protects informants who report in good faith. Retaliation against a reporter is illegal. For safety-sensitive cases, we recommend consulting an attorney first." },
    { q:"What happens after I submit a tip?",                    a:"Your tip is analyzed by AI, forensically verified, and routed to the correct agency. If multiple people report the same official, reports are clustered and when verified reports hit the threshold, an investigation is triggered." },
    { q:"What if I don't have a smartphone?",                    a:"Send an SMS to shortcode 21000 in the format: SAFUU [Name] | [Office] | [What happened]. Your report goes through the same pipeline as Telegram tips." },
    { q:"What if the official's name is spelled differently?",   a:"SAFUU uses phonetic matching to group reports even when names are spelled differently. Tesfaye/Tesffaye/Tesfaaye are all matched to the same profile." },
    { q:"Can photos be faked?",                                  a:"We verify photos using EXIF metadata (checking the date the photo was taken against the reported incident date) and AI-generation detection powered by Hive Moderation API (94% accuracy). AI-generated images are flagged and excluded from evidence scoring." },
  ];

  const SMS_EXAMPLE = {
    en: "SAFUU Abebe Girma | Federal Police Bole | Asked me for 2000 birr at checkpoint",
    am: "SAFUU አበበ ግርማ | ቦሌ ፌደራል ፖሊስ | ፍተሻ ላይ 2000 ብር ጠየቀኝ",
    or: "SAFUU Abebe Girma | Poolisii Federaalaa Boolee | Daandii irratti birrii 2000 na gaafate",
  };

  return (
    <div style={{ background:"#06080f", color:"#e8eaf0", fontFamily:"'Georgia','Times New Roman',serif", overflowX:"hidden" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#1a2035; border-radius:2px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.4)} 70%{box-shadow:0 0 0 12px rgba(0,230,118,0)} }
        a { color:inherit; text-decoration:none; }
        .hover-lift:hover { transform:translateY(-4px); transition:transform 0.2s; }
        .faq-btn:hover { background:rgba(255,255,255,0.04)!important; }
      `}</style>

      {/* ── TOP FLAG BAR ── */}
      <FlagBar/>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(6,8,15,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"56px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"28px", height:"28px", borderRadius:"6px", background:"linear-gradient(135deg,#078930,#ca8a04,#da121a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"900", color:"#fff" }}>ሳ</div>
          <span style={{ fontSize:"16px", fontWeight:"700", color:"#00e676", letterSpacing:"0.1em", fontFamily:"monospace" }}>SAFUU</span>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>ሳፉ</span>
        </div>
        <div style={{ display:"flex", gap:"24px", alignItems:"center" }}>
          {["How it works","Who to call","FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:"monospace", letterSpacing:"0.08em", transition:"color 0.2s" }}>{l.toUpperCase()}</a>
          ))}
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ background:"#00e676", color:"#000", fontFamily:"monospace", fontSize:"11px", fontWeight:"700", padding:"7px 16px", borderRadius:"5px", letterSpacing:"0.1em" }}>REPORT NOW →</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", position:"relative", overflow:"hidden" }}>
        {/* Background grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

        {/* Gradient orbs */}
        <div style={{ position:"absolute", top:"20%", left:"10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(7,137,48,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"20%", right:"10%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(202,138,4,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ maxWidth:"780px", textAlign:"center", position:"relative", animation:"fadeUp 0.8s ease-out" }}>
          {/* Amharic tagline */}
          <div style={{ fontSize:"12px", letterSpacing:"0.25em", color:"rgba(0,230,118,0.6)", fontFamily:"monospace", marginBottom:"20px" }}>
            ሙስናን ሪፖርት አድርጉ · REPORT CORRUPTION · GABAASA MALAANMMALTUMMAA
          </div>

          <h1 style={{ fontSize:"clamp(48px,8vw,90px)", fontWeight:"900", lineHeight:1.05, marginBottom:"24px", color:"#fff" }}>
            Safuu.<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 40px rgba(0,230,118,0.5)" }}>ሳፉ</span>
          </h1>

          <p style={{ fontSize:"18px", color:"rgba(255,255,255,0.55)", lineHeight:"1.8", maxWidth:"580px", margin:"0 auto 40px", fontFamily:"monospace", fontWeight:"400" }}>
            Ethiopia's anonymous anti-corruption intelligence platform.<br/>
            Report by voice, text, or SMS. Your identity is never stored.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"10px", background:"#00e676", color:"#000", padding:"14px 28px", borderRadius:"8px", fontFamily:"monospace", fontSize:"14px", fontWeight:"800", letterSpacing:"0.08em", boxShadow:"0 0 30px rgba(0,230,118,0.3)", animation:"pulse 2.5s infinite" }}>
              🤖 OPEN TELEGRAM BOT
            </a>
            <a href="#how-it-works" style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.06)", color:"#fff", padding:"14px 28px", borderRadius:"8px", fontFamily:"monospace", fontSize:"13px", fontWeight:"600", letterSpacing:"0.08em", border:"1px solid rgba(255,255,255,0.1)" }}>
              HOW IT WORKS ↓
            </a>
          </div>

          {/* SMS note */}
          <div style={{ marginTop:"20px", fontSize:"11px", color:"rgba(255,255,255,0.25)", fontFamily:"monospace" }}>
            No smartphone? SMS <strong style={{ color:"rgba(255,255,255,0.4)" }}>21000</strong> from any phone · Works with basic feature phones
          </div>

          {/* Live indicator */}
          <div style={{ marginTop:"36px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontSize:"11px", color:"rgba(0,230,118,0.6)", fontFamily:"monospace" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#00e676", display:"inline-block", animation:"blink 1.5s infinite" }}/>
            SYSTEM ONLINE · ANONYMOUS · ENCRYPTED · 24/7
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,230,118,0.03)" }}>
        <GeoBorder/>
        <div style={{ display:"flex", flexWrap:"wrap", maxWidth:"900px", margin:"0 auto" }}>
          {STATS.map((s, i) => <StatCard key={i} {...s} active={statsVisible}/>)}
        </div>
        <GeoBorder/>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:"80px 24px", maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"52px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"12px" }}>▸ HOW IT WORKS</div>
          <h2 style={{ fontSize:"36px", fontWeight:"700", color:"#fff" }}>Four steps to accountability</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"20px" }}>
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="hover-lift" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"24px", animation:`fadeUp 0.6s ease-out ${i*0.1}s both` }}>
              <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.2em", marginBottom:"12px" }}>{s.n}</div>
              <div style={{ fontSize:"28px", marginBottom:"12px" }}>{s.icon}</div>
              <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"10px", lineHeight:"1.3" }}>{s.title}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:"1.8", fontFamily:"monospace" }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SMS HOW TO ── */}
      <section style={{ background:"rgba(255,255,255,0.02)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"60px 24px" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"10px" }}>▸ SMS REPORTING</div>
            <h2 style={{ fontSize:"28px", fontWeight:"700", color:"#fff" }}>No internet? No problem.</h2>
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", marginTop:"10px", fontFamily:"monospace" }}>Text shortcode <strong style={{ color:"#00e676" }}>21000</strong> from any mobile phone in Ethiopia</p>
          </div>

          {/* Language selector */}
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"20px" }}>
            {[["en","English"],["am","አማርኛ"],["or","Oromiffa"]].map(([l,label]) => (
              <button key={l} onClick={() => setReportLang(l)} style={{
                fontSize:"11px", padding:"5px 14px", borderRadius:"4px", cursor:"pointer", fontFamily:"monospace",
                background:reportLang===l?"#00e676":"rgba(255,255,255,0.05)",
                color:reportLang===l?"#000":"rgba(255,255,255,0.5)",
                border:`1px solid ${reportLang===l?"#00e676":"rgba(255,255,255,0.1)"}`,
              }}>{label}</button>
            ))}
          </div>

          {/* SMS example */}
          <div style={{ background:"rgba(0,0,0,0.4)", border:"1px solid rgba(0,230,118,0.2)", borderRadius:"12px", padding:"20px 24px" }}>
            <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.15em", marginBottom:"12px" }}>EXAMPLE SMS TO 21000</div>
            <div style={{ fontSize:"14px", color:"#00e676", fontFamily:"monospace", lineHeight:"1.6", wordBreak:"break-word" }}>
              {SMS_EXAMPLE[reportLang]}
            </div>
            <div style={{ marginTop:"16px", fontSize:"11px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", lineHeight:"1.7" }}>
              Format: SAFUU [Official Name] | [Office] | [What happened]<br/>
              You'll receive a tip ID confirming your report. Standard SMS rates apply.
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section style={{ padding:"80px 24px", maxWidth:"960px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"52px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"12px" }}>▸ YOUR SAFETY</div>
          <h2 style={{ fontSize:"36px", fontWeight:"700", color:"#fff" }}>Built for protection</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"16px" }}>
          {TRUST.map((t, i) => (
            <div key={i} className="hover-lift" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", padding:"20px 22px", transition:"background 0.2s" }}>
              <div style={{ fontSize:"24px", marginBottom:"12px" }}>{t.icon}</div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"8px" }}>{t.title}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:"1.8", fontFamily:"monospace" }}>{t.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENCIES ── */}
      <section id="who-to-call" style={{ background:"rgba(7,137,48,0.05)", borderTop:"1px solid rgba(7,137,48,0.15)", borderBottom:"1px solid rgba(7,137,48,0.15)", padding:"60px 24px" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"40px" }}>
            <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"12px" }}>▸ WHO TO CALL</div>
            <h2 style={{ fontSize:"28px", fontWeight:"700", color:"#fff" }}>Ethiopian Reporting Bodies</h2>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"10px", fontFamily:"monospace" }}>SAFUU automatically routes your tip to the right agency</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"12px" }}>
            {AGENCIES.map(a => (
              <div key={a.name} className="hover-lift" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${a.color}33`, borderRadius:"10px", padding:"20px", borderTop:`3px solid ${a.color}` }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"4px" }}>{a.name}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginBottom:"14px", fontFamily:"monospace" }}>{a.am}</div>
                <a href={`tel:${a.phone}`} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"20px", fontWeight:"800", color:a.color, fontFamily:"monospace" }}>
                  📞 {a.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"80px 24px", maxWidth:"720px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"12px" }}>▸ FAQ</div>
          <h2 style={{ fontSize:"32px", fontWeight:"700", color:"#fff" }}>Common questions</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${activeFaq===i?"rgba(0,230,118,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:"8px", overflow:"hidden" }}>
              <button className="faq-btn" onClick={() => setActiveFaq(activeFaq===i ? null : i)} style={{ width:"100%", padding:"16px 20px", background:"none", border:"none", color:"#fff", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"14px", fontWeight:"600", transition:"background 0.15s" }}>
                {f.q}
                <span style={{ color:"#00e676", fontSize:"18px", marginLeft:"12px", flexShrink:0 }}>{activeFaq===i?"−":"+"}</span>
              </button>
              {activeFaq===i && (
                <div style={{ padding:"0 20px 16px", fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:"1.8", fontFamily:"monospace" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"rgba(0,230,118,0.04)", borderTop:"1px solid rgba(0,230,118,0.1)" }}>
        <div style={{ maxWidth:"600px", margin:"0 auto" }}>
          <div style={{ fontSize:"48px", marginBottom:"20px", animation:"float 4s ease-in-out infinite" }}>🇪🇹</div>
          <h2 style={{ fontSize:"32px", fontWeight:"700", color:"#fff", marginBottom:"16px" }}>
            Safuu means moral order.<br/>
            <span style={{ color:"#00e676" }}>Help restore it.</span>
          </h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"monospace", lineHeight:"1.8", marginBottom:"32px" }}>
            Every report matters. Every verified tip brings accountability closer.<br/>
            ሙስናን ሪፖርት አድርጉ — Report corruption. Protect Ethiopia.
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:"10px", background:"#00e676", color:"#000", padding:"16px 36px", borderRadius:"8px", fontFamily:"monospace", fontSize:"15px", fontWeight:"800", letterSpacing:"0.08em", boxShadow:"0 0 40px rgba(0,230,118,0.25)" }}>
            🤖 START REPORTING ANONYMOUSLY
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"32px 40px", background:"#06080f" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"14px", fontWeight:"700", color:"#00e676", fontFamily:"monospace" }}>SAFUU</span>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>ሳፉ — Oromo: "Moral Order"</span>
          </div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace", textAlign:"right" }}>
            Anonymous · Encrypted · Ethiopian · Open Source<br/>
            Contact: safuu@example.com · FEACC: 959
          </div>
        </div>
      </footer>
      <FlagBar/>
    </div>
  );
}
