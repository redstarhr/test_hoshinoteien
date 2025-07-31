// okuribito_bot/components/index.js

const fs = require('fs');
const path = require('path');

// 各コンポーネントのディレクトリパス
const componentsPath = {
  buttons: path.join(__dirname, 'buttons'),
  modals: path.join(__dirname, 'modals'),
  selects: path.join(__dirname, 'selects'),
};

// 各タイプのハンドラーMap
const buttonHandlers = new Map();
const modalHandlers = new Map();
const selectMenuHandlers = new Map();

/**
 * 指定ディレクトリからハンドラーを読み込み
 * @param {string} dirPath
 * @param {Map<string, object>} targetMap
 */
function loadHandlers(dirPath, targetMap) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️ ディレクトリが存在しません: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    try {
      // キャッシュクリア（ホットリロード用）
      const fullPath = path.join(dirPath, file);
      delete require.cache[require.resolve(fullPath)];

      const handler = require(fullPath);

      if (handler && typeof handler.customId === 'string' && typeof handler.execute === 'function') {
        targetMap.set(handler.customId, handler);
        console.log(`✅ Loaded handler: ${handler.customId} (${file})`);
      } else {
        console.warn(`⚠️ 無効なハンドラー定義（customIdかexecuteが不足）: ${file}`);
      }
    } catch (e) {
      console.error(`❌ ハンドラー読み込み失敗: ${file}`, e);
    }
  }
}

// 各種ハンドラーを読み込み
loadHandlers(componentsPath.buttons, buttonHandlers);
loadHandlers(componentsPath.modals, modalHandlers);
loadHandlers(componentsPath.selects, selectMenuHandlers);

// ロード状況ログ関数（必要ならindex.jsで呼ぶ）
function logLoadedHandlers() {
  console.log('--- 登録済みインタラクション一覧 ---');

  console.log(`ボタン（buttons）: ${buttonHandlers.size} 個`);
  for (const key of buttonHandlers.keys()) {
    console.log(`  - ${key}`);
  }

  console.log(`セレクトメニュー（selectMenus）: ${selectMenuHandlers.size} 個`);
  for (const key of selectMenuHandlers.keys()) {
    console.log(`  - ${key}`);
  }

  console.log(`モーダル（modals）: ${modalHandlers.size} 個`);
  for (const key of modalHandlers.keys()) {
    console.log(`  - ${key}`);
  }

  console.log('------------------------------------');
}

module.exports = {
  buttonHandlers,
  modalHandlers,
  selectMenuHandlers,
  logLoadedHandlers,
};
