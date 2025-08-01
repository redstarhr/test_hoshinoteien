// okuribito_bot/components/buttons/mark_complete_button.js
const { EmbedBuilder } = require('discord.js');
const { handleInteractionError } = require('../../../handlers/interactionErrorHandler');

module.exports = {
  customId: 'mark_complete_button',
  async execute(interaction) {
    try {
      // すでに完了済みか判定（Embedタイトルで判別など）
      const message = interaction.message;
      const embed = message.embeds[0];
      if (!embed) {
        await interaction.reply({ content: 'エンベッドが見つかりません。', ephemeral: true });
        return;
      }

      if (embed.title && embed.title.includes('🏠送りました🏠')) {
        await interaction.reply({ content: 'この送迎は既に完了済みです。', ephemeral: true });
        return;
      }

      // embedタイトルを変更
      const newEmbed = EmbedBuilder.from(embed)
        .setTitle(embed.title.replace('🚕送ります🚕', '🏠送りました🏠'));

      await interaction.update({ embeds: [newEmbed], components: [] }); // ボタン無効化も可能
    } catch (error) {
      await handleInteractionError(interaction, error, '送迎完了マーク処理に失敗しました。');
    }
  }
};
