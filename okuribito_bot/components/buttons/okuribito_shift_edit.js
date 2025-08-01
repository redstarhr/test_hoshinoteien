const { ButtonInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_shift_edit',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        try {
            const [_, userId] = interaction.customId.split(':');
            const config = await loadOkuribitoConfig(interaction.guild.id);
            const shiftData = config?.shifts?.[userId];

            if (!shiftData) {
                return interaction.reply({ content: '編集対象のシフトが見つかりませんでした。', ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId(`okuribito_shift_modal:${userId}`)
                .setTitle('送り人シフト編集');

            const startDateInput = new TextInputBuilder()
                .setCustomId('shift_start_date')
                .setLabel('シフト開始日 (例: 2023-10-27)')
                .setStyle(TextInputStyle.Short)
                .setValue(shiftData.startDate || '')
                .setRequired(true);

            const endDateInput = new TextInputBuilder()
                .setCustomId('shift_end_date')
                .setLabel('シフト終了日 (例: 2023-10-28)')
                .setStyle(TextInputStyle.Short)
                .setValue(shiftData.endDate || '')
                .setRequired(true);

            const timeInput = new TextInputBuilder()
                .setCustomId('shift_times')
                .setLabel('時間 (改行で複数入力)')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(shiftData.times.join('\n') || '')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(startDateInput), new ActionRowBuilder().addComponents(endDateInput), new ActionRowBuilder().addComponents(timeInput));

            await interaction.showModal(modal);
        } catch (error) {
            logger.error({ message: 'シフト編集モーダルの表示に失敗しました:', error });
            await interaction.reply({ content: 'エラーが発生し、編集画面を開けませんでした。', ephemeral: true }).catch(() => {});
        }
    },
};