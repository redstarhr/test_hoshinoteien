const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_send_start',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);

            if (!config || !config.shifts || Object.keys(config.shifts).length === 0) {
                return interaction.editReply({ content: '現在シフトに入っている送り人がいません。', ephemeral: true });
            }

            const now = new Date();
            const activeMembers = [];

            for (const userId in config.shifts) {
                const shift = config.shifts[userId];
                const startDate = new Date(shift.startDate);
                const endDate = new Date(shift.endDate);
                endDate.setHours(23, 59, 59, 999); // 終了日をその日の終わりまで有効にする

                if (now >= startDate && now <= endDate) {
                    try {
                        const member = await interaction.guild.members.fetch(userId);
                        activeMembers.push(member);
                    } catch (err) {
                        logger.warn(`送迎フローのためメンバー(ID: ${userId})を取得できませんでした。`);
                    }
                }
            }

            if (activeMembers.length === 0) {
                return interaction.editReply({ content: '現在シフトに入っている送り人が見つかりませんでした。', ephemeral: true });
            }

            const driverSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('okuribito_send_driver_select')
                .setPlaceholder('送ってくれる人を選択してください')
                .addOptions(
                    activeMembers.map(member => ({
                        label: member.displayName,
                        description: `ID: ${member.id}`,
                        value: member.id,
                    })).slice(0, 25) // Select MenuのOptionは25個まで
                );

            const row = new ActionRowBuilder().addComponents(driverSelectMenu);
            await interaction.editReply({ content: 'ステップ1: 送り人を選択してください。', components: [row], ephemeral: true });

        } catch (error) {
            logger.error({ message: '「送ります」ボタンの処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
        }
    },
};