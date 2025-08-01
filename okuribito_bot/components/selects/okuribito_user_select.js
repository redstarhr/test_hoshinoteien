const { UserSelectMenuInteraction, EmbedBuilder } = require('discord.js');
const { loadOkuribitoConfig } = require('../../utils/okuribitoConfigManager');
const { logToThread } = require('../../utils/okuribitoLogger');
const logger = require('../../utils/logger');

module.exports = {
    customId: 'okuribito_user_select',
    /**
     * @param {UserSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const config = await loadOkuribitoConfig(guild.id);

            if (!config?.okuribitoRoleId) {
                return interaction.editReply({ content: 'エラー: 送り人ロールが設定されていません。管理者に連絡してください。', ephemeral: true });
            }

            const okuribitoRole = await guild.roles.fetch(config.okuribitoRoleId);
            if (!okuribitoRole) {
                return interaction.editReply({ content: 'エラー: 設定されている送り人ロールが見つかりませんでした。再設定してください。', ephemeral: true });
            }

            const selectedUserIds = interaction.values;
            const addedMembers = [];
            const alreadyHadRoleMembers = [];

            for (const userId of selectedUserIds) {
                try {
                    const member = await guild.members.fetch(userId);
                    if (member.roles.cache.has(okuribitoRole.id)) {
                        alreadyHadRoleMembers.push(member);
                    } else {
                        await member.roles.add(okuribitoRole);
                        addedMembers.push(member);
                    }
                } catch (err) {
                    logger.error(`ユーザー(ID: ${userId})へのロール付与に失敗しました。`, err);
                }
            }

            // 総送り人数を取得 (より効率的な方法)
            const totalOkuribito = okuribitoRole.members.size;

            // ログ用Embedを作成
            const logEmbed = new EmbedBuilder()
                .setTitle('🚕 送り人登録')
                .setColor('#2ECC71')
                .addFields(
                    { name: '設定者', value: `${interaction.user}`, inline: true },
                    { name: '入力年月日時間', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '総送り人', value: `${totalOkuribito}人`, inline: true },
                )
                .setTimestamp();

            if (addedMembers.length > 0) {
                logEmbed.addFields({ name: '送り人追加', value: addedMembers.map(m => `${m}`).join('\n'), inline: false });
            }

            await logToThread(guild, logEmbed);

            // ユーザーへの返信Embedを作成
            const descriptionParts = [];
            if (addedMembers.length > 0) {
                descriptionParts.push(`**${addedMembers.length}名**に送り人ロールを付与しました。`);
            }
            if (alreadyHadRoleMembers.length > 0) {
                descriptionParts.push(`**${alreadyHadRoleMembers.length}名**は既にロールを所持していました。`);
            }
            if (descriptionParts.length === 0) {
                descriptionParts.push('処理が完了しましたが、対象のユーザーがいませんでした。');
            }
            const replyEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('✅ 送り人登録完了')
                .setDescription(descriptionParts.join('\n'));
            await interaction.editReply({ embeds: [replyEmbed] });

        } catch (error) {
            logger.error({ message: '送り人登録処理中にエラーが発生しました:', error });
            await interaction.editReply({ content: 'エラーが発生し、登録処理を完了できませんでした。' });
        }
    },
};