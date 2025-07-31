// events/interactionHandler.js

const logger = require('../utils/logger');
const { handleInteractionError } = require('../utils/errorHandler');

/**
 * Discord.js Interactionイベントの汎用ハンドラー
 * @param {import('discord.js').Interaction} interaction
 * @param {Object} components - 各種コンポーネントモジュールのマップ（例：buttons, selects, modals）
 */
async function handleInteraction(interaction, components) {
  try {
    if (interaction.isButton()) {
      // 完全一致優先でハンドラー取得
      let handler = components.buttons[interaction.customId];

      // 先頭マッチも試す（例：カスタムIDに動的部分がある場合）
      if (!handler) {
        handler = Object.values(components.buttons).find(h =>
          h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)
        );
      }

      if (handler) {
        await handler.execute(interaction);
      } else {
        logger.warn(`未対応のボタンカスタムID: ${interaction.customId}`);
      }

    } else if (interaction.isSelectMenu()) {
      // 完全一致
      let handler = components.selects[interaction.customId];

      // 先頭マッチでのハンドラー検出
      if (!handler) {
        handler = Object.values(components.selects).find(h =>
          h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)
        );
      }

      if (handler) {
        await handler.execute(interaction);
      } else {
        logger.warn(`未対応のセレクトメニューカスタムID: ${interaction.customId}`);
      }

    } else if (interaction.isModalSubmit()) {
      // 完全一致
      let handler = components.modals[interaction.customId];

      // 先頭マッチ
      if (!handler) {
        handler = Object.values(components.modals).find(h =>
          h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)
        );
      }

      if (handler) {
        await handler.execute(interaction);
      } else {
        logger.warn(`未対応のモーダルカスタムID: ${interaction.customId}`);
      }

    } else {
      logger.info(`対応外のインタラクションタイプ: ${interaction.type}`);
    }
  } catch (error) {
    await handleInteractionError(interaction, error);
  }
}

module.exports = { handleInteraction };
