// handlers/interactionLoader.js

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Discord Bot 各モジュールの components フォルダから
 * buttons, selects, modals を読み込み、
 * client の対応コレクションに登録する。
 * @param {import('discord.js').Client} client
 */
function loadInteractions(client) {
  const baseDir = path.resolve(__dirname, '..');

  // モジュールディレクトリ（commands または components を含む）を取得
  const botModules = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name =>
      fs.existsSync(path.join(baseDir, name, 'commands')) ||
      fs.existsSync(path.join(baseDir, name, 'components'))
    );

  // interactionタイプと client のコレクションのマッピング
  const interactionTypes = {
    buttons: {
      dirName: 'buttons',
      collection: client.buttons,
    },
    selectMenus: {
      dirName: 'selects', // NOTE: ディレクトリ名は "selectMenus" ではなく "selects"
      collection: client.selectMenus,
    },
    modals: {
      dirName: 'modals',
      collection: client.modals,
    },
  };

  let totalLoaded = 0;

  for (const moduleName of botModules) {
    const componentsPath = path.join(baseDir, moduleName, 'components');

    for (const [type, { dirName, collection }] of Object.entries(interactionTypes)) {
      const typePath = path.join(componentsPath, dirName);
      if (!fs.existsSync(typePath)) continue;

      const files = fs.readdirSync(typePath).filter(file => file.endsWith('.js'));
      if (files.length === 0) continue;

      logger.info(`📂 [${moduleName}] ${dirName} ディレクトリから ${files.length} 件の ${type} を読み込み中...`);

      for (const file of files) {
        const filePath = path.join(typePath, file);
        try {
          delete require.cache[require.resolve(filePath)];
          const handler = require(filePath);

          if (
            handler &&
            (typeof handler.customId === 'string' || typeof handler.customIdPrefix === 'string') &&
            typeof handler.execute === 'function'
          ) {
            const id = handler.customId || handler.customIdPrefix;

            if (collection.has(id)) {
              logger.warn(`⚠️ 重複したインタラクションID "${id}" が既に登録されています。ファイル: ${filePath}`);
            }

            collection.set(id, handler);
            totalLoaded++;
          } else {
            logger.warn(`⚠️ 無効なインタラクション: customId または execute() が不足しています。ファイル: ${filePath}`);
          }
        } catch (error) {
          logger.error(`❌ インタラクションの読み込み中にエラーが発生しました: ${filePath}`, error);
        }
      }
    }
  }

  logger.info(`✅ インタラクションの読み込み完了。合計: ${totalLoaded} 件`);
}

module.exports = { loadInteractions };
