const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_config_shift',
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

            const okuribitoRole = await interaction.guild.roles.fetch(config.okuribitoRoleId);
            if (!okuribitoRole) {
                return interaction.editReply({ content: 'エラー: 設定されている送り人ロールが見つかりませんでした。再設定してください。' });
            }

            const okuribitoMembers = okuribitoRole.members;
            if (okuribitoMembers.size === 0) {
                return interaction.editReply({ content: '送り人として登録されているメンバーがいません。「送り人登録」からメンバーを登録してください。' });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('okuribito_shift_user_select')
                .setPlaceholder('シフトを登録するユーザーを選択')
                .addOptions(
                    okuribitoMembers.map(member =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(member.user.username)
                            .setDescription(`ID: ${member.id}`)
                            .setValue(member.id)
                    ).slice(0, 25) // Select MenuのOptionは25個まで
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({ content: 'シフトを登録するユーザーを選択してください。', components: [row] });

        } catch (error) {
            logger.error({ message: 'シフト登録メニューの表示に失敗しました:', error });
            await interaction.editReply({ content: '⚠️ メニューの表示中にエラーが発生しました。' });
        }
    },
};