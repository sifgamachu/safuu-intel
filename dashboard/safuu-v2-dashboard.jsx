import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as d3 from "d3";

// ── PALETTE ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#06080f", panel:"rgba(255,255,255,0.03)", panel2:"rgba(255,255,255,0.055)",
  border:"rgba(255,255,255,0.07)", borderG:"rgba(0,230,118,0.2)",
  green:"#00e676", greenDim:"rgba(0,230,118,0.08)", greenGlow:"rgba(0,230,118,0.25)",
  gold:"#f59e0b", goldDim:"rgba(245,158,11,0.1)", goldBr:"#fbbf24",
  red:"#ff4444", redDim:"rgba(255,68,68,0.1)",
  orange:"#ff7c2a", blue:"#38bdf8", purple:"#a78bfa",
  text:"#e8eaf0", muted:"#4a5568", muted2:"#718096", dim:"rgba(255,255,255,0.04)",
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const PERSONS = [
  { id:1, name:"Tesfaye Bekele",    office:"Ministry of Land & Urban Dev.", title:"Deputy Director",      region:"Addis Ababa",    reports:47,verified:31,rating:8.7,severity:"Critical",status:"Court",      trend:+12,lastReport:"2026-04-10",phone:"0911-234-567",amounts:"ETB 85k–240k", imageVerified:true,  aiFlag:false,dedupBlocked:5,riskScore:94 },
  { id:2, name:"Abebe Girma",       office:"Federal Police Commission",     title:"Senior Inspector",      region:"Addis Ababa",    reports:38,verified:24,rating:7.9,severity:"High",    status:"Investigation",trend:+8, lastReport:"2026-04-10",phone:"0912-456-789",amounts:"ETB 2k–15k",   imageVerified:true,  aiFlag:false,dedupBlocked:3,riskScore:81 },
  { id:3, name:"Mulugeta Haile",    office:"Ethiopian Customs Commission",  title:"Port Clearance Officer",region:"Djibouti Corridor",reports:31,verified:19,rating:7.2,severity:"High",   status:"Investigation",trend:+5, lastReport:"2026-04-08",phone:"0913-321-654",amounts:"ETB 10k–80k",  imageVerified:true,  aiFlag:true, dedupBlocked:2,riskScore:74 },
  { id:4, name:"Selamawit Tadesse", office:"Addis Ababa City Admin.",       title:"Land Allocation Head",  region:"Addis Ababa",    reports:28,verified:22,rating:8.1,severity:"High",    status:"Under Review", trend:+3, lastReport:"2026-04-09",phone:"Unknown",    amounts:"ETB 30k–120k", imageVerified:false, aiFlag:false,dedupBlocked:1,riskScore:78 },
  { id:5, name:"Dawit Worku",       office:"Ministry of Finance",           title:"Procurement Officer",   region:"Addis Ababa",    reports:22,verified:14,rating:6.8,severity:"Medium",  status:"Under Review", trend:+6, lastReport:"2026-04-07",phone:"0916-789-012",amounts:"ETB 5k–22k",   imageVerified:true,  aiFlag:false,dedupBlocked:0,riskScore:62 },
  { id:6, name:"Tigist Alemu",      office:"ERCA – Revenue Authority",      title:"Regional Tax Officer",  region:"Oromia",         reports:19,verified:11,rating:6.2,severity:"Medium",  status:"Monitoring",   trend:+2, lastReport:"2026-04-06",phone:"0917-234-890",amounts:"ETB 1.5k–8k",  imageVerified:false, aiFlag:false,dedupBlocked:4,riskScore:54 },
  { id:7, name:"Yohannes Mesfin",   office:"Federal First Instance Court",  title:"Senior Court Clerk",    region:"Addis Ababa",    reports:15,verified:8, rating:5.9,severity:"Medium",  status:"Monitoring",   trend:+1, lastReport:"2026-04-05",phone:"Unknown",    amounts:"ETB 500–3k",   imageVerified:true,  aiFlag:false,dedupBlocked:0,riskScore:47 },
  { id:8, name:"Hiwot Kebede",      office:"Ministry of Health",            title:"Supply Chain Manager",  region:"Addis Ababa",    reports:12,verified:7, rating:5.5,severity:"Medium",  status:"Monitoring",   trend:-1, lastReport:"2026-04-03",phone:"0918-567-123",amounts:"ETB 8k–35k",   imageVerified:false, aiFlag:true, dedupBlocked:2,riskScore:42 },
  { id:9, name:"Girma Tadesse",     office:"Ethiopian Roads Authority",     title:"Contract Supervisor",   region:"SNNPR",          reports:9, verified:4, rating:4.8,severity:"Low",     status:"Monitoring",   trend:0,  lastReport:"2026-04-01",phone:"0919-876-543",amounts:"ETB 20k–90k",  imageVerified:false, aiFlag:false,dedupBlocked:1,riskScore:33 },
  { id:10,name:"Meseret Alemu",     office:"Ministry of Education",         title:"School Administration", region:"Amhara",         reports:7, verified:3, rating:4.2,severity:"Low",     status:"Monitoring",   trend:-2, lastReport:"2026-03-28",phone:"Unknown",    amounts:"ETB 200–1k",   imageVerified:false, aiFlag:false,dedupBlocked:0,riskScore:24 },
];

const TREND_DATA = [
  {d:"Mar 26",r:4,v:2},{d:"Mar 27",r:7,v:5},{d:"Mar 28",r:5,v:3},{d:"Mar 29",r:11,v:7},
  {d:"Mar 30",r:9,v:6},{d:"Mar 31",r:13,v:9},{d:"Apr 1",r:8,v:5},{d:"Apr 2",r:15,v:11},
  {d:"Apr 3",r:12,v:8},{d:"Apr 4",r:18,v:13},{d:"Apr 5",r:14,v:9},{d:"Apr 6",r:21,v:16},
  {d:"Apr 7",r:19,v:14},{d:"Apr 8",r:24,v:18},{d:"Apr 9",r:22,v:17},{d:"Apr 10",r:29,v:22},
];

const OFFICE_DATA = [
  {o:"Land & Urban",r:54},{o:"Police",r:41},{o:"Customs",r:37},
  {o:"City Admin",r:29},{o:"Finance",r:24},{o:"ERCA",r:21},{o:"Courts",r:16},{o:"Health",r:13},
];

const CORRUPTION_TYPES = [
  {t:"Land Fraud",n:54,c:"#ff4444"},{t:"Bribery",n:48,c:C.orange},{t:"Extortion",n:41,c:C.gold},
  {t:"Procurement",n:37,c:"#a78bfa"},{t:"Embezzlement",n:29,c:C.blue},{t:"Nepotism",n:17,c:C.green},{t:"Other",n:7,c:C.muted2},
];

const LIVE_EVENTS_INIT = [
  {ts:"14:52:31",lvl:"CRIT", msg:"Report: Tesfaye Bekele — Land fraud ETB 150,000 Bole Sub-City"},
  {ts:"14:47:18",lvl:"INFO", msg:"EXIF verified: TIP-KM4XP9RZ — date matches incident within 24h"},
  {ts:"14:39:05",lvl:"WARN", msg:"AI-generated flag: TIP-LQ8RT2XW — Hive confidence 91%"},
  {ts:"14:31:42",lvl:"HIGH", msg:"Dedup block: same submitter attempted 2nd report on Abebe Girma"},
  {ts:"14:22:17",lvl:"INFO", msg:"Report: Selamawit Tadesse — Bid rigging Kirkos Woreda"},
  {ts:"14:15:09",lvl:"CRIT", msg:"Threshold breached: Tesfaye Bekele — 31 verified reports"},
  {ts:"13:58:33",lvl:"INFO", msg:"Voice transcription: TIP-NZ7YQ3MV — Amharic 94% confidence"},
  {ts:"13:44:50",lvl:"HIGH", msg:"Report: Mulugeta Haile — Customs bribery Djibouti Corridor"},
  {ts:"13:18:07",lvl:"WARN", msg:"EXIF anomaly: TIP-AB2CD3EF — photo 14 days before incident"},
  {ts:"13:05:55",lvl:"INFO", msg:"Auto-routed to FEACC: TIP-XY9WZ1TK — extortion pattern"},
];

const NEW_EVENTS = [
  {lvl:"INFO", msg:"Voice tip received — Oromiffa, transcribing..."},
  {lvl:"HIGH", msg:"Report: Tigist Alemu — tax evasion Oromia Region"},
  {lvl:"WARN", msg:"AI check: TIP-PP3RQ7ZA — Sightengine 0.73"},
  {lvl:"CRIT", msg:"Count updated: Tesfaye Bekele now 48 total reports"},
  {lvl:"INFO", msg:"Dedup passed — unique submitter confirmed"},
  {lvl:"HIGH", msg:"Report: Dawit Worku — procurement ghost contract"},
  {lvl:"INFO", msg:"Voice tip: Amharic, 4 new details on land fraud case"},
];

const STATUS_CFG = {
  "Monitoring":   {c:"#3b82f6",bg:"rgba(59,130,246,0.1)"},
  "Under Review": {c:C.gold,   bg:"rgba(245,158,11,0.1)"},
  "Investigation":{c:C.orange, bg:"rgba(255,124,42,0.1)"},
  "Court":        {c:C.red,    bg:"rgba(255,68,68,0.1)"},
  "Cleared":      {c:C.green,  bg:"rgba(0,230,118,0.1)"},
};
const SEV_C = {Critical:C.red, High:C.orange, Medium:C.gold, Low:C.green};
const LVL_C = {CRIT:C.red, HIGH:C.orange, WARN:C.gold, INFO:C.green};

// ── ORACLE SYSTEM PROMPT ──────────────────────────────────────────────────────
const ORACLE_SYSTEM = `You are ORACLE — the embedded AI intelligence engine inside SAFUU, Ethiopia's anonymous anti-corruption intelligence platform.

LIVE DATABASE SNAPSHOT (as of April 10, 2026):
- Total reports: 233 | Verified: 139 | Investigations: 2 | Court cases: 1
- AI-flagged images: 3 | Dedup blocks: 18 | Voice tips: 134 | Text tips: 89

TOP ACCUSED PERSONS (ranked by verified reports):
1. Tesfaye Bekele | Deputy Director, Ministry of Land & Urban Dev. | Addis Ababa | 47 reports, 31 verified | Rating 8.7/10 | STATUS: COURT | Type: Land Fraud | ETB 85k-240k
2. Abebe Girma | Senior Inspector, Federal Police | Addis Ababa | 38 reports, 24 verified | Rating 7.9 | STATUS: INVESTIGATION | Type: Extortion/Bribery | ETB 2k-15k
3. Mulugeta Haile | Port Officer, Ethiopian Customs | Djibouti Corridor | 31 reports, 19 verified | Rating 7.2 | STATUS: INVESTIGATION | AI image flagged | ETB 10k-80k
4. Selamawit Tadesse | Land Office Head, Addis Ababa City Admin. | 28 reports, 22 verified | Rating 8.1 | STATUS: UNDER REVIEW | ETB 30k-120k
5. Dawit Worku | Procurement Officer, Ministry of Finance | 22 reports, 14 verified | Rating 6.8 | STATUS: UNDER REVIEW | ETB 5k-22k
6. Tigist Alemu | Tax Officer, ERCA Oromia | 19 reports, 11 verified | ETB 1.5k-8k | Monitoring
7. Yohannes Mesfin | Court Clerk, Federal Court | 15 reports, 8 verified | Monitoring
8. Hiwot Kebede | Supply Chain, Ministry of Health | 12 reports, 7 verified | AI image flagged | Monitoring
9. Girma Tadesse | Contract Supervisor, Roads Authority | 9 reports | Monitoring
10. Meseret Alemu | Education Ministry | 7 reports | Monitoring

CORRUPTION TYPES: Land Fraud (54), Bribery (48), Extortion (41), Procurement Fraud (37), Embezzlement (29), Nepotism (17)
HOTSPOT REGIONS: Addis Ababa (127 reports, 54%), Oromia (43, 18%), Amhara (28, 12%), SNNPR (19, 8%)
INVESTIGATION THRESHOLD: Currently set at 20 verified reports (manual mode)
CURRENT THRESHOLD ALERTS: Selamawit Tadesse (22 verified) — ready for formal investigation

You can answer questions, suggest next steps, identify patterns, recommend escalations, and analyze trends. Keep responses sharp, data-driven, and under 200 words. You are a serious intelligence tool for Ethiopian law enforcement and civil accountability.`;

// ── HOOKS ─────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start = 0;
      const step = target / (duration / 16);
      const id = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(Math.floor(start));
        if (start >= target) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return val;
}

function useSearch(items, keys) {
  const [q, setQ] = useState("");
  const filtered = q.trim()
    ? items.filter(item => keys.some(k => String(item[k]||"").toLowerCase().includes(q.toLowerCase())))
    : items;
  return { q, setQ, filtered };
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG["Monitoring"];
  return <span style={{ fontSize:"9px",fontFamily:"monospace",letterSpacing:"0.1em",padding:"2px 8px",borderRadius:"3px",color:s.c,background:s.bg,border:`1px solid ${s.c}44`,whiteSpace:"nowrap" }}>{status.toUpperCase()}</span>;
};

const SevDot = ({ s }) => <span style={{ display:"inline-block",width:"6px",height:"6px",borderRadius:"50%",background:SEV_C[s]||C.muted,marginRight:"5px",flexShrink:0 }}/>;

const GlowPanel = ({ children, color = C.green, style }) => (
  <div style={{ background:C.panel, border:`1px solid ${color}22`, borderRadius:"10px", overflow:"hidden", boxShadow:`0 0 30px ${color}08`, ...style }}>
    {children}
  </div>
);

const PanelHeader = ({ title, right }) => (
  <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.02)" }}>
    <span style={{ fontSize:"9px", color:C.muted2, letterSpacing:"0.18em", fontFamily:"monospace" }}>{title}</span>
    {right}
  </div>
);

// Risk gauge (circular SVG)
const RiskGauge = ({ score, size = 44 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? C.red : score >= 60 ? C.orange : score >= 40 ? C.gold : C.green;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 4px ${color})`, transition:"stroke-dasharray 1s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="10" fontFamily="monospace" fontWeight="700"
        style={{ transform:"rotate(90deg)", transformOrigin:`${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
};

// Animated KPI card
const KPI = ({ label, value, sub, color, delay = 0, icon }) => {
  const animated = useCountUp(value, 1800, delay);
  return (
    <div style={{ background:C.panel, border:`1px solid ${color}22`, borderRadius:"10px", padding:"14px 18px", flex:1, minWidth:0, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${color}, transparent)` }}/>
      <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"0.15em", fontFamily:"monospace", marginBottom:"8px" }}>{label}</div>
      <div style={{ fontSize:"26px", fontWeight:"800", color, fontFamily:"monospace", lineHeight:1, textShadow:`0 0 20px ${color}66` }}>{animated.toLocaleString()}</div>
      {sub && <div style={{ fontSize:"10px", color:C.muted2, marginTop:"5px", fontFamily:"monospace" }}>{sub}</div>}
      {icon && <div style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", fontSize:"24px", opacity:0.07 }}>{icon}</div>}
    </div>
  );
};

// ── NETWORK GRAPH ─────────────────────────────────────────────────────────────
function NetworkGraph({ persons, onSelect }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const W = el.clientWidth || 600, H = el.clientHeight || 400;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).append("g");

    // Zoom
    d3.select(el).call(d3.zoom().scaleExtent([0.4,3]).on("zoom", e => svg.attr("transform", e.transform)));

    // Nodes: persons + offices
    const officeSet = [...new Set(persons.map(p => p.office))];
    const nodes = [
      ...persons.map(p => ({ id:`p${p.id}`, label:p.name.split(" ")[0], type:"person", data:p, r:6 + p.verified/5, color:SEV_C[p.severity]||C.muted2 })),
      ...officeSet.map(o => ({ id:`o${o}`, label:o.split(" ")[0], type:"office", data:{office:o}, r:8, color:C.blue })),
    ];

    // Links: person → office
    const links = persons.map(p => ({ source:`p${p.id}`, target:`o${p.office}`, value:p.verified }));

    const sim = d3.forceSimulation(nodes)
      .force("link",   d3.forceLink(links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(W/2, H/2))
      .force("collide", d3.forceCollide(d => d.r + 10));

    const link = svg.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 1);

    const node = svg.append("g").selectAll("g").data(nodes).join("g")
      .style("cursor","pointer")
      .on("click", (e, d) => { if (d.type === "person") onSelect(d.data); })
      .on("mouseenter", (e, d) => setTooltip({ x:e.clientX, y:e.clientY, d }))
      .on("mouseleave", () => setTooltip(null));

    // Glow filter
    const defs = d3.select(el).append("defs");
    const filter = defs.append("filter").attr("id","glow");
    filter.append("feGaussianBlur").attr("stdDeviation","3").attr("result","blur");
    filter.append("feComposite").attr("in","SourceGraphic").attr("in2","blur").attr("operator","over");

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => `${d.color}22`)
      .attr("stroke", d => d.color)
      .attr("stroke-width", d => d.type === "person" ? 1.5 : 2)
      .style("filter", "url(#glow)");

    node.append("text")
      .text(d => d.label)
      .attr("text-anchor","middle")
      .attr("dy", d => d.r + 12)
      .attr("fill", C.muted2)
      .attr("font-size", 8)
      .attr("font-family","monospace");

    sim.on("tick", () => {
      link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y)
          .attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [persons]);

  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <svg ref={svgRef} style={{ width:"100%", height:"100%", background:"transparent" }}/>
      {tooltip && (
        <div style={{ position:"fixed", left:tooltip.x+12, top:tooltip.y-10, background:"#111", border:`1px solid ${C.border}`, borderRadius:"6px", padding:"8px 12px", fontSize:"10px", color:C.text, pointerEvents:"none", zIndex:999, maxWidth:"180px" }}>
          <div style={{ color:tooltip.d.color, fontWeight:"700" }}>{tooltip.d.label}</div>
          {tooltip.d.type==="person" && <div style={{ color:C.muted2, marginTop:"2px" }}>{tooltip.d.data.office}<br/>Verified: {tooltip.d.data.verified} | Score: {tooltip.d.data.riskScore}</div>}
          {tooltip.d.type==="office" && <div style={{ color:C.muted2, marginTop:"2px" }}>{tooltip.d.data.office}</div>}
        </div>
      )}
    </div>
  );
}

// ── AI ORACLE ─────────────────────────────────────────────────────────────────
function OraclePanel({ threshold, setThreshold }) {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:"ORACLE online. I have full access to Safuu's intelligence database. Ask me anything about the cases, patterns, or who to prioritize next." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  const inputRef = useRef();

  const QUICK = [
    "Who should we escalate next?",
    "Any patterns in land fraud?",
    "Which office is highest risk?",
    "Is Tesfaye ready for court?",
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  async function ask(text) {
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
          max_tokens:300,
          system: ORACLE_SYSTEM,
          messages:[...msgs, { role:"user", text:q }].map(m => ({ role:m.role, content:m.text })),
        }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role:"assistant", text:data.content?.[0]?.text || "Error" }]);
    } catch {
      setMsgs(prev => [...prev, { role:"assistant", text:"Connection error. Try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:"8px" }}>
        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, animation:"blink 2s infinite" }}/>
        <span style={{ fontSize:"11px", color:C.green, letterSpacing:"0.15em", fontFamily:"monospace", fontWeight:"700" }}>ORACLE AI</span>
        <span style={{ fontSize:"9px", color:C.muted, marginLeft:"auto" }}>Claude-powered</span>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom:"12px", display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="assistant" && <div style={{ fontSize:"8px", color:C.green, fontFamily:"monospace", marginBottom:"3px", letterSpacing:"0.1em" }}>ORACLE</div>}
            <div style={{
              maxWidth:"90%", fontSize:"11px", lineHeight:"1.7", padding:"9px 12px", borderRadius:m.role==="user"?"8px 8px 2px 8px":"8px 8px 8px 2px",
              background:m.role==="user"?"rgba(0,230,118,0.1)":"rgba(255,255,255,0.04)",
              border:`1px solid ${m.role==="user"?C.green+"44":C.border}`,
              color:m.role==="user"?C.green:C.muted2,
              fontFamily:"monospace",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:"4px", padding:"8px 12px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width:"5px", height:"5px", borderRadius:"50%", background:C.green, animation:"bounce 1s infinite", animationDelay:`${i*0.15}s` }}/>)}
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Quick prompts */}
      <div style={{ padding:"8px 12px", borderTop:`1px solid ${C.border}`, display:"flex", flexWrap:"wrap", gap:"4px" }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => ask(q)} style={{
            fontSize:"8px", padding:"3px 7px", borderRadius:"3px", cursor:"pointer",
            background:"rgba(0,230,118,0.06)", color:C.muted2, border:`1px solid ${C.border}`,
            fontFamily:"monospace", transition:"all 0.15s",
          }}>{q}</button>
        ))}
      </div>

      {/* Threshold quick-set */}
      <div style={{ padding:"8px 12px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
          <span style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace" }}>INVEST. THRESHOLD</span>
          <span style={{ fontSize:"13px", color:C.green, fontWeight:"800", fontFamily:"monospace", marginLeft:"auto" }}>{threshold}</span>
        </div>
        <input type="range" min={5} max={50} value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ width:"100%" }}/>
      </div>

      {/* Input */}
      <div style={{ padding:"8px 12px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", gap:"6px" }}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter")ask(); }}
            placeholder="Ask ORACLE..."
            style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:"6px", padding:"7px 10px", color:C.text, fontSize:"11px", fontFamily:"monospace", caretColor:C.green, outline:"none" }}/>
          <button onClick={()=>ask()} disabled={!input.trim()||loading} style={{
            width:"32px", borderRadius:"6px", border:"none", cursor:"pointer",
            background:input.trim()&&!loading?C.green:"rgba(0,230,118,0.1)",
            color:input.trim()&&!loading?"#000":C.muted, fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center",
          }}>›</button>
        </div>
      </div>
    </div>
  );
}

// ── TOAST NOTIFICATIONS ───────────────────────────────────────────────────────
function Toasts({ toasts, dismiss }) {
  return (
    <div style={{ position:"fixed", top:"60px", right:"16px", zIndex:1000, display:"flex", flexDirection:"column", gap:"6px" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => dismiss(t.id)} style={{
          background:"#0e1117", border:`1px solid ${LVL_C[t.lvl]||C.green}55`,
          borderLeft:`3px solid ${LVL_C[t.lvl]||C.green}`,
          borderRadius:"6px", padding:"10px 14px", fontSize:"11px",
          color:C.muted2, maxWidth:"320px", cursor:"pointer",
          animation:"slideInRight 0.3s ease-out", boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
          fontFamily:"monospace",
        }}>
          <span style={{ color:LVL_C[t.lvl]||C.green, marginRight:"8px", fontWeight:"700" }}>{t.lvl}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function SafuuV2() {
  const [tab, setTab]         = useState("command");
  const [selected, setSelected] = useState(null);
  const [compare, setCompare] = useState(null);
  const [threshold, setThreshold] = useState(20);
  const [statusOvr, setStatusOvr] = useState({});
  const [events, setEvents]   = useState(LIVE_EVENTS_INIT);
  const [toasts, setToasts]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filterSev, setFilterSev] = useState("All");
  const [filterSt,  setFilterSt]  = useState("All");
  const [sortBy,    setSortBy]    = useState("verified");
  const [showOracle, setOracle]   = useState(true);
  const { q, setQ, filtered: searchResults } = useSearch(PERSONS, ["name","office","title","region"]);
  const feedRef = useRef();
  const evtIdx  = useRef(0);

  const getStatus = p => statusOvr[p.id] || p.status;

  const pushToast = useCallback((lvl, msg) => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-3), { id, lvl, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismissToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  // Live event feed
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      const ev = NEW_EVENTS[evtIdx.current % NEW_EVENTS.length];
      evtIdx.current++;
      setEvents(prev => [{ ts, ...ev }, ...prev.slice(0, 40)]);
      if (ev.lvl === "CRIT" || ev.lvl === "HIGH") pushToast(ev.lvl, ev.msg.slice(0, 80));
    }, 6000);
    return () => clearInterval(t);
  }, [pushToast]);

  const escalate = (p, to) => {
    setStatusOvr(prev => ({ ...prev, [p.id]: to }));
    pushToast("HIGH", `${p.name.split(" ")[0]} → ${to.toUpperCase()}`);
    const ts = new Date(); const t = `${String(ts.getHours()).padStart(2,"0")}:${String(ts.getMinutes()).padStart(2,"0")}:${String(ts.getSeconds()).padStart(2,"0")}`;
    setEvents(prev => [{ ts, lvl:"CRIT", msg:`STATUS: ${p.name} → ${to.toUpperCase()} (admin action)` }, ...prev]);
  };

  const totR  = PERSONS.reduce((s,p)=>s+p.reports,0);
  const totV  = PERSONS.reduce((s,p)=>s+p.verified,0);
  const courtN = PERSONS.filter(p=>getStatus(p)==="Court").length;
  const invN   = PERSONS.filter(p=>getStatus(p)==="Investigation").length;
  const atThresh = PERSONS.filter(p=>p.verified>=threshold && getStatus(p)==="Monitoring");

  const persons = [...PERSONS]
    .filter(p=>filterSev==="All"||p.severity===filterSev)
    .filter(p=>filterSt==="All"||getStatus(p)===filterSt)
    .sort((a,b)=>sortBy==="verified"?b.verified-a.verified:sortBy==="reports"?b.reports-a.reports:b.riskScore-a.riskScore);

  const TABS = ["command","persons","network","evidence","pipeline","analytics","admin"];

  const vRate = Math.round(totV/totR*100);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'JetBrains Mono','Fira Code','Consolas',monospace", fontSize:"12px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#1a2035;border-radius:2px}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.4)}70%{box-shadow:0 0 0 8px rgba(0,230,118,0)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        .row:hover{background:rgba(255,255,255,0.04)!important;cursor:pointer}
        .tb:hover{color:#e8eaf0!important;background:rgba(255,255,255,0.06)!important}
        .pill:hover{opacity:0.8;cursor:pointer}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%}
        input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:rgba(255,255,255,0.08)}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:${C.green};margin-top:-4.5px;cursor:pointer;box-shadow:0 0 8px ${C.green}}
        textarea:focus,input:focus{outline:none}
      `}</style>

      <Toasts toasts={toasts} dismiss={dismissToast}/>

      {/* ── TOPBAR ── */}
      <div style={{ height:"48px", flexShrink:0, background:"rgba(6,8,15,0.98)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"0 16px", gap:"16px", backdropFilter:"blur(10px)" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <div style={{ width:"26px", height:"26px", borderRadius:"6px", background:`linear-gradient(135deg, #078930, #ca8a04, #da121a)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"900", color:"#fff", boxShadow:`0 0 16px rgba(0,230,118,0.3)` }}>ሳ</div>
          <div>
            <div style={{ fontSize:"13px", fontWeight:"700", color:C.green, letterSpacing:"0.12em", lineHeight:1, textShadow:`0 0 16px ${C.green}66` }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:C.muted, letterSpacing:"0.12em" }}>INTEL v2.0</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", flex:1, alignItems:"center", gap:"1px", overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t} className="tb" onClick={()=>{ setTab(t); setSelected(null); }} style={{
              background:tab===t?"rgba(0,230,118,0.1)":"transparent",
              border:"none", borderBottom:tab===t?`2px solid ${C.green}`:"2px solid transparent",
              color:tab===t?C.green:C.muted, padding:"0 14px", height:"48px", cursor:"pointer",
              fontSize:"9px", letterSpacing:"0.15em", textTransform:"uppercase", transition:"all 0.15s", flexShrink:0,
            }}>{t}</button>
          ))}
        </div>

        {/* Global search */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="⌕  Search persons, offices..."
            style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${q?C.green+"66":C.border}`, borderRadius:"6px", padding:"5px 10px 5px 10px", color:C.text, fontSize:"10px", width:"200px", fontFamily:"monospace" }}/>
          {q && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:100, background:"#0e1117", border:`1px solid ${C.border}`, borderRadius:"6px", marginTop:"4px", maxHeight:"200px", overflowY:"auto" }}>
              {searchResults.map(p => (
                <div key={p.id} onClick={()=>{ setSelected(p); setTab("persons"); setQ(""); }} style={{ padding:"8px 12px", borderBottom:`1px solid ${C.border}`, cursor:"pointer" }} className="row">
                  <div style={{ fontSize:"11px", color:C.text }}>{p.name}</div>
                  <div style={{ fontSize:"9px", color:C.muted }}>{p.office}</div>
                </div>
              ))}
              {searchResults.length === 0 && <div style={{ padding:"10px", fontSize:"10px", color:C.muted }}>No results</div>}
            </div>
          )}
        </div>

        {/* Alert + live indicators */}
        {atThresh.length > 0 && (
          <div onClick={()=>setTab("admin")} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"9px", color:C.orange, cursor:"pointer", animation:"shimmer 2s infinite", flexShrink:0 }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.orange, animation:"blink 0.8s infinite", display:"inline-block" }}/>
            {atThresh.length} ESCALATE
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"9px", color:C.green, flexShrink:0 }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.green, animation:"pulse 2s infinite", display:"inline-block" }}/>
          LIVE
        </div>
        <button onClick={()=>setOracle(o=>!o)} style={{ background:showOracle?"rgba(0,230,118,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${showOracle?C.green+"44":C.border}`, borderRadius:"5px", color:showOracle?C.green:C.muted, padding:"4px 10px", cursor:"pointer", fontSize:"9px", letterSpacing:"0.1em", flexShrink:0 }}>
          ORACLE {showOracle?"▶":"◀"}
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px", display:"flex", flexDirection:"column", gap:"12px", minWidth:0 }}>

          {/* ════ COMMAND ════ */}
          {tab==="command" && (<>
            {/* KPIs */}
            <div style={{ display:"flex", gap:"10px" }}>
              <KPI label="TOTAL REPORTS"    value={totR}  sub={`↑29 today`}           color={C.blue}   delay={0}   icon="📊"/>
              <KPI label="VERIFIED REPORTS" value={totV}  sub={`${vRate}% rate`}       color={C.green}  delay={150} icon="✓"/>
              <KPI label="INVESTIGATIONS"   value={invN}  sub={`+${courtN} court`}     color={C.orange} delay={300} icon="⚖"/>
              <KPI label="COURT CASES"      value={courtN}sub="Tesfaye Bekele"         color={C.red}    delay={450} icon="🏛"/>
              <KPI label="AI FLAGGED"       value={3}     sub="images rejected"        color={C.purple} delay={600} icon="🤖"/>
              <KPI label="DEDUP BLOCKS"     value={18}    sub="prevented spam"         color={C.gold}   delay={750} icon="🛡"/>
            </div>

            <div style={{ display:"flex", gap:"12px", flex:1 }}>
              {/* Left col */}
              <div style={{ display:"flex", flexDirection:"column", gap:"12px", width:"320px", flexShrink:0 }}>

                {/* Top accused */}
                <GlowPanel>
                  <PanelHeader title="▸ MOST ACCUSED — LIVE RANKING"/>
                  <div>
                    {PERSONS.slice(0,8).map((p,i) => (
                      <div key={p.id} className="row" onClick={()=>{ setSelected(p); setTab("persons"); }} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 14px", borderBottom:`1px solid ${C.border}`, transition:"background 0.15s" }}>
                        <span style={{ fontSize:"9px", color:i<3?C.gold:C.muted, width:"16px", textAlign:"right", fontWeight:i<3?"800":"400" }}>#{i+1}</span>
                        <RiskGauge score={p.riskScore} size={36}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"11px", color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                          <div style={{ fontSize:"9px", color:C.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.office}</div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"3px", flexShrink:0 }}>
                          <span style={{ fontSize:"12px", color:C.green, fontWeight:"800" }}>{p.verified}</span>
                          <Badge status={getStatus(p)}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlowPanel>

                {/* Live feed */}
                <GlowPanel style={{ flex:1 }}>
                  <PanelHeader title="▸ LIVE EVENT STREAM" right={<span style={{ fontSize:"8px", color:C.green, animation:"blink 1s infinite" }}>● LIVE</span>}/>
                  <div ref={feedRef} style={{ height:"260px", overflowY:"auto", padding:"4px 0" }}>
                    {events.map((e,i) => (
                      <div key={i} style={{ display:"flex", gap:"8px", padding:"5px 12px", borderBottom:`1px solid rgba(255,255,255,0.025)`, animation:i===0?"fadeIn 0.3s ease-out":"none" }}>
                        <span style={{ fontSize:"8px", color:C.muted, flexShrink:0, paddingTop:"1px", fontFamily:"monospace" }}>{e.ts}</span>
                        <span style={{ fontSize:"8px", fontWeight:"700", color:LVL_C[e.lvl]||C.muted, flexShrink:0, width:"30px" }}>{e.lvl}</span>
                        <span style={{ fontSize:"9px", color:C.muted2, lineHeight:"1.5" }}>{e.msg}</span>
                      </div>
                    ))}
                  </div>
                </GlowPanel>
              </div>

              {/* Center col */}
              <div style={{ display:"flex", flexDirection:"column", gap:"12px", flex:1, minWidth:0 }}>
                <GlowPanel>
                  <PanelHeader title="▸ REPORT VELOCITY — 16 DAYS"/>
                  <div style={{ padding:"12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={170}>
                      <AreaChart data={TREND_DATA} margin={{ top:0,right:4,left:-24,bottom:0 }}>
                        <defs>
                          <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                          <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.4}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="d" tick={{ fill:C.muted, fontSize:8 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:C.muted, fontSize:8 }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ background:"#0e1117", border:`1px solid ${C.border}`, borderRadius:"6px", fontSize:"10px" }}/>
                        <Area type="monotone" dataKey="r" stroke={C.blue}  fill="url(#gT)" strokeWidth={1.5} name="Total"    dot={false}/>
                        <Area type="monotone" dataKey="v" stroke={C.green} fill="url(#gV)" strokeWidth={1.5} name="Verified" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlowPanel>

                {/* 2-col charts */}
                <div style={{ display:"flex", gap:"12px", flex:1 }}>
                  <GlowPanel style={{ flex:1 }}>
                    <PanelHeader title="▸ CORRUPTION TYPES"/>
                    <div style={{ padding:"10px 12px" }}>
                      {CORRUPTION_TYPES.map((t,i) => (
                        <div key={t.t} style={{ marginBottom:"9px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                            <span style={{ fontSize:"9px", color:C.muted2 }}>{t.t}</span>
                            <span style={{ fontSize:"9px", color:t.c, fontWeight:"700" }}>{t.n}</span>
                          </div>
                          <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px" }}>
                            <div style={{ height:"100%", width:`${(t.n/54)*100}%`, background:t.c, borderRadius:"2px", boxShadow:`0 0 6px ${t.c}88`, transition:"width 1s ease" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlowPanel>

                  <GlowPanel style={{ flex:1 }}>
                    <PanelHeader title="▸ REGIONAL HOTSPOTS"/>
                    <div style={{ padding:"10px 12px" }}>
                      {[["Addis Ababa",127,54,C.red],["Oromia",43,18,C.orange],["Amhara",28,12,C.gold],["SNNPR",19,8,C.green],["Tigray",11,5,C.blue],["Other",8,3,C.muted2]].map(([r,n,pct,c]) => (
                        <div key={r} style={{ marginBottom:"10px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                            <span style={{ fontSize:"9px", color:C.muted2 }}>{r}</span>
                            <span style={{ fontSize:"9px", color:c, fontWeight:"700" }}>{n}</span>
                          </div>
                          <div style={{ height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:"2px", boxShadow:`0 0 6px ${c}66` }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlowPanel>
                </div>
              </div>
            </div>
          </>)}

          {/* ════ PERSONS ════ */}
          {tab==="persons" && (
            <div style={{ display:"flex", gap:"12px" }}>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"10px", minWidth:0 }}>
                {/* Filters */}
                <div style={{ display:"flex", gap:"6px", alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:"9px", color:C.muted }}>SEV:</span>
                  {["All","Critical","High","Medium","Low"].map(s=>(
                    <button key={s} className="pill" onClick={()=>setFilterSev(s)} style={{ fontSize:"8px",padding:"2px 8px",borderRadius:"3px",cursor:"pointer",background:filterSev===s?(SEV_C[s]||C.green)+"22":"transparent",color:filterSev===s?(SEV_C[s]||C.green):C.muted,border:`1px solid ${filterSev===s?(SEV_C[s]||C.green)+"44":C.border}`,fontFamily:"monospace" }}>{s}</button>
                  ))}
                  <span style={{ fontSize:"9px", color:C.muted, marginLeft:"8px" }}>STATUS:</span>
                  {["All","Monitoring","Under Review","Investigation","Court"].map(s=>(
                    <button key={s} className="pill" onClick={()=>setFilterSt(s)} style={{ fontSize:"8px",padding:"2px 8px",borderRadius:"3px",cursor:"pointer",background:filterSt===s?"rgba(0,230,118,0.12)":"transparent",color:filterSt===s?C.green:C.muted,border:`1px solid ${filterSt===s?C.green+"44":C.border}`,fontFamily:"monospace" }}>{s}</button>
                  ))}
                  <span style={{ fontSize:"9px", color:C.muted, marginLeft:"auto" }}>SORT:</span>
                  {["verified","reports","riskScore"].map(s=>(
                    <button key={s} className="pill" onClick={()=>setSortBy(s)} style={{ fontSize:"8px",padding:"2px 8px",borderRadius:"3px",cursor:"pointer",background:sortBy===s?"rgba(56,189,248,0.12)":"transparent",color:sortBy===s?C.blue:C.muted,border:`1px solid ${sortBy===s?C.blue+"44":C.border}`,fontFamily:"monospace" }}>{s.toUpperCase()}</button>
                  ))}
                </div>

                {/* Table */}
                <GlowPanel style={{ flex:1 }}>
                  <PanelHeader title={`▸ ACCUSED REGISTRY — ${persons.length} RECORDS`}/>
                  <div style={{ overflowY:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                          {["","RISK","NAME","OFFICE","REPORTS","VERIFIED","RATING","SEV","STATUS","TREND",""].map((h,i)=>(
                            <th key={i} style={{ padding:"7px 10px", textAlign:"left", fontSize:"8px", color:C.muted, letterSpacing:"0.12em", fontWeight:"600", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {persons.map((p,i) => {
                          const st = getStatus(p);
                          const isExp = expanded===p.id;
                          const isSel = selected?.id===p.id;
                          return (<>
                            <tr key={p.id} className="row" onClick={()=>{ setSelected(isSel?null:p); setExpanded(isExp?null:p.id); }} style={{ background:isSel?"rgba(0,230,118,0.05)":"transparent", borderBottom:isExp?`1px solid ${C.green}22`:`1px solid ${C.border}`, borderLeft:isSel?`3px solid ${C.green}`:"3px solid transparent", transition:"all 0.15s" }}>
                              <td style={{ padding:"9px 10px", fontSize:"9px", color:C.muted }}>#{i+1}</td>
                              <td style={{ padding:"9px 10px" }}><RiskGauge score={p.riskScore} size={38}/></td>
                              <td style={{ padding:"9px 10px" }}>
                                <div style={{ fontSize:"11px", color:C.text, whiteSpace:"nowrap" }}>{p.name}</div>
                                <div style={{ fontSize:"8px", color:C.muted }}>{p.title}</div>
                              </td>
                              <td style={{ padding:"9px 10px", fontSize:"9px", color:C.muted2, maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.office}</td>
                              <td style={{ padding:"9px 10px", fontSize:"13px", color:C.blue,  fontWeight:"800" }}>{p.reports}</td>
                              <td style={{ padding:"9px 10px", fontSize:"13px", color:C.green, fontWeight:"800" }}>{p.verified}</td>
                              <td style={{ padding:"9px 10px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                                  <div style={{ width:"40px",height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px" }}>
                                    <div style={{ height:"100%",width:`${p.rating*10}%`,background:p.rating>7?C.green:p.rating>5?C.gold:C.red,borderRadius:"2px",boxShadow:`0 0 5px ${p.rating>7?C.green:p.rating>5?C.gold:C.red}88` }}/>
                                  </div>
                                  <span style={{ fontSize:"9px", color:C.muted2 }}>{p.rating}</span>
                                </div>
                              </td>
                              <td style={{ padding:"9px 10px" }}><span style={{ fontSize:"9px", color:SEV_C[p.severity], display:"flex", alignItems:"center" }}><SevDot s={p.severity}/>{p.severity}</span></td>
                              <td style={{ padding:"9px 10px" }}><Badge status={st}/></td>
                              <td style={{ padding:"9px 10px", fontSize:"10px", fontWeight:"700", color:p.trend>0?C.green:p.trend<0?C.red:C.muted }}>{p.trend>0?`↑+${p.trend}`:p.trend<0?`↓${p.trend}`:"—"}</td>
                              <td style={{ padding:"9px 10px" }}>
                                <div style={{ display:"flex", gap:"4px" }}>
                                  <button onClick={e=>{e.stopPropagation();escalate(p,"Investigation");}} style={{ fontSize:"8px",padding:"2px 6px",borderRadius:"3px",cursor:"pointer",background:"rgba(255,124,42,0.1)",color:C.orange,border:`1px solid ${C.orange}33` }}>↑</button>
                                  <button onClick={e=>{e.stopPropagation();setCompare(p);}} style={{ fontSize:"8px",padding:"2px 6px",borderRadius:"3px",cursor:"pointer",background:C.dim,color:C.muted,border:`1px solid ${C.border}` }}>⇌</button>
                                </div>
                              </td>
                            </tr>
                            {isExp && (
                              <tr key={`exp${p.id}`} style={{ background:"rgba(0,230,118,0.02)", borderBottom:`1px solid ${C.border}` }}>
                                <td colSpan={11} style={{ padding:"14px 60px" }}>
                                  <div style={{ display:"flex", gap:"24px" }}>
                                    {[["Phone",p.phone],["Region",p.region],["Amounts",p.amounts],["Last Report",p.lastReport],["Dedup Blocks",p.dedupBlocked]].map(([k,v])=>(
                                      <div key={k}><div style={{ fontSize:"8px", color:C.muted, marginBottom:"3px" }}>{k}</div><div style={{ fontSize:"10px", color:C.text }}>{v}</div></div>
                                    ))}
                                    <div style={{ display:"flex", gap:"8px" }}>
                                      <div style={{ padding:"5px 10px", borderRadius:"4px", background:p.imageVerified?"rgba(0,230,118,0.08)":"rgba(255,68,68,0.08)", border:`1px solid ${p.imageVerified?C.green:C.red}33`, fontSize:"8px", color:p.imageVerified?C.green:C.red }}>{p.imageVerified?"✓ EXIF OK":"✗ EXIF UNVERIFIED"}</div>
                                      <div style={{ padding:"5px 10px", borderRadius:"4px", background:p.aiFlag?"rgba(167,139,250,0.1)":"rgba(0,230,118,0.08)", border:`1px solid ${p.aiFlag?C.purple:C.green}33`, fontSize:"8px", color:p.aiFlag?C.purple:C.green }}>{p.aiFlag?"⚠ AI FLAGGED":"✓ AI CLEAR"}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>);
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlowPanel>
              </div>

              {/* Side detail + compare */}
              {(selected || compare) && (
                <div style={{ width:"280px", flexShrink:0, display:"flex", flexDirection:"column", gap:"10px" }}>
                  {selected && (
                    <GlowPanel color={C.green}>
                      <PanelHeader title="▸ INTEL FILE" right={<button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"14px" }}>✕</button>}/>
                      <div style={{ padding:"14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
                          <RiskGauge score={selected.riskScore} size={52}/>
                          <div><div style={{ fontSize:"13px", color:C.text, fontWeight:"700" }}>{selected.name}</div><div style={{ fontSize:"9px", color:C.gold }}>{selected.title}</div><div style={{ fontSize:"9px", color:C.muted }}>{selected.office}</div></div>
                        </div>
                        <div style={{ display:"flex", gap:"6px", marginBottom:"12px", flexWrap:"wrap" }}><Badge status={getStatus(selected)}/><span style={{ fontSize:"9px", color:SEV_C[selected.severity], display:"flex", alignItems:"center" }}><SevDot s={selected.severity}/>{selected.severity}</span></div>
                        {[["Reports",selected.reports,C.blue],["Verified",selected.verified,C.green],["Rating",`${selected.rating}/10`,selected.rating>7?C.green:C.gold],["Region",selected.region,C.muted2],["Phone",selected.phone,C.muted2],["Amounts",selected.amounts,C.muted2],["Dedup Blocks",selected.dedupBlocked,C.orange]].map(([k,v,c])=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, padding:"5px 0" }}>
                            <span style={{ fontSize:"9px", color:C.muted }}>{k}</span>
                            <span style={{ fontSize:"9px", color:c, fontWeight:"600" }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ marginTop:"10px", display:"flex", flexDirection:"column", gap:"5px" }}>
                          <div style={{ fontSize:"8px", color:C.muted, marginBottom:"3px" }}>ESCALATE TO →</div>
                          {["Under Review","Investigation","Court","Cleared"].map(s=>(
                            <button key={s} onClick={()=>escalate(selected,s)} style={{ padding:"6px",borderRadius:"4px",cursor:"pointer",fontSize:"9px",background:STATUS_CFG[s]?.bg||C.dim,color:STATUS_CFG[s]?.c||C.muted,border:`1px solid ${STATUS_CFG[s]?.c||C.border}33`,fontFamily:"monospace" }}>→ {s.toUpperCase()}</button>
                          ))}
                        </div>
                      </div>
                    </GlowPanel>
                  )}
                  {compare && (
                    <GlowPanel color={C.gold}>
                      <PanelHeader title="▸ COMPARE" right={<button onClick={()=>setCompare(null)} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"14px" }}>✕</button>}/>
                      <div style={{ padding:"12px" }}>
                        <div style={{ fontSize:"9px", color:C.gold, marginBottom:"8px" }}>vs. {selected?.name || "Select a person"}</div>
                        {selected && (
                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead><tr><th style={{ fontSize:"8px",color:C.muted,padding:"4px 6px",textAlign:"left" }}>METRIC</th><th style={{ fontSize:"8px",color:C.green,padding:"4px 6px" }}>{selected.name.split(" ")[0]}</th><th style={{ fontSize:"8px",color:C.gold,padding:"4px 6px" }}>{compare.name.split(" ")[0]}</th></tr></thead>
                            <tbody>
                              {[["Verified",selected.verified,compare.verified],["Rating",selected.rating,compare.rating],["Risk",selected.riskScore,compare.riskScore],["Reports",selected.reports,compare.reports]].map(([m,a,b])=>(
                                <tr key={m} style={{ borderTop:`1px solid ${C.border}` }}>
                                  <td style={{ fontSize:"9px",color:C.muted,padding:"5px 6px" }}>{m}</td>
                                  <td style={{ fontSize:"10px",color:a>b?C.red:C.green,textAlign:"center",fontWeight:"700",padding:"5px 6px" }}>{a}</td>
                                  <td style={{ fontSize:"10px",color:b>a?C.red:C.green,textAlign:"center",fontWeight:"700",padding:"5px 6px" }}>{b}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </GlowPanel>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ NETWORK ════ */}
          {tab==="network" && (
            <GlowPanel style={{ flex:1, height:"calc(100vh - 100px)" }}>
              <PanelHeader title="▸ CORRUPTION NETWORK — PERSON ↔ OFFICE RELATIONSHIPS" right={<span style={{ fontSize:"9px", color:C.muted }}>Drag · Scroll to zoom · Click person node</span>}/>
              <div style={{ height:"calc(100% - 40px)" }}>
                <NetworkGraph persons={PERSONS} onSelect={p=>{ setSelected(p); setTab("persons"); }}/>
              </div>
              <div style={{ padding:"8px 16px", borderTop:`1px solid ${C.border}`, display:"flex", gap:"16px" }}>
                {[["Person node",C.red,"Sized by verified count"],["Person node",C.orange,""],["Office node",C.blue,"Click person to open file"]].slice(0,2).map(([l,c,d],i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"9px", color:C.muted }}>
                    <div style={{ width:"10px",height:"10px",borderRadius:"50%",background:c+"33",border:`2px solid ${c}` }}/>
                    {l} — {d}
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"9px", color:C.muted }}>
                  <div style={{ width:"10px",height:"10px",borderRadius:"50%",background:C.blue+"33",border:`2px solid ${C.blue}` }}/>Office node
                </div>
              </div>
            </GlowPanel>
          )}

          {/* ════ EVIDENCE ════ */}
          {tab==="evidence" && (
            <GlowPanel>
              <PanelHeader title="▸ IMAGE FORENSIC QUEUE — EXIF · AI DETECTION · AUTHENTICITY"/>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {["TIP ID","PERSON","SUBMITTED","EXIF DATE","DELTA","AI SCORE","STATUS","CLAUDE ANALYSIS","ACTION"].map(h=>(
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:"8px", color:C.muted, letterSpacing:"0.12em" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    {id:"TIP-KM4XP9RZ",p:"Tesfaye Bekele",   sub:"Apr 10",exif:"Apr 10",delta:"0d", ai:0.04,st:"VERIFIED",  claude:"Receipt + cash — high relevance"},
                    {id:"TIP-LQ8RT2XW",p:"Abebe Girma",      sub:"Apr 10",exif:"Apr 10",delta:"0d", ai:0.91,st:"AI FLAGGED",claude:"Midjourney artifacts detected"},
                    {id:"TIP-AB2CD3EF",p:"Mulugeta Haile",   sub:"Apr 9", exif:"Mar 26",delta:"14d",ai:0.12,st:"EXIF WARN", claude:"Office interior — moderate relevance"},
                    {id:"TIP-NZ7YQ3MV",p:"Selamawit Tadesse",sub:"Apr 9", exif:"Apr 8", delta:"1d", ai:0.08,st:"VERIFIED",  claude:"Land document visible — high relevance"},
                    {id:"TIP-XY9WZ1TK",p:"Dawit Worku",      sub:"Apr 8", exif:"Apr 8", delta:"0d", ai:0.03,st:"VERIFIED",  claude:"Procurement form — high relevance"},
                    {id:"TIP-PP3RQ7ZA",p:"Hiwot Kebede",     sub:"Apr 7", exif:"N/A",   delta:"N/A",ai:0.73,st:"AI FLAGGED",claude:"Stable Diffusion patterns likely"},
                  ].map(r => {
                    const c = r.st==="AI FLAGGED"?C.purple:r.st==="EXIF WARN"?C.orange:C.green;
                    return (
                      <tr key={r.id} className="row" style={{ borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:"9px 12px", fontSize:"9px", color:C.blue, fontFamily:"monospace" }}>{r.id}</td>
                        <td style={{ padding:"9px 12px", fontSize:"10px", color:C.text }}>{r.p}</td>
                        <td style={{ padding:"9px 12px", fontSize:"9px", color:C.muted }}>{r.sub}</td>
                        <td style={{ padding:"9px 12px", fontSize:"9px", color:C.muted }}>{r.exif}</td>
                        <td style={{ padding:"9px 12px", fontSize:"9px", color:r.delta!=="0d"&&r.delta!=="1d"?C.orange:C.muted }}>{r.delta}</td>
                        <td style={{ padding:"9px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                            <div style={{ width:"48px",height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"2px" }}>
                              <div style={{ height:"100%",width:`${r.ai*100}%`,background:r.ai>0.6?C.red:r.ai>0.3?C.orange:C.green,borderRadius:"2px" }}/>
                            </div>
                            <span style={{ fontSize:"8px", color:r.ai>0.6?C.red:r.ai>0.3?C.orange:C.green }}>{(r.ai*100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:"9px 12px" }}><span style={{ fontSize:"8px",padding:"2px 7px",borderRadius:"3px",color:c,background:`${c}18`,border:`1px solid ${c}33` }}>{r.st}</span></td>
                        <td style={{ padding:"9px 12px", fontSize:"9px", color:C.muted2, maxWidth:"160px" }}>{r.claude}</td>
                        <td style={{ padding:"9px 12px" }}><button style={{ fontSize:"8px",padding:"2px 8px",borderRadius:"3px",background:`${C.blue}18`,color:C.blue,border:`1px solid ${C.blue}33`,cursor:"pointer" }}>REVIEW</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlowPanel>
          )}

          {/* ════ PIPELINE ════ */}
          {tab==="pipeline" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ fontSize:"9px", color:C.muted }}>INVESTIGATION PIPELINE — Click ADVANCE to move cases forward. All moves logged in evidence ledger.</div>
              <div style={{ display:"flex", gap:"10px", overflowX:"auto", paddingBottom:"8px" }}>
                {["Monitoring","Under Review","Investigation","Court","Cleared"].map(stage => {
                  const sp = PERSONS.filter(p=>getStatus(p)===stage);
                  const sc = STATUS_CFG[stage]?.c||C.muted;
                  return (
                    <div key={stage} style={{ flex:"0 0 210px", display:"flex", flexDirection:"column", gap:"8px" }}>
                      <div style={{ padding:"10px 12px", background:C.panel, border:`1px solid ${sc}33`, borderRadius:"8px", borderTop:`3px solid ${sc}`, boxShadow:`0 0 20px ${sc}0a` }}>
                        <div style={{ fontSize:"9px", color:sc, letterSpacing:"0.12em", fontWeight:"700" }}>{stage.toUpperCase()}</div>
                        <div style={{ fontSize:"22px", color:C.text, fontWeight:"800", fontFamily:"monospace" }}>{sp.length}</div>
                      </div>
                      {sp.map(p=>(
                        <div key={p.id} style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"11px", borderLeft:`3px solid ${SEV_C[p.severity]}` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                            <RiskGauge score={p.riskScore} size={34}/>
                            <div><div style={{ fontSize:"10px", color:C.text, fontWeight:"600" }}>{p.name.split(" ")[0]} {p.name.split(" ")[1]?.[0]}.</div><div style={{ fontSize:"8px", color:C.muted }}>{p.verified} verified</div></div>
                          </div>
                          <div style={{ fontSize:"8px", color:C.muted, marginBottom:"8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.office}</div>
                          <div style={{ display:"flex", gap:"4px" }}>
                            {stage!=="Court"&&stage!=="Cleared" && (
                              <button onClick={()=>{ const stages=["Monitoring","Under Review","Investigation","Court"]; const next=stages[stages.indexOf(stage)+1]; if(next) escalate(p,next); }} style={{ flex:1,fontSize:"8px",padding:"4px",borderRadius:"3px",cursor:"pointer",background:`${sc}18`,color:sc,border:`1px solid ${sc}33`,fontFamily:"monospace" }}>→ ADVANCE</button>
                            )}
                            <button onClick={()=>{ setSelected(p); setTab("persons"); }} style={{ fontSize:"8px",padding:"4px 8px",borderRadius:"3px",cursor:"pointer",background:C.dim,color:C.muted,border:`1px solid ${C.border}` }}>⋯</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ ANALYTICS ════ */}
          {tab==="analytics" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ display:"flex", gap:"12px" }}>
                <GlowPanel style={{ flex:2 }}>
                  <PanelHeader title="▸ REPORT VELOCITY + VERIFICATION RATE"/>
                  <div style={{ padding:"12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={TREND_DATA} margin={{ top:0,right:4,left:-24,bottom:0 }}>
                        <defs>
                          <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                          <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.4}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="d" tick={{ fill:C.muted,fontSize:8 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:C.muted,fontSize:8 }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ background:"#0e1117",border:`1px solid ${C.border}`,borderRadius:"6px",fontSize:"10px" }}/>
                        <Area type="monotone" dataKey="r" stroke={C.blue}  fill="url(#ga1)" strokeWidth={1.5} name="Total"    dot={false}/>
                        <Area type="monotone" dataKey="v" stroke={C.green} fill="url(#ga2)" strokeWidth={1.5} name="Verified" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlowPanel>
                <GlowPanel style={{ flex:1 }}>
                  <PanelHeader title="▸ SEVERITY DISTRIBUTION"/>
                  <div style={{ padding:"12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={[{n:"Critical",v:47,c:C.red},{n:"High",v:97,c:C.orange},{n:"Medium",v:73,c:C.gold},{n:"Low",v:16,c:C.green}]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="v" strokeWidth={0}>
                          {[C.red,C.orange,C.gold,C.green].map((c,i)=><Cell key={i} fill={c}/>)}
                        </Pie>
                        <Tooltip contentStyle={{ background:"#0e1117",border:`1px solid ${C.border}`,fontSize:"10px" }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </GlowPanel>
              </div>
              <div style={{ display:"flex", gap:"12px" }}>
                <GlowPanel style={{ flex:1 }}>
                  <PanelHeader title="▸ REPORTS BY OFFICE"/>
                  <div style={{ padding:"12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={OFFICE_DATA} layout="vertical" margin={{ top:0,right:8,left:0,bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                        <XAxis type="number" tick={{ fill:C.muted,fontSize:8 }} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="o" tick={{ fill:C.muted2,fontSize:8 }} axisLine={false} tickLine={false} width={80}/>
                        <Tooltip contentStyle={{ background:"#0e1117",border:`1px solid ${C.border}`,fontSize:"10px" }}/>
                        <Bar dataKey="r" fill={C.green} radius={[0,3,3,0]} name="Reports"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlowPanel>
                <GlowPanel style={{ flex:1 }}>
                  <PanelHeader title="▸ TIME OF DAY PATTERN"/>
                  <div style={{ padding:"12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={[{h:"00",v:3},{h:"03",v:1},{h:"06",v:8},{h:"09",v:24},{h:"12",v:31},{h:"15",v:28},{h:"18",v:19},{h:"21",v:9}]} margin={{ top:0,right:4,left:-24,bottom:0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="h" tick={{ fill:C.muted,fontSize:8 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fill:C.muted,fontSize:8 }} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{ background:"#0e1117",border:`1px solid ${C.border}`,fontSize:"10px" }}/>
                        <Bar dataKey="v" fill={C.blue} radius={[3,3,0,0]} name="Reports">
                          {[3,1,8,24,31,28,19,9].map((_,i)=><Cell key={i} fill={`hsl(${200+i*8},70%,50%)`}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlowPanel>
              </div>
            </div>
          )}

          {/* ════ ADMIN ════ */}
          {tab==="admin" && (
            <div style={{ display:"flex", gap:"12px" }}>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"12px" }}>
                <GlowPanel>
                  <PanelHeader title="▸ INVESTIGATION THRESHOLD ENGINE"/>
                  <div style={{ padding:"20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px" }}>
                      <input type="range" min={5} max={50} value={threshold} onChange={e=>setThreshold(+e.target.value)} style={{ flex:1 }}/>
                      <div style={{ fontSize:"42px", color:C.green, fontWeight:"800", fontFamily:"monospace", lineHeight:1, textShadow:`0 0 30px ${C.green}66`, minWidth:"60px", textAlign:"right" }}>{threshold}</div>
                    </div>
                    <div style={{ fontSize:"9px", color:C.muted, marginBottom:"16px" }}>
                      Persons with ≥ <span style={{ color:C.green }}>{threshold}</span> verified reports trigger escalation alert. Currently: <span style={{ color:atThresh.length>0?C.orange:C.green }}>{atThresh.length} person(s) at threshold</span>
                    </div>
                    {atThresh.length > 0 && (
                      <div style={{ background:"rgba(255,124,42,0.06)", border:`1px solid ${C.orange}33`, borderRadius:"8px", padding:"14px" }}>
                        <div style={{ fontSize:"9px", color:C.orange, fontWeight:"700", marginBottom:"10px" }}>⚠ READY FOR ESCALATION</div>
                        {atThresh.map(p=>(
                          <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}><RiskGauge score={p.riskScore} size={36}/><div><div style={{ fontSize:"11px", color:C.text }}>{p.name}</div><div style={{ fontSize:"9px", color:C.muted }}>{p.verified} verified · {p.office}</div></div></div>
                            <button onClick={()=>escalate(p,"Investigation")} style={{ fontSize:"9px",padding:"6px 14px",borderRadius:"4px",cursor:"pointer",background:`${C.orange}20`,color:C.orange,border:`1px solid ${C.orange}44`,fontFamily:"monospace",fontWeight:"700" }}>TRIGGER INVESTIGATION</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlowPanel>

                <GlowPanel>
                  <PanelHeader title="▸ AGENCY AUTO-ROUTING"/>
                  <div style={{ padding:"14px" }}>
                    {[
                      {a:"FEACC",          c:"959 · feaccdars.gov.et", t:"All corruption types",    on:true },
                      {a:"EHRC",           c:"1488",                   t:"Human rights violations",  on:true },
                      {a:"Ombudsman",      c:"6060",                   t:"Abuse of power",           on:true },
                      {a:"Federal Police", c:"911",                    t:"Extortion + violence",     on:false},
                      {a:"Attorney General",c:"Direct API",            t:"Court referrals",          on:false},
                    ].map(r=>(
                      <div key={r.a} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ width:"32px", height:"18px", borderRadius:"9px", background:r.on?C.green:"rgba(255,255,255,0.06)", position:"relative", cursor:"pointer", flexShrink:0 }}>
                          <div style={{ position:"absolute", top:"2px", left:r.on?"15px":"2px", width:"14px", height:"14px", borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:r.on?`0 0 6px ${C.green}`:"none" }}/>
                        </div>
                        <div style={{ flex:1 }}><div style={{ fontSize:"10px", color:C.text }}>{r.a}</div><div style={{ fontSize:"8px", color:C.muted }}>{r.t} · {r.c}</div></div>
                        <span style={{ fontSize:"8px", color:r.on?C.green:C.muted }}>{r.on?"ACTIVE":"INACTIVE"}</span>
                      </div>
                    ))}
                  </div>
                </GlowPanel>
              </div>

              <div style={{ width:"260px", flexShrink:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                <GlowPanel>
                  <PanelHeader title="▸ SYSTEM STATUS"/>
                  <div style={{ padding:"12px" }}>
                    {[["Telegram Bot",true],["Whisper STT",true],["Claude AI",true],["Hive Detection",true],["EXIF Forensics",true],["Dedup Engine",true],["Evidence Ledger",true],["FEACC Routing",false],["SMS Fallback",false],["Dashboard API",true]].map(([l,ok])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
                        <span style={{ fontSize:"9px", color:C.muted2 }}>{l}</span>
                        <span style={{ fontSize:"8px", color:ok?C.green:C.muted, display:"flex", alignItems:"center", gap:"4px" }}>
                          <span style={{ width:"4px",height:"4px",borderRadius:"50%",background:ok?C.green:C.muted,display:"inline-block",animation:ok?"blink 2s infinite":"none" }}/>
                          {ok?"ONLINE":"OFFLINE"}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlowPanel>
                <GlowPanel>
                  <PanelHeader title="▸ EVIDENCE LEDGER"/>
                  <div style={{ padding:"12px", fontSize:"9px", color:C.muted, lineHeight:"1.9" }}>
                    Sealed blocks: <span style={{ color:C.green }}>233</span><br/>
                    Last hash: <span style={{ color:C.blue, fontFamily:"monospace" }}>a4f9c2b1...</span><br/>
                    Chain intact: <span style={{ color:C.green }}>✓ Verified</span><br/>
                    Court-ready: <span style={{ color:C.green }}>✓ Yes</span><br/>
                    <br/>
                    <span style={{ color:C.muted, fontSize:"8px" }}>All tips cryptographically sealed. Each block references the previous hash. Tamper-evident for legal proceedings.</span>
                  </div>
                </GlowPanel>
              </div>
            </div>
          )}
        </div>

        {/* ── ORACLE SIDEBAR ── */}
        {showOracle && (
          <div style={{ width:"300px", flexShrink:0, borderLeft:`1px solid ${C.border}`, background:"rgba(0,230,118,0.015)", display:"flex", flexDirection:"column" }}>
            <OraclePanel threshold={threshold} setThreshold={setThreshold}/>
          </div>
        )}
      </div>
    </div>
  );
}
