// okuribito_bot/commands/okuribito-log.js
const { SlashCommandBuilder } = require('discord.js');
const appendCsv = require('../../utils/appendCsv');
const readJson = require('../../utils/readJson');
const config = require('../../config');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('okuribito-log')
    .setDescription('送り人ログを記録します。')
    .addStringOption(option =>
      option.setName('log_data').setDescription('記録するログデータ').setRequired(true)
    ),

  async execute(interaction) {
    const { guildId } = interaction;
    const logData = interaction.options.getString('log_data');

    try {
      // 1. okuribitoの設定をGCSから読み込む (okuribito/config.json)
      const okuribitoConfig = await readJson(guildId, config.paths.okuribito.config);
      // configを使った何らかの処理...
      logger.info(`ギルド${guildId}の送り人設定を読み込みました:`, okuribitoConfig);

      // 2. 今日の日付でログファイルに追記する (送り人ログ/年月日_送り人.csv)
      const today = new Date();
      const dateString = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
      const logPath = config.paths.okuribito.log.replace('{date}', dateString);

      // 追記するCSV行を作成
      const csvLine = `${new Date().toISOString()},${interaction.user.id},${logData}`;

      await appendCsv(guildId, logPath, csvLine);

      await interaction.reply({ content: 'ログを記録しました。', ephemeral: true });
    } catch (error) {
      logger.error('送り人ログの記録中にエラーが発生しました:', error);
      await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
  },
};