// okuribito_bot/components/buttons/add_note_button.js

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'add_note_button',
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('add_note_modal')
      .setTitle('備考を入力してください');

    const noteInput = new TextInputBuilder()
      .setCustomId('note_input')
      .setLabel('備考')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('ここに備考を入力してください')
      .setRequired(false)
      .setMaxLength(4000);

    const firstActionRow = new ActionRowBuilder().addComponents(noteInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  }
};
