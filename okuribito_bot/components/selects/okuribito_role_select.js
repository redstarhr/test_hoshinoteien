// okuribito_bot/components/selects/okuribito_role_select.js

const { EmbedBuilder } = require('discord.js');
const { logToOkuribitoThread } = require('../../utils/okuribitoLogger');
const { saveOkuribitoConfig } = require('../../utils/okuribitoConfigManager');

module.exports = {
  customId: 'okuribito_role_select',
  async execute(interaction) {
    try {
      const selectedRole = interaction.values[0];
      const guildId = interaction.guild.id;

      // 1. GCSなどに送り人ロールIDを保存
      await saveOkuribitoConfig(guildId, { okuribitoRoleId: selectedRole });

      // 2. ログ用Embed作成
      const embed = new EmbedBuilder()
        .setTitle('🚕 送り人ロールが設定されました')
        .addFields(
          { name: '設定者', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'ロール', value: `<@&${selectedRole}>`, inline: true },
          { name: '日時', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        )
        .setColor(0x00bfff);

      // 3. スレッド「送り設定」にログ出力
      await logToOkuribitoThread(interaction.guild, embed);

      // 4. ユーザーへ応答
      await interaction.reply({
        content: '送り人ロールが設定され、ログに記録されました。',
        ephemeral: true,
      });
    } catch (error) {
      console.error('送り人ロール設定処理でエラー:', error);
      await interaction.reply({
        content: '⚠️ 送り人ロールの設定中にエラーが発生しました。',
        ephemeral: true,
      });
    }
  },
};
