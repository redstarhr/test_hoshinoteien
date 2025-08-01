const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_manage_shifts',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);
            if (!config || !config.shifts || Object.keys(config.shifts).length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('ℹ️ シフト情報なし')
                    .setDescription('現在、登録されているシフト情報がありません。');
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const shiftUsers = Object.keys(config.shifts);
            const options = [];

            for (const userId of shiftUsers) {
                try {
                    const member = await interaction.guild.members.fetch(userId);
                    options.push(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(member.user.username)
                            .setDescription(`期間: ${config.shifts[userId].startDate} ~ ${config.shifts[userId].endDate}`)
                            .setValue(userId)
                    );
                } catch (err) {
                    logger.warn(`シフト管理メニュー表示のためメンバー(ID: ${userId})を取得できませんでした。`);
                }
            }

            if (options.length === 0) {
                return interaction.editReply({ content: 'シフトが登録されているメンバーが見つかりませんでした。' });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('okuribito_manage_shift_select')
                .setPlaceholder('編集または削除するシフトを選択してください')
                .addOptions(options.slice(0, 25));

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({ content: '管理するシフトを選択してください。', components: [row] });

        } catch (error) {
            logger.error({ message: 'シフト管理メニューの表示に失敗しました:', error });
            await interaction.editReply({ content: '⚠️ メニューの表示中にエラーが発生しました。' });
        }
    },
};