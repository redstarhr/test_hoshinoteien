// okuribito_bot/components/selects/select_okuribito_user.js

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'select_okuribito_user',
  async execute(interaction) {
    const selectedUserId = interaction.values[0]; // 選択された送り人のユーザーID

    // カスタムIDに送り人IDを含めて人数選択メニューを作成
    const options = [];
    for (let i = 0; i <= 24; i++) {
      options.push({ label: `${i}人`, value: i.toString() });
    }

    const countSelect = new StringSelectMenuBuilder()
      .setCustomId(`select_send_count_${selectedUserId}`) // ここで送り人IDを埋め込む
      .setPlaceholder('送る人数を選択してください')
      .addOptions(options)
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(countSelect);

    await interaction.update({
      content: `送り人 <@${selectedUserId}> を選択しました。送る人数を選んでください。`,
      components: [row],
      embeds: [],
    });
  }
};
