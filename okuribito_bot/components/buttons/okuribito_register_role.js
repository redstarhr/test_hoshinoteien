// okuribito_bot/components/buttons/register_role_button.js

const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'okuribito_register_role',
  async execute(interaction) {
    try {
      const selectMenu = new RoleSelectMenuBuilder()
        .setCustomId('okuribito_role_select')
        .setPlaceholder('送り人ロールを選択')
        .setMinValues(1)
        .setMaxValues(1);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: '送り人ロールを選択してください。',
        components: [row],
        flags: 64, // ephemeral対応
      });
    } catch (error) {
      console.error('【エラー】送り人ロール選択メニューの表示に失敗しました:', error);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '⚠️ 送り人ロール選択メニューの表示中にエラーが発生しました。',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '⚠️ 送り人ロール選択メニューの表示中にエラーが発生しました。',
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error('【エラー】エラー通知の送信にも失敗しました:', replyError);
      }
    }
  },
};
