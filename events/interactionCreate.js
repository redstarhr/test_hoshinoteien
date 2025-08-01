// events/interactionCreate.js

const logger = require('../utils/logger');
const { handleInteractionError } = require('../handlers/interactionErrorHandler');

/**
 * 指定コレクションからカスタムIDに合致するハンドラを取得する
 * 完全一致または prefix 一致に対応
 * @param {import('discord.js').Collection<string, any>} collection 
 * @param {string} customId 
 * @returns {any|null}
 */
function findComponentHandler(collection, customId) {
  const exact = collection.get(customId);
  if (exact) return exact;

  for (const [key, value] of collection.entries()) {
    if (value.customIdPrefix && customId.startsWith(value.customIdPrefix)) {
      return value;
    }
  }
  return null;
}

/**
 * interactionに対して安全にreply/followUpを行う
 * @param {import('discord.js').Interaction} interaction 
 * @param {string} message 
 */
async function safeReply(interaction, message) {
  const payload = { content: message, ephemeral: true };
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload);
  } else {
    await interaction.reply(payload);
  }
}

/**
 * 共通ハンドラ実行処理
 * @param {any} handler 
 * @param {import('discord.js').Interaction} interaction 
 * @param {import('discord.js').Client} client 
 * @param {string} typeLabel 
 */
async function executeHandler(handler, interaction, client, typeLabel) {
  if (!handler) {
    await safeReply(interaction, `この${typeLabel}は無効です。`);
    return;
  }
  await handler.execute(interaction, client);
}

function isAnySelectMenu(interaction) {
  return interaction.isStringSelectMenu() || interaction.isUserSelectMenu() ||
         interaction.isRoleSelectMenu() || interaction.isMentionableSelectMenu();
}

module.exports = {
  name: 'interactionCreate',
  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        logger.info(`[interactionCreate] ChatInputCommand: ${interaction.commandName} by ${interaction.user.tag}`);
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          await safeReply(interaction, 'このコマンドは存在しません。');
          return;
        }
        await command.execute(interaction, client);

      } else if (interaction.isButton()) {
        logger.info(`[interactionCreate] Button: ${interaction.customId} by ${interaction.user.tag}`);
        const handler = findComponentHandler(client.buttons, interaction.customId);
        await executeHandler(handler, interaction, client, 'ボタン');

      } else if (isAnySelectMenu(interaction)) {
        logger.info(`[interactionCreate] SelectMenu: ${interaction.customId} by ${interaction.user.tag} values: ${interaction.values.join(', ')}`);
        const handler = findComponentHandler(client.selectMenus, interaction.customId);
        await executeHandler(handler, interaction, client, 'セレクトメニュー');

      } else if (interaction.isModalSubmit()) {
        logger.info(`[interactionCreate] Modal: ${interaction.customId} by ${interaction.user.tag}`);
        const handler = findComponentHandler(client.modals, interaction.customId);
        await executeHandler(handler, interaction, client, 'モーダル');

      } else {
        logger.warn(`[interactionCreate] Unknown interaction type: ${interaction.type}, customId: ${interaction.customId ?? 'N/A'}`);
        await safeReply(interaction, 'この操作にはまだ対応していません。');
      }

    } catch (error) {
      await handleInteractionError(interaction, error, `interactionCreateイベントで未補足のエラーが発生しました (type: ${interaction.type}, customId: ${interaction.customId ?? 'N/A'})`);
    }
  },
};
