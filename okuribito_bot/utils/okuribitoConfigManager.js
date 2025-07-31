// utils/okuribitoConfigManager.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'data-hoshinokoutei';

async function saveOkuribitoConfig(guildId, config) {
  const filePath = `${guildId}/okuribito/config.json`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  const jsonStr = JSON.stringify(config, null, 2);
  await file.save(jsonStr, { contentType: 'application/json' });
}

module.exports = { saveOkuribitoConfig };
