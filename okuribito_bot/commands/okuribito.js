const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { loadOkuribitoConfig } = require('../utils/okuribitoConfigManager');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito')
        .setDescription('送り人BOTの設定パネルを表示します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // 管理者のみが実行可能

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);
            let roleStatus = '未設定';

            if (config?.okuribitoRoleId) {
                try {
                    const role = await interaction.guild.roles.fetch(config.okuribitoRoleId);
                    roleStatus = role ? `${role}` : '`設定済み (ロールが見つかりません)`';
                } catch {
                    logger.warn(`設定パネル表示のためロール(ID: ${config.okuribitoRoleId})の取得に失敗しました。`);
                    roleStatus = '`設定済み (ロールが見つかりません)`';
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚕 送り人BOT 設定パネル')
                .setDescription('現在の設定状況を確認し、下のボタンから各種設定を行ってください。')
                .addFields(
                    { name: '現在の送り人ロール', value: roleStatus, inline: false }
                );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('okuribito_config_role')
                        .setLabel('ロール設定')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('okuribito_config_users')
                        .setLabel('メンバー登録')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('okuribito_config_shift')
                        .setLabel('シフト登録')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('okuribito_manage_shifts')
                        .setLabel('シフト編集/削除')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (error) {
            logger.error({ message: '設定パネルの表示中にエラーが発生しました:', error });
            await interaction.editReply({ content: 'エラーが発生しました。' });
        }
    },
};