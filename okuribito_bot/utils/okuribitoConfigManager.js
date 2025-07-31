// utils/okuribitoConfigManager.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'data-hoshinokoutei';

/**
 * 送り人設定情報をGCSに保存
 * @param {string} guildId ギルドID
 * @param {object} config 保存する設定オブジェクト
 */
async function saveOkuribitoConfig(guildId, config) {
  const filePath = `${guildId}/okuribito/config.json`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  try {
    const jsonStr = JSON.stringify(config, null, 2);
    await file.save(jsonStr, { contentType: 'application/json' });
    console.log(`[okuribitoConfigManager] ${filePath} に設定を保存しました。`);
  } catch (error) {
    console.error(`[okuribitoConfigManager] 設定保存中にエラーが発生しました:`, error);
    throw error;
  }
}

module.exports = { saveOkuribitoConfig };
