const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// You can set the log level via an environment variable, e.g., LOG_LEVEL=debug
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const configuredLevel = LOG_LEVELS[CURRENT_LOG_LEVEL.toLowerCase()] ?? LOG_LEVELS.info;

const createLogFunction = (level) => {
  if (LOG_LEVELS[level] <= configuredLevel) {
    // Return a function that logs messages at the specified level
    return (...args) => {
      const timestamp = new Date().toISOString();
      // Use console[level] which corresponds to console.info, console.warn, etc.
      console[level](`[${timestamp}] [${level.toUpperCase()}]`, ...args);
    };
  }
  // Return a no-op function if the log level is below the configured level
  return () => {};
};

module.exports = {
  info: createLogFunction('info'),
  warn: createLogFunction('warn'),
  error: createLogFunction('error'),
  debug: createLogFunction('debug'),
};