const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadOkuribitoConfig } = require('./okuribitoConfigManager');
const logger = require('./logger'); // パスを修正

/**
 * 指定されたギルドのライブパネルを更新します。
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 */
async function updateLivePanel(client, guildId) {
    const config = await loadOkuribitoConfig(guildId);
    if (!config?.livePanel?.channelId || !config?.livePanel?.messageId) {
        // このサーバーにはライブパネルが設定されていません
        return;
    }

    try {
        const channel = await client.channels.fetch(config.livePanel.channelId);
        const message = await channel.messages.fetch(config.livePanel.messageId);

        // --- 表示内容を構築するロジック ---
        const now = new Date();
        const activeShifts = [];
        if (config.shifts) {
            for (const userId in config.shifts) {
                const shift = config.shifts[userId];
                const startDate = new Date(shift.startDate);
                const endDate = new Date(shift.endDate);
                endDate.setHours(23, 59, 59, 999); // 日付の終わりまでを範囲とする

                if (now >= startDate && now <= endDate) {
                    try {
                        const member = await channel.guild.members.fetch(userId);
                        activeShifts.push({
                            name: member.displayName,
                            times: shift.times.join('\n') || '時間未設定',
                        });
                    } catch (err) {
                        logger.warn(`パネル更新のためメンバー(ID: ${userId})を取得できませんでした。`);
                    }
                }
            }
        }

        const updatedEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🚕 現在の送り人一覧')
            .setDescription(activeShifts.length > 0 ? '現在シフトに入っている送り人です。' : '現在対応可能な送り人はいません。')
            .setFooter({ text: `最終更新` })
            .setTimestamp();

        if (activeShifts.length > 0) {
            updatedEmbed.addFields(activeShifts.map(shift => ({ name: shift.name, value: shift.times, inline: false })));
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('okuribito_send_start').setLabel('🚕 送ります').setStyle(ButtonStyle.Success)
        );
        // --- ロジックここまで ---

        await message.edit({ embeds: [updatedEmbed], components: [row] });
        logger.info(`ライブパネルを更新しました (Guild ID: ${guildId})`);

    } catch (error) {
        if (error.code === 10008 || error.code === 10003) { // Unknown Message or Unknown Channel
            logger.warn(`ライブパネルのメッセージまたはチャンネルが見つかりませんでした (Guild ID: ${guildId})。設定が古い可能性があります。`);
        } else {
            logger.error({ message: `ライブパネルの更新に失敗しました (Guild ID: ${guildId})`, error });
        }
    }
}

function initializePanelUpdater(client) {
    // 5分ごとにすべてのサーバーのパネルを更新
    setInterval(() => {
        logger.info('定期的なライブパネルの更新を開始します...');
        client.guilds.cache.forEach(guild => {
            updateLivePanel(client, guild.id);
        });
    }, 5 * 60 * 1000); // 300000ms = 5分
}

module.exports = { initializePanelUpdater, updateLivePanel };