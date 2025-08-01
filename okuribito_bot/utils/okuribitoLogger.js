const { ChannelType } = require('discord.js');
const logger = require('./logger'); // パスを修正

const THREAD_NAME = '送り設定';

/**
 * ギルド内のログ用スレッドを取得または作成します。
 * @param {import('discord.js').Guild} guild
 * @returns {Promise<import('discord.js').ThreadChannel|null>}
 */
async function getLogThread(guild) {
    // アクティブなスレッドから探す
    const activeThreads = await guild.threads.fetchActive();
    let thread = activeThreads.threads.find(t => t.name === THREAD_NAME && !t.archived);

    if (thread) return thread;

    // アーカイブされたスレッドから探す
    const archivedThreads = await guild.threads.fetchArchived();
    thread = archivedThreads.threads.find(t => t.name === THREAD_NAME);
    if (thread) {
        await thread.setArchived(false).catch(e => logger.error('Failed to unarchive log thread', e));
        return thread;
    }

    // 見つからなければ作成する (システムチャンネル or 特定のチャンネル)
    const channel = guild.systemChannel; // ここは必要に応じて設定ファイルから読み込むように変更できます
    if (!channel || channel.type !== ChannelType.GuildText) {
        logger.warn(`Guild ${guild.id} has no suitable channel to create the log thread in.`);
        return null;
    }
    try {
        thread = await channel.threads.create({
            name: THREAD_NAME,
            autoArchiveDuration: 10080, // 1 week
            reason: '送り人BOTのログ用スレッド',
        });
        await thread.send({ content: 'このスレッドは送り人BOTの各種設定ログを記録します。' });
        return thread;
    } catch (error) {
        logger.error(`Could not create log thread in guild ${guild.id}`, error);
        return null;
    }
}

async function logToThread(guild, embed) {
    const thread = await getLogThread(guild);
    if (thread) {
        try {
            await thread.send({ embeds: [embed] });
        } catch (error) {
            logger.error(`Failed to send log to thread in guild ${guild.id}`, error);
        }
    }
}

module.exports = { logToThread };