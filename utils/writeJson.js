// utils/writeJson.js
const storage = require('./gcsClient');
const { GCS_DATA_ROOT } = require('../config');

const bucketName = process.env.GCS_BUCKET_NAME;

async function writeJson(guildId, filePath, jsonData) {
  if (!bucketName) throw new Error('GCS_BUCKET_NAMEが未設定です。');

  const fullPath = `${GCS_DATA_ROOT}/${guildId}/${filePath}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fullPath);

  const jsonStr = JSON.stringify(jsonData, null, 2);

  await file.save(jsonStr, {
    resumable: false,
    contentType: 'application/json',
  });
}

module.exports = writeJson;
