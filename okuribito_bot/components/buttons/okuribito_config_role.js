const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
  customId: 'okuribito_config_role', // パネルのボタンIDと一致させます
  /**
   * @param {ButtonInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const config = await loadOkuribitoConfig(interaction.guild.id);

      let description = 'BOTが送り人として認識するロールを選択してください。';
      if (config?.okuribitoRoleId) {
        try {
          const currentRole = await interaction.guild.roles.fetch(config.okuribitoRoleId);
          if (currentRole) {
            description = `現在、**${currentRole.name}** が設定されています。\n変更する場合は、新しいロールを選択してください。`;
          }
        } catch (fetchError) {
          logger.warn(`[okuribito_config_role] 既存ロール(ID: ${config.okuribitoRoleId})の取得に失敗しました。削除された可能性があります。`);
        }
      }

      const selectMenu = new RoleSelectMenuBuilder()
        .setCustomId('okuribito_role_select')
        .setPlaceholder('送り人ロールを選択');

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('送り人ロール設定')
        .setDescription(description);

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      logger.error({ message: '送り人ロール選択メニューの表示に失敗しました:', error });
      await interaction.editReply({ content: '⚠️ メニューの表示中にエラーが発生しました。', embeds: [], components: [] });
    }
  },
};
