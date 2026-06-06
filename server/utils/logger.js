/**
 * utils/logger.js
 * Lightweight structured logger.
 * - Development: coloured, human-readable output
 * - Production:  single-line JSON (easy to ingest by log aggregators)
 */

const IS_PROD = process.env.NODE_ENV === "production";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const COLOURS = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
  reset: "\x1b[0m",
};

const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

const formatDev = (level, message, meta) => {
  const colour = COLOURS[level] ?? "";
  const tag = `${colour}[${level.toUpperCase()}]${COLOURS.reset}`;
  const ts = new Date().toISOString();
  const base = `${ts} ${tag} ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const formatProd = (level, message, meta) =>
  JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta });

const log = (level, message, meta) => {
  if (LEVELS[level] < MIN_LEVEL) return;
  const line = IS_PROD
    ? formatProd(level, message, meta)
    : formatDev(level, message, meta);
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  console[method](line);
};

export const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info:  (msg, meta) => log("info",  msg, meta),
  warn:  (msg, meta) => log("warn",  msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};
