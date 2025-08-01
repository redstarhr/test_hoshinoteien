const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    // The customId is dynamic
    customId: 'okuribito_note_modal',
    /**
     * @param {ModalSubmitInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            const [_, messageId] = interaction.customId.split(':');
            const noteText = interaction.fields.getTextInputValue('note_input');

            const originalMessage = await interaction.channel.messages.fetch(messageId);
            if (!originalMessage) {
                return interaction.followUp({ content: '元のメッセージが見つかりませんでした。', ephemeral: true });
            }

            const originalEmbed = originalMessage.embeds[0];
            if (!originalEmbed) {
                return interaction.followUp({ content: '元の埋め込みメッセージが見つかりませんでした。', ephemeral: true });
            }

            // Create a new embed by copying the old one and updating the notes field
            const updatedEmbed = EmbedBuilder.from(originalEmbed);
            const noteFieldIndex = updatedEmbed.data.fields.findIndex(field => field.name === '備考');
            if (noteFieldIndex !== -1) {
                updatedEmbed.data.fields[noteFieldIndex].value = noteText;
            }

            await originalMessage.edit({ embeds: [updatedEmbed] });
        } catch (error) {
            logger.error({ message: '備考の更新処理中にエラーが発生しました:', error });
            await interaction.followUp({ content: 'エラーが発生し、備考を更新できませんでした。', ephemeral: true });
        }
    },
};