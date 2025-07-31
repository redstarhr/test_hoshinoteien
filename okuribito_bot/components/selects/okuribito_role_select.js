// okuribito_bot/components/selects/okuribito_role_select.js
const readJson = require('../../../utils/readJson');
const writeJson = require('../../../utils/writeJson');
const config = require('../../../config');
const logger = require('../../../utils/logger');

module.exports = {
  customId: 'okuribito_role_select',
  async execute(interaction) {
    const { guildId, values } = interaction;
    const selectedRoleId = values[0];
    const configPath = config.paths.okuribito.config;

    await interaction.deferUpdate();

    try {
      // 1. Read the current configuration from GCS
      let okuribitoConfig = await readJson(guildId, configPath);
      if (!okuribitoConfig) {
        okuribitoConfig = { users: {} }; // Create a new object if it doesn't exist
      }

      // 2. Save the selected role ID
      okuribitoConfig.roleId = selectedRoleId;

      // 3. Write the updated configuration back to GCS
      await writeJson(guildId, configPath, okuribitoConfig);

      logger.info(`Set okuribito role for guild [${guildId}] to <@&${selectedRoleId}>.`);
      await interaction.editReply({
        content: `✅ 送り人ロールを <@&${selectedRoleId}> に設定しました。`,
        components: [], // Remove the menu
      });
    } catch (error) {
      logger.error(`Error setting okuribito role (Guild ID: ${guildId})`, error);
      await interaction.editReply({
        content: '❌ ロール設定中にエラーが発生しました。',
        components: [],
      });
    }
  },
};
