// events/interactionCreate.js
// events/interactionCreate.js

const logger = require('../utils/logger');

/**
 * 指定コレクションからカスタムIDに合致するハンドラを取得する
 * 完全一致またはprefix一致をサポート
 * @param {import('discord.js').Collection<string, any>} collection 
 * @param {string} customId 
 * @returns {any|null}
 */
function findComponentHandler(collection, customId) {
  // 完全一致優先
  const handler = collection.get(customId);
  if (handler) return handler;

  // prefix一致 (動的customId対応)
  for (const [key, value] of collection.entries()) {
    if (value.customIdPrefix && customId.startsWith(value.customIdPrefix)) {
      return value;
    }
  }
  return null;
}

module.exports = {
  name: 'interactionCreate',
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    // エラー処理共通関数
    const handleError = async (error, type, name) => {
      logger.error(`Error executing ${type} '${name}':`, error);
      const reply = { content: '⚠️ 処理中にエラーが発生しました。', flags: 64 }; // ephemeral
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      } catch (sendError) {
        logger.error(`Failed to send error reply for interaction ${interaction.id}:`, sendError);
      }
    };

    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このコマンドは存在しません。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このコマンドは存在しません。', ephemeral: true });
          }
          return;
        }
        await command.execute(interaction, client);

      } else if (interaction.isButton()) {
        const handler = findComponentHandler(client.buttons, interaction.customId);
        if (!handler) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このボタンは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このボタンは無効です。', ephemeral: true });
          }
          return;
        }
        await handler.execute(interaction, client);

      } else if (interaction.isSelectMenu()) {
        const handler = findComponentHandler(client.selectMenus, interaction.customId);
        if (!handler) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このセレクトメニューは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このセレクトメニューは無効です。', ephemeral: true });
          }
          return;
        }
        await handler.execute(interaction, client);

      } else if (interaction.isModalSubmit()) {
        const handler = findComponentHandler(client.modals, interaction.customId);
        if (!handler) {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このモーダルは無効です。', ephemeral: true });
          } else {
            await interaction.reply({ content: 'このモーダルは無効です。', ephemeral: true });
          }
          return;
        }
        await handler.execute(interaction, client);
      }

    } catch (error) {
      logger.error('interactionCreateイベントでエラー:', error);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '処理中にエラーが発生しました。', ephemeral: true });
        } else {
          await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
        }
      } catch (err) {
        logger.error('エラー通知送信時にさらにエラー:', err);
      }
    }
  },
};
