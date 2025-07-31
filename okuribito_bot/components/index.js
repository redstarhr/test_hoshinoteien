// okuribito_bot/components/index.js

const fs = require('fs');
const path = require('path');

/**
 * 指定フォルダ内のハンドラーをMapで読み込む
 * @param {string} type - サブフォルダ名（buttons, selects, modals）
 * @returns {Map<string, object>}
 */
function loadHandlers(type) {
  const dirPath = path.join(__dirname, type);
  const handlers = new Map();

  if (!fs.existsSync(dirPath)) return handlers;

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));
  for (const file of files) {
    try {
      const handler = require(path.join(dirPath, file));
      if (handler?.customId && typeof handler.execute === 'function') {
        handlers.set(handler.customId, handler);
      } else {
        console.warn(`⚠️ 不正なハンドラー: ${type}/${file} (customId または execute 関数がありません)`);
      }
    } catch (error) {
      console.error(`❌ ハンドラー読み込みエラー: ${type}/${file}`, error);
    }
  }

  return handlers;
}

const buttons = loadHandlers('buttons');
const selects = loadHandlers('selects');
const modals = loadHandlers('modals');

module.exports = {
  buttons,
  selects,
  modals,
};
