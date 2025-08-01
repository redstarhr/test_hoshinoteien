// okuribito_bot/components/buttons/register_shift_button.js

const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const { handleInteractionError } = require('../../../handlers/interactionErrorHandler');

module.exports = {
  customId: 'okuribito_register_shift',
  async execute(interaction) {
    try {
      const userSelect = new UserSelectMenuBuilder()
        .setCustomId('okuribito_shift_user_select')
        .setPlaceholder('シフト登録する送り人ユーザーを選択（複数可）')
        .setMinValues(1)
        .setMaxValues(25);

      const row = new ActionRowBuilder().addComponents(userSelect);

      await interaction.reply({
        content: 'シフト登録する送り人ユーザーを選択してください。',
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      await handleInteractionError(interaction, error, 'シフト登録ユーザー選択メニューの表示に失敗しました。');
    }
  },
};
