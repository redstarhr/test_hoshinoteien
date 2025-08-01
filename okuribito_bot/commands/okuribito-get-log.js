const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { getSendLogCsv } = require('../../utils/okuribitoGcsManager');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito-get-log')
        .setDescription('指定した日付の送迎ログCSVを取得します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('date')
                .setDescription('取得する日付 (例: 2023-10-28)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const dateString = interaction.options.getString('date');
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(dateString)) {
            return interaction.editReply({ content: '日付の形式が正しくありません。「YYYY-MM-DD」の形式で入力してください。' });
        }

        try {
            const logFile = await getSendLogCsv(interaction.guild.id, dateString);

            if (!logFile) {
                return interaction.editReply({ content: `\`${dateString}\` のログファイルは見つかりませんでした。` });
            }

            const attachment = new AttachmentBuilder(logFile.buffer, { name: logFile.fileName });

            await interaction.editReply({
                content: `✅ \`${dateString}\` の送迎ログをDMに送信しました。`,
            });

            // DMでファイルを送信
            await interaction.user.send({
                content: `${interaction.guild.name} の \`${dateString}\` の送迎ログです。`,
                files: [attachment],
            });
        } catch (error) {
            logger.error({ message: 'ログファイルの取得・送信中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生し、ログファイルを取得できませんでした。' });
        }
    },
};