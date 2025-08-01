// handlers/interactionLoader.js

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * 指定ディレクトリ内のすべての .js ファイルを再帰的に取得
 * @param {string} dirPath
 * @returns {string[]} ファイルパス一覧
 */
function getAllJsFilesRecursively(dirPath) {
  const files = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllJsFilesRecursively(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 指定モジュールの特定コンポーネント種別（buttons/selects/modals）を読み込む
 * @param {string} basePath - components ディレクトリのパス
 * @param {string} typeDir - buttons/selects/modals
 * @param {import('discord.js').Collection} collection
 * @param {string} moduleName
 */
function loadComponentType(basePath, typeDir, collection, moduleName) {
  const targetDirs = [
    path.join(basePath, typeDir),
    path.join(basePath, 'panels', typeDir),
    path.join(basePath, 'settings', typeDir),
  ];

  let loaded = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    const jsFiles = getAllJsFilesRecursively(dir);
    if (jsFiles.length === 0) continue;

    logger.info(`📂 [${moduleName}] ${path.relative(basePath, dir)} から ${jsFiles.length} 件の ${typeDir} を読み込み中...`);

    for (const filePath of jsFiles) {
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
          loaded++;
        } else {
          logger.warn(`⚠️ 無効なインタラクション: customId または execute() が不足しています。ファイル: ${filePath}`);
        }
      } catch (error) {
        logger.error(`❌ インタラクションの読み込み中にエラーが発生しました: ${filePath}`, error);
      }
    }
  }

  return loaded;
}

/**
 * 各モジュールから buttons / selects / modals を panels, settings 含めて読み込む
 * @param {import('discord.js').Client} client
 */
function loadInteractions(client) {
  const baseDir = path.resolve(__dirname, '..');

  const botModules = fs.readdirSync(baseDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name =>
      fs.existsSync(path.join(baseDir, name, 'commands')) ||
      fs.existsSync(path.join(baseDir, name, 'components'))
    );

  // 初期化
  client.buttons = new Map();
  client.selectMenus = new Map();
  client.modals = new Map();

  const interactionTypes = {
    buttons: client.buttons,
    selects: client.selectMenus,
    modals: client.modals,
  };

  let totalLoaded = 0;

  for (const moduleName of botModules) {
    const componentsPath = path.join(baseDir, moduleName, 'components');
    if (!fs.existsSync(componentsPath)) continue;

    for (const [typeDir, collection] of Object.entries(interactionTypes)) {
      const count = loadComponentType(componentsPath, typeDir, collection, moduleName);
      totalLoaded += count;
    }
  }

  logger.info(`✅ インタラクションの読み込み完了。合計: ${totalLoaded} 件`);
}

module.exports = { loadInteractions };
