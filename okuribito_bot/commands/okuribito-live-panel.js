const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadOkuribitoConfig, saveOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito-live-panel')
        .setDescription('自動更新される送り人一覧パネルを設置します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const initialEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🚕 現在の送り人一覧')
                .setDescription('パネルを初期化しています...');

            // 先にメッセージを送信してIDを取得する
            const panelMessage = await interaction.channel.send({ embeds: [initialEmbed] });

            // GCSにパネルの場所を保存
            const config = await loadOkuribitoConfig(interaction.guild.id) || {};
            config.livePanel = {
                channelId: interaction.channel.id,
                messageId: panelMessage.id,
            };
            await saveOkuribitoConfig(interaction.guild.id, config);

            // ここで一度、手動で更新処理を呼び出す（将来的に実装）
            // await updateLivePanel(interaction.client, interaction.guild.id);

            await interaction.editReply({ content: '✅ 自動更新パネルを設置しました。数分以内に情報が更新されます。' });
        } catch (error) {
            logger.error({ message: '自動更新パネルの設置中にエラーが発生しました:', error });
            await interaction.editReply({ content: '⚠️ パネルの設置中にエラーが発生しました。' });
        }
    },
};