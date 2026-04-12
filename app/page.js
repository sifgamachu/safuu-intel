'use client';
import { useState, useEffect, useRef } from "react";

const STATS = [
  { val: 233, label: "Anonymous Tips Filed",  suffix: "+" },
  { val: 139, label: "Reports Verified",       suffix: ""  },
  { val: 10,  label: "Officials on Record",    suffix: "+" },
  { val: 3,   label: "Active Investigations",  suffix: ""  },
];

const HOW_STEPS = [
  { n:"01", icon:"🎙️", title:"Report Anonymously",     body:"Open Telegram or send an SMS. Your name, phone, and identity are never stored — only a one-way cryptographic hash." },
  { n:"02", icon:"🔍", title:"AI Verifies Evidence",   body:"SAFUU checks EXIF dates, detects AI-generated photos, and transcribes voice in Amharic, Oromiffa, Tigrinya or English." },
  { n:"03", icon:"⚖️", title:"Routes to Right Body",  body:"Claude AI analyzes the tip and routes it to FEACC, Federal Police, Ombudsman, or Ministry of Finance — automatically." },
  { n:"04", icon:"📊", title:"Builds Evidence File",  body:"Multiple reports on the same official are clustered. At threshold, the name is publicly disclosed and investigation triggered." },
];

const TRUST = [
  { icon:"🔐", title:"Zero identity storage",      body:"No username, user ID, name or phone is ever logged. One-way SHA-256 hashing, irreversible." },
  { icon:"⛓️", title:"Immutable evidence ledger",  body:"Every report sealed in a cryptographic hash chain. Evidence cannot be altered or deleted." },
  { icon:"🤖", title:"AI image forensics",          body:"Photos verified against reported dates using EXIF metadata and AI-generation detection (94% accuracy)." },
  { icon:"🛡️", title:"Duplicate prevention",       body:"The same reporter cannot flood one person. Phonetic name matching catches spelling variants." },
  { icon:"🌍", title:"11 languages supported",      body:"Amharic · Oromiffa · Tigrinya · Somali · Afar · Sidama · Wolaytta · Hadiyya · Dawro · Gamo · Bench" },
  { icon:"📱", title:"Works on any phone",          body:"Telegram for smartphones. SMS via shortcode for any mobile phone, even without internet." },
];

const AGENCIES = [
  { name:"FEACC",         am:"ፀረሙስና ኮሚሽን", phone:"959",  color:"#16a34a" },
  { name:"EHRC",          am:"የሰብዓዊ መብት",   phone:"1488", color:"#2563eb" },
  { name:"Ombudsman",     am:"ዕርቀ ሚካሄ",     phone:"6060", color:"#7c3aed" },
  { name:"Federal Police",am:"ፌደራል ፖሊስ",   phone:"911",  color:"#dc2626" },
];

function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let v = 0;
    const step = target / 60;
    const id = setInterval(() => {
      v = Math.min(v + step, target);
      setVal(Math.floor(v));
      if (v >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target, active]);
  return val;
}

function StatCard({ val, label, suffix, active }) {
  const n = useCountUp(val, active);
  return (
    <div style={{ textAlign:"center", padding:"24px 16px" }}>
      <div style={{ fontSize:"clamp(32px,6vw,48px)", fontWeight:"900", color:"#fff", fontFamily:"'Georgia',serif", lineHeight:1, textShadow:"0 0 30px rgba(0,230,118,0.4)" }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", marginTop:"8px", fontFamily:"monospace", letterSpacing:"0.1em" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function FlagBar({ h = 3 }) {
  return (
    <div style={{ display:"flex", height:h }}>
      <div style={{ flex:1, background:"#078930" }}/>
      <div style={{ flex:1, background:"#FCDD09" }}/>
      <div style={{ flex:1, background:"#DA121A" }}/>
    </div>
  );
}

export default function SafuuHome() {
  const [statsActive, setStatsActive] = useState(false);
  const [activeFaq, setActiveFaq]     = useState(null);
  const [mobileMenu, setMobileMenu]   = useState(false);
  const statsRef = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const FAQS = [
    { q:"Is my identity really protected?",
      a:"Yes. SAFUU never stores your Telegram username, user ID, name, or phone number. We use one-way SHA-256 hashing that cannot be reversed. Even our own administrators cannot identify you." },
    { q:"Can I be punished for reporting?",
      a:"Ethiopia's FEACC Proclamation protects informants who report in good faith. Retaliation against a reporter is illegal. For safety-sensitive cases, consult an attorney first." },
    { q:"What happens after I submit a tip?",
      a:"Your tip is analyzed by Claude AI, forensically verified, and routed to the correct agency. When enough verified reports accumulate on one official, the name is publicly disclosed and an investigation is triggered." },
    { q:"What if I don't have a smartphone?",
      a:"Send an SMS to shortcode 21000 in the format: SAFUU [Name] | [Office] | [What happened]. Your report goes through the same pipeline as Telegram tips." },
    { q:"What languages can I use?",
      a:"Any of Ethiopia's languages: Amharic, Oromiffa, Tigrinya, Somali, Afar, Sidama, Wolaytta, Hadiyya, Dawro, Gamo, Bench, or English. Voice messages are transcribed automatically." },
    { q:"Can photos be faked?",
      a:"We verify photos using EXIF metadata (photo date vs reported incident date) and AI-generation detection via Hive Moderation API (94% accuracy). AI-generated images are flagged and excluded from evidence scoring." },
  ];

  const styles = {
    page: { background:"#06080f", color:"rgba(255,255,255,0.85)", fontFamily:"'Georgia','Times New Roman',serif", overflowX:"hidden" },
    nav: { position:"sticky", top:0, zIndex:100, background:"rgba(6,8,15,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px" },
    navLogo: { display:"flex", alignItems:"center", gap:"10px" },
    logoBox: { width:"28px", height:"28px", borderRadius:"6px", background:"linear-gradient(135deg,#078930,#ca8a04,#da121a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"900", color:"#fff" },
    logoText: { fontSize:"16px", fontWeight:"700", color:"#00e676", letterSpacing:"0.1em", fontFamily:"monospace" },
    navLinks: { display:"flex", gap:"24px", alignItems:"center" },
    navLink: { fontSize:"12px", color:"rgba(255,255,255,0.5)", fontFamily:"monospace", letterSpacing:"0.08em", textDecoration:"none", cursor:"pointer" },
    cta: { background:"#00e676", color:"#000", fontFamily:"monospace", fontSize:"11px", fontWeight:"700", padding:"8px 18px", borderRadius:"5px", textDecoration:"none", letterSpacing:"0.1em" },
    hero: { minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", position:"relative", overflow:"hidden", textAlign:"center" },
    grid: { position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" },
    orb1: { position:"absolute", top:"20%", left:"10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(7,137,48,0.08) 0%,transparent 70%)", pointerEvents:"none" },
    orb2: { position:"absolute", bottom:"20%", right:"10%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(202,138,4,0.06) 0%,transparent 70%)", pointerEvents:"none" },
    section: { maxWidth:"900px", margin:"0 auto", padding:"80px 24px" },
    sectionTitle: { textAlign:"center", marginBottom:"52px" },
    label: { fontSize:"10px", letterSpacing:"0.2em", color:"#00e676", fontFamily:"monospace", marginBottom:"12px", display:"block" },
    h2: { fontSize:"clamp(26px,4vw,36px)", fontWeight:"700", color:"#fff", margin:0 },
    card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"24px", transition:"transform 0.2s" },
    faqBtn: { width:"100%", padding:"16px 20px", background:"none", border:"none", color:"#fff", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"clamp(13px,2vw,15px)", fontWeight:"600", fontFamily:"'Georgia',serif" },
  };

  return (
    <div style={styles.page}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.4)}70%{box-shadow:0 0 0 12px rgba(0,230,118,0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        a{color:inherit;text-decoration:none}
        .hover-up:hover{transform:translateY(-4px)}
        .faq:hover{background:rgba(255,255,255,0.03)}
        @media(max-width:640px){.nav-links{display:none}}
      `}</style>

      <FlagBar h={4}/>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.logoBox}>ሳ</div>
          <div>
            <div style={styles.logoText}>SAFUU</div>
            <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", letterSpacing:"0.1em" }}>safuu.net</div>
          </div>
        </div>
        <div className="nav-links" style={styles.navLinks}>
          <a href="#how" style={styles.navLink}>HOW IT WORKS</a>
          <a href="#agencies" style={styles.navLink}>AGENCIES</a>
          <a href="#faq" style={styles.navLink}>FAQ</a>
          <a href="/transparency" style={styles.navLink}>TRANSPARENCY</a>
        </div>
        <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={styles.cta}>
          REPORT NOW →
        </a>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.grid}/>
        <div style={styles.orb1}/>
        <div style={styles.orb2}/>
        <div style={{ position:"relative", maxWidth:"780px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.25em", color:"rgba(0,230,118,0.6)", fontFamily:"monospace", marginBottom:"20px" }}>
            ሙስናን ሪፖርት አድርጉ · REPORT CORRUPTION · GABAASA MALAANMMALTUMMAA
          </div>
          <h1 style={{ fontSize:"clamp(52px,10vw,96px)", fontWeight:"900", lineHeight:1.05, marginBottom:"24px", color:"#fff" }}>
            Safuu.<br/>
            <span style={{ color:"#00e676", textShadow:"0 0 40px rgba(0,230,118,0.5)" }}>ሳፉ</span>
          </h1>
          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.5)", lineHeight:"1.8", maxWidth:"560px", margin:"0 auto 40px", fontFamily:"monospace" }}>
            Ethiopia's anonymous anti-corruption intelligence platform.<br/>
            Report by voice, text, or SMS. Identity never stored.
          </p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:"10px", background:"#00e676", color:"#000", padding:"14px 28px", borderRadius:"8px", fontFamily:"monospace", fontSize:"14px", fontWeight:"800", letterSpacing:"0.08em", animation:"pulse 2.5s infinite" }}>
              🤖 OPEN TELEGRAM BOT
            </a>
            <a href="#how" style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.06)", color:"#fff", padding:"14px 28px", borderRadius:"8px", fontFamily:"monospace", fontSize:"13px", fontWeight:"600", border:"1px solid rgba(255,255,255,0.1)" }}>
              HOW IT WORKS ↓
            </a>
          </div>
          <div style={{ marginTop:"20px", fontSize:"11px", color:"rgba(255,255,255,0.25)", fontFamily:"monospace" }}>
            No smartphone? SMS <strong style={{ color:"rgba(255,255,255,0.4)" }}>21000</strong> from any phone
          </div>
          <div style={{ marginTop:"32px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontSize:"11px", color:"rgba(0,230,118,0.6)", fontFamily:"monospace" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#00e676", display:"inline-block", animation:"blink 1.5s infinite" }}/>
            SYSTEM ONLINE · ANONYMOUS · ENCRYPTED · 24/7
          </div>
        </div>
      </section>

      {/* STATS */}
      <div ref={statsRef} style={{ borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,230,118,0.03)" }}>
        <div style={{ display:"flex", flexWrap:"wrap", maxWidth:"900px", margin:"0 auto" }}>
          {STATS.map((s,i) => <StatCard key={i} {...s} active={statsActive}/>)}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={styles.section}>
        <div style={styles.sectionTitle}>
          <span style={styles.label}>▸ HOW IT WORKS</span>
          <h2 style={styles.h2}>Four steps to accountability</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"20px" }}>
          {HOW_STEPS.map((s,i) => (
            <div key={i} className="hover-up card" style={{ ...styles.card, transition:"transform 0.2s" }}>
              <div style={{ fontSize:"9px", color:"rgba(0,230,118,0.5)", fontFamily:"monospace", letterSpacing:"0.2em", marginBottom:"12px" }}>{s.n}</div>
              <div style={{ fontSize:"28px", marginBottom:"12px" }}>{s.icon}</div>
              <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"10px", lineHeight:"1.3" }}>{s.title}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:"1.8", fontFamily:"monospace" }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section style={{ ...styles.section, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={styles.sectionTitle}>
          <span style={styles.label}>▸ YOUR SAFETY</span>
          <h2 style={styles.h2}>Built for protection</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"16px" }}>
          {TRUST.map((t,i) => (
            <div key={i} className="hover-up" style={{ ...styles.card, transition:"transform 0.2s" }}>
              <div style={{ fontSize:"24px", marginBottom:"12px" }}>{t.icon}</div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"8px" }}>{t.title}</div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:"1.8", fontFamily:"monospace" }}>{t.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AGENCIES */}
      <section id="agencies" style={{ background:"rgba(7,137,48,0.05)", borderTop:"1px solid rgba(7,137,48,0.15)", borderBottom:"1px solid rgba(7,137,48,0.15)", padding:"60px 24px" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"40px" }}>
            <span style={styles.label}>▸ WHO TO CALL</span>
            <h2 style={styles.h2}>Ethiopian Reporting Bodies</h2>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"10px", fontFamily:"monospace" }}>SAFUU automatically routes your tip to the right agency</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"12px" }}>
            {AGENCIES.map(a => (
              <div key={a.name} className="hover-up" style={{ ...styles.card, borderTop:`3px solid ${a.color}`, transition:"transform 0.2s" }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"4px" }}>{a.name}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginBottom:"14px", fontFamily:"monospace" }}>{a.am}</div>
                <a href={`tel:${a.phone}`} style={{ fontSize:"22px", fontWeight:"800", color:a.color, fontFamily:"monospace", display:"block" }}>
                  📞 {a.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ ...styles.section, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={styles.sectionTitle}>
          <span style={styles.label}>▸ FAQ</span>
          <h2 style={styles.h2}>Common questions</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          {FAQS.map((f,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${activeFaq===i?"rgba(0,230,118,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:"8px", overflow:"hidden" }}>
              <button className="faq" style={styles.faqBtn} onClick={() => setActiveFaq(activeFaq===i?null:i)}>
                {f.q}
                <span style={{ color:"#00e676", fontSize:"20px", flexShrink:0, marginLeft:"12px" }}>{activeFaq===i?"−":"+"}</span>
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

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"rgba(0,230,118,0.04)", borderTop:"1px solid rgba(0,230,118,0.1)" }}>
        <div style={{ maxWidth:"600px", margin:"0 auto" }}>
          <div style={{ fontSize:"48px", marginBottom:"20px", animation:"float 4s ease-in-out infinite" }}>🇪🇹</div>
          <h2 style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:"700", color:"#fff", marginBottom:"16px" }}>
            Safuu means moral order.<br/>
            <span style={{ color:"#00e676" }}>Help restore it.</span>
          </h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"monospace", lineHeight:"1.8", marginBottom:"32px" }}>
            ሙስናን ሪፖርት አድርጉ — Report corruption. Protect Ethiopia.
          </p>
          <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:"10px", background:"#00e676", color:"#000", padding:"16px 36px", borderRadius:"8px", fontFamily:"monospace", fontSize:"15px", fontWeight:"800", letterSpacing:"0.08em", boxShadow:"0 0 40px rgba(0,230,118,0.25)" }}>
            🤖 START REPORTING ANONYMOUSLY
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 24px", background:"#06080f" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"14px", fontWeight:"700", color:"#00e676", fontFamily:"monospace" }}>SAFUU</span>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>ሳፉ · Oromo: "Moral Order"</span>
          </div>
          <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
            <a href="https://github.com/sifgamachu/safuu-intel" target="_blank" rel="noreferrer" style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", letterSpacing:"0.08em" }}>
              GitHub →
            </a>
            <a href="/transparency" style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace", letterSpacing:"0.08em" }}>
              Transparency Wall →
            </a>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>FEACC: 959</span>
          </div>
        </div>
      </footer>

      <FlagBar h={3}/>
    </div>
  );
}
