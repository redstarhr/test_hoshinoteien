// okuribito_bot/utils/okuribitoLogger.js

/**
 * 送迎スレッドにEmbed付きでログを書き込む
 * @param {import('discord.js').TextChannel | import('discord.js').ThreadChannel} channel - ログを書き込むチャンネルまたはスレッド
 * @param {object} logData - ログデータ（入力者、送り人、人数、日時など）
 * @param {import('discord.js').Client} client
 */
async function postOkuribitoLog(channel, logData, client) {
  const { user, okuribitoUser, count, datetime, note } = logData;

  const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

  const embed = new EmbedBuilder()
    .setTitle('🚕送ります🚕')
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

  const completeButton = new ButtonBuilder()
    .setCustomId('mark_complete_button')
    .setLabel('完了')
    .setStyle(ButtonStyle.Success);

  const noteButton = new ButtonBuilder()
    .setCustomId('add_note_button')
    .setLabel('備考')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(completeButton, noteButton);

  return await channel.send({ embeds: [embed], components: [row] });
}

module.exports = { postOkuribitoLog };
