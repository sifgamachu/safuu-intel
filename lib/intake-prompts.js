// ─────────────────────────────────────────────────────────────────────────
//  SAFUU Intel — Intake Flow Prompts
//  Languages: English, Amharic (አማርኛ), Afaan Oromo, Tigrinya (ትግርኛ), Somali
//
//  Translation confidence levels (for a live whistleblower platform these
//  should be reviewed by a native speaker before public launch):
//    en — canonical
//    am — high confidence
//    or — moderate (grammar reviewed, idiom less certain)
//    ti — moderate (script correct, natural flow less certain)
//    so — moderate
// ─────────────────────────────────────────────────────────────────────────

export const LANGUAGES = [
  { code: 'en', native: 'English'         },
  { code: 'am', native: 'አማርኛ'             },
  { code: 'or', native: 'Afaan Oromoo'    },
  { code: 'ti', native: 'ትግርኛ'             },
  { code: 'so', native: 'Soomaali'        },
];

export const PROMPTS = {

  en: {
    welcome:    `👋 Welcome to <b>SAFUU Intel</b>.\n\nReport corruption anonymously. Your identity is never stored — we hash it and throw away the original.\n\n<i>You can type /language anytime to switch.</i>\n\nChoose your language to begin:`,
    step1:      `<b>Step 1/11 — Name</b>\n\nWho are you reporting? (Full name, if known. If not, type "unknown".)`,
    step2:      `<b>Step 2/11 — Office</b>\n\nWhat office, ministry, or organization do they work for?`,
    step3:      `<b>Step 3/11 — Position</b>\n\nWhat is their job title? (e.g. "Procurement Director"). Type "unknown" if you don't know.`,
    step4:      `<b>Step 4/11 — Location</b>\n\nWhich city and region did this happen in? (e.g. "Addis Ababa, Oromia")`,
    step5:      `<b>Step 5/11 — Type of corruption</b>\n\nWhat kind of corruption? Tap one:`,
    step6:      `<b>Step 6/11 — When</b>\n\nWhen did this happen? (Approximate date is fine — e.g. "March 2025" or "last week")`,
    step7:      `<b>Step 7/11 — What happened</b>\n\nDescribe what you saw or experienced. You can send a voice note or text in any language — we'll handle translation.`,
    step8:      `<b>Step 8/11 — Amount (optional)</b>\n\nIf money was involved, how much? (In Ethiopian Birr, or type "skip".)`,
    step9:      `<b>Step 9/11 — Evidence (optional)</b>\n\nDo you have a photo, receipt, or document? Send it now, or type "skip".`,
    step10:     `<b>Step 10/11 — Anything else?</b>\n\nAdd a free-form note in any language. Or type "skip".`,
    step11:     `<b>Step 11/11 — Review & submit</b>\n\n{summary}\n\nReady to submit? Reply <b>yes</b> or <b>no</b>.`,
    submitted:  `✅ <b>Report received.</b>\n\nID: <code>{id}</code>\n\nIt has been cryptographically sealed in the evidence ledger. We do not know who you are. Thank you for making Africa stronger.\n\n🔗 safuu.net`,
    cancel:     `Cancelled. Type /report to start again.`,
    error:      `Something went wrong. Please try again — /report`,
    langMenu:   `🌐 Change language — pick one:`,
    langSwitched: `✅ Switched to English.`,
    langButton: `🌐 Language`,
  },

  am: {
    welcome:    `👋 ወደ <b>ሳፉ ኢንቴል</b> እንኳን ደህና መጡ።\n\nሙስናን በማይታወቅ ሁኔታ ሪፖርት ያድርጉ። ማንነትዎ አይቀመጥም — እናጥባለን እና ኦሪጅናሉን እንጥላለን።\n\n<i>በማንኛውም ጊዜ /language ብለው ይላኩ ለመቀየር።</i>\n\nለመጀመር ቋንቋዎን ይምረጡ:`,
    step1:      `<b>ደረጃ 1/11 — ስም</b>\n\nሪፖርት የሚያደርጉት ሰው ማን ነው? (ሙሉ ስም ከታወቀ። ካልታወቀ "unknown" ይጻፉ።)`,
    step2:      `<b>ደረጃ 2/11 — ቢሮ</b>\n\nበየትኛው ቢሮ፣ ሚኒስቴር ወይም ድርጅት ውስጥ ይሠራሉ?`,
    step3:      `<b>ደረጃ 3/11 — ሥራ</b>\n\nየሥራ ማዕረጋቸው ምንድነው? (ለምሳሌ "የግዥ ዳይሬክተር")። ካልታወቀ "unknown" ይጻፉ።`,
    step4:      `<b>ደረጃ 4/11 — ቦታ</b>\n\nይህ ድርጊት የት ተከሰተ? (ለምሳሌ "አዲስ አበባ፣ ኦሮሚያ")`,
    step5:      `<b>ደረጃ 5/11 — የሙስና ዓይነት</b>\n\nምን ዓይነት ሙስና ነው? አንዱን ይምረጡ:`,
    step6:      `<b>ደረጃ 6/11 — መቼ</b>\n\nመቼ ተከሰተ? (ግምታዊ ቀን በቂ ነው — ለምሳሌ "መጋቢት 2017" ወይም "ባለፈው ሳምንት")`,
    step7:      `<b>ደረጃ 7/11 — ምን ሆነ</b>\n\nያዩትን ወይም ያጋጠመዎትን ይግለጹ። በማንኛውም ቋንቋ የድምጽ መልእክት ወይም ጽሑፍ መላክ ይችላሉ።`,
    step8:      `<b>ደረጃ 8/11 — መጠን (አማራጭ)</b>\n\nገንዘብ ተሳትፎ ካለ ምን ያህል ነበር? (በብር፣ ወይም "skip" ይጻፉ።)`,
    step9:      `<b>ደረጃ 9/11 — ማስረጃ (አማራጭ)</b>\n\nፎቶ፣ ደረሰኝ ወይም ሰነድ አለዎት? አሁን ይላኩ፣ ወይም "skip" ይጻፉ።`,
    step10:     `<b>ደረጃ 10/11 — ሌላ ነገር?</b>\n\nበማንኛውም ቋንቋ ነፃ ማስታወሻ ይጨምሩ። ወይም "skip" ይጻፉ።`,
    step11:     `<b>ደረጃ 11/11 — ያረጋግጡ እና ይላኩ</b>\n\n{summary}\n\nለመላክ ዝግጁ ነዎት? <b>yes</b> ወይም <b>no</b> ይመልሱ።`,
    submitted:  `✅ <b>ሪፖርት ተቀብሏል።</b>\n\nመታወቂያ: <code>{id}</code>\n\nበማስረጃ መዝገብ ውስጥ በክሪፕቶግራፊ ታሽጓል። እርስዎ ማን እንደሆኑ አናውቅም። አፍሪካን ለማጠናከር ስላደረጉት አመሰግናለን።\n\n🔗 safuu.net`,
    cancel:     `ተሰርዟል። እንደገና ለመጀመር /report ይጻፉ።`,
    error:      `ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ — /report`,
    langMenu:   `🌐 ቋንቋ ይቀይሩ — ይምረጡ:`,
    langSwitched: `✅ ወደ አማርኛ ተቀይሯል።`,
    langButton: `🌐 ቋንቋ`,
  },

  or: {
    welcome:    `👋 <b>SAFUU Intel</b> baga dhuftan.\n\nMalaammaltummaa iccitiin gabaasaa. Eenyummaan keessan hin kuufamu — ni cubbisna, kan jalqabaa immoo ni gatna.\n\n<i>Yeroo kamittiyyuu afaan jijjiiruudhaaf /language barreessaa.</i>\n\nJalqabuuf afaan keessan filadhaa:`,
    step1:      `<b>Tarkaanfii 1/11 — Maqaa</b>\n\nNama gabaaftan eenyu? (Maqaa guutuu yoo beektan. Yoo hin beekne "unknown" barreessaa.)`,
    step2:      `<b>Tarkaanfii 2/11 — Waajjira</b>\n\nWaajjira, ministeera, yookaan dhaabbata kam keessa hojjetu?`,
    step3:      `<b>Tarkaanfii 3/11 — Sadarkaa</b>\n\nSadarkaan hojii isaanii maali? (fkn. "Daareektara Bittaa"). Yoo hin beekne "unknown" barreessaa.`,
    step4:      `<b>Tarkaanfii 4/11 — Bakka</b>\n\nMagaalaa fi naannoo kamitti raawwate? (fkn. "Finfinnee, Oromiyaa")`,
    step5:      `<b>Tarkaanfii 5/11 — Gosa malaammaltummaa</b>\n\nGosa malaammaltummaa kami? Filadhaa:`,
    step6:      `<b>Tarkaanfii 6/11 — Yoom</b>\n\nYoom raawwate? (Guyyaa tilmaamaa gahaa dha — fkn. "Bitootessa 2017" yookaan "torban darbe")`,
    step7:      `<b>Tarkaanfii 7/11 — Maal ta'e</b>\n\nWaan argitan yookaan isin mudate ibsaa. Sagaleedhaan yookaan barreeffamaan afaan kamiiniyyuu ergitu ni dandeessu.`,
    step8:      `<b>Tarkaanfii 8/11 — Hamma (filannoo)</b>\n\nMaallaqni keessa yoo jiraate, meeqa? (Birriin, yookaan "skip" barreessaa.)`,
    step9:      `<b>Tarkaanfii 9/11 — Ragaa (filannoo)</b>\n\nSuuraa, nagahee, yookaan sanada qabduu? Amma ergaa, yookaan "skip" barreessaa.`,
    step10:     `<b>Tarkaanfii 10/11 — Waan biraa?</b>\n\nYaada bilisaa afaan kamiiniyyuu dabaluu dandeessu. Yookaan "skip" barreessaa.`,
    step11:     `<b>Tarkaanfii 11/11 — Mirkaneessaa fi ergaa</b>\n\n{summary}\n\nErguuf qophii? <b>yes</b> yookaan <b>no</b> deebisaa.`,
    submitted:  `✅ <b>Gabaasni fudhatame.</b>\n\nID: <code>{id}</code>\n\nGalmee ragaa keessatti sirreeffamaan cufameera. Eenyummaa keessan hin beeknu. Afrikaa jabeessuuf galatoomaa.\n\n🔗 safuu.net`,
    cancel:     `Haqameera. Deebitee jalqabuuf /report barreessaa.`,
    error:      `Dogoggorri uumameera. Irra deebi'ii yaalaa — /report`,
    langMenu:   `🌐 Afaan jijjiiri — filadhaa:`,
    langSwitched: `✅ Gara Afaan Oromootti jijjiirameera.`,
    langButton: `🌐 Afaan`,
  },

  ti: {
    welcome:    `👋 ናብ <b>SAFUU Intel</b> እንቋዕ ብደሓን መጻእኩም።\n\nግዕዝይና ብዘይ መንነት ሓብሩ። መንነትኩም ኣይንሕዝን — ነሓዎ እሞ ነቲ ዋናዊ ንድርብዮ።\n\n<i>ኣብ ዝኾነ እዋን ንቋንቋ ንምቕያር /language ጸሓፉ።</i>\n\nንምጅማር ቋንቋኹም ምረጹ:`,
    step1:      `<b>ደረጃ 1/11 — ስም</b>\n\nትሕብሩ ዘለኹም ሰብ መን እዩ? (ምሉእ ስም ተፈሊጡ እንተሎ። እንተዘይተፈሊጡ "unknown" ጸሓፉ።)`,
    step2:      `<b>ደረጃ 2/11 — ቤት-ጽሕፈት</b>\n\nኣብ ኣየናይ ቤት-ጽሕፈት፣ ሚኒስቴር ወይ ትካል ይሰርሑ?`,
    step3:      `<b>ደረጃ 3/11 — ስራሕ</b>\n\nናይ ስራሕ መዓርግ እንታይ እዩ? (ኣብነት "ዳይረክተር ዕድጊ")። እንተዘይተፈሊጡ "unknown" ጸሓፉ።`,
    step4:      `<b>ደረጃ 4/11 — ቦታ</b>\n\nኣብ ኣየናይ ከተማን ዞባን ተፈጺሙ? (ኣብነት "ኣዲስ ኣበባ፣ ኦሮምያ")`,
    step5:      `<b>ደረጃ 5/11 — ዓይነት ግዕዝይና</b>\n\nዓይነት ግዕዝይና እንታይ እዩ? ምረጹ:`,
    step6:      `<b>ደረጃ 6/11 — መዓስ</b>\n\nመዓስ ተፈጺሙ? (ግምታዊ ዕለት ይኣክል — ኣብነት "መጋቢት 2017" ወይ "ዝሓለፈ ሰሙን")`,
    step7:      `<b>ደረጃ 7/11 — እንታይ ተፈጺሙ</b>\n\nዝረኣኹምዎ ወይ ዘጋጠመኩም ግለጹ። ብዝኾነ ቋንቋ ድምጺ ወይ ጽሑፍ ክትልእኩ ትኽእሉ።`,
    step8:      `<b>ደረጃ 8/11 — መጠን (ኣማራጺ)</b>\n\nገንዘብ ኣትዩ እንተኾይኑ ክንደይ ነይሩ? (ብብር፣ ወይ "skip" ጸሓፉ።)`,
    step9:      `<b>ደረጃ 9/11 — መረጋገጺ (ኣማራጺ)</b>\n\nስእሊ፣ ቅብሊት፣ ወይ ሰነድ ኣለኩም? ሕጂ ልኣኹዎ፣ ወይ "skip" ጸሓፉ።`,
    step10:     `<b>ደረጃ 10/11 — ካልእ ነገር?</b>\n\nብዝኾነ ቋንቋ ናጻ ሓሳብ ወስኹ። ወይ "skip" ጸሓፉ።`,
    step11:     `<b>ደረጃ 11/11 — ኣረጋግጹን ልኣኹን</b>\n\n{summary}\n\nንምልኣኽ ድሉዋት ዲኹም? <b>yes</b> ወይ <b>no</b> መልሱ።`,
    submitted:  `✅ <b>ጸብጻብ ተቐቢሉ።</b>\n\nID: <code>{id}</code>\n\nኣብ መዝገብ መረጋገጺ ብክሪፕቶግራፊ ተሓቲሙ። መንነትኩም ኣይንፈልጥን። ኣፍሪቃ ንምድልዳል ዝገበርኩሞ ነመስግን።\n\n🔗 safuu.net`,
    cancel:     `ተሰሪዙ። እንደገና ንምጅማር /report ጸሓፉ።`,
    error:      `ጌጋ ተፈጢሩ። በጃኹም እንደገና ፈትኑ — /report`,
    langMenu:   `🌐 ቋንቋ ቀይሩ — ምረጹ:`,
    langSwitched: `✅ ናብ ትግርኛ ተቐይሩ።`,
    langButton: `🌐 ቋንቋ`,
  },

  so: {
    welcome:    `👋 Ku soo dhowow <b>SAFUU Intel</b>.\n\nMusuq-maasuqa ka warran si qarsoodi ah. Aqoonsigaaga lama kaydiyo — waan xatimaynaa oo tuurnaa asalka.\n\n<i>Wakhti kasta waxaad qori kartaa /language si aad u beddesho luqadda.</i>\n\nDooro luqaddaada si aad u billowdo:`,
    step1:      `<b>Tallaabo 1/11 — Magaca</b>\n\nQofka aad ka warbixineyso waa kuma? (Magaca buuxa haddii la garanayo. Haddii kale "unknown" qor.)`,
    step2:      `<b>Tallaabo 2/11 — Xafiiska</b>\n\nXafiis, wasaarad, ama hay'ad kee ayuu ka shaqeeyaa?`,
    step3:      `<b>Tallaabo 3/11 — Jagada</b>\n\nCinwaanka shaqadiisu waa maxay? (tusaale "Agaasimaha Iibsiga"). Haddii kale "unknown" qor.`,
    step4:      `<b>Tallaabo 4/11 — Goobta</b>\n\nMagaalada iyo gobolka kee ku dhacay? (tusaale "Addis Ababa, Oromia")`,
    step5:      `<b>Tallaabo 5/11 — Nooca musuq-maasuqa</b>\n\nWaa noocee musuq-maasuq? Mid dooro:`,
    step6:      `<b>Tallaabo 6/11 — Goorta</b>\n\nGoorma ayuu dhacay? (Taariikh qiyaas ah way caawinaysaa — tusaale "Maarso 2025" ama "toddobaadkii hore")`,
    step7:      `<b>Tallaabo 7/11 — Waxa dhacay</b>\n\nSharax waxa aad aragtay ama kugu dhacay. Waxaad diri kartaa cod ama qoraal luqad kasta.`,
    step8:      `<b>Tallaabo 8/11 — Qaddarka (ikhtiyaari)</b>\n\nHaddii lacag ku jirtay, intee ayay ahayd? (Birr Itoobiyaan, ama qor "skip".)`,
    step9:      `<b>Tallaabo 9/11 — Caddayn (ikhtiyaari)</b>\n\nMa haysataa sawir, rasiid, ama dukumeenti? Hadda dir, ama qor "skip".`,
    step10:     `<b>Tallaabo 10/11 — Wax kale?</b>\n\nKu dar qoraal bilaash ah luqad kasta. Ama qor "skip".`,
    step11:     `<b>Tallaabo 11/11 — Eeg oo dir</b>\n\n{summary}\n\nDiyaar ma tahay in aad dirto? <b>yes</b> ama <b>no</b> ku jawaab.`,
    submitted:  `✅ <b>Warbixinta waa la helay.</b>\n\nID: <code>{id}</code>\n\nDiiwaanka caddaynta si qarsoodi ah ayaa lagu xidhay. Ma naqaan cidda aad tahay. Mahadsanid inaad Afrika xoojisay.\n\n🔗 safuu.net`,
    cancel:     `Waa la tirtiray. Dib u billaw, qor /report.`,
    error:      `Khalad ayaa dhacay. Fadlan isku day mar kale — /report`,
    langMenu:   `🌐 Beddel luqadda — dooro:`,
    langSwitched: `✅ Luqadda waxaa loo beddelay Soomaali.`,
    langButton: `🌐 Luqadda`,
  },
};

export function getPrompts(lang) {
  return PROMPTS[lang] || PROMPTS.en;
}

// ─────────────────────────────────────────────────────────────────────────
// Corruption type labels — localized per language
// ─────────────────────────────────────────────────────────────────────────
export const CORRUPTION_TYPES = [
  { code: 'bribery',             en: '💰 Bribery',              am: '💰 ጉቦ',                     or: "💰 Mattaa'aa",                ti: '💰 ጉቦ',                     so: '💰 Laaluush' },
  { code: 'embezzlement',        en: '🏦 Embezzlement',         am: '🏦 ምዝበራ',                   or: '🏦 Hannaa qabeenyaa',         ti: '🏦 ምዝባብ',                   so: '🏦 Xatooyo' },
  { code: 'procurement_fraud',   en: '📑 Procurement Fraud',    am: '📑 የግዥ ማጭበርበር',              or: '📑 Gowwomsaa bittaa',         ti: '📑 ምትላል ግዝዒ',                so: '📑 Khiyaano iibsi' },
  { code: 'tax_evasion',         en: '💸 Tax Evasion',          am: '💸 ግብር ማምለጥ',                or: '💸 Gibira oolmaa',            ti: '💸 ካብ ቀረጽ ምህዳም',             so: '💸 Cashuur ka carar' },
  { code: 'nepotism',            en: '👪 Nepotism',             am: '👪 ዘመድ አድልዎ',                or: '👪 Firoomsa',                  ti: '👪 ቤተሰባዊ ኣድልዎ',              so: '👪 Eexda qoyska' },
  { code: 'abuse_of_power',      en: '⚖️ Abuse of Power',       am: '⚖️ የስልጣን ብዝበዛ',              or: '⚖️ Aangoo fayyadamuu',        ti: '⚖️ ስልጣን ምዝባዕ',               so: '⚖️ Xadgudub awood' },
  { code: 'land_fraud',          en: '🏞️ Land Fraud',           am: '🏞️ የመሬት ማጭበርበር',             or: '🏞️ Gowwomsaa lafaa',          ti: '🏞️ ምትላል መሬት',                so: '🏞️ Khiyaano dhul' },
  { code: 'extortion',           en: '🔫 Extortion',            am: '🔫 ማስፈራራት',                  or: '🔫 Dirqisiisuu',               ti: '🔫 ግፍዒ',                     so: '🔫 Baad' },
  { code: 'money_laundering',    en: '💼 Money Laundering',     am: '💼 ገንዘብ ማጠብ',                or: '💼 Maallaqa miiccuu',         ti: '💼 ገንዘብ ምሕጻብ',               so: '💼 Lacag dhaqid' },
  { code: 'electoral_fraud',     en: '🗳️ Electoral Fraud',      am: '🗳️ የምርጫ ማጭበርበር',             or: '🗳️ Gowwomsaa filannoo',       ti: '🗳️ ምትላል መረጻ',                so: '🗳️ Khiyaano doorasho' },
  { code: 'judicial_corruption', en: '⚖️ Judicial Corruption',  am: '⚖️ የፍትህ ሙስና',                or: '⚖️ Malaammaltummaa seeraa',   ti: '⚖️ ግዕዝይና ፍትሒ',              so: '⚖️ Musuq-maasuq garsoor' },
  { code: 'police_misconduct',   en: '🚓 Police Misconduct',    am: '🚓 የፖሊስ ጥፋት',                or: '🚓 Balleessaa poolisii',      ti: '🚓 ጌጋ ፖሊስ',                  so: '🚓 Xadgudub booliis' },
  { code: 'other',               en: '📌 Other',                am: '📌 ሌላ',                       or: '📌 Biraa',                     ti: '📌 ካልእ',                     so: '📌 Kale' },
];

export function corruptionTypeLabel(code, lang) {
  const t = CORRUPTION_TYPES.find(x => x.code === code);
  if (!t) return code;
  return t[lang] || t.en;
}
