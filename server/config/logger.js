// Structured logging utility
const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] [${formatTimestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] [${formatTimestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] [${formatTimestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
  },
  security: (action, meta = {}) => {
    console.log(`[SECURITY-AUDIT] [${formatTimestamp()}] [${action}]`, meta);
  }
};
