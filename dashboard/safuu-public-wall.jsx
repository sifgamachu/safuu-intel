import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

// ── DISCLOSURE THRESHOLD (configurable by admin) ──────────────────────────────
// Below this: show city + office only. At/above: reveal the name.
const DISCLOSURE_THRESHOLD = 15;

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// In production this comes from GET /api/public/transparency
// Persons are sorted by verified_count desc; name only shown if >= threshold
const ALL_PERSONS = [
  { id:1,  name:"Tesfaye Bekele",    office:"Ministry of Land & Urban Dev.", city:"Addis Ababa", region:"Addis Ababa", reports:47, verified:31, severity:"Critical", corruption_type:"Land Fraud",       trend:+12, status:"Court",       disclosed:true  },
  { id:2,  name:"Abebe Girma",       office:"Federal Police Commission",     city:"Addis Ababa", region:"Addis Ababa", reports:38, verified:24, severity:"High",     corruption_type:"Extortion",        trend:+8,  status:"Investigation",disclosed:true  },
  { id:3,  name:"Mulugeta Haile",    office:"Ethiopian Customs Commission",  city:"Djibouti Corridor", region:"Afar", reports:31, verified:19,severity:"High",     corruption_type:"Customs Fraud",    trend:+5,  status:"Investigation",disclosed:true  },
  { id:4,  name:"Selamawit Tadesse", office:"Addis Ababa City Admin.",       city:"Addis Ababa", region:"Addis Ababa", reports:28, verified:22, severity:"High",     corruption_type:"Bid Rigging",      trend:+3,  status:"Under Review", disclosed:true  },
  { id:5,  name:"Dawit Worku",       office:"Ministry of Finance",           city:"Addis Ababa", region:"Addis Ababa", reports:22, verified:14, severity:"Medium",   corruption_type:"Procurement Fraud",trend:+6,  status:"Under Review", disclosed:false },
  { id:6,  name:"Tigist Alemu",      office:"ERCA – Revenue Authority",      city:"Adama",       region:"Oromia",      reports:19, verified:11, severity:"Medium",   corruption_type:"Tax Evasion",      trend:+2,  status:"Monitoring",   disclosed:false },
  { id:7,  name:"Yohannes Mesfin",   office:"Federal First Instance Court",  city:"Addis Ababa", region:"Addis Ababa", reports:15, verified:8,  severity:"Medium",   corruption_type:"Bribery",          trend:+1,  status:"Monitoring",   disclosed:false },
  { id:8,  name:"Hiwot Kebede",      office:"Ministry of Health",            city:"Addis Ababa", region:"Addis Ababa", reports:12, verified:7,  severity:"Medium",   corruption_type:"Supply Theft",     trend:-1,  status:"Monitoring",   disclosed:false },
  { id:9,  name:"Girma Tadesse",     office:"Ethiopian Roads Authority",      city:"Hawassa",     region:"SNNPR",       reports:9,  verified:4,  severity:"Low",      corruption_type:"Contract Fraud",   trend:0,   status:"Monitoring",   disclosed:false },
  { id:10, name:"Meseret Alemu",     office:"Ministry of Education",         city:"Bahir Dar",   region:"Amhara",      reports:7,  verified:3,  severity:"Low",      corruption_type:"Nepotism",         trend:-2,  status:"Monitoring",   disclosed:false },
  { id:11, name:"Samuel Bekele",     office:"Addis Ababa Land Office",       city:"Addis Ababa", region:"Addis Ababa", reports:5,  verified:2,  severity:"Low",      corruption_type:"Land Fraud",       trend:+1,  status:"Monitoring",   disclosed:false },
  { id:12, name:"Ayantu Desta",      office:"Oromia Revenue Bureau",         city:"Nekemte",     region:"Oromia",      reports:4,  verified:1,  severity:"Low",      corruption_type:"Tax Evasion",      trend:0,   status:"Monitoring",   disclosed:false },
];

// Re-apply threshold to determine disclosure state
const persons = ALL_PERSONS.map(p => ({
  ...p,
  disclosed: p.verified >= DISCLOSURE_THRESHOLD,
}));

const TREND_DATA = [
  {d:"Mar 26",r:4},{d:"Mar 27",r:7},{d:"Mar 28",r:5},{d:"Mar 29",r:11},
  {d:"Mar 30",r:9},{d:"Mar 31",r:13},{d:"Apr 1",r:8},{d:"Apr 2",r:15},
  {d:"Apr 3",r:12},{d:"Apr 4",r:18},{d:"Apr 5",r:14},{d:"Apr 6",r:21},
  {d:"Apr 7",r:19},{d:"Apr 8",r:24},{d:"Apr 9",r:22},{d:"Apr 10",r:29},
];

const TYPE_DATA = [
  {t:"Land Fraud",n:54},{t:"Bribery",n:48},{t:"Extortion",n:41},
  {t:"Procurement",n:37},{t:"Embezzlement",n:29},{t:"Tax Evasion",n:21},
];

const LIVE_INIT = [
  "Anonymous tip received — Addis Ababa, Land Office",
  "EXIF verified — image date matches incident",
  "Report routed to FEACC",
  "Voice tip received — Oromiffa, transcribing...",
  "New report — Customs fraud, Djibouti Corridor",
  "Verified report count updated",
  "Anonymous tip — Ministry of Finance, Addis Ababa",
  "AI image check passed — evidence authentic",
  "Report clustered with existing case",
  "New tip — Revenue Authority, Adama",
];

const NEW_EVENTS = [
  { city:"Addis Ababa", type:"Land Fraud",       msg:"New tip — Land Office, Bole Sub-City" },
  { city:"Adama",       type:"Tax Evasion",      msg:"New tip — Revenue Authority, Adama" },
  { city:"Addis Ababa", type:"Procurement Fraud",msg:"Voice tip — Ministry of Finance" },
  { city:"Hawassa",     type:"Contract Fraud",   msg:"New tip — Roads Authority, SNNPR" },
  { city:"Addis Ababa", type:"Bribery",          msg:"New tip — Federal Police Commission" },
  { city:"Bahir Dar",   type:"Nepotism",         msg:"New tip — Education Bureau, Amhara" },
  { city:"Dire Dawa",   type:"Customs Fraud",    msg:"SMS tip — Customs checkpoint" },
];

const SEV_COLOR = { Critical:"#ff4444", High:"#ff7c2a", Medium:"#f59e0b", Low:"#00e676" };
const STATUS_COLOR = {
  "Court":"#ff4444","Investigation":"#ff7c2a",
  "Under Review":"#f59e0b","Monitoring":"#3b82f6","Cleared":"#00e676",
};

// ── Masking logic ─────────────────────────────────────────────────────────────
function maskName(name) {
  // e.g. "Tesfaye Bekele" → "T••••••• B•••••"
  return name.split(" ").map(w => w[0] + "•".repeat(Math.max(1, w.length - 1))).join(" ");
}

function displayName(person) {
  return person.disclosed ? person.name : maskName(person.name);
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0;
      const step = target / 60;
      const id = setInterval(() => {
        v = Math.min(v + step, target);
        setVal(Math.floor(v));
        if (v >= target) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

// ── Ethiopian flag bar ────────────────────────────────────────────────────────
function FlagBar({ height = 3 }) {
  return (
    <div style={{ display:"flex", height }}>
      <div style={{ flex:1, background:"#078930" }}/>
      <div style={{ flex:1, background:"#FCDD09" }}/>
      <div style={{ flex:1, background:"#DA121A" }}/>
    </div>
  );
}

// ── Disclosure pill ────────────────────────────────────────────────────────────
function DisclosurePill({ disclosed, verified, threshold }) {
  return disclosed ? (
    <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"10px", background:"rgba(255,68,68,0.15)", color:"#ff4444", border:"1px solid #ff444433", fontFamily:"monospace", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
      ⚠ NAME DISCLOSED
    </span>
  ) : (
    <span title={`${threshold - verified} more verified reports needed to disclose name`} style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"10px", background:"rgba(0,230,118,0.08)", color:"#00e676", border:"1px solid #00e67633", fontFamily:"monospace", letterSpacing:"0.08em", whiteSpace:"nowrap", cursor:"help" }}>
      🛡 PROTECTED ({verified}/{threshold})
    </span>
  );
}

// ── Threshold progress bar ────────────────────────────────────────────────────
function ThresholdBar({ verified, threshold, disclosed }) {
  const pct = Math.min((verified / threshold) * 100, 100);
  const color = disclosed ? "#ff4444" : verified >= threshold * 0.7 ? "#f59e0b" : "#00e676";
  return (
    <div style={{ marginTop:"6px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
        <span style={{ fontSize:"8px", color:"rgba(255,255,255,0.3)", fontFamily:"monospace" }}>
          {disclosed ? "DISCLOSED" : `${threshold - verified} to disclose`}
        </span>
        <span style={{ fontSize:"8px", color, fontFamily:"monospace", fontWeight:"700" }}>{verified}/{threshold}</span>
      </div>
      <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:"2px",
          background: disclosed ? `linear-gradient(90deg, #ff4444, #ff7c2a)` : color,
          boxShadow: disclosed ? "0 0 8px #ff444488" : `0 0 6px ${color}66`,
          transition:"width 1s ease",
        }}/>
      </div>
    </div>
  );
}

// ── ORACLE AI chat ────────────────────────────────────────────────────────────
const ORACLE_PROMPT = `You are ORACLE, the public-facing AI assistant for SAFUU — Ethiopia's anonymous anti-corruption transparency platform.

CURRENT PUBLIC DATA (April 10, 2026):
- Total anonymous tips: 233 | Verified reports: 139 | Active investigations: 2 | Court cases: 1
- Disclosure threshold: ${DISCLOSURE_THRESHOLD} verified reports (names hidden below this)
- Regions reporting: Addis Ababa (127), Oromia (43), Amhara (28), SNNPR (19), Tigray (11)
- Top corruption types: Land Fraud (54), Bribery (48), Extortion (41), Procurement Fraud (37)

DISCLOSED PERSONS (verified reports ≥ ${DISCLOSURE_THRESHOLD}):
1. Tesfaye Bekele — Deputy Director, Ministry of Land, Addis Ababa — 31 verified — STATUS: COURT
2. Abebe Girma — Inspector, Federal Police, Addis Ababa — 24 verified — STATUS: INVESTIGATION
3. Mulugeta Haile — Port Officer, Customs Commission, Djibouti Corridor — 19 verified — INVESTIGATION
4. Selamawit Tadesse — Land Head, Addis Ababa City Admin — 22 verified — UNDER REVIEW

PROTECTED (names hidden, below ${DISCLOSURE_THRESHOLD} threshold):
- Ministry of Finance official, Addis Ababa — 14 verified
- Revenue Authority official, Oromia — 11 verified
- Federal Court official, Addis Ababa — 8 verified
- Ministry of Health official, Addis Ababa — 7 verified
- Roads Authority official, SNNPR — 4 verified
- Education Ministry official, Amhara — 3 verified

HOW NAME DISCLOSURE WORKS:
Names are hidden until ${DISCLOSURE_THRESHOLD} verified reports are confirmed. Below that, only city and office are shown. This protects against false accusations while ensuring accountability when evidence is strong.

You help citizens understand the platform, report corruption, and track accountability. Be warm, direct, and factual. Under 150 words per response. Always end with something actionable.`;

function OracleChat() {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:`Selam! I'm ORACLE — your guide to Safuu's public accountability data.\n\nI can tell you who has been disclosed, how the name protection works, how to report, and what's happening across Ethiopia right now.\n\nWhat would you like to know?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  const inputRef = useRef();

  const QUICK = [
    "Why are some names hidden?",
    "Who has been disclosed?",
    "How do I report anonymously?",
    "What's happening in Addis Ababa?",
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setMsgs(prev => [...prev, { role:"user", text:q }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:250,
          system: ORACLE_PROMPT,
          messages:[...msgs, { role:"user", text:q }].map(m => ({ role:m.role, content:m.text })),
        }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role:"assistant", text:data.content?.[0]?.text || "Error. Try again." }]);
    } catch {
      setMsgs(prev => [...prev, { role:"assistant", text:"Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"rgba(0,0,0,0.3)" }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(0,230,118,0.15)", display:"flex", alignItems:"center", gap:"8px" }}>
        <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00e676", boxShadow:"0 0 8px #00e676", animation:"blink 2s infinite" }}/>
        <span style={{ fontSize:"10px", color:"#00e676", letterSpacing:"0.15em", fontFamily:"monospace", fontWeight:"700" }}>ORACLE</span>
        <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.25)", marginLeft:"auto", fontFamily:"monospace" }}>AI · Public Mode</span>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:"10px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="assistant" && <div style={{ fontSize:"7px", color:"#00e676", fontFamily:"monospace", marginBottom:"3px", letterSpacing:"0.1em" }}>ORACLE</div>}
            <div style={{
              maxWidth:"88%", fontSize:"11px", lineHeight:"1.7", padding:"9px 12px",
              borderRadius:m.role==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",
              background:m.role==="user"?"rgba(0,230,118,0.12)":"rgba(255,255,255,0.04)",
              border:`1px solid ${m.role==="user"?"rgba(0,230,118,0.3)":"rgba(255,255,255,0.07)"}`,
              color:m.role==="user"?"#00e676":"rgba(255,255,255,0.75)",
              fontFamily:"monospace", whiteSpace:"pre-wrap",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:"4px", padding:"6px 12px" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:"5px",height:"5px",borderRadius:"50%",background:"#00e676",animation:"bounce 1s infinite",animationDelay:`${i*0.15}s` }}/>)}
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", flexWrap:"wrap", gap:"4px" }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{ fontSize:"8px", padding:"3px 8px", borderRadius:"10px", cursor:"pointer", background:"rgba(0,230,118,0.06)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", fontFamily:"monospace", transition:"all 0.15s" }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:"6px" }}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter")send(); }}
          placeholder="Ask about the data..."
          style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px", padding:"7px 10px", color:"rgba(255,255,255,0.8)", fontSize:"11px", fontFamily:"monospace", caretColor:"#00e676", outline:"none" }}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{ width:"32px", height:"32px", borderRadius:"6px", border:"none", cursor:"pointer", background:input.trim()&&!loading?"#00e676":"rgba(0,230,118,0.1)", color:input.trim()&&!loading?"#000":"rgba(255,255,255,0.2)", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>›</button>
      </div>
    </div>
  );
}

// ── MAIN PUBLIC WALL ──────────────────────────────────────────────────────────
export default function SafuuPublicWall() {
  const [events, setEvents]       = useState(LIVE_INIT.map((msg, i) => ({ msg, id:i, ts:new Date().toLocaleTimeString("en-ET",{hour:"2-digit",minute:"2-digit",second:"2-digit"}) })));
  const [ticker, setTicker]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [tab, setTab]             = useState("leaderboard");
  const [reportCount, setReports] = useState(233);
  const [justDisclosed, setJD]    = useState(null);
  const [showOracle, setOracle]   = useState(true);
  const eventIdx = useRef(0);
  const feedRef  = useRef();

  const totalV = useCountUp(139, 200);
  const totalR = useCountUp(reportCount, 0);
  const courtN = useCountUp(1, 400);
  const invN   = useCountUp(2, 600);

  // Live event feed + ticker
  useEffect(() => {
    const t = setInterval(() => {
      const ev = NEW_EVENTS[eventIdx.current % NEW_EVENTS.length];
      eventIdx.current++;
      const ts = new Date().toLocaleTimeString("en-ET",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

      setEvents(prev => [{ msg:ev.msg, city:ev.city, type:ev.type, id:Date.now(), ts }, ...prev.slice(0,30)]);
      setTicker(prev => [ev, ...prev.slice(0,8)]);
      setReports(prev => prev + 1);

      // Simulate a disclosure unlock every ~8 events
      if (eventIdx.current % 8 === 0) {
        setJD("An official at " + ev.city + " " + ev.type + " case approaching disclosure threshold");
        setTimeout(() => setJD(null), 5000);
      }
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = 0; }, [events]);

  const disclosed = persons.filter(p => p.disclosed);
  const protected_ = persons.filter(p => !p.disclosed);

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", color:"rgba(255,255,255,0.85)", fontFamily:"'JetBrains Mono','Fira Code','Consolas',monospace", fontSize:"12px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,68,68,0.4)}70%{box-shadow:0 0 0 12px rgba(255,68,68,0)}}
        @keyframes tickerMove{0%{transform:translateX(100vw)}100%{transform:translateX(-100vw)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes unlock{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#1a2035;border-radius:2px}
        .card:hover{background:rgba(255,255,255,0.05)!important;cursor:pointer}
        .tab:hover{color:rgba(255,255,255,0.8)!important}
        input:focus{outline:none}
      `}</style>

      <FlagBar height={4}/>

      {/* ── DISCLOSURE ALERT ── */}
      {justDisclosed && (
        <div style={{ background:"rgba(245,158,11,0.12)", borderBottom:"1px solid rgba(245,158,11,0.3)", padding:"8px 20px", display:"flex", alignItems:"center", gap:"10px", animation:"fadeIn 0.3s ease-out" }}>
          <span style={{ fontSize:"14px" }}>⚡</span>
          <span style={{ fontSize:"10px", color:"#f59e0b", fontFamily:"monospace" }}>{justDisclosed}</span>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <div style={{ padding:"0 20px", height:"50px", display:"flex", alignItems:"center", gap:"16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(7,9,15,0.98)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <div style={{ width:"26px", height:"26px", borderRadius:"6px", background:"linear-gradient(135deg,#078930,#ca8a04,#da121a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"900", color:"#fff" }}>ሳ</div>
          <div>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"#00e676", letterSpacing:"0.12em", lineHeight:1 }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>PUBLIC TRANSPARENCY</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"2px", flex:1 }}>
          {[["leaderboard","LEADERBOARD"],["map","REGIONS"],["trends","TRENDS"]].map(([id,label]) => (
            <button key={id} className="tab" onClick={()=>setTab(id)} style={{
              background:"none", border:"none", borderBottom:tab===id?"2px solid #00e676":"2px solid transparent",
              color:tab===id?"#00e676":"rgba(255,255,255,0.3)", padding:"0 14px", height:"50px",
              cursor:"pointer", fontSize:"9px", letterSpacing:"0.15em", transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* Live KPIs */}
        <div style={{ display:"flex", gap:"20px", alignItems:"center", flexShrink:0 }}>
          {[
            { label:"TIPS",    val:totalR, color:"#3b82f6" },
            { label:"VERIFIED",val:totalV, color:"#00e676"  },
            { label:"INVEST.", val:invN,   color:"#ff7c2a"  },
            { label:"COURT",   val:courtN, color:"#ff4444"  },
          ].map(k => (
            <div key={k.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"16px", color:k.color, fontWeight:"800", lineHeight:1, textShadow:`0 0 16px ${k.color}88` }}>{k.val.toLocaleString()}</div>
              <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"9px", color:"#00e676", flexShrink:0 }}>
          <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#00e676",animation:"blink 1.5s infinite",display:"inline-block" }}/>
          LIVE
        </div>

        <button onClick={()=>setOracle(o=>!o)} style={{ background:showOracle?"rgba(0,230,118,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${showOracle?"rgba(0,230,118,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:"5px", color:showOracle?"#00e676":"rgba(255,255,255,0.3)", padding:"4px 10px", cursor:"pointer", fontSize:"8px", letterSpacing:"0.1em", flexShrink:0 }}>
          ORACLE {showOracle?"▶":"◀"}
        </button>
      </div>

      {/* ── LIVE TICKER ── */}
      <div style={{ height:"28px", background:"rgba(0,0,0,0.4)", borderBottom:"1px solid rgba(255,255,255,0.04)", overflow:"hidden", display:"flex", alignItems:"center", flexShrink:0 }}>
        <div style={{ background:"#00e676", color:"#000", fontSize:"8px", fontWeight:"800", padding:"0 10px", height:"100%", display:"flex", alignItems:"center", flexShrink:0, letterSpacing:"0.1em" }}>LIVE</div>
        <div style={{ flex:1, overflow:"hidden", position:"relative", height:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", height:"100%", gap:"32px", animation:"tickerMove 40s linear infinite", whiteSpace:"nowrap", paddingLeft:"20px" }}>
            {[...ticker, ...ticker].map((e, i) => (
              <span key={i} style={{ fontSize:"9px", color:"rgba(255,255,255,0.45)", fontFamily:"monospace" }}>
                <span style={{ color:SEV_COLOR[e.type] || "#00e676", marginRight:"6px" }}>⬤</span>
                {e.city} — {e.type}
              </span>
            ))}
            {LIVE_INIT.slice(0,5).map((msg,i) => (
              <span key={`init-${i}`} style={{ fontSize:"9px", color:"rgba(255,255,255,0.35)", fontFamily:"monospace" }}>{msg}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── MAIN ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"14px", minWidth:0 }}>

          {/* Disclosure threshold banner */}
          <div style={{
            background:"rgba(0,230,118,0.04)", border:"1px solid rgba(0,230,118,0.15)",
            borderRadius:"10px", padding:"12px 18px",
            display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap",
          }}>
            <div style={{ fontSize:"18px" }}>🛡️</div>
            <div style={{ flex:1, minWidth:"200px" }}>
              <div style={{ fontSize:"11px", color:"#00e676", fontWeight:"700", marginBottom:"3px", letterSpacing:"0.05em" }}>
                Name Disclosure Threshold: <span style={{ color:"#fff" }}>{DISCLOSURE_THRESHOLD} verified reports</span>
              </div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", lineHeight:"1.6", fontFamily:"monospace" }}>
                Below {DISCLOSURE_THRESHOLD} verified reports: only city and office are shown — protecting against unverified accusations.
                At or above {DISCLOSURE_THRESHOLD}: the full name is publicly disclosed and the case is flagged for investigation.
              </div>
            </div>
            <div style={{ display:"flex", gap:"20px", flexShrink:0 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"22px", color:"#ff4444", fontWeight:"800" }}>{disclosed.length}</div>
                <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em" }}>DISCLOSED</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"22px", color:"#00e676", fontWeight:"800" }}>{protected_.length}</div>
                <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em" }}>PROTECTED</div>
              </div>
            </div>
          </div>

          {/* ════ LEADERBOARD ════ */}
          {tab === "leaderboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

              {/* SECTION A: DISCLOSED */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ height:"1px", flex:1, background:"rgba(255,68,68,0.3)" }}/>
                  <span style={{ fontSize:"9px", color:"#ff4444", letterSpacing:"0.2em", fontFamily:"monospace", padding:"0 10px" }}>
                    ⚠ DISCLOSED — {DISCLOSURE_THRESHOLD}+ VERIFIED REPORTS
                  </span>
                  <div style={{ height:"1px", flex:1, background:"rgba(255,68,68,0.3)" }}/>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {disclosed.map((p, i) => (
                    <div key={p.id} className="card" onClick={() => setSelected(selected?.id===p.id?null:p)} style={{
                      background: selected?.id===p.id ? "rgba(255,68,68,0.08)" : "rgba(255,255,255,0.03)",
                      border:`1px solid ${selected?.id===p.id?"rgba(255,68,68,0.4)":"rgba(255,68,68,0.15)"}`,
                      borderRadius:"10px", padding:"14px 18px",
                      borderLeft:`4px solid ${SEV_COLOR[p.severity]}`,
                      transition:"all 0.15s",
                      animation:`glowPulse 3s ease-in-out ${i*0.5}s`,
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
                        {/* Rank */}
                        <div style={{ fontSize:"22px", fontWeight:"900", color:i===0?"#f59e0b":i===1?"rgba(255,255,255,0.5)":i===2?"rgba(205,127,50,0.8)":"rgba(255,255,255,0.2)", fontFamily:"monospace", flexShrink:0, minWidth:"28px", lineHeight:1.1 }}>
                          #{i+1}
                        </div>

                        {/* Main content */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px", flexWrap:"wrap" }}>
                            <span style={{ fontSize:"16px", fontWeight:"700", color:"#ff4444", letterSpacing:"0.02em" }}>
                              {p.name}
                            </span>
                            <DisclosurePill disclosed={p.disclosed} verified={p.verified} threshold={DISCLOSURE_THRESHOLD}/>
                            <span style={{ fontSize:"9px", padding:"2px 8px", borderRadius:"3px", color:STATUS_COLOR[p.status], background:`${STATUS_COLOR[p.status]}18`, border:`1px solid ${STATUS_COLOR[p.status]}44`, fontFamily:"monospace" }}>
                              {p.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>
                            {p.office}
                          </div>

                          <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
                            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>📍 {p.city}, {p.region}</span>
                            <span style={{ fontSize:"10px", color:SEV_COLOR[p.severity] }}>⬤ {p.severity} · {p.corruption_type}</span>
                            <span style={{ fontSize:"10px", color:p.trend>0?"#00e676":"rgba(255,255,255,0.35)", fontWeight:"700" }}>
                              {p.trend>0?`↑ +${p.trend} this week`:"Stable"}
                            </span>
                          </div>

                          <ThresholdBar verified={p.verified} threshold={DISCLOSURE_THRESHOLD} disclosed={p.disclosed}/>
                        </div>

                        {/* Stats */}
                        <div style={{ display:"flex", gap:"14px", flexShrink:0, alignItems:"center" }}>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:"22px", fontWeight:"800", color:"#ff4444", lineHeight:1 }}>{p.verified}</div>
                            <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em" }}>VERIFIED</div>
                          </div>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:"16px", fontWeight:"700", color:"rgba(255,255,255,0.3)", lineHeight:1 }}>{p.reports}</div>
                            <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.2)", letterSpacing:"0.08em" }}>TOTAL</div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {selected?.id === p.id && (
                        <div style={{ marginTop:"14px", paddingTop:"14px", borderTop:"1px solid rgba(255,68,68,0.2)", animation:"fadeIn 0.2s ease-out" }}>
                          <div style={{ display:"flex", gap:"24px", flexWrap:"wrap" }}>
                            <div>
                              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", marginBottom:"4px", letterSpacing:"0.1em" }}>CORRUPTION TYPE</div>
                              <div style={{ fontSize:"12px", color:"#ff7c2a" }}>{p.corruption_type}</div>
                            </div>
                            <div>
                              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", marginBottom:"4px", letterSpacing:"0.1em" }}>INVESTIGATION STATUS</div>
                              <div style={{ fontSize:"12px", color:STATUS_COLOR[p.status] }}>{p.status}</div>
                            </div>
                            <div>
                              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", marginBottom:"4px", letterSpacing:"0.1em" }}>VERIFICATION RATE</div>
                              <div style={{ fontSize:"12px", color:"#00e676" }}>{Math.round(p.verified/p.reports*100)}%</div>
                            </div>
                            <div>
                              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", marginBottom:"4px", letterSpacing:"0.1em" }}>WEEKLY TREND</div>
                              <div style={{ fontSize:"12px", color:p.trend>0?"#00e676":"rgba(255,255,255,0.5)" }}>{p.trend>0?"+":""}{p.trend} reports</div>
                            </div>
                          </div>
                          <div style={{ marginTop:"12px", padding:"10px", background:"rgba(0,0,0,0.2)", borderRadius:"6px", fontSize:"10px", color:"rgba(255,255,255,0.35)", lineHeight:"1.7", fontFamily:"monospace" }}>
                            💡 This person's name was disclosed because {p.verified} verified anonymous reports reached the threshold of {DISCLOSURE_THRESHOLD}. Evidence has been cryptographically sealed in the Safuu ledger and forwarded to {p.status === "Court" ? "the Ethiopian Federal Court" : "FEACC"} for formal action.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: PROTECTED */}
              <div style={{ marginTop:"4px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ height:"1px", flex:1, background:"rgba(0,230,118,0.2)" }}/>
                  <span style={{ fontSize:"9px", color:"#00e676", letterSpacing:"0.2em", fontFamily:"monospace", padding:"0 10px" }}>
                    🛡 PROTECTED — BELOW {DISCLOSURE_THRESHOLD} VERIFIED REPORTS
                  </span>
                  <div style={{ height:"1px", flex:1, background:"rgba(0,230,118,0.2)" }}/>
                </div>

                <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", marginBottom:"12px", lineHeight:"1.7", fontFamily:"monospace" }}>
                  These offices have received anonymous reports that are being verified. Names will be revealed once {DISCLOSURE_THRESHOLD} verified reports are confirmed. Keep reporting — every verified report counts.
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"8px" }}>
                  {protected_.map((p, i) => (
                    <div key={p.id} className="card" style={{
                      background:"rgba(255,255,255,0.02)",
                      border:`1px solid rgba(255,255,255,0.07)`,
                      borderRadius:"10px", padding:"14px 16px",
                      borderLeft:`4px solid ${SEV_COLOR[p.severity]}55`,
                      transition:"all 0.15s",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                        <div style={{ fontSize:"12px", fontWeight:"800", color:"rgba(255,255,255,0.15)", fontFamily:"monospace" }}>
                          #{i + disclosed.length + 1}
                        </div>
                        <div>
                          {/* MASKED NAME */}
                          <div style={{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.2)", letterSpacing:"0.08em", fontFamily:"monospace" }}>
                            {maskName(p.name)}
                          </div>
                          <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>
                            Identity protected
                          </div>
                        </div>
                        <div style={{ marginLeft:"auto" }}>
                          <DisclosurePill disclosed={false} verified={p.verified} threshold={DISCLOSURE_THRESHOLD}/>
                        </div>
                      </div>

                      {/* WHAT IS SHOWN: city + office only */}
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>
                        🏢 {p.office}
                      </div>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"10px" }}>
                        📍 {p.city}, {p.region} · {p.corruption_type}
                      </div>

                      <ThresholdBar verified={p.verified} threshold={DISCLOSURE_THRESHOLD} disclosed={false}/>

                      {/* Mini CTA */}
                      <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"block", marginTop:"10px", padding:"6px", background:"rgba(0,230,118,0.06)", border:"1px solid rgba(0,230,118,0.15)", borderRadius:"5px", textAlign:"center", fontSize:"8px", color:"#00e676", textDecoration:"none", letterSpacing:"0.08em", fontFamily:"monospace" }}>
                        + ADD YOUR REPORT → accelerate disclosure
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ REGIONS ════ */}
          {tab === "map" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"10px" }}>
                {[
                  { region:"Addis Ababa", reports:127, pct:54, color:"#ff4444", offices:["Land Office","Federal Police","City Admin","Finance","Courts"] },
                  { region:"Oromia",      reports:43,  pct:18, color:"#ff7c2a", offices:["Revenue Authority","Customs","Roads"] },
                  { region:"Amhara",      reports:28,  pct:12, color:"#f59e0b", offices:["Education Bureau","Land Registry"] },
                  { region:"SNNPR",       reports:19,  pct:8,  color:"#3b82f6", offices:["Roads Authority","Health Office"] },
                  { region:"Tigray",      reports:11,  pct:5,  color:"#a78bfa", offices:["Revenue Bureau"] },
                  { region:"Dire Dawa",   reports:5,   pct:2,  color:"#00e676", offices:["Customs Checkpoint"] },
                ].map(r => (
                  <div key={r.region} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${r.color}22`, borderRadius:"10px", padding:"16px", borderTop:`3px solid ${r.color}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                      <div style={{ fontSize:"13px", fontWeight:"700", color:r.color }}>{r.region}</div>
                      <div style={{ fontSize:"18px", fontWeight:"800", color:"rgba(255,255,255,0.7)", fontFamily:"monospace" }}>{r.reports}</div>
                    </div>
                    <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", marginBottom:"10px" }}>
                      <div style={{ height:"100%", width:`${r.pct}%`, background:r.color, borderRadius:"2px" }}/>
                    </div>
                    <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", lineHeight:"1.8" }}>
                      {r.offices.map(o => <div key={o}>• {o}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ TRENDS ════ */}
          {tab === "trends" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", overflow:"hidden" }}>
                <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:"9px", color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em" }}>▸ ANONYMOUS TIPS — LAST 16 DAYS</div>
                <div style={{ padding:"16px 8px 8px" }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={TREND_DATA} margin={{ top:0,right:4,left:-28,bottom:0 }}>
                      <defs>
                        <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00e676" stopOpacity={0.3}/><stop offset="95%" stopColor="#00e676" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="d" tick={{ fill:"rgba(255,255,255,0.25)",fontSize:8 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"rgba(255,255,255,0.25)",fontSize:8 }} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{ background:"#0e1117",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",fontSize:"10px" }}/>
                      <Area type="monotone" dataKey="r" stroke="#00e676" fill="url(#gR)" strokeWidth={2} name="Tips" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", overflow:"hidden" }}>
                <div style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:"9px", color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em" }}>▸ REPORT TYPE BREAKDOWN</div>
                <div style={{ padding:"16px 12px" }}>
                  {TYPE_DATA.map((t,i) => (
                    <div key={t.t} style={{ marginBottom:"10px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                        <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.45)" }}>{t.t}</span>
                        <span style={{ fontSize:"10px", fontWeight:"700", color:`hsl(${120-i*20},70%,55%)` }}>{t.n}</span>
                      </div>
                      <div style={{ height:"4px", background:"rgba(255,255,255,0.05)", borderRadius:"2px" }}>
                        <div style={{ height:"100%", width:`${(t.n/54)*100}%`, background:`hsl(${120-i*20},70%,45%)`, borderRadius:"2px" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: LIVE FEED + ORACLE ── */}
        <div style={{ width:"300px", flexShrink:0, borderLeft:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column" }}>

          {/* Live feed */}
          <div style={{ flex:"0 0 auto", maxHeight:"240px", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:"7px", flexShrink:0 }}>
              <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#00e676",animation:"blink 1s infinite",display:"inline-block" }}/>
              <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.4)", letterSpacing:"0.15em" }}>LIVE TIPS</span>
              <span style={{ fontSize:"8px", color:"#00e676", marginLeft:"auto", fontFamily:"monospace" }}>+{reportCount-233} new</span>
            </div>
            <div ref={feedRef} style={{ overflowY:"auto", flex:1 }}>
              {events.map((e,i) => (
                <div key={e.id} style={{ padding:"6px 14px", borderBottom:"1px solid rgba(255,255,255,0.025)", animation:i===0?"fadeIn 0.3s ease-out":"none" }}>
                  <div style={{ display:"flex", gap:"6px", alignItems:"flex-start" }}>
                    <span style={{ fontSize:"7px", color:"rgba(255,255,255,0.2)", flexShrink:0, paddingTop:"1px", fontFamily:"monospace" }}>{e.ts}</span>
                    <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.4)", lineHeight:"1.5" }}>{e.msg}</span>
                  </div>
                  {e.city && (
                    <div style={{ fontSize:"8px", color:"rgba(0,230,118,0.5)", marginLeft:"52px", marginTop:"1px", fontFamily:"monospace" }}>
                      📍 {e.city} · {e.type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Oracle chat */}
          {showOracle && (
            <div style={{ flex:1, borderTop:"2px solid rgba(0,230,118,0.15)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <OracleChat/>
            </div>
          )}

          {/* Report CTA */}
          <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,230,118,0.03)", flexShrink:0 }}>
            <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.35)", marginBottom:"8px", lineHeight:"1.6", textAlign:"center" }}>
              Know someone in this list? Add your verified report — every report moves them closer to disclosure.
            </div>
            <a href="https://t.me/SafuuEthBot" target="_blank" rel="noreferrer" style={{ display:"block", padding:"10px", background:"#00e676", borderRadius:"7px", textAlign:"center", fontSize:"10px", fontWeight:"800", color:"#000", textDecoration:"none", letterSpacing:"0.08em" }}>
              🤖 REPORT ANONYMOUSLY
            </a>
            <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"7px", textAlign:"center", fontFamily:"monospace" }}>
              Identity never stored · Voice or text · Any language
            </div>
          </div>
        </div>
      </div>

      <FlagBar height={3}/>
    </div>
  );
}
