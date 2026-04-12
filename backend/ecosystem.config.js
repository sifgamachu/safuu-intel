// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU — PM2 Ecosystem Config  |  ecosystem.config.js
//  Start all services:  pm2 start ecosystem.config.js
//  Reload (zero-down):  pm2 reload ecosystem.config.js
//  Status:              pm2 status
//  Logs:                pm2 logs
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

module.exports = {
  apps: [
    // ── Telegram Bot ────────────────────────────────────────────────────────
    {
      name:             "safuu-bot",
      script:           "./safuu-bot.js",
      instances:        1,           // Telegram polling must be single instance
      exec_mode:        "fork",
      watch:            false,
      autorestart:      true,
      restart_delay:    5000,        // 5s between restarts
      max_restarts:     10,
      min_uptime:       "30s",

      // Logging
      out_file:         "./logs/bot-out.log",
      error_file:       "./logs/bot-err.log",
      log_date_format:  "YYYY-MM-DD HH:mm:ss",
      merge_logs:       true,

      // Environment (production inherits .env via dotenv)
      env: {
        NODE_ENV: "production",
      },

      // Memory limit — restart if bot leaks memory
      max_memory_restart: "400M",

      // Graceful shutdown timeout
      kill_timeout:     10000,

      // Source map support for better error traces
      source_map_support: false,

      // Reduce log noise
      combine_logs: true,
    },

    // ── REST API + WebSocket Server ─────────────────────────────────────────
    {
      name:             "safuu-api",
      script:           "./safuu-server.js",
      instances:        1,           // Single instance — SQLite can't handle multi-writer
      exec_mode:        "fork",
      watch:            false,
      autorestart:      true,
      restart_delay:    3000,
      max_restarts:     10,
      min_uptime:       "20s",

      out_file:         "./logs/api-out.log",
      error_file:       "./logs/api-err.log",
      log_date_format:  "YYYY-MM-DD HH:mm:ss",
      merge_logs:       true,

      env: {
        NODE_ENV: "production",
        API_PORT:  "3001",
      },

      max_memory_restart: "300M",
      kill_timeout:       10000,
    },

    // ── SMS Server (Africa's Talking) ──────────────────────────────────────
    {
      name:             "safuu-sms",
      script:           "./safuu-sms.js",
      instances:        1,
      exec_mode:        "fork",
      watch:            false,
      autorestart:      true,
      restart_delay:    5000,
      max_restarts:     10,
      min_uptime:       "20s",

      out_file:         "./logs/sms-out.log",
      error_file:       "./logs/sms-err.log",
      log_date_format:  "YYYY-MM-DD HH:mm:ss",
      merge_logs:       true,

      env: {
        NODE_ENV: "production",
        SMS_PORT:  "3002",
      },

      max_memory_restart: "200M",
      kill_timeout:       10000,
    },
  ],
};
