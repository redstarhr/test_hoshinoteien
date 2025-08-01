const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    // The customId is dynamic (e.g., okuribito_send_complete:messageId), so we use a startsWith check
    customId: 'okuribito_send_complete',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        // Use deferUpdate to acknowledge the interaction without sending a new message
        await interaction.deferUpdate();

        try {
            const originalMessage = interaction.message;
            const originalEmbed = originalMessage.embeds[0];

            if (!originalEmbed) {
                return interaction.followUp({ content: '元の埋め込みメッセージが見つかりませんでした。', ephemeral: true });
            }

            // Create a new embed based on the old one with updated title and color
            const completedEmbed = EmbedBuilder.from(originalEmbed)
                .setTitle('🏠 送りました')
                .setColor('#2ECC71'); // Green for completed

            // Disable both buttons in the action row
            const disabledButtons = ActionRowBuilder.from(originalMessage.components[0]);
            disabledButtons.components.forEach(component => component.setDisabled(true));

            await originalMessage.edit({ embeds: [completedEmbed], components: [disabledButtons] });

        } catch (error) {
            logger.error({ message: '送迎完了処理中にエラーが発生しました:', error });
            // Since we deferred, we use followUp for any error messages
            await interaction.followUp({ content: 'エラーが発生し、完了処理を実行できませんでした。', ephemeral: true });
        }
    },
};