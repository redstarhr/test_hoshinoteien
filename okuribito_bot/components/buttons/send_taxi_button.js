// okuribito_bot/components/buttons/send_taxi_button.js

const { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction } = require('discord.js');

module.exports = {
  customId: 'send_taxi_button',
  async execute(interaction) {
    // 送り人一覧をGCSや設定から取得する想定
    // ここでは仮に静的なリストを用意
    const okuribitoUsers = [
      { label: '山田太郎', value: 'userId1' },
      { label: '鈴木花子', value: 'userId2' },
      { label: '佐藤次郎', value: 'userId3' }
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_okuribito_user')
      .setPlaceholder('送り人を選択してください')
      .addOptions(okuribitoUsers)
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '送り人を選択してください。',
      components: [row],
      ephemeral: true
    });
  }
};
