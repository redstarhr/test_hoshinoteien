const { StringSelectMenuInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_shift_user_select',
    /**
     * @param {StringSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        try {
            const selectedUserId = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`okuribito_shift_modal:${selectedUserId}`)
                .setTitle('送り人シフト登録');

            const startDateInput = new TextInputBuilder()
                .setCustomId('shift_start_date')
                .setLabel('シフト開始日 (例: 2023-10-27)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const endDateInput = new TextInputBuilder()
                .setCustomId('shift_end_date')
                .setLabel('シフト終了日 (例: 2023-10-28)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const timeInput = new TextInputBuilder()
                .setCustomId('shift_times')
                .setLabel('時間 (改行で複数入力)')
                .setPlaceholder('18:00～22:00\n23:00～04:00')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(startDateInput), new ActionRowBuilder().addComponents(endDateInput), new ActionRowBuilder().addComponents(timeInput));

            await interaction.showModal(modal);
        } catch (error) {
            logger.error({ message: 'シフト登録モーダルの表示に失敗しました:', error });
        }
    },
};