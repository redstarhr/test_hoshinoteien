// 🌳 星の校庭 🌳 bot - メインエントリーポイント

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandLoader');
const { loadInteractions } = require('./handlers/interactionLoader');
const logger = require('./utils/logger');

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

// コマンドとインタラクションを読み込み
loadCommands(client);
loadInteractions(client);

// イベント読み込み
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  logger.info(`✅ ${eventFiles.length} 件のイベントハンドラを読み込みました。`);
} else {
  logger.warn('events フォルダが見つかりませんでした。');
}

// ログイン
client.login(process.env.DISCORD_TOKEN);
