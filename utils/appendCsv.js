// utils/appendCsv.js
const storage = require('./gcsClient');

const bucketName = process.env.GCS_BUCKET_NAME;

async function appendCsv(guildId, filePath, csvLine) {
  if (!bucketName) throw new Error('GCS_BUCKET_NAMEが未設定です。');

  const fullPath = `data-svml/${guildId}/${filePath}`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fullPath);

  const [exists] = await file.exists();
  let content = '';
  if (exists) {
    const [data] = await file.download();
    content = data.toString();
  }

  content += csvLine + '\n';

  await file.save(content, {
    resumable: false,
    contentType: 'text/csv',
  });
}

module.exports = appendCsv;
