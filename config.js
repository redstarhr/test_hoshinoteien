// config.js
module.exports = {
  GCS_DATA_ROOT: 'data-hoshinokoutei',
  paths: {
    okuribito: {
      // {date} は '20240731' のような日付文字列に置換して使用します
      log: 'okuribito/送り人ログ/{date}_送り人.csv',
      config: 'okuribito/config.json',
    },
  },
};