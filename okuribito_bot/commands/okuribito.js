const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito')
        .setDescription('送り人BOTの設定パネルを表示します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // 管理者のみが実行可能
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🚕 送り人BOT 設定パネル')
            .setDescription('各種設定はここから行ってください。')
            .addFields(
                { name: '送り人ロール設定', value: 'BOTが送り人として認識するロールを設定・変更します。' },
                { name: '送り人登録', value: 'メンバーを送り人として登録します。（ロールが付与されます）' },
                { name: 'シフト登録', value: '送り人のシフトを登録・変更します。' }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('okuribito_config_role')
                    .setLabel('送り人ロール設定')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('okuribito_config_users')
                    .setLabel('送り人登録')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('okuribito_config_shift')
                    .setLabel('シフト登録')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
        });
    },
};