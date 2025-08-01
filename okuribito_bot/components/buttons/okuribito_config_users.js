const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../../utils/okuribitoConfigManager');
const logger = require('../../../utils/logger');
const { handleInteractionError } = require('../../../handlers/interactionErrorHandler');

module.exports = {
    customId: 'okuribito_config_users',
    /**
     * @param {ButtonInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const config = await loadOkuribitoConfig(interaction.guild.id);
            if (!config?.okuribitoRoleId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ 設定エラー')
                    .setDescription('先に「送り人ロール」を設定してください。\n`/okuribito` コマンドから設定できます。');
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const selectMenu = new UserSelectMenuBuilder()
                .setCustomId('okuribito_user_select')
                .setPlaceholder('登録するユーザーを選択してください（複数選択可）')
                .setMinValues(1)
                .setMaxValues(25);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('送り人登録')
                .setDescription('送り人として登録するユーザーを選択してください。\n選択されたユーザーには自動的に送り人ロールが付与されます。');

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            await handleInteractionError(interaction, error, '送り人登録メニューの表示に失敗しました', 'メニューの表示中にエラーが発生しました。');
        }
    },
};