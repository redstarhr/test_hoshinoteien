// handlers/commandLoader.js

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * 指定されたクライアントに、全Botモジュールのコマンドを読み込む
 * @param {import('discord.js').Client} client 
 */
function loadCommands(client) {
  // modules一覧（commandsまたはinteractionsディレクトリが存在するもの）
  const botModules = fs.readdirSync(path.join(__dirname, '..'), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name =>
      fs.existsSync(path.join(__dirname, '..', name, 'commands')) ||
      fs.existsSync(path.join(__dirname, '..', name, 'interactions'))
    );

  logger.info(`🔄 ${botModules.length}個のモジュールを検出: [${botModules.join(', ')}]`);

  for (const moduleName of botModules) {
    const commandsPath = path.join(__dirname, '..', moduleName, 'commands');

    if (!fs.existsSync(commandsPath)) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = require(filePath);
        if (command?.data && typeof command.execute === 'function') {
          client.commands.set(command.data.name, command);
        } else {
          logger.warn(`⚠️ 無効なコマンド: ${moduleName}/commands/${file}`);
        }
      } catch (error) {
        logger.error(`❌ コマンド読み込み失敗: ${moduleName}/commands/${file} - ${error.message}`);
      }
    }
  }
}

module.exports = { loadCommands };
