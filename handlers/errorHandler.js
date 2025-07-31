// handlers/errorHandler.js

/**
 * Discordインタラクションの汎用エラーハンドラー
 * @param {Interaction} interaction - Discord.jsのインタラクションオブジェクト
 * @param {Error} error - 発生したエラーオブジェクト
 */
async function handleInteractionError(interaction, error) {
  console.error('Interaction error:', error);

  // すでに返信済みかどうかチェック
  if (interaction.replied || interaction.deferred) {
    try {
      await interaction.followUp({
        content: '⚠️ エラーが発生しました。管理者に連絡してください。',
        ephemeral: true,
      });
    } catch (followUpError) {
      console.error('フォローアップ返信失敗:', followUpError);
    }
  } else {
    try {
      await interaction.reply({
        content: '⚠️ エラーが発生しました。管理者に連絡してください。',
        ephemeral: true,
      });
    } catch (replyError) {
      console.error('初回返信失敗:', replyError);
    }
  }
}

module.exports = { handleInteractionError };
