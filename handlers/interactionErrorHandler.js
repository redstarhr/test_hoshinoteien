const logger = require('../utils/logger');

/**
 * Discordインタラクションで発生したエラーを処理する汎用ハンドラ
 * @param {import('discord.js').CommandInteraction | import('discord.js').ButtonInteraction | import('discord.js').AnySelectMenuInteraction} interaction - エラーが発生したインタラクション
 * @param {Error} error - 発生したエラーオブジェクト
 * @param {string} logMessage - ログに出力するメッセージ
 * @param {string} [userMessage='処理中にエラーが発生しました。'] - ユーザーに表示するメッセージ
 */
async function handleInteractionError(interaction, error, logMessage, userMessage = '処理中にエラーが発生しました。') {
  // 詳細なエラーログを記録
  logger.error({ message: logMessage, error: error.stack || error });

  const replyOptions = {
    content: `⚠️ ${userMessage}`,
    ephemeral: true,
    components: [],
    embeds: [],
  };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  } catch (replyError) {
    // 返信に失敗した場合 (例: interaction tokenの期限切れ)
    logger.error({ message: 'インタラクションへのエラー返信に失敗しました。', error: replyError.stack || replyError });
  }
}

module.exports = { handleInteractionError };
