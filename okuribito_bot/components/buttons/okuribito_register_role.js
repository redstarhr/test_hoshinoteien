// okuribito_bot/components/buttons/register_role_button.js

const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'okuribito_register_role',
  async execute(interaction) {
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId('okuribito_role_select')
      .setPlaceholder('送り人ロールを選択')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '送り人ロールを選択してください。',
      components: [row],
      ephemeral: true,
    });
  },
};
