const { StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_manage_shift_select',
    /**
     * @param {StringSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const selectedUserId = interaction.values[0];
            const config = await loadOkuribitoConfig(interaction.guild.id);
            const shiftData = config?.shifts?.[selectedUserId];

            if (!shiftData) {
                return interaction.editReply({ content: '選択されたユーザーのシフト情報が見つかりませんでした。', ephemeral: true });
            }

            const member = await interaction.guild.members.fetch(selectedUserId);

            const embed = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle(`シフト管理: ${member.user.username}`)
                .setDescription('このシフトに対する操作を選択してください。')
                .addFields(
                    { name: '期間', value: `${shiftData.startDate} ~ ${shiftData.endDate}`, inline: false },
                    { name: '時間', value: shiftData.times.join('\n'), inline: false }
                );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`okuribito_shift_edit:${selectedUserId}`)
                        .setLabel('このシフトを編集')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`okuribito_shift_delete:${selectedUserId}`)
                        .setLabel('このシフトを削除')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            logger.error({ message: 'シフト管理オプションの表示に失敗しました:', error });
            await interaction.editReply({ content: '⚠️ エラーが発生しました。', ephemeral: true });
        }
    },
};