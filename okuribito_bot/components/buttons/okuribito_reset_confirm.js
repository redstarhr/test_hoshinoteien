const { ButtonInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig, deleteOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const { logToThread } = require('../../utils/okuribitoLogger');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_reset_confirm',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const config = await loadOkuribitoConfig(guild.id);

            // Attempt to delete the live panel message if it exists
            if (config?.livePanel?.channelId && config?.livePanel?.messageId) {
                try {
                    const channel = await interaction.client.channels.fetch(config.livePanel.channelId);
                    const message = await channel.messages.fetch(config.livePanel.messageId);
                    await message.delete();
                    logger.info(`ライブパネルを削除しました (Guild ID: ${guild.id})`);
                } catch (err) {
                    logger.warn(`リセット時にライブパネルの削除に失敗しました (Guild ID: ${guild.id})。既に削除されている可能性があります。`);
                }
            }

            // Delete the configuration file from GCS
            await deleteOkuribitoConfig(guild.id);

            // Log the reset action
            const logEmbed = new EmbedBuilder()
                .setTitle('🚨 全設定リセット')
                .setColor('#992D22')
                .setDescription(`**${interaction.user.username}** がBOTの全設定をリセットしました。`)
                .setTimestamp();
            await logToThread(guild, logEmbed);

            await interaction.editReply({ content: '✅ すべての設定をリセットしました。', components: [] });

        } catch (error) {
            logger.error({ message: '設定リセット処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生し、リセット処理を完了できませんでした。' });
        }
    },
};