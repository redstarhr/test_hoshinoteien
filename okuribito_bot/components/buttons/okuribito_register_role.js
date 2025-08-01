// okuribito_bot/components/selects/okuribitoRoleSelect.js
const { writeJson } = require('../../utils/gcsManager');
const { getThreadChannel } = require('../../utils/threadHelper');
const { bold, time } = require('discord.js');

module.exports = {
  customId: 'okuribito_register_role',

  /**
   * 送り人ロールの選択後の処理
   * @param {import('discord.js').SelectMenuInteraction} interaction
   */
  async execute(interaction) {
    const roleId = interaction.values[0];
    const guildId = interaction.guildId;
    const user = interaction.user;

    if (!roleId) {
      await interaction.reply({
        content: 'ロールが選択されていません。',
        flags: 1 << 6 // ephemeral
      });
      return;
    }

    // GCSへ保存
    const configPath = `data-svml/${guildId}/okuribito/config.json`;
    await writeJson(configPath, { roleId });

    // ログスレッド取得
    const thread = await getThreadChannel(interaction.guild, '送り設定');
    if (thread) {
      const now = new Date();
      const log = `✅ ${time(now, 't')} ${bold(user.username)} が送り人ロールを <@&${roleId}> に設定しました。`;
      await thread.send(log);
    }

    await interaction.reply({
      content: `送り人ロールを <@&${roleId}> に設定しました。`,
      flags: 1 << 6 // ephemeral
    });
  }
};
