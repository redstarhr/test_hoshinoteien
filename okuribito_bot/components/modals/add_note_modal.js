// okuribito_bot/components/modals/add_note_modal.js

module.exports = {
  customId: 'add_note_modal',
  async execute(interaction) {
    const note = interaction.fields.getTextInputValue('note_input');

    const message = interaction.message;
    if (!message) {
      await interaction.reply({ content: '対象メッセージが見つかりません。', ephemeral: true });
      return;
    }

    const embed = message.embeds[0];
    if (!embed) {
      await interaction.reply({ content: '対象のEmbedが見つかりません。', ephemeral: true });
      return;
    }

    // 備考欄に追記する例（フィールド追加または説明文追記）
    const newEmbed = embed.toJSON();

    // フィールドとして備考を追加（既存の備考があれば追記）
    let remarksField = newEmbed.fields?.find(f => f.name === '備考');
    if (remarksField) {
      remarksField.value += `\n${note}`;
    } else {
      if (!newEmbed.fields) newEmbed.fields = [];
      newEmbed.fields.push({
        name: '備考',
        value: note || 'なし',
      });
    }

    await interaction.update({ embeds: [newEmbed] });
  }
};
