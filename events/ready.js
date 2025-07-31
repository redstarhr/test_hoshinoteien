// events/ready.js

const { Events } = require('discord.js');
const { Storage } = require('@google-cloud/storage');
const logger = require('../utils/logger'); // カスタムロガーを想定（consoleでもOK）

/**
 * Google Cloud Storageへの接続をチェック
 */
async function checkGcsConnection() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    logger.warn('⚠️ GCS_BUCKET_NAMEが設定されていません。GCS接続確認をスキップします。');
    return;
  }

  try {
    const storage = new Storage();
    const [exists] = await storage.bucket(bucketName).exists();
    if (exists) {
      logger.info(`✅ GCSバケット「${bucketName}」に正常に接続しました。`);
    } else {
      logger.error(`❌ GCSバケット「${bucketName}」が存在しません。設定を確認してください。`);
    }
  } catch (error) {
    logger.error(`❌ GCSへの接続に失敗しました（バケット名: ${bucketName}）。`, error);
  }
}

/**
 * Botの起動状態をログに出力
 */
function logBotInfo(client) {
  logger.info('🌳================ BOT 起動 =================🌳');
  logger.info(`✅ ログインユーザー: ${client.user.tag}`);

  const guilds = client.guilds.cache;
  let totalMembers = 0;
  guilds.forEach(g => totalMembers += g.memberCount);

  logger.info(`🔗 接続中サーバー数: ${guilds.size}`);
  logger.info(`👥 総メンバー数: ${totalMembers}`);
  logger.info('🌳===========================================🌳');
}

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * 起動時の処理
   * @param {import('discord.js').Client} client
   */
  async execute(client) {
    logBotInfo(client);
    await checkGcsConnection();

    // ✅ 起動時の初期化タスクがあればここに追加
    // await initializeOkuribitoPanel(client);
    // await registerSlashCommands(client);
  }
};
