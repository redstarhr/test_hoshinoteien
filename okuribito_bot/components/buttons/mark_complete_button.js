// okuribito_bot/components/buttons/mark_complete_button.js

module.exports = {
  customId: 'mark_complete_button',
  async execute(interaction) {
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
    const newEmbed = embed.toJSON();
    newEmbed.title = newEmbed.title.replace('🚕送ります🚕', '🏠送りました🏠');

    await interaction.update({ embeds: [newEmbed], components: [] }); // ボタン無効化も可能

    // ここに完了ログの追記や追加処理を入れても良い
  }
};
