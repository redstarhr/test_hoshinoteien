const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito-display')
        .setDescription('送り人一覧パネルをこのチャンネルに設置します。(静的)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // 管理者のみが実行可能

    async execute(interaction) {
        // このパネルは公開情報なので、ephemeral: false (デフォルト) で応答します
        await interaction.deferReply();

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);

            if (!config || !config.shifts || Object.keys(config.shifts).length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ 表示エラー')
                    .setDescription('表示できるシフト情報がありません。\n`/okuribito` コマンドからシフトを登録してください。');
                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            const now = new Date();
            const activeShifts = [];

            for (const userId in config.shifts) {
                const shift = config.shifts[userId];
                const startDate = new Date(shift.startDate);
                const endDate = new Date(shift.endDate);
                endDate.setHours(23, 59, 59, 999); // 終了日をその日の終わりまで有効にする

                if (now >= startDate && now <= endDate) {
                    try {
                        const member = await interaction.guild.members.fetch(userId);
                        activeShifts.push({
                            name: member.displayName,
                            times: shift.times.join('\n') || '時間未設定',
                        });
                    } catch (err) {
                        logger.warn(`送り人パネル表示のためメンバー(ID: ${userId})を取得できませんでした。`);
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🚕 現在の送り人一覧')
                .setDescription(activeShifts.length > 0 ? '現在シフトに入っている送り人です。' : '現在シフトに入っている送り人はいません。')
                .setTimestamp();

            activeShifts.forEach(shift => embed.addFields({ name: shift.name, value: shift.times, inline: false }));

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('okuribito_send_start').setLabel('🚕 送ります').setStyle(ButtonStyle.Success)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            logger.error({ message: '送り人一覧パネルの設置中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ パネルの設置中にエラーが発生しました。', ephemeral: true });
        }
    },
};