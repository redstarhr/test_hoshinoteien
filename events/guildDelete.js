// events/guildDelete.js

module.exports = {
  name: 'guildDelete',
  async execute(guild) {
    console.log(`🗑️ Botがサーバーから削除されました: ${guild.name} (${guild.id})`);
    try {
      // guildのデータ削除用モジュールを読み込み
      const questDataManager = require('../manager/questDataManager');

      // ギルドIDに紐づくデータ削除処理を呼ぶ（非同期）
      await questDataManager.deleteGuildData(guild.id);

      // TODO: GPT設定データなど他のギルド固有データ削除も追加すると良い
    } catch (error) {
      console.error(`⚠️ ギルド削除イベント処理でエラーが発生しました: ${guild.id}`, error);
    }
  },
};
