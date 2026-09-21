const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const activeLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS[defaultLevel];

const log = (level, method) => (message, data = null) => {
  if (LEVELS[level] > activeLevel) return;

  const prefix = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;

  if (data === null || data === undefined) {
    console[method](prefix);
  } else {
    console[method](prefix, data);
  }
};

const logger = {
  error: log('error', 'error'),
  warn: log('warn', 'warn'),
  info: log('info', 'log'),
  debug: log('debug', 'debug'),
};

module.exports = logger;
