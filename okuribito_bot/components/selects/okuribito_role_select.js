const { RoleSelectMenuInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig, saveOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const { logToThread } = require('../../utils/okuribitoLogger');
const logger = require('../../utils/logger');

module.exports = {
  customId: 'okuribito_role_select',
  /**
   * @param {RoleSelectMenuInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const roleId = interaction.values[0];
    const guildId = interaction.guild.id;
    const role = await interaction.guild.roles.fetch(roleId);

    if (!role) {
      logger.warn(`Failed to fetch role ${roleId} in guild ${guildId}`);
      return interaction.editReply({
        content: 'ロールの取得に失敗しました。もう一度お試しください。',
      });
    }

    try {
      const currentConfig = await loadOkuribitoConfig(guildId) || {};
      const newConfig = {
        ...currentConfig,
        okuribitoRoleId: roleId,
      };

      await saveOkuribitoConfig(guildId, newConfig);

      const logEmbed = new EmbedBuilder()
        .setTitle('🚕 送り人ロール設定')
        .setColor('#5865F2')
        .addFields(
          { name: '設定者', value: `${interaction.user}`, inline: true },
          { name: '入力年月日時間', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '送り人ロール', value: `${role}`, inline: false }
        )
        .setTimestamp();
      await logToThread(interaction.guild, logEmbed);

      const replyEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('✅ 設定完了')
        .setDescription(`送り人ロールを **${role.name}** に設定しました。`)
        .setTimestamp();

      await interaction.editReply({ embeds: [replyEmbed] });
    } catch (error) {
      logger.error({ message: `GCSへのファイル保存中にエラーが発生しました (Guild ID: ${guildId})`, error });
      await interaction.editReply({
        content: 'エラーが発生し、ロール設定を保存できませんでした。',
      });
    }
  },
};
