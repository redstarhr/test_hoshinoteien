const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

/**
 * ロールの設定状況を取得して文字列を返す
 * @param {import('discord.js').Interaction} interaction
 * @param {string | undefined} roleId
 * @returns {Promise<string>}
 */
async function getRoleStatus(interaction, roleId) {
    if (!roleId) return '未設定';
    try {
        const role = await interaction.guild.roles.fetch(roleId);
        return role ? `${role}` : '`設定済み (ロールが見つかりません)`';
    } catch {
        logger.warn(`設定確認コマンドでロール(ID: ${roleId})の取得に失敗しました。`);
        return '`設定済み (ロールが見つかりません)`';
    }
}

/**
 * 自動更新パネルの設定状況を取得して文字列を返す
 * @param {import('discord.js').Interaction} interaction
 * @param {object | undefined} panelConfig
 * @returns {Promise<string>}
 */
async function getPanelStatus(interaction, panelConfig) {
    if (!panelConfig?.channelId) return '未設置';
    try {
        const channel = await interaction.guild.channels.fetch(panelConfig.channelId);
        return channel ? `${channel} に設置済み` : '`設置済み (チャンネルが見つかりません)`';
    } catch {
        return '`設置済み (チャンネルが見つかりません)`';
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('okuribito-settings')
        .setDescription('現在の送り人BOTの設定状況を表示します。')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);

            if (!config || Object.keys(config).length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('ℹ️ 送り人設定未完了')
                    .setDescription('このサーバーでは、送り人BOTの設定がまだ行われていません。\n`/okuribito` コマンドで設定を開始してください。')
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('現在の送り人BOT設定状況')
                .addFields(
                    { name: '① 送り人ロール', value: await getRoleStatus(interaction, config.okuribitoRoleId) },
                    { name: '② シフト登録人数', value: `${config.shifts ? Object.keys(config.shifts).length : 0}人` },
                    { name: '③ 自動更新パネル', value: await getPanelStatus(interaction, config.livePanel) }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            logger.error({ message: '設定確認コマンドの実行中にエラーが発生しました。', error });
            await interaction.editReply({ content: '設定の表示中にエラーが発生しました。' });
        }
    },
};