const { StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getDailySendThread } = require('../../utils/okuribitoLogger');
const { appendToSendLogCsv } = require('../../utils/okuribitoGcsManager');
const logger = require('../../utils/logger');

module.exports = {
    // The customId is dynamic, so we use a startsWith check
    customId: 'okuribito_send_count_select',
    /**
     * @param {StringSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const requester = interaction.user;

            const [_, driverId] = interaction.customId.split(':');
            const passengerCount = interaction.values[0];

            const driverMember = await guild.members.fetch(driverId);
            if (!driverMember) {
                return interaction.editReply({ content: 'エラー: 送り人として選択されたユーザーが見つかりませんでした。', ephemeral: true });
            }

            // 1. Get or create the daily log thread
            const logThread = await getDailySendThread(guild);
            if (!logThread) {
                return interaction.editReply({ content: 'エラー: ログ記録用のスレッドを作成できませんでした。', ephemeral: true });
            }

            // 2. Create the log embed with buttons
            const logEmbed = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('🚕 送ります')
                .addFields(
                    { name: '入力者', value: `${requester}`, inline: true },
                    { name: '入力月日時間', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                    { name: '送り人', value: `${driverMember}`, inline: false },
                    { name: '人数', value: `${passengerCount}人`, inline: false },
                    { name: '備考', value: 'なし' }
                )
                .setTimestamp();

            const logButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('okuribito_send_complete').setLabel('完了').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('okuribito_send_note').setLabel('備考').setStyle(ButtonStyle.Secondary)
            );

            // 3. Send the log to the thread
            const logMessage = await logThread.send({ embeds: [logEmbed], components: [logButtons] });

            // 4. Update the button customIds to include the message ID for easy reference
            logButtons.components[0].setCustomId(`okuribito_send_complete:${logMessage.id}`);
            logButtons.components[1].setCustomId(`okuribito_send_note:${logMessage.id}`);
            await logMessage.edit({ components: [logButtons] });

            // 5. Log to GCS CSV
            await appendToSendLogCsv(guild.id, {
                timestamp: new Date().toISOString(),
                requesterId: requester.id,
                requesterName: requester.username,
                driverId: driverMember.id,
                driverName: driverMember.user.username,
                passengerCount: passengerCount,
                logMessageId: logMessage.id,
            });

            // 5. Post public notification in the original channel
            const notificationEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setDescription(`🚕 **${driverMember.displayName}** が **${requester.username}** さんを **${passengerCount}人** 送迎します。\n詳細はこちらのスレッドを確認してください。`)
                .setTimestamp();

            await interaction.channel.send({ embeds: [notificationEmbed] });

            // 6. Confirm to the user
            await interaction.editReply({ content: '✅ 送迎リクエストを送信しました。', ephemeral: true });

        } catch (error) {
            logger.error({ message: '送迎リクエストの処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
        }
    },
};