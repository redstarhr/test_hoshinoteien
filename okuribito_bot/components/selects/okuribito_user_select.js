// okuribito_bot/components/selects/okuribito_user_select.js
const readJson = require('../../../utils/readJson');
const writeJson = require('../../../utils/writeJson');
const config = require('../../../config');
const logger = require('../../../utils/logger');

module.exports = {
  customId: 'okuribito_user_select',
  async execute(interaction) {
    const { guildId, values: selectedUserIds, members } = interaction;
    const configPath = config.paths.okuribito.config;

    await interaction.deferUpdate();

    try {
      // 1. Read the current configuration from GCS
      let okuribitoConfig = await readJson(guildId, configPath);
      if (!okuribitoConfig) {
        okuribitoConfig = { users: {} }; // Create a new object if it doesn't exist
      }
      if (!okuribitoConfig.users) {
        okuribitoConfig.users = {};
      }

      // 2. Register/update the selected users
      const addedUsers = [];
      for (const userId of selectedUserIds) {
        const member = members.get(userId);
        if (member) {
          okuribitoConfig.users[userId] = {
            name: member.user.username,
            active: true, // Active by default
          };
          addedUsers.push(`<@${userId}>`);
        }
      }

      // 3. Write the updated configuration back to GCS
      await writeJson(guildId, configPath, okuribitoConfig);

      logger.info(`Updated okuribito users for guild [${guildId}]: ${addedUsers.join(', ')}`);
      await interaction.editReply({
        content: `✅ 以下のユーザーを送り人として登録しました:\n${addedUsers.join('\n')}`,
        components: [], // Remove the menu
      });
    } catch (error) {
      logger.error(`Error during okuribito user registration (Guild ID: ${guildId})`, error);
      await interaction.editReply({
        content: '❌ ユーザー登録中にエラーが発生しました。',
        components: [],
      });
    }
  },
};