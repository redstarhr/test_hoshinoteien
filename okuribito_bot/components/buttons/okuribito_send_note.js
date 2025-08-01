const { ButtonInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const logger = require('../../../utils/logger');
const { handleInteractionError } = require('../../../handlers/interactionErrorHandler');

module.exports = {
    // The customId is dynamic
    customId: 'okuribito_send_note',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        try {
            const messageId = interaction.message.id;

            const modal = new ModalBuilder()
                .setCustomId(`okuribito_note_modal:${messageId}`)
                .setTitle('備考の入力');

            const noteInput = new TextInputBuilder()
                .setCustomId('note_input')
                .setLabel('備考を入力してください')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(noteInput));

            await interaction.showModal(modal);
        } catch (error) {
            await handleInteractionError(interaction, error, '備考入力モーダルの表示に失敗しました', '備考入力画面を開けませんでした。');
        }
    },
};