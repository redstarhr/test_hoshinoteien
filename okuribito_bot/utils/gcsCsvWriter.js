// okuribito_bot/utils/gcsCsvWriter.js

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = process.env.GCS_BUCKET_NAME;

/**
 * 送迎CSVをGCSに追記または新規作成する
 * @param {string} guildId - ギルドID
 * @param {string} dateString - 日付文字列（例：20250731）
 * @param {string} csvLine - CSVの1行分データ（カンマ区切り）
 */
async function appendOkuribitoCsv(guildId, dateString, csvLine) {
  if (!bucketName) throw new Error('GCS_BUCKET_NAME が未設定です。');

  const filePath = `data-svml/${guildId}/okuribito/送迎_${dateString}.csv`;
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  // ファイルが存在するかチェック
  const [exists] = await file.exists();
  let content = '';
  if (exists) {
    // 既存ファイル読み込み
    const [data] = await file.download();
    content = data.toString();
  }

  // 末尾に追記
  content += csvLine + '\n';

  // ファイル上書き
  await file.save(content, {
    resumable: false,
    contentType: 'text/csv',
  });
}

module.exports = { appendOkuribitoCsv };
