// okuribito_bot/utils/okuribitoLogger.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * 送迎ログをスレッド付きで送信
 * @param {import('discord.js').TextChannel} logChannel - ログ用テキストチャンネル
 * @param {object} logData - ログ情報 { user, okuribitoUser, count, datetime, note }
 * @param {import('discord.js').Client} client
 */
async function postOkuribitoLog(logChannel, logData, client) {
  const { user, okuribitoUser, count, datetime, note } = logData;

  // 🔍 スレッド検索 or 作成
  const threadName = '送り設定';
  let thread = (await logChannel.threads.fetchActive()).threads.find(t => t.name === threadName);

  if (!thread) {
    const starterMessage = await logChannel.send('🚕 ログスレッドを作成します...');
    thread = await starterMessage.startThread({
      name: threadName,
      autoArchiveDuration: 1440, // 24時間
    });
  }

  // 📦 Embed生成
  const embed = new EmbedBuilder()
    .setTitle('🚕 送ります 🚕')
    .addFields(
      { name: '入力者', value: `<@${user.id}>`, inline: true },
      { name: '送り人', value: `<@${okuribitoUser.id}>`, inline: true },
      { name: '人数', value: `${count}`, inline: true },
      { name: '日時', value: datetime, inline: false }
    )
    .setColor(0x0099ff)
    .setTimestamp();

  if (note) {
    embed.addFields({ name: '備考', value: note });
  }

  // 🧩 ボタン
  const completeButton = new ButtonBuilder()
    .setCustomId('mark_complete_button')
    .setLabel('完了')
    .setStyle(ButtonStyle.Success);

  const noteButton = new ButtonBuilder()
    .setCustomId('add_note_button')
    .setLabel('備考')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(completeButton, noteButton);

  // 📝 スレッドに送信
  return await thread.send({ embeds: [embed], components: [row] });
}

module.exports = { postOkuribitoLog };
