// utils/readJson.js
const storage = require('./gcsClient');

const bucketName = process.env.GCS_BUCKET_NAME;

async function readJson(guildId, filePath) {
  if (!bucketName) throw new Error('GCS_BUCKET_NAMEが未設定です。');

  const fullPath = `data-svml/${guildId}/${filePath}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fullPath);

  const [exists] = await file.exists();
  if (!exists) return null;

  const [data] = await file.download();
  return JSON.parse(data.toString());
}

module.exports = readJson;
