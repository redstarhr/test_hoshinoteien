// okuribito_bot/components/selects/select_send_count.js
const { postOkuribitoLog } = require('../../utils/okuribitoLogger');
const appendCsv = require('../../../utils/appendCsv');
const config = require('../../../config');
const logger = require('../../../utils/logger');

module.exports = {
  // customIdの先頭部分を定義（これで複数のIDを受け取る設計に対応）
  customIdPrefix: 'select_send_count_',

  async execute(interaction, client) {
    // customIdは 'select_send_count_<送り人ID>' の形式
    const { customId, values, guild, user } = interaction;
    const count = values[0];
    const okuribitoUserId = customId.slice(this.customIdPrefix.length);

    await interaction.deferUpdate();

    try {
      const okuribitoUser = await client.users.fetch(okuribitoUserId);

      // 1. Post the log to the channel
      // The target channel should ideally be read from config.
      // Here, we'll post in the channel where the interaction happened.
      const logMessage = await postOkuribitoLog(interaction.channel, {
        user: user,
        okuribitoUser: okuribitoUser,
        count: count,
        datetime: new Date().toLocaleString('ja-JP'),
      });

      // 2. Append the log to the CSV
      const today = new Date();
      const dateString = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
      const logPath = config.paths.okuribito.log.replace('{date}', dateString);
      const csvLine = `${new Date().toISOString()},${user.id},${user.username},${okuribitoUser.id},${okuribitoUser.username},${count},${logMessage.id}`;
      await appendCsv(guild.id, logPath, csvLine);

      await interaction.editReply({ content: '送迎ログを記録しました。', components: [] });
    } catch (error) {
      logger.error(`Error processing send count selection (Guild ID: ${guild.id})`, error);
      await interaction.editReply({ content: 'エラーが発生しました。', components: [] });
    }
  },
};
