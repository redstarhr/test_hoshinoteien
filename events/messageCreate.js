// events/messageCreate.js
const logger = require('../utils/logger');
const { handleGptChat } = require('../chat_gpt_bot/utils/chatHandler');


module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    // ボット自身のメッセージは無視
    if (message.author.bot) return;

    try {
      // GPTチャット処理を非同期で実行
      await handleGptChat(message, client);

      // TODO: 他BotのmessageCreate処理や汎用処理をここに追加可能

    } catch (error) {
      logger.error({
        message: `messageCreateイベント処理でエラー (Guild: ${message.guild?.name})`,
        error: error,
        client: client
      });
    }
  },
};
