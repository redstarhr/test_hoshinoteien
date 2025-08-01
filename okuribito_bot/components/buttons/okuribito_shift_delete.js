const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig, saveOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const { logToThread } = require('../../utils/okuribitoLogger');
const { updateLivePanel } = require('../../utils/panelUpdater');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_shift_delete',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const [_, userId] = interaction.customId.split(':');
            const config = await loadOkuribitoConfig(interaction.guild.id);

            if (!config?.shifts?.[userId]) {
                return interaction.editReply({ content: '対象のシフトは既に削除されているか、見つかりませんでした。', ephemeral: true });
            }

            const member = await interaction.guild.members.fetch(userId);

            // Delete the shift for the user
            delete config.shifts[userId];

            // Save the updated config
            await saveOkuribitoConfig(interaction.guild.id, config);

            // Log the deletion
            const logEmbed = new EmbedBuilder()
                .setTitle('🗑️ 送り人シフト削除')
                .setColor('#E74C3C')
                .addFields(
                    { name: '操作者', value: `${interaction.user}`, inline: true },
                    { name: '対象者', value: `${member}`, inline: true },
                    { name: '操作日時', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setTimestamp();
            await logToThread(interaction.guild, logEmbed);

            await interaction.editReply({ content: `✅ ${member.user.username}さんのシフトを削除しました。`, embeds: [], components: [] });

            // Immediately update the live panel to reflect the changes
            await updateLivePanel(interaction.client, interaction.guild.id);

        } catch (error) {
            logger.error({ message: 'シフト削除処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
        }
    },
};