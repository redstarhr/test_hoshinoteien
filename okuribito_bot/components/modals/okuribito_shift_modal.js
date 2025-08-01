const { ModalSubmitInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig, saveOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const { logToThread } = require('../../utils/okuribitoLogger');
const logger = require('../../utils/logger');

module.exports = {
    // The customId is dynamic, so we use a startsWith check in the interactionCreate event
    customId: 'okuribito_shift_modal',
    /**
     * @param {ModalSubmitInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const [_, userId] = interaction.customId.split(':');

            const startDate = interaction.fields.getTextInputValue('shift_start_date');
            const endDate = interaction.fields.getTextInputValue('shift_end_date');
            const times = interaction.fields.getTextInputValue('shift_times');

            const config = await loadOkuribitoConfig(guild.id) || {};

            // Initialize shifts object if it doesn't exist
            if (!config.shifts) {
                config.shifts = {};
            }

            // Store the shift data for the user
            config.shifts[userId] = {
                startDate,
                endDate,
                times: times.split('\n'), // Store times as an array
            };

            await saveOkuribitoConfig(guild.id, config);

            const member = await guild.members.fetch(userId);

            // Create log embed
            const logEmbed = new EmbedBuilder()
                .setTitle('🚕 送り人シフト登録')
                .setColor('#3498DB')
                .addFields(
                    { name: '設定者', value: `${interaction.user}`, inline: true },
                    { name: '入力年月日時間', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '送り人', value: `${member}`, inline: false },
                    { name: 'シフト', value: `**期間:** ${startDate} ~ ${endDate}\n**時間:**\n${times}`, inline: false }
                )
                .setTimestamp();

            await logToThread(guild, logEmbed);

            const replyEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('✅ シフト登録完了')
                .setDescription(`${member.user.username}さんのシフトを登録しました。`);

            await interaction.editReply({ embeds: [replyEmbed] });

        } catch (error) {
            logger.error({ message: 'シフト登録処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: 'エラーが発生し、シフト登録を完了できませんでした。' });
        }
    },
};