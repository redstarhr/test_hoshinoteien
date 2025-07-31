// okuribito_bot/utils/gcsCsvWriter.js

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = 'data-hoshinokoutei'; // バケット名は環境に合わせて変更してください

/**
 * GCS に CSV ファイルを書き込む（上書き）
 * @param {string} filePath GCS上のファイルパス（例: 'guildId/okuribito/filename.csv'）
 * @param {string} csvData CSV形式の文字列データ
 */
async function writeCsv(filePath, csvData) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);

  try {
    await file.save(csvData, {
      contentType: 'text/csv',
      resumable: false,
      // encoding: 'utf-8' // 必要なら指定
    });
    console.log(`CSVファイルをGCSに保存しました: ${filePath}`);
  } catch (error) {
    console.error('GCSへのCSV書き込みでエラー:', error);
    throw error;
  }
}

module.exports = {
  writeCsv,
};
