type LogLevel = "info" | "error" | "warn" | "debug";

const isDev = process.env.NODE_ENV !== "production";

function formatMessage(level: LogLevel, message: string, meta?: any) {
  return {
    level,
    message,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
}

export const logger = {
  info(message: string, meta?: any) {
    const log = formatMessage("info", message, meta);
    if (isDev) console.log(log);
  },

  error(message: string, meta?: any) {
    const log = formatMessage("error", message, meta);
    console.error(log);
  },

  warn(message: string, meta?: any) {
    const log = formatMessage("warn", message, meta);
    console.warn(log);
  },

  debug(message: string, meta?: any) {
    if (!isDev) return;
    const log = formatMessage("debug", message, meta);
    console.debug(log);
  },
};