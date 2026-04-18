/**
 * SAFUU INTEL — Telegram Broadcast System
 * ==========================================
 * Handles:
 *   1. Subscriber management (subscribe/unsubscribe via @SafuuIntelBot)
 *   2. Three broadcast types:
 *      A. SAFUU platform events (case hits threshold)
 *      B. African corruption news (curated + AI-sourced)
 *      C. Global corruption news (major world events)
 *   4. Region preferences (all Africa / specific country / global only)
 *
 * Dependencies: node-telegram-bot-api, better-sqlite3
 * Setup: npm install node-telegram-bot-api better-sqlite3 node-cron
 */

const TelegramBot = require('node-telegram-bot-api');
const Database    = require('better-sqlite3');
const cron        = require('node-cron');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;  // from .env
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─── Database ────────────────────────────────────────────────────────────────
const db = new Database('./data/safuu.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    chat_id       INTEGER PRIMARY KEY,
    subscribed_at TEXT    DEFAULT (datetime('now')),
    region_pref   TEXT    DEFAULT 'all',          -- 'all' | 'africa' | 'global' | 'ethiopia' | etc
    active        INTEGER DEFAULT 1,
    username      TEXT                             -- never stored with reports — only for opt-in broadcast
  );

  CREATE TABLE IF NOT EXISTS broadcasts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL,                  -- 'threshold' | 'africa_news' | 'global_news'
    headline   TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    region     TEXT,
    url        TEXT,
    sent_at    TEXT    DEFAULT (datetime('now')),
    recipients INTEGER DEFAULT 0
  );
`);

// ─── Subscriber helpers ───────────────────────────────────────────────────────
const subscribe   = (chatId, username) => db.prepare(
  `INSERT INTO subscribers (chat_id, username) VALUES (?, ?)
   ON CONFLICT(chat_id) DO UPDATE SET active=1, subscribed_at=datetime('now')`
).run(chatId, username || null);

const unsubscribe = (chatId) => db.prepare(
  `UPDATE subscribers SET active=0 WHERE chat_id=?`
).run(chatId);

const setRegion   = (chatId, region) => db.prepare(
  `UPDATE subscribers SET region_pref=? WHERE chat_id=?`
).run(region, chatId);

const getActive   = (region = null) => {
  if (!region || region === 'all') {
    return db.prepare(`SELECT chat_id FROM subscribers WHERE active=1`).all();
  }
  return db.prepare(
    `SELECT chat_id FROM subscribers WHERE active=1 AND (region_pref='all' OR region_pref=?)`
  ).all(region);
};

// ─── Message templates ───────────────────────────────────────────────────────
const DIVIDER = '─'.repeat(32);

function thresholdMessage(caseData) {
  // caseData: { id, office, city, region, type, reports, agency }
  return `📡 *SAFUU INTEL — CASE DISCLOSED*

🔴 *THRESHOLD REACHED*
📍 ${caseData.office}
🏙️ ${caseData.city}, ${caseData.region}
⚖️ Type: ${caseData.type}
📊 ${caseData.reports} verified reports filed

This case has been formally referred to *${caseData.agency}* for independent investigation.

_Appearance on the transparency wall is not a finding of guilt — it is a referral for investigation. The named individual retains all rights under Ethiopian law._

🔗 [View case → safuu.net/transparency/${caseData.id}](https://safuu.net/transparency/${caseData.id})

${DIVIDER}
🌍 @SafuuIntelBot · safuu.net`;
}

function africaNewsMessage(story) {
  // story: { country, headline, summary, source, url }
  const FLAG = {
    Ethiopia:'🇪🇹', Nigeria:'🇳🇬', Kenya:'🇰🇪', Ghana:'🇬🇭',
    SouthAfrica:'🇿🇦', Uganda:'🇺🇬', Tanzania:'🇹🇿', Rwanda:'🇷🇼',
    Sudan:'🇸🇩', Egypt:'🇪🇬', Cameroon:'🇨🇲', Senegal:'🇸🇳',
    DRC:'🇨🇩', Angola:'🇦🇴', Zambia:'🇿🇲', Zimbabwe:'🇿🇼',
    Mozambique:'🇲🇿', Somalia:'🇸🇴', Eritrea:'🇪🇷', Djibouti:'🇩🇯',
  };
  const flag = FLAG[story.country] || '🌍';
  return `📡 *SAFUU INTEL — AFRICA INTELLIGENCE*

${flag} *${story.country.toUpperCase()}*
📰 ${story.headline}

${story.summary}

📎 Source: ${story.source}
🔗 [Read more](${story.url})

${DIVIDER}
🌍 @SafuuIntelBot · Subscribe for Africa + global corruption intelligence`;
}

function globalNewsMessage(story) {
  // story: { country, headline, summary, source, url, tags }
  return `📡 *SAFUU INTEL — GLOBAL INTELLIGENCE*

🌐 *${story.country ? story.country.toUpperCase() : 'WORLD'}*
📰 ${story.headline}

${story.summary}

📎 Source: ${story.source}
🔗 [Read more](${story.url})

${DIVIDER}
🌍 @SafuuIntelBot · safuu.net`;
}

function weeklyDigest(stats) {
  return `📡 *SAFUU INTEL — WEEKLY DIGEST*

📊 *This week across Africa + the world:*

🔴 ${stats.newCases} new cases opened
✅ ${stats.referred} cases referred to authorities
📨 ${stats.totalReports} anonymous reports filed
🌍 ${stats.countries} countries with active cases

*Top offices by reports this week:*
${stats.topOffices.map((o,i) => `${i+1}. ${o.name} — ${o.count} reports`).join('\n')}

*Regions most active:*
${stats.regions.map(r => `• ${r.name}: ${r.count} reports`).join('\n')}

${DIVIDER}
To unsubscribe: /unsubscribe
To change region: /region
🌍 safuu.net`;
}

// ─── Broadcast engine ─────────────────────────────────────────────────────────
async function broadcast(message, type, region = null, meta = {}) {
  const recipients = getActive(region);
  let sent = 0, failed = 0;

  for (const { chat_id } of recipients) {
    try {
      await bot.sendMessage(chat_id, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
      sent++;
      // Throttle: Telegram allows 30 messages/sec
      await new Promise(r => setTimeout(r, 40));
    } catch (err) {
      if (err.code === 'ETELEGRAM' && err.response?.body?.error_code === 403) {
        // User blocked the bot — deactivate
        unsubscribe(chat_id);
      }
      failed++;
    }
  }

  // Log the broadcast
  db.prepare(`INSERT INTO broadcasts (type, headline, body, region, url, recipients)
    VALUES (?, ?, ?, ?, ?, ?)`
  ).run(type, meta.headline || '', message, region, meta.url || '', sent);

  console.log(`Broadcast sent: ${sent} delivered, ${failed} failed`);
  return { sent, failed };
}

// ─── Public API: trigger broadcasts from the main backend ────────────────────
// Call these from safuu-transparency-api.js when events happen
async function broadcastThreshold(caseData) {
  const msg = thresholdMessage(caseData);
  return broadcast(msg, 'threshold', caseData.region, {
    headline: `Threshold reached: ${caseData.office}`,
    url: `https://safuu.net/transparency/${caseData.id}`,
  });
}

async function broadcastAfricaNews(story) {
  const msg = africaNewsMessage(story);
  return broadcast(msg, 'africa_news', story.country, { headline: story.headline, url: story.url });
}

async function broadcastGlobalNews(story) {
  const msg = globalNewsMessage(story);
  return broadcast(msg, 'global_news', null, { headline: story.headline, url: story.url });
}

async function broadcastWeeklyDigest(stats) {
  const msg = weeklyDigest(stats);
  return broadcast(msg, 'weekly_digest', null, { headline: 'Weekly Digest' });
}

// ─── Weekly digest — every Monday 08:00 UTC ───────────────────────────────────
cron.schedule('0 8 * * 1', async () => {
  // Pull stats from DB and broadcast
  const stats = {
    newCases: db.prepare(`SELECT COUNT(*) as c FROM cases WHERE created_at > datetime('now','-7 days')`).get()?.c || 0,
    referred: db.prepare(`SELECT COUNT(*) as c FROM cases WHERE referred=1 AND updated_at > datetime('now','-7 days')`).get()?.c || 0,
    totalReports: db.prepare(`SELECT COUNT(*) as c FROM reports WHERE created_at > datetime('now','-7 days')`).get()?.c || 0,
    countries: 1, // Ethiopia for now, expand as platform grows
    topOffices: [],
    regions: [],
  };
  await broadcastWeeklyDigest(stats);
}, { timezone: 'Africa/Nairobi' });

// ─── Bot commands ─────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'there';

  await bot.sendMessage(chatId,
    `⚖️ *Welcome to SAFUU Intel, ${name}*\n\n` +
    `SAFUU is an anonymous corruption intelligence platform for Africa and the world.\n\n` +
    `*What you can do here:*\n` +
    `📨 /report — File an anonymous corruption report\n` +
    `📡 /subscribe — Get corruption intelligence broadcasts\n` +
    `🔇 /unsubscribe — Stop receiving broadcasts\n` +
    `🌍 /region — Set your region preference\n` +
    `📊 /status — Platform stats\n` +
    `❓ /help — Full command list\n\n` +
    `_Your identity is never stored. SHA-256 hash only._\n\n` +
    `🔗 safuu.net`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  subscribe(chatId, msg.from?.username);

  await bot.sendMessage(chatId,
    `✅ *Subscribed to SAFUU Intel broadcasts*\n\n` +
    `You'll receive:\n` +
    `🔴 *Case disclosures* — when a case hits threshold and is referred to authorities\n` +
    `🌍 *Africa intelligence* — breaking corruption stories across the continent\n` +
    `🌐 *Global intelligence* — major corruption cases worldwide\n` +
    `📊 *Weekly digest* — every Monday, a summary of the week's activity\n\n` +
    `To set a region preference: /region\n` +
    `To stop: /unsubscribe\n\n` +
    `_Broadcasts are in English. Voice intake coming soon._`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  unsubscribe(chatId);
  await bot.sendMessage(chatId,
    `🔇 *Unsubscribed from SAFUU Intel broadcasts.*\n\n` +
    `You can re-subscribe anytime with /subscribe.\n` +
    `To file a report, use /report.`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/region/, async (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [{ text:'🌍 All Africa + Global (default)', callback_data:'region:all'       }],
      [{ text:'🇪🇹 Ethiopia',    callback_data:'region:Ethiopia'    },
       { text:'🇳🇬 Nigeria',     callback_data:'region:Nigeria'     }],
      [{ text:'🇰🇪 Kenya',       callback_data:'region:Kenya'       },
       { text:'🇬🇭 Ghana',       callback_data:'region:Ghana'       }],
      [{ text:'🇿🇦 South Africa',callback_data:'region:SouthAfrica'},
       { text:'🇺🇬 Uganda',      callback_data:'region:Uganda'      }],
      [{ text:'🇪🇬 Egypt',       callback_data:'region:Egypt'       },
       { text:'🌐 Global only',   callback_data:'region:global'     }],
    ]
  };
  await bot.sendMessage(chatId,
    `🌍 *Choose your region preference:*\n\n` +
    `You'll receive broadcasts for your selected region plus any global major events.\n` +
    `As SAFUU expands across Africa, more countries will be added.`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  if (query.data?.startsWith('region:')) {
    const region = query.data.replace('region:', '');
    setRegion(chatId, region);
    await bot.answerCallbackQuery(query.id, { text: `Region set to: ${region}` });
    await bot.sendMessage(chatId,
      `✅ Region preference set to *${region}*.\n\nYou'll receive broadcasts relevant to ${region === 'all' ? 'all of Africa and the world' : region}.`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const totalSubs = db.prepare(`SELECT COUNT(*) as c FROM subscribers WHERE active=1`).get()?.c || 0;
  const totalBroadcasts = db.prepare(`SELECT COUNT(*) as c FROM broadcasts`).get()?.c || 0;
  await bot.sendMessage(chatId,
    `📊 *SAFUU Intel — Platform Status*\n\n` +
    `📡 Active subscribers: ${totalSubs}\n` +
    `📨 Broadcasts sent: ${totalBroadcasts}\n` +
    `🔴 Cases referred: 3\n` +
    `📋 Total reports: 233+\n\n` +
    `🔗 safuu.net/transparency`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    `*SAFUU Intel — Commands*\n\n` +
    `*Reporting:*\n` +
    `/report — File an anonymous corruption report\n\n` +
    `*Intelligence feed:*\n` +
    `/subscribe — Subscribe to corruption broadcasts\n` +
    `/unsubscribe — Stop receiving broadcasts\n` +
    `/region — Set your region (Ethiopia, Nigeria, Kenya...)\n` +
    `/status — Platform stats\n\n` +
    `*About:*\n` +
    `/start — Welcome message\n` +
    `/help — This list\n\n` +
    `_SAFUU covers Africa and global corruption. English broadcasts for now._\n` +
    `🔗 safuu.net`,
    { parse_mode: 'Markdown' }
  );
});

// ─── Export broadcast functions for use by other backend modules ───────────────
module.exports = { broadcastThreshold, broadcastAfricaNews, broadcastGlobalNews, broadcastWeeklyDigest, broadcast };

console.log('SAFUU broadcaster running — @SafuuIntelBot active');
