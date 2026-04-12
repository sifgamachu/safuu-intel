import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Language metadata ───────────────────────────────────────────────────────
const LANG_META = {
  am: { label:"Amharic",   native:"አማርኛ",        flag:"🇪🇹", script:"Ethiopic" },
  ti: { label:"Tigrinya",  native:"ትግርኛ",         flag:"🇪🇹", script:"Ethiopic" },
  or: { label:"Oromiffa",  native:"Oromiffa",      flag:"🇪🇹", script:"Latin"    },
  so: { label:"Somali",    native:"Soomaali",      flag:"🇪🇹", script:"Latin"    },
  af: { label:"Afar",      native:"Qafar",         flag:"🇪🇹", script:"Latin"    },
  si: { label:"Sidama",    native:"Sidaamu Afoo",  flag:"🇪🇹", script:"Latin"    },
  wo: { label:"Wolaytta",  native:"Wolayttatto",   flag:"🇪🇹", script:"Latin"    },
  ha: { label:"Hadiyya",   native:"Hadiyyissa",    flag:"🇪🇹", script:"Latin"    },
  da: { label:"Dawro",     native:"Dawro",         flag:"🇪🇹", script:"Latin"    },
  ga: { label:"Gamo",      native:"Gamo",          flag:"🇪🇹", script:"Latin"    },
  be: { label:"Bench",     native:"Bench",         flag:"🇪🇹", script:"Latin"    },
  en: { label:"English",   native:"English",       flag:"🇬🇧", script:"Latin"    },
  mix:{ label:"Mixed",     native:"Mixed",         flag:"🇪🇹", script:"Mixed"    },
};

// ─── Mock enriched report data with notes ────────────────────────────────────
const REPORTS = [
  {
    tip_id:"TIP-KM4XP9RZ", person:"Tesfaye Bekele", office:"Ministry of Land",
    date:"2026-04-10", input_type:"text", severity:"Critical",
    corruption_type:"Land Fraud", is_verified:1, ai_flagged:0, exif_verified:1,
    notes_language:"am",
    notes:"ይህ ሰው ከስድስት ወር በፊትም ጉቦ ጠይቆኛል። ቢሮ ውስጥ ሌሎች ሰዎች ሲናገሩ ሰምቻለሁ። ሌሎቹ ሰዎችም ትክክለኛ ደረሰኝ እንዳልተሰጣቸው ይናገራሉ። ምስክሮች አሉ።",
  },
  {
    tip_id:"TIP-LQ8RT2XW", person:"Abebe Girma", office:"Federal Police Commission",
    date:"2026-04-10", input_type:"voice", severity:"High",
    corruption_type:"Extortion", is_verified:1, ai_flagged:0, exif_verified:1,
    notes_language:"or",
    notes:"Nama kana duraan baay tee mul irratti argineerra. Yeroo heddu daandii irratti dhaabbatee lacag gaafata. Namoonni biroo itti himachuuf sodaatu. Lakkoofsa bilbilaa kana qabadhee jira garuu erguuf sodaadhe.",
  },
  {
    tip_id:"TIP-AB2CD3EF", person:"Mulugeta Haile", office:"Ethiopian Customs",
    date:"2026-04-08", input_type:"voice", severity:"High",
    corruption_type:"Customs Fraud", is_verified:1, ai_flagged:1, exif_verified:0,
    notes_language:"ti",
    notes:"ሓቂ እዩ ዝብለኒ ዘለኩ። ካልኦት ሰራሕተኛታት ናይ ጥልመት ተሳተፍቲ እዮም። ናይ ምስክር ሰብ ኣሎኒ ግን ስሙ ኣይሃቦን። ሓደ ወር ቅድሚ ኡ'ውን ተፈጺሙ ነይሩ።",
  },
  {
    tip_id:"TIP-NZ7YQ3MV", person:"Selamawit Tadesse", office:"Addis Ababa City Admin",
    date:"2026-04-09", input_type:"text", severity:"High",
    corruption_type:"Bid Rigging", is_verified:1, ai_flagged:0, exif_verified:0,
    notes_language:"en",
    notes:"This is not the first time. I know of at least three other contractors who lost bids in the same way. One of them has documentation. The pattern is always the same — the winning company submits late but still wins. Someone inside is leaking the other bids.",
  },
  {
    tip_id:"TIP-XY9WZ1TK", person:"Dawit Worku", office:"Ministry of Finance",
    date:"2026-04-07", input_type:"text", severity:"Medium",
    corruption_type:"Procurement Fraud", is_verified:1, ai_flagged:0, exif_verified:1,
    notes_language:"am",
    notes:"ሌሎች ሰዎችም ተመሳሳይ ችግር አጋጥሟቸዋል። የዛሬ ሦስት ወር ተመሳሳይ ነገር ሆኖ ነበር። ይህ ሰው ዘመዶቹን ይጠቅማል ብዬ አምናለሁ።",
  },
  {
    tip_id:"TIP-PP3RQ7ZA", person:"Tigist Alemu", office:"ERCA Revenue Authority",
    date:"2026-04-06", input_type:"voice", severity:"Medium",
    corruption_type:"Tax Evasion", is_verified:0, ai_flagged:0, exif_verified:0,
    notes_language:"or",
    notes:"Daandii biroo itti fufee hojjedha. Naannoo keessa nama beeku qabadhee jira. Poolisiin naannichaa beeka garuu hin deeggaru.",
  },
  {
    tip_id:"TIP-QR5ST8UV", person:"Yohannes Mesfin", office:"Federal First Instance Court",
    date:"2026-04-05", input_type:"text", severity:"Medium",
    corruption_type:"Bribery", is_verified:1, ai_flagged:0, exif_verified:1,
    notes_language:"am",
    notes:"ዳኛ ለመደለል ሞከረ። ጠበቃዬ ሁሉ ይህን ያውቃሉ ነገር ግን ለመናገር ይፈራሉ። ይህ ሁኔታ ለበርካታ ዓመታት ቀጥሏል።",
  },
  {
    tip_id:"TIP-MN2KP4RT", person:"Hiwot Kebede", office:"Ministry of Health",
    date:"2026-04-03", input_type:"voice", severity:"Medium",
    corruption_type:"Supply Theft", is_verified:1, ai_flagged:1, exif_verified:0,
    notes_language:"so",
    notes:"Waxaan arkay in daawooyinka laga bixiyo isbitaalka oo si qarsoodi ah loo iib geysto suuqa. Dadka sarifka ah ayaa ka qeyb qaata. Maalin kasta ayay samaynayaan.",
  },
];

// ─── Language stats ───────────────────────────────────────────────────────────
const langStats = Object.entries(
  REPORTS.reduce((acc, r) => {
    acc[r.notes_language] = (acc[r.notes_language] || 0) + 1;
    return acc;
  }, {})
).sort((a, b) => b[1] - a[1]);

const TREND = [
  { d:"Apr 4",  notes:2 },{ d:"Apr 5",  notes:4 },{ d:"Apr 6",  notes:3 },
  { d:"Apr 7",  notes:6 },{ d:"Apr 8",  notes:5 },{ d:"Apr 9",  notes:8 },
  { d:"Apr 10", notes:11 },
];

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  bg:"#07090f", panel:"rgba(255,255,255,0.03)",
  border:"rgba(255,255,255,0.07)", green:"#00e676",
  gold:"#f59e0b", red:"#ff4444", orange:"#ff7c2a",
  blue:"#38bdf8", purple:"#a78bfa",
  text:"rgba(255,255,255,0.85)", muted:"rgba(255,255,255,0.35)",
};

const SEV_C = { Critical:C.red, High:C.orange, Medium:C.gold, Low:C.green };
const LANG_C = { am:"#f59e0b", ti:"#38bdf8", or:"#00e676", so:"#a78bfa", af:"#ff7c2a", en:"#94a3b8", default:"#475569" };
function langColor(code) { return LANG_C[code] || LANG_C.default; }

// ─── Script badge ─────────────────────────────────────────────────────────────
function ScriptBadge({ code }) {
  const meta = LANG_META[code] || LANG_META.en;
  const c    = langColor(code);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"5px",
      fontSize:"9px", padding:"2px 8px", borderRadius:"10px",
      color:c, background:`${c}18`, border:`1px solid ${c}33`,
      fontFamily:"monospace", letterSpacing:"0.06em", whiteSpace:"nowrap",
    }}>
      {meta.flag} {meta.native}
      <span style={{ opacity:0.5 }}>· {meta.script}</span>
    </span>
  );
}

// ─── Notes card ───────────────────────────────────────────────────────────────
function NoteCard({ report, expanded, onToggle }) {
  const meta = LANG_META[report.notes_language] || LANG_META.en;
  const c    = langColor(report.notes_language);
  const isEthiopic = meta.script === "Ethiopic";

  return (
    <div onClick={onToggle} style={{
      background:C.panel, border:`1px solid ${C.border}`,
      borderLeft:`4px solid ${c}`,
      borderRadius:"10px", padding:"14px 16px",
      cursor:"pointer", transition:"all 0.15s",
      ...(expanded ? { background:`${c}08`, borderColor:`${c}44` } : {}),
    }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom: expanded?"12px":"0" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"4px" }}>
            <span style={{ fontSize:"10px", fontFamily:"monospace", color:C.blue }}>{report.tip_id}</span>
            <span style={{ fontSize:"9px", color:SEV_C[report.severity], fontFamily:"monospace" }}>⬤ {report.severity}</span>
            <span style={{ fontSize:"9px", color:C.muted, fontFamily:"monospace" }}>
              {report.input_type === "voice" ? "🎙️ voice" : "💬 text"}
            </span>
            <ScriptBadge code={report.notes_language}/>
          </div>
          <div style={{ fontSize:"12px", color:C.text, fontWeight:"600", marginBottom:"2px" }}>
            {report.office}
          </div>
          <div style={{ fontSize:"10px", color:C.muted }}>{report.date} · {report.corruption_type}</div>
        </div>

        {/* Expand chevron */}
        <div style={{ fontSize:"14px", color:c, opacity:0.6, flexShrink:0, marginTop:"2px" }}>
          {expanded ? "▾" : "▸"}
        </div>
      </div>

      {/* Notes body — expanded */}
      {expanded && (
        <div style={{ animation:"fadeIn 0.2s ease-out" }}>
          <div style={{
            padding:"12px 14px",
            background:`rgba(0,0,0,0.35)`,
            borderRadius:"7px",
            border:`1px solid ${c}22`,
            marginBottom:"10px",
          }}>
            {/* Language header */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px", paddingBottom:"8px", borderBottom:`1px solid ${c}22` }}>
              <span style={{ fontSize:"14px" }}>{meta.flag}</span>
              <div>
                <div style={{ fontSize:"10px", color:c, fontWeight:"700", letterSpacing:"0.08em" }}>
                  {meta.label} — {meta.native}
                </div>
                <div style={{ fontSize:"8px", color:C.muted, fontFamily:"monospace" }}>
                  {meta.script} script · Auto-detected · Encrypted at rest
                </div>
              </div>
            </div>

            {/* Notes text */}
            <p style={{
              fontSize: isEthiopic ? "15px" : "13px",
              lineHeight: isEthiopic ? "2" : "1.8",
              color:"rgba(255,255,255,0.75)",
              margin:0,
              fontFamily: isEthiopic ? "'Noto Serif Ethiopic','serif'" : "monospace",
              letterSpacing: isEthiopic ? "0.02em" : "0",
              wordBreak:"break-word",
            }}>
              {report.notes}
            </p>
          </div>

          {/* Forensic flags */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"3px", fontFamily:"monospace",
              color:report.is_verified?C.green:C.muted,
              background:report.is_verified?"rgba(0,230,118,0.08)":"rgba(255,255,255,0.04)",
              border:`1px solid ${report.is_verified?C.green+"33":C.border}` }}>
              {report.is_verified?"✓ VERIFIED":"○ UNVERIFIED"}
            </span>
            <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"3px", fontFamily:"monospace",
              color:report.exif_verified?C.green:C.muted,
              background:report.exif_verified?"rgba(0,230,118,0.08)":"rgba(255,255,255,0.04)",
              border:`1px solid ${report.exif_verified?C.green+"33":C.border}` }}>
              {report.exif_verified?"✓ EXIF MATCH":"○ NO EXIF"}
            </span>
            {report.ai_flagged ? (
              <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"3px", fontFamily:"monospace",
                color:"#a78bfa", background:"rgba(167,139,250,0.08)", border:"1px solid #a78bfa33" }}>
                ⚠ AI IMAGE FLAG
              </span>
            ) : null}
            <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"3px", fontFamily:"monospace",
              color:C.muted, background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}` }}>
              🔒 AES-256-GCM encrypted
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function SafuuNotesPanel() {
  const [expanded, setExpanded]     = useState(null);
  const [filterLang, setFilterLang] = useState("all");
  const [filterVer,  setFilterVer]  = useState("all");
  const [search, setSearch]         = useState("");
  const [liveCount, setLiveCount]   = useState(REPORTS.length);
  const [newNote, setNewNote]       = useState(null);

  // Simulate incoming notes
  useEffect(() => {
    const NEW_NOTES = [
      { lang:"am", text:"ይህን ሁኔታ ከሶስት ወር ጀምሮ ሳስተውል ነው...", office:"Land Registry" },
      { lang:"or", text:"Yeroo heddu mul irratti argineerra...", office:"ERCA Oromia" },
      { lang:"ti", text:"ሓቂ ዝኾነ ሰብ ኣነ ርኢዬ...", office:"Customs" },
      { lang:"so", text:"Waxaan arkay in...", office:"Revenue Bureau" },
      { lang:"en", text:"This pattern has been going on for months...", office:"Finance" },
    ];
    let i = 0;
    const t = setInterval(() => {
      const n = NEW_NOTES[i % NEW_NOTES.length]; i++;
      setNewNote({ ...n, id:Date.now() });
      setLiveCount(c => c + 1);
      setTimeout(() => setNewNote(null), 4000);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const reports = REPORTS
    .filter(r => filterLang === "all" || r.notes_language === filterLang)
    .filter(r => filterVer === "all" || (filterVer === "verified" ? r.is_verified : !r.is_verified))
    .filter(r => !search || r.notes?.toLowerCase().includes(search.toLowerCase()) || r.office.toLowerCase().includes(search.toLowerCase()));

  const totalNotes = REPORTS.length;
  const langBreakdown = langStats;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:"12px" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a2035;border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,230,118,0.4)}70%{box-shadow:0 0 0 10px rgba(0,230,118,0)}}
        input:focus{outline:none}
        .pill:hover{opacity:0.75;cursor:pointer}
        .card:hover{border-color:rgba(255,255,255,0.14)!important}
      `}</style>

      {/* Top stripe */}
      <div style={{ display:"flex", height:"3px" }}>
        <div style={{ flex:1, background:"#078930" }}/><div style={{ flex:1, background:"#FCDD09" }}/><div style={{ flex:1, background:"#DA121A" }}/>
      </div>

      {/* ── HEADER ── */}
      <div style={{ padding:"0 20px", height:"50px", display:"flex", alignItems:"center", gap:"16px", borderBottom:`1px solid ${C.border}`, background:"rgba(7,9,15,0.98)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <div style={{ width:"26px", height:"26px", borderRadius:"6px", background:"linear-gradient(135deg,#078930,#ca8a04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"900", color:"#fff" }}>ሳ</div>
          <div>
            <div style={{ fontSize:"13px", fontWeight:"700", color:C.green, letterSpacing:"0.12em" }}>SAFUU</div>
            <div style={{ fontSize:"7px", color:C.muted, letterSpacing:"0.1em" }}>TIPPER NOTES — MULTILINGUAL INTELLIGENCE</div>
          </div>
        </div>

        <div style={{ flex:1 }}/>

        {/* KPIs */}
        {[
          { label:"NOTES RECEIVED", value:liveCount, color:C.green  },
          { label:"LANGUAGES",      value:langBreakdown.length, color:C.gold  },
          { label:"VOICE NOTES",    value:REPORTS.filter(r=>r.input_type==="voice").length, color:C.blue  },
          { label:"WITH EXIF",      value:REPORTS.filter(r=>r.exif_verified).length, color:C.orange },
        ].map(k => (
          <div key={k.label} style={{ textAlign:"center", padding:"0 10px", borderLeft:`1px solid ${C.border}` }}>
            <div style={{ fontSize:"18px", fontWeight:"800", color:k.color, lineHeight:1 }}>{k.value}</div>
            <div style={{ fontSize:"7px", color:C.muted, letterSpacing:"0.08em", marginTop:"2px" }}>{k.label}</div>
          </div>
        ))}

        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"9px", color:C.green, paddingLeft:"16px", borderLeft:`1px solid ${C.border}`, flexShrink:0 }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.green, animation:"blink 1.5s infinite", display:"inline-block" }}/>
          LIVE
        </div>
      </div>

      {/* ── NEW NOTE TOAST ── */}
      {newNote && (
        <div style={{
          margin:"10px 20px 0", padding:"10px 16px",
          background:"rgba(0,230,118,0.06)", border:`1px solid ${C.green}44`,
          borderRadius:"8px", animation:"slideDown 0.3s ease-out",
          display:"flex", alignItems:"center", gap:"12px",
        }}>
          <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:C.green, animation:"pulse 1.5s infinite", display:"inline-block", flexShrink:0 }}/>
          <ScriptBadge code={newNote.lang}/>
          <span style={{ fontSize:"10px", color:C.muted }}>New note received — <span style={{ color:C.text }}>{newNote.office}</span></span>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)", fontStyle:"italic", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            "{newNote.text}"
          </span>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ display:"flex", gap:0, padding:"16px 20px", gap:"16px" }}>

        {/* ── SIDEBAR: Language stats + chart ── */}
        <div style={{ width:"260px", flexShrink:0, display:"flex", flexDirection:"column", gap:"12px" }}>

          {/* Language breakdown */}
          <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:"10px", overflow:"hidden" }}>
            <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontSize:"9px", color:C.muted, letterSpacing:"0.15em" }}>
              ▸ LANGUAGES RECEIVED
            </div>
            <div style={{ padding:"10px 4px" }}>
              {langBreakdown.map(([code, count]) => {
                const meta = LANG_META[code] || LANG_META.en;
                const c    = langColor(code);
                const pct  = Math.round((count / totalNotes) * 100);
                return (
                  <div key={code} className="pill" onClick={() => setFilterLang(filterLang===code?"all":code)} style={{
                    padding:"8px 10px", borderRadius:"6px", marginBottom:"2px",
                    background:filterLang===code?`${c}12`:"transparent",
                    border:`1px solid ${filterLang===code?c+"44":"transparent"}`,
                    transition:"all 0.15s",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                      <span style={{ fontSize:"12px" }}>{meta.flag}</span>
                      <span style={{ fontSize:"10px", color:filterLang===code?c:C.text, flex:1 }}>{meta.label}</span>
                      <span style={{ fontSize:"9px", color:c, fontWeight:"700", fontFamily:"monospace" }}>{count}</span>
                      <span style={{ fontSize:"8px", color:C.muted }}>{pct}%</span>
                    </div>
                    <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"2px" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:"2px", boxShadow:`0 0 4px ${c}88` }}/>
                    </div>
                    <div style={{ fontSize:"8px", color:C.muted, marginTop:"3px", fontFamily:"monospace" }}>
                      {meta.native} · {meta.script}
                    </div>
                  </div>
                );
              })}
              {filterLang !== "all" && (
                <button onClick={() => setFilterLang("all")} style={{ width:"100%", marginTop:"4px", padding:"5px", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:"9px", letterSpacing:"0.08em" }}>
                  ✕ Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Notes trend */}
          <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:"10px", overflow:"hidden" }}>
            <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontSize:"9px", color:C.muted, letterSpacing:"0.15em" }}>▸ NOTES PER DAY</div>
            <div style={{ padding:"10px 4px 4px" }}>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={TREND} margin={{ top:0, right:4, left:-32, bottom:0 }}>
                  <defs>
                    <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="d" tick={{ fill:C.muted, fontSize:7 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:C.muted, fontSize:7 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:"#0e1117", border:`1px solid ${C.border}`, fontSize:"9px" }}/>
                  <Area type="monotone" dataKey="notes" stroke={C.green} fill="url(#gN)" strokeWidth={2} dot={false} name="Notes"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* How it works */}
          <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
            <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"0.15em", marginBottom:"12px" }}>▸ HOW NOTES WORK</div>
            {[
              { icon:"🎙️", text:"Tipper sends voice or text in any Ethiopian language" },
              { icon:"🔍", text:"Language auto-detected (Whisper for voice, heuristics for text)" },
              { icon:"🔒", text:"Notes encrypted with AES-256-GCM before storage" },
              { icon:"📋", text:"Shown only to investigators in the admin channel" },
              { icon:"⚖️", text:"Included in court-sealed evidence ledger" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"9px" }}>
                <span style={{ fontSize:"14px", flexShrink:0 }}>{s.icon}</span>
                <span style={{ fontSize:"9px", color:C.muted, lineHeight:"1.6" }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Language support list */}
          <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"14px" }}>
            <div style={{ fontSize:"9px", color:C.muted, letterSpacing:"0.15em", marginBottom:"10px" }}>▸ SUPPORTED LANGUAGES</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
              {Object.entries(LANG_META).filter(([k]) => k !== "mix").map(([code, meta]) => (
                <span key={code} style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"10px", color:langColor(code), background:`${langColor(code)}12`, border:`1px solid ${langColor(code)}33`, fontFamily:"monospace" }}>
                  {meta.native}
                </span>
              ))}
            </div>
            <div style={{ fontSize:"8px", color:C.muted, marginTop:"10px", lineHeight:"1.6" }}>
              Voice messages in any language are transcribed automatically by OpenAI Whisper before being processed by Claude AI.
            </div>
          </div>
        </div>

        {/* ── MAIN: Notes list ── */}
        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:"10px" }}>

          {/* Filters + search */}
          <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
            {/* Search */}
            <div style={{ flex:1, minWidth:"160px", position:"relative" }}>
              <span style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"11px", color:C.muted }}>⌕</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search notes, office..."
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${search?C.green+"55":C.border}`, borderRadius:"6px", padding:"6px 10px 6px 28px", color:C.text, fontSize:"10px", fontFamily:"monospace" }}/>
            </div>

            {/* Verification filter */}
            {["all","verified","unverified"].map(f => (
              <button key={f} className="pill" onClick={() => setFilterVer(f)} style={{
                fontSize:"8px", padding:"5px 10px", borderRadius:"4px", cursor:"pointer",
                background:filterVer===f?"rgba(0,230,118,0.12)":"rgba(255,255,255,0.03)",
                color:filterVer===f?C.green:C.muted,
                border:`1px solid ${filterVer===f?C.green+"44":C.border}`,
                fontFamily:"monospace", letterSpacing:"0.05em",
              }}>{f.toUpperCase()}</button>
            ))}

            <span style={{ fontSize:"9px", color:C.muted, marginLeft:"4px" }}>
              {reports.length} of {totalNotes} notes
            </span>
          </div>

          {/* Notes grid */}
          {reports.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px", color:C.muted, fontSize:"11px" }}>
              No notes match your filter.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {reports.map(r => (
                <NoteCard
                  key={r.tip_id}
                  report={r}
                  expanded={expanded === r.tip_id}
                  onToggle={() => setExpanded(expanded === r.tip_id ? null : r.tip_id)}
                />
              ))}
            </div>
          )}

          {/* Whisper capability note */}
          <div style={{ marginTop:"4px", padding:"12px 16px", background:"rgba(56,189,248,0.05)", border:`1px solid ${C.blue}22`, borderRadius:"8px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
            <span style={{ fontSize:"18px", flexShrink:0 }}>🎙️</span>
            <div>
              <div style={{ fontSize:"10px", color:C.blue, fontWeight:"700", marginBottom:"3px", letterSpacing:"0.06em" }}>
                Voice Notes — Any Ethiopian Language
              </div>
              <div style={{ fontSize:"10px", color:C.muted, lineHeight:"1.7" }}>
                Tippers can send voice messages at Step 11 in Amharic, Oromiffa, Tigrinya, Somali, Sidama, Afar, Wolaytta, Hadiyya, Dawro, Gamo, Bench, or any other Ethiopian language. OpenAI Whisper transcribes the audio automatically. Language is auto-detected and stored alongside the encrypted note. Investigators see both the transcript and the detected language in the admin alert.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stripe */}
      <div style={{ display:"flex", height:"3px", marginTop:"8px" }}>
        <div style={{ flex:1, background:"#078930" }}/><div style={{ flex:1, background:"#FCDD09" }}/><div style={{ flex:1, background:"#DA121A" }}/>
      </div>
    </div>
  );
}
