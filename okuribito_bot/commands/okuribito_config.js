// okuribito_bot/commands/okuribito_config.js

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('送り人設定')
    .setDescription('送り人関連のロール設定・登録・シフト登録パネルを表示します。')
    .setDefaultMemberPermissions(0), // 管理者のみ

  async execute(interaction) {
    try {
      // 応答の準備（ephemeral: true）
      await interaction.deferReply({ ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('🚕 送り人設定パネル')
        .setDescription('以下のボタンで設定を行ってください。まずは「送り人ロール」を設定してください。')
        .addFields(
          { name: '送り人ロール', value: '送り人として登録するロールを指定します。' },
          { name: '送り人登録', value: 'ユーザーに送り人ロールを付与します。' },
          { name: 'シフト登録', value: '送り人のシフト（時間帯）を登録します。' }
        )
        .setColor(0x00bcd4);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('okuribito_register_role')
          .setLabel('送り人ロール')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('okuribito_register_user')
          .setLabel('送り人登録')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('okuribito_register_shift')
          .setLabel('シフト登録')
          .setStyle(ButtonStyle.Secondary)
      );

      // 返信編集
      await interaction.editReply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });

    } catch (error) {
      console.error('送り人設定コマンドでエラー:', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '⚠️ パネルの表示中にエラーが発生しました。',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '⚠️ パネルの表示中にエラーが発生しました。',
          ephemeral: true,
        });
      }
    }
  }
};
