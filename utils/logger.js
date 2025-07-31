// utils/logger.js

const { Console } = require('console');
const chalk = require('chalk'); // 色付け用（optional）

const logger = {
  info: (message, ...optionalParams) => {
    console.log(chalk.blue('[INFO]'), message, ...optionalParams);
  },

  warn: (message, ...optionalParams) => {
    console.warn(chalk.yellow('[WARN]'), message, ...optionalParams);
  },

  error: (message, ...optionalParams) => {
    console.error(chalk.red('[ERROR]'), message, ...optionalParams);
  },

  debug: (message, ...optionalParams) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(chalk.gray('[DEBUG]'), message, ...optionalParams);
    }
  },
};

module.exports = logger;
