// okuribito_bot/components/buttons/send_taxi_button.js

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const readJson = require('../../../utils/readJson');
const config = require('../../../config');
const logger = require('../../../utils/logger');

module.exports = {
  customId: 'send_taxi_button',
  async execute(interaction) {
    const { guildId } = interaction;
    const configPath = config.paths.okuribito.config;

    try {
      const okuribitoConfig = await readJson(guildId, configPath);
      const okuribitoUsers = okuribitoConfig?.users
        ? Object.entries(okuribitoConfig.users)
            .filter(([, userData]) => userData.active) // Only include active users
            .map(([userId, userData]) => ({
              label: userData.name,
              value: userId,
            }))
        : [];

      if (okuribitoUsers.length === 0) {
        return interaction.reply({ content: '現在、送迎可能な送り人が登録されていません。', ephemeral: true });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_okuribito_user')
        .setPlaceholder('送り人を選択してください')
        .addOptions(okuribitoUsers.slice(0, 25)); // Select Menu options are limited to 25

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: '送り人を選択してください。',
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      logger.error(`Error creating okuribito selection menu (Guild ID: ${guildId})`, error);
      await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
  },
};
