// 🌳 星の校庭 🌳 bot - メインエントリーポイント (okuribito_bot専用)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

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

// コレクション初期化
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

// モジュール名
const mod = 'okuribito_bot';

// 各パス定義
const basePath = path.join(__dirname, mod);
const structure = {
  commands: client.commands,
  buttons: client.buttons,
  modals: client.modals,
  selects: client.selectMenus,
};

// 各種ハンドラを読み込み
for (const [type, collection] of Object.entries(structure)) {
  const dir = type === 'selects' ? 'selects' : type; // フォルダ名に合わせる
  const targetPath = path.join(basePath, 'components', dir);
  const isCommand = type === 'commands';
  const isSelect = type === 'selects';

  const actualPath = isCommand ? path.join(basePath, 'commands') : targetPath;
  if (!fs.existsSync(actualPath)) continue;

  const files = fs.readdirSync(actualPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(actualPath, file);
    const handler = require(filePath);

    const key = handler.customId || (handler.data && handler.data.name);
    const isValid = isCommand
      ? handler.data && handler.execute
      : handler.customId && handler.execute;

    if (key && isValid) {
      collection.set(key, handler);
    } else {
      console.warn(`⚠️ 無効な ${type} ハンドラ: ${file}`);
    }
  }

  console.log(`📁 ${type} 読み込み完了: ${collection.size} 件`);
}

// イベント読み込み
const eventsPath = path.join(basePath, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    const eventName = file.split('.')[0];

    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client));
    } else {
      client.on(eventName, (...args) => event.execute(...args, client));
    }
  }

  console.log(`✅ イベントハンドラ読み込み完了: ${eventFiles.length} 件`);
} else {
  console.log('ℹ️ events フォルダが見つかりませんでした。');
}

// インタラクションハンドリング（基本保険）
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) return await command.execute(interaction, client);
    } else if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (button) return await button.execute(interaction, client);
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (modal) return await modal.execute(interaction, client);
    } else if (interaction.isStringSelectMenu()) {
      const menu = client.selectMenus.get(interaction.customId);
      if (menu) return await menu.execute(interaction, client);
    }
  } catch (err) {
    console.error('❌ インタラクション実行エラー:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '⚠️ 処理中にエラーが発生しました。', ephemeral: true });
    } else {
      await interaction.reply({ content: '⚠️ 処理中にエラーが発生しました。', ephemeral: true });
    }
  }
});

// ログイン
client.login(process.env.DISCORD_TOKEN);
