// okuribito_bot/commands/okuribito_panel.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('送り人設置')
    .setDescription('送り人一覧パネルと「🚕送ります🚕」ボタンを表示します。'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🚕 送り人一覧')
      .setDescription('シフト登録された送り人がここに表示されます。')
      .setColor(0x4caf50);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('send_taxi_button')
        .setLabel('🚕送ります🚕')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
