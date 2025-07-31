// events/messageCreate.js

const { handleGptChat } = require('../chat_gpt_bot/utils/chatHandler');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    try {
      // GPTチャット処理を非同期で実行
      await handleGptChat(message, client);

      // TODO: 他BotのmessageCreate処理や汎用処理をここに追加可能

    } catch (error) {
      console.error('messageCreateイベント処理でエラー:', error);
    }
  },
};
