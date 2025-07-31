// index.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const logger = require('./utils/logger');

// コマンド・インタラクション読み込み関数を別ファイルにまとめているならここで読み込み
const { loadCommands } = require('./handlers/commandLoader');
const { loadInteractions } = require('./handlers/interactionLoader');

// devcmd.jsからコマンド登録関数をインポート
const { registerCommands } = require('./scripts/devcmd'); // パスは適宜調整

// クライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// コレクションをクライアントにアタッチ
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

// コマンド・インタラクションを読み込み
loadCommands(client);
loadInteractions(client);

// イベント読み込み
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file);
      delete require.cache[require.resolve(filePath)];  // キャッシュクリア
      const event = require(filePath);
      if (!event || typeof event !== 'object' || !event.name || !event.execute) {
        logger.warn(`⚠️ 無効なイベントファイル: ${file}`);
        continue;
      }
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      logger.info(`✅ イベント登録完了: ${event.name}`);
    } catch (error) {
      logger.error(`❌ イベント読み込み中にエラーが発生しました: ${file}`, error);
    }
  }
  logger.info(`✅ ${eventFiles.length} 件のイベントハンドラを読み込みました。`);
} else {
  logger.warn('⚠️ events フォルダが見つかりませんでした。');
}

// Discordログイン＆起動処理
(async () => {
  try {
    await registerCommands(); // 起動時にスラッシュコマンド登録を実行

    await client.login(process.env.DISCORD_TOKEN);
    logger.info('BOTが正常に起動しました。');
  } catch (error) {
    logger.error('BOT起動中に致命的なエラーが発生しました:', error);
    process.exit(1);
  }
})();
