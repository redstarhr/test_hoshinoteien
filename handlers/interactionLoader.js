// handlers/interactionLoader.js

const fs = require('fs');
const path = require('path');

/**
 * 各モジュールのinteractionsフォルダから
 * buttons, selectMenus, modals を読み込み
 * clientの対応コレクションにセットする
 * @param {import('discord.js').Client} client 
 */
function loadInteractions(client) {
  const baseDir = path.resolve(__dirname, '..');
  const botModules = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name =>
      fs.existsSync(path.join(baseDir, name, 'commands')) ||
      fs.existsSync(path.join(baseDir, name, 'interactions'))
    );

  const interactionTypes = {
    buttons: client.buttons,
    selectMenus: client.selectMenus,
    modals: client.modals,
  };

  for (const moduleName of botModules) {
    const interactionsPath = path.join(baseDir, moduleName, 'interactions');
    if (!fs.existsSync(interactionsPath)) continue;

    for (const [type, collection] of Object.entries(interactionTypes)) {
      const typePath = path.join(interactionsPath, type);
      if (!fs.existsSync(typePath)) continue;

      const files = fs.readdirSync(typePath).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const filePath = path.join(typePath, file);
        try {
          // 開発時に変更反映したい場合はキャッシュ削除
          delete require.cache[require.resolve(filePath)];

          const handler = require(filePath);

          if (
            handler &&
            typeof handler.customId === 'string' &&
            typeof handler.handle === 'function'
          ) {
            if (collection.has(handler.customId)) {
              console.warn(`⚠️ 重複したカスタムID: ${handler.customId} ファイル: ${filePath}`);
            }
            collection.set(handler.customId, handler);
          } else {
            console.warn(`⚠️ 不正なインタラクション定義: ${filePath}`);
          }
        } catch (error) {
          console.error(`❌ インタラクション読み込み失敗: ${filePath}`, error);
        }
      }
    }
  }
}

module.exports = { loadInteractions };
