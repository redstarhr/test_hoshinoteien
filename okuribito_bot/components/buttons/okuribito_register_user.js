// okuribito_bot/components/buttons/okuribito_user_select.js

const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'okuribito_register_user',
  async execute(interaction) {
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId('okuribito_user_select')
      .setPlaceholder('送り人として登録するユーザーを選択（複数可）')
      .setMinValues(1)
      .setMaxValues(25); // 最大人数は必要に応じて調整

    const row = new ActionRowBuilder().addComponents(userSelect);

    await interaction.reply({
      content: '送り人に登録したいユーザーを選択してください。',
      components: [row],
      ephemeral: true,
    });
  },
};
